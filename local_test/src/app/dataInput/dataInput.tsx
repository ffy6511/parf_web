import React, { useState, useEffect } from 'react';
import { Row, Col, Slider, InputNumber, Space, Button, List, Input, message } from 'antd';
import { AlignLeftOutlined } from '@ant-design/icons';
import styles from './dataInput.module.css';

// IndexedDB Setup
const openDatabase = () => {
  
  
  const request = indexedDB.open('ParameterStorage', 1);

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    db.createObjectStore('parameters', { keyPath: 'groupName' });
  };

  return request;
};

// 时间预算输入
const TimeBudgetInput = ({ value, onChange }) => (
  <Row style={{ width: '100%' }}>
    <Col span={16}>
      <Slider min={0} max={2000} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </Col>
    <Col span={6}>
      <InputNumber min={0} max={2000} value={value} onChange={onChange} style={{ width: '100%', marginLeft: '5px' }} />
    </Col>
  </Row>
);

// 核输入
const CoreInput = ({ value, onChange }) => (
  <Row style={{ width: '100%' }}>
    <Col span={18}>
      <Slider min={1} max={64} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </Col>
    <Col span={6}>
      <InputNumber min={1} max={64} value={value} onChange={onChange} style={{ width: '100%', marginLeft: '5px' }} />
    </Col>
  </Row>
);

// 采样数量输入
const SampleSizeInput = ({ value, onChange }) => (
  <Row style={{ width: '100%' }}>
    <Col span={18}>
      <Slider min={1} max={1000} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </Col>
    <Col span={6}>
      <InputNumber min={1} max={1000} value={value} onChange={onChange} style={{ width: '100%', marginLeft: '5px' }} />
    </Col>
  </Row>
);

const InputPanel = () => {
  const [timeBudget, setTimeBudget] = useState(1);
  const [core, setCore] = useState(1);
  const [sampleSize, setSampleSize] = useState(1);
  const [groupName, setGroupName] = useState<string>(''); // 参数组名称
  const [savedGroups, setSavedGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null); // 当前选中的参数组
  const [isSelected,setIsSelected] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState(null);

  useEffect(() => {
    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      loadSavedGroups(db);
    };
  }, []);

  // 显示提示
  const showMessage = (type: 'success' | 'info' | 'warning', content: string) => {
    message[type](content);
  };

  // 保存或更新参数组
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
        showMessage('success', `参数组 "${groupName}" 已保存`);
        loadSavedGroups(db);
        setGroupName('');
      };
    };
  };

  // 加载已保存的参数组
  const loadSavedGroups = (db: IDBDatabase) => {
    const transaction = db.transaction(['parameters'], 'readonly');
    const store = transaction.objectStore('parameters');
    const request = store.getAll();

    request.onsuccess = () => {
      setSavedGroups(request.result);
    };
  };

  // 选择参数组，并将参数填充到上方的输入框
  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group.groupName);
    setGroupName(group.groupName);
    setTimeBudget(group.timeBudget);
    setCore(group.core);
    setSampleSize(group.sampleSize);
    showMessage('info', `参数组 "${group.groupName}" 已被选中`);
  };

  // 删除参数组
  const handleDeleteGroup = (groupName: string) => {
    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['parameters'], 'readwrite');
      const store = transaction.objectStore('parameters');

      store.delete(groupName).onsuccess = () => {
        showMessage('warning', `参数组 "${groupName}" 已删除`);
        loadSavedGroups(db);
      };
    };
  };

  return (
  <div>
    <strong style={{ fontSize: '25px', marginTop: '5px', textShadow: '2px 2px 4px #a49f9f' }}>
      <AlignLeftOutlined /> 参数设置
    </strong>
    <Space style={{ width: '100%', marginTop: '35px' }} direction="vertical">
      <div className={styles.container}>
        
        <div className={styles.inputRow}>
          <strong>时间预算(秒)</strong>
          <TimeBudgetInput value={timeBudget} onChange={setTimeBudget} />
        </div>

        <div className={styles.inputRow}>
          <strong>核</strong>
          <CoreInput value={core} onChange={setCore} />
        </div>

        <div className={styles.inputRow}>
          <strong>采样数量</strong>
          <SampleSizeInput value={sampleSize} onChange={setSampleSize} />
        </div>
      </div>

    {/* 保存或更新参数组 */}
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
      <Input
        placeholder="输入参数组名"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={{ marginRight: '10px', width: '200px' }}
      />
      <Button type="primary" onClick={handleSave}>
        {selectedGroup ? '更新参数组' : '保存参数组'}
      </Button>
    </div>

    {/* 显示已保存的参数组 */}
    <h3 style={{ textShadow: '1px 1px 5px #a49f9f' }}>已保存的参数组</h3>
    <List
      dataSource={savedGroups}
      renderItem={(item) => {
        const isHovered = hoveredGroup === item.groupName;
        const isSelected = selectedGroup === item.groupName;

        return (
          <List.Item
            actions={[
              <Button type="link" onClick={() => handleDeleteGroup(item.groupName)} danger>
                删除
              </Button>,
            ]}
            onMouseEnter={() => setHoveredGroup(item.groupName)}
            onMouseLeave={() => setHoveredGroup(null)}
            onClick={() => handleSelectGroup(item)}
            style={{
              backgroundColor: isSelected ? '#e6f7ff' : isHovered ? '#E9E9E9' : 'white',
              cursor: 'pointer',
              transform: isHovered ? 'scale(1.08)' : isSelected ? 'scale(1.05)' : 'scale(1.0)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              padding: '9px',
              left: '8px',
              position: 'relative',
              marginBottom: '10px',
              borderRight: isHovered ? '3px solid #D9D9D9' : '#ccc',
              borderLeft: isHovered ? '3px solid #D9D9D9' : '#ccc',
              borderBottom: isSelected ? '6px solid #D9D9D9' : '2px solid #ccc',
              borderRadius: isSelected ? '15px' : isHovered ? '20px' : '10px',
            }}
          >
            <div>
              <strong>{item.groupName}</strong>: 时间预算 - {item.timeBudget} 秒, 核 - {item.core}, 采样数量 - {item.sampleSize}
            </div>
          </List.Item>
        );
      }}
    />
  </Space>
</div>

  );
};

export default InputPanel;
