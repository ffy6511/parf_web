import React, { useState, useEffect } from 'react';
import { Row, Col, Slider, InputNumber, Button, Input, message } from 'antd';
import { AlignLeftOutlined, UnorderedListOutlined } from '@ant-design/icons';
import styles from './paraInput.module.css';
import "~/styles/globals.css";

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
  const [timeBudget, setTimeBudget] = useState(1);
  const [core, setCore] = useState(1);
  const [sampleSize, setSampleSize] = useState(1);
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

    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['parameters'], 'readwrite');
      const store = transaction.objectStore('parameters');

      const data = {
        groupName,
        timeBudget,
        core,
        sampleSize,
      };

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
    setTimeBudget(group.timeBudget);
    setCore(group.core);
    setSampleSize(group.sampleSize);
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
        showMessage('info', `参数组 "${groupName}" 已删除`);
        loadSavedGroups(db);
      };
    };
  };

  return (
    <div>
      

      <div style={{ width: '100%', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className={styles.container}>

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
              fontSize:'0.3em'
            }}>
              {'Save'}
            </Button>
          </div>

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
        </div>

        {/* 显示已保存的参数组 */}
        <strong style={{  marginTop: '1px', fontSize: '1em',marginLeft:'0.5vw' }}>
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
