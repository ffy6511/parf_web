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
  value: number; // value 是一个 number 类型
  onChange: (value: number) => void; // onChange 是一个接受 number 参数并返回 void 的函数
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
  value: number; // value 是一个 number 类型
  onChange: (value: number) => void; // onChange 是一个接受 number 参数并返回 void 的函数
}

// 核输入
const CoreInput : React.FC<CoreInputProps> = ({ value, onChange }) => (
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
  value: number; // value 是一个 number 类型
  onChange: (value: number) => void; // onChange 是一个接受 number 参数并返回 void 的函数
}

// 采样数量输入
const SampleSizeInput : React.FC<SampleSizeInputProps> = ({ value, onChange }) => (
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
  const [groupName, setGroupName] = useState<string>(''); // 参数组名称
  const [savedGroups, setSavedGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null); // 当前选中的参数组
  const [hoveredGroup, setHoveredGroup] = useState(null);

  useEffect(() => {
    const request = openDatabase();
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      loadSavedGroups(db);
    };
  }, []);

  // 显示提示
  const showMessage = (type: 'success' | 'info' | 'error', content: string) => {
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
    showMessage('info', `已选择参数组 "${group.groupName}" `);

    // 保存到 localStorage
    localStorage.setItem('selectedGroup', JSON.stringify(group));
  };

  // 删除参数组
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
        <AlignLeftOutlined /> Parameter Setting
      </strong>

      <div style={{ width: '100%', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
          <Input
            placeholder="输入参数组名"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{ marginRight: '10px', width: '200px' }}
          />
          <Button type="primary" onClick={handleSave} className = "sendButton">
            {selectedGroup ? '更新参数组' : '保存参数组'}
          </Button>
        </div>

        {/* 显示已保存的参数组 */}
        <strong style={{ textShadow: '1px 1px 4px #a49f9f', marginTop: '3px',fontSize: '15px', color:'#4f4e4e' }}>
        <UnorderedListOutlined /> Parameter Groups
          </strong>
        <div
          style={{
            maxHeight: '40vh', // 限制最大高度
            overflowY: 'auto', // 启用垂直滚动
            padding: '3px',
            marginTop: '-5px',
            listStyle: 'none',
            scrollbarWidth: 'thin', // 用于 Firefox 的细滚动条
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
                时间预算: {item.timeBudget} 秒   核数: {item.core}   采样数量: {item.sampleSize}
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
