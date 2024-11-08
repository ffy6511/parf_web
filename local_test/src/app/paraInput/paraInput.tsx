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
  <Row style={{ width: '100%' }}>
    <Col span={'18'}>
      <Slider min={1} max={2000} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </Col>
    <Col span={'6'}>
      <InputNumber min={0} max={2000} value={value} onChange={onChange} style={{ width: '100%', marginLeft: '5px' }} />
    </Col>
  </Row>
);

interface CoreInputProps {
  value: number;
  onChange: (value: number) => void;
}

// 核输入
const CoreInput: React.FC<CoreInputProps> = ({ value, onChange }) => (
  <Row style={{ width: '100%' }}>
    <Col span={'18'}>
      <Slider min={1} max={64} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </Col>
    <Col span={'6'}>
      <InputNumber min={1} max={64} value={value} onChange={onChange} style={{ width: '100%', marginLeft: '5px' }} />
    </Col>
  </Row>
);

interface SampleSizeInputProps {
  value: number;
  onChange: (value: number) => void;
}

// 采样数量输入
const SampleSizeInput: React.FC<SampleSizeInputProps> = ({ value, onChange }) => (
  <Row style={{ width: '100%' }}>
    <Col span={'18'}>
      <Slider min={1} max={1000} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </Col>
    <Col span={'6'}>
      <InputNumber min={1} max={1000} value={value} onChange={onChange} style={{ width: '100%', marginLeft: '5px' }} />
    </Col>
  </Row>
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
      <strong style={{ fontSize: '17px', marginTop: '2px', textShadow: '1px 1px 10px #a49f9f' }}>
        <AlignLeftOutlined /> Hyperparameters Configuration
      </strong>

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
              width: '80px', // 调整按钮宽度
              marginLeft: '10px',
            }}>
              {selectedGroup ? 'Update' : 'Save'}
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
        <strong style={{ textShadow: '1px 1px 4px #a49f9f', marginTop: '3px', fontSize: '15px', color: '#4f4e4e' }}>
          <UnorderedListOutlined /> Parameter Groups
        </strong>
        <div
          style={{
            maxHeight: '40vh',
            overflowY: 'auto',
            padding: '3px',
            marginTop: '-5px',
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
                      Time Budget: {item.timeBudget} _Processes: {item.core}_Samples: {item.sampleSize}
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
