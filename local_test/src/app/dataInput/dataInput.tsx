import React, { useState, useEffect } from 'react';
import { Row, Col, Slider, InputNumber, Space, Button, List, Input, notification } from 'antd';

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
    <Col span={18}>
      <Slider min={0} max={2000} onChange={onChange} value={typeof value === 'number' ? value : 0} step={1} />
    </Col>
    <Col span={6}>
      <InputNumber min={0} max={2000} value={value} onChange={onChange} style={{ width: '100px', marginLeft: '5px' }} />
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
      <InputNumber min={1} max={64} value={value} onChange={onChange} style={{ width: '100px', marginLeft: '5px' }} />
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
      <InputNumber min={1} max={1000} value={value} onChange={onChange} style={{ width: '100px', marginLeft: '5px' }} />
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

  useEffect(() => {
    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      loadSavedGroups(db);
    };
  }, []);

  // 弹出通知
  const openNotificationWithIcon = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    notification[type]({
      message: message,
      description: description,
    });
  };

  // 保存或更新参数组
  const handleSave = () => {
    if (!groupName) {
      alert('请输入参数组名！');
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
        openNotificationWithIcon('success', '保存成功', `参数组 "${groupName}" 已保存`);
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
    openNotificationWithIcon('info', '已选中', `参数组 "${group.groupName}" 已被选中`);
  };

  // 删除参数组
  const handleDeleteGroup = (groupName: string) => {
    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['parameters'], 'readwrite');
      const store = transaction.objectStore('parameters');

      store.delete(groupName).onsuccess = () => {
        openNotificationWithIcon('warning', '删除成功', `参数组 "${groupName}" 已删除`);
        loadSavedGroups(db);
      };
    };
  };

  return (
    <div>
      <h1>参数设置</h1>
      <Space style={{ width: '100%' }} direction="vertical">
        <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
          <p style={{ margin: 0, marginRight: '10px' }}>时间预算(秒)</p>
          <TimeBudgetInput value={timeBudget} onChange={setTimeBudget} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
          <p style={{ margin: 0, marginRight: '10px' }}>核</p>
          <CoreInput value={core} onChange={setCore} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
          <p style={{ margin: 0, marginRight: '10px' }}>采样数量</p>
          <SampleSizeInput value={sampleSize} onChange={setSampleSize} />
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
        <h3>已保存的参数组</h3>
        <List
          bordered
          dataSource={savedGroups}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => handleDeleteGroup(item.groupName)} danger>
                  删除
                </Button>,
              ]}
              onClick={() => handleSelectGroup(item)}
              style={{
                backgroundColor: selectedGroup === item.groupName ? '#e6f7ff' : 'white', // 高亮选中的组
                cursor: 'pointer',
              }}
            >
              <div>
                <strong>{item.groupName}</strong>: 时间预算 - {item.timeBudget} 秒, 核 - {item.core}, 采样数量 - {item.sampleSize}
              </div>
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
};

export default InputPanel;
