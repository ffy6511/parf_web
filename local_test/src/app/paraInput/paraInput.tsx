import React, { useState, useEffect } from 'react';
import { Row, Col, Slider, InputNumber, Button, Input, message, Switch, Select } from 'antd';
import { AlignLeftOutlined, UnorderedListOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './paraInput.module.css';
import "~/styles/globals.css";
import { defaultParameters, defaultBasicParameters, availableDomains, equalityOptions } from './parameterConfig';

// IndexedDB Setup
const openDatabase = () => {
  const request = indexedDB.open('ParameterStorage', 1);
  
  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    db.createObjectStore('parameters', { keyPath: 'groupName' });
  };

  return request;
};

interface TimeBudgetInputProps {
  value: number;
  onChange: (value: number) => void;
}

// 时间预算输入
const TimeBudgetInput: React.FC<TimeBudgetInputProps> = ({ value, onChange }) => (
  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingLeft: '20px' }}>
    <div style={{ flex: '0 1 70%' }}>
      <Slider min={1} max={3600} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </div>
    <div style={{ width: '80px' }}>
      <InputNumber 
        min={0} 
        max={3600} 
        value={value} 
        onChange={onChange} 
        style={{ 
          width: '100%',
          fontSize: '0.8em'
        }} 
      />
    </div>
  </div>
);

interface CoreInputProps {
  value: number;
  onChange: (value: number) => void;
}

// 核输入
const CoreInput: React.FC<CoreInputProps> = ({ value, onChange }) => (
  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingLeft: '20px' }}>
    <div style={{ flex: '0 1 70%' }}>
      <Slider min={1} max={8} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </div>
    <div style={{ width: '80px' }}>
      <InputNumber 
        min={1} 
        max={8} 
        value={value} 
        onChange={onChange} 
        style={{ 
          width: '100%',
          fontSize: '0.8em'
        }} 
      />
    </div>
  </div>
);

interface SampleSizeInputProps {
  value: number;
  onChange: (value: number) => void;
}

// 采样数量输入
const SampleSizeInput: React.FC<SampleSizeInputProps> = ({ value, onChange }) => (
  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingLeft: '20px' }}>
    <div style={{ flex: '0 1 70%' }}>
      <Slider min={1} max={16} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </div>
    <div style={{ width: '80px' }}>
      <InputNumber 
        min={1} 
        max={16} 
        value={value} 
        onChange={onChange} 
        style={{ 
          width: '100%',
          fontSize: '0.8em'
        }} 
      />
    </div>
  </div>
);

const InputPanel = () => {
  const [timeBudget, setTimeBudget] = useState(defaultBasicParameters.timeBudget);
  const [core, setCore] = useState(defaultBasicParameters.core);
  const [sampleSize, setSampleSize] = useState(defaultBasicParameters.sampleSize);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedParams, setAdvancedParams] = useState(defaultParameters);
  const [groupName, setGroupName] = useState<string>('');
  const [savedGroups, setSavedGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState(null);

  useEffect(() => {
    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      loadSavedGroups(db);
    };
  }, []);

  const showMessage = (type: 'success' | 'info' | 'error', content: string) => {
    message[type](content);
  };

  const handleSave = () => {
    if (!groupName) {
      message.error('请输入参数组名！');
      return;
    }

    const data = {
      groupName,
      timeBudget,
      core,
      sampleSize,
      widening_delay: advancedParams.widening_delay,
      subdivide_non_linear: advancedParams.subdivide_non_linear,
      slevel: advancedParams.slevel,
      plevel: advancedParams.plevel,
      partition_history: advancedParams.partition_history,
      min_loop_unroll: advancedParams.min_loop_unroll,
      ilevel: advancedParams.ilevel,
      equality_through_calls: advancedParams.equality_through_calls,
      auto_loop_unroll: advancedParams.auto_loop_unroll,
      domains: advancedParams.domains
    };

    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['parameters'], 'readwrite');
      const store = transaction.objectStore('parameters');

      // 数据已在上面准备好

      store.put(data).onsuccess = () => {
        showMessage('success', ` "${groupName}" Saved`);
        loadSavedGroups(db);
        setGroupName('');
      };
    };
  };

  const loadSavedGroups = (db: IDBDatabase) => {
    const transaction = db.transaction(['parameters'], 'readonly');
    const store = transaction.objectStore('parameters');
    const request = store.getAll();

    request.onsuccess = () => {
      setSavedGroups(request.result);
    };
  };

  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group.groupName);
    setGroupName(group.groupName);
    if (showAdvanced) {
      setAdvancedParams({
        widening_delay: group.widening_delay || defaultParameters.widening_delay,
        subdivide_non_linear: group.subdivide_non_linear || defaultParameters.subdivide_non_linear,
        slevel: group.slevel || defaultParameters.slevel,
        plevel: group.plevel || defaultParameters.plevel,
        partition_history: group.partition_history || defaultParameters.partition_history,
        min_loop_unroll: group.min_loop_unroll || defaultParameters.min_loop_unroll,
        ilevel: group.ilevel || defaultParameters.ilevel,
        equality_through_calls: group.equality_through_calls || defaultParameters.equality_through_calls,
        auto_loop_unroll: group.auto_loop_unroll || defaultParameters.auto_loop_unroll,
        domains: group.domains || defaultParameters.domains
      });
    } else {
      setTimeBudget(group.timeBudget);
      setCore(group.core);
      setSampleSize(group.sampleSize);
    }
    showMessage('info', `Group "${group.groupName}" selected`);
    localStorage.setItem('selectedGroup', JSON.stringify(group));
  };

  const handleDeleteGroup = (groupName: string) => {
    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['parameters'], 'readwrite');
      const store = transaction.objectStore('parameters');

      store.delete(groupName).onsuccess = () => {
        showMessage('info', ` Group "${groupName}" deleted`);
        loadSavedGroups(db);
      };
    };
  };

  return (
    <div>
      <div style={{ width: '100%', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            {/* <div> Initial Parameter </div> */}
            <div>
              <Switch
                checkedChildren="IP"
                unCheckedChildren="HP"
                checked={showAdvanced}
                onChange={setShowAdvanced}
              />
              </div>
          </div>

          {/* 保存或更新参数组 */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0px' }}>
            <div className={styles.inputRow}>
              <strong>Group Name</strong>
            </div>
            <Input
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{ 
                marginRight: '10px', 
                width: '150px', // 调整输入框宽度
                marginLeft: '20px'
              }}
            />
            <Button type="primary" onClick={handleSave} className="sendButton" style={{
              width: '3vw', // 调整按钮宽度
              marginRight:'1vw',
              maxHeight:'40%',
              marginBottom:'1vh',
              fontSize:'0.8em'
            }}>
              {'Save'}
            </Button>
          </div>

          {!showAdvanced ? (
            <>
              <div className={styles.inputRow}>
                <strong>Time Budget(s)</strong>
                <TimeBudgetInput value={timeBudget} onChange={setTimeBudget} />
              </div>

              <div className={styles.inputRow}>
                <strong>Processes</strong>
                <CoreInput value={core} onChange={setCore} />
              </div>

              <div className={styles.inputRow}>
                <strong>Samples</strong>
                <SampleSizeInput value={sampleSize} onChange={setSampleSize} />
              </div>
            </>
          ) : (
            <>
              {Object.entries(advancedParams).map(([key, value]) => {
                if (key === 'domains') {
                  return (
                    <div key={key} className={styles.inputRow}>
                      <strong>Domains</strong>
                      <Select
                        mode="multiple"
                        style={{ width: '70%', marginLeft: '20px' }}
                        value={value}
                        onChange={(newValue) => setAdvancedParams(prev => ({ ...prev, domains: newValue }))}
                        options={availableDomains.map(domain => ({ label: domain, value: domain }))}
                      />
                    </div>
                  );
                } else if (key === 'equality_through_calls') {
                  return (
                    <div key={key} className={styles.inputRow}>
                      <strong>Equality Through Calls</strong>
                      <Select
                        style={{ width: '70%', marginLeft: '20px' }}
                        value={value}
                        onChange={(newValue) => setAdvancedParams(prev => ({ ...prev, equality_through_calls: newValue }))}
                        options={equalityOptions.map(option => ({ label: option, value: option }))}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={key} className={styles.inputRow}>
                      <strong>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</strong>
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingLeft: '20px' }}>
                        <div style={{ flex: '0 1 70%' }}>
                          <Slider
                            min={0}
                            max={100}
                            value={value}
                            onChange={(newValue) => setAdvancedParams(prev => ({ ...prev, [key]: newValue }))}
                          />
                        </div>
                        <div style={{ width: '80px' }}>
                          <InputNumber
                            min={0}
                            max={100}
                            value={value}
                            onChange={(newValue) => setAdvancedParams(prev => ({ ...prev, [key]: newValue ?? 0 }))}
                            style={{ width: '100%', fontSize: '0.8em' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </>
          )}
        </div>

        {/* 显示已保存的参数组 */}
        <strong style={{  marginTop: '1px', fontSize: '1em',marginLeft:'0.5vw', color:'var(--text-color)' }}>
          <UnorderedListOutlined /> Configuration Groups
        </strong>
        <div
          style={{
            overflowY: 'auto',
            padding: '3px',
            marginTop: '-2px',
            listStyle: 'none',
            scrollbarWidth: 'thin',
          }}
        >
          <ul className={styles.List}>
            {savedGroups.map((item) => {
              const isHovered = hoveredGroup === item.groupName;
              const isSelected = selectedGroup === item.groupName;

              return (
                <li
                  key={item.groupName}
                  onMouseEnter={() => setHoveredGroup(item.groupName)}
                  onMouseLeave={() => setHoveredGroup(null)}
                  onClick={() => handleSelectGroup(item)}
                  className={`${styles.parameterListItem} ${isSelected ? styles.selected : ''}`}
                >
                  <div className={styles.parameterContent}>
                    <strong>{item.groupName}</strong>
                    <div className={styles.parameterDetails}>
                      <div>
                        Time Budget: {item.timeBudget} 
                      </div> 
                      <div>
                       Processes: {item.core} 
                       </div>
                       <div>
                       Samples: {item.sampleSize}
                       </div>
                    </div>
                  </div>
                  <Button
                    shape="circle-outline"
                    size="small"
                    onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { e.stopPropagation(); handleDeleteGroup(item.groupName); }}
                    className={styles.deleteButton}
                  >
                    Delete
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
