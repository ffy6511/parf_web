import React, { useState } from 'react';
import { Col, InputNumber, Row, Slider, Space } from 'antd';


//时间预算
const TimeBudgetInput = () => {
  const [inputValue, setInputValue] = useState(1);
  
  const onChange = (newValue: number) => {
    setInputValue(newValue);
  };
  
  return (
    <Row>
      <Col span={12}>
        <Slider
          min={0}
          max={2000} 
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          step={1}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={0}
          max={2000}
          style={{
            margin: '0 16px',
          }}
          value={inputValue}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};


//核
const CoreInput = () => {
  const [inputValue, setInputValue] = useState(1);

  const onChange = (newValue: number) => {
    setInputValue(newValue);
  };

  return (
    <Row>
      <Col span={12}>
        <Slider
          min={1}
          max={64}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          step={1}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={1}
          max={64} // Same here for max value
          style={{
            margin: '0 16px',
          }}
          value={inputValue}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

//采样数量
const SampleSizeInput = () => {
  const [inputValue, setInputValue] = useState(1);

  const onChange = (newValue: number) => {
    setInputValue(newValue);
  };

  return (
    <Row>
      <Col span={12}>
        <Slider
          min={1}
          max={1000} 
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          step={1}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={1}
          max={1000} 
          style={{
            margin: '0 16px',
          }}
          value={inputValue}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

const InputPanel = () => (
  <Space
    style={{
      width: '100%',
    }}
    direction="vertical"
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>时间预算(秒)</h3>
        <TimeBudgetInput />
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>核</h3>
        <CoreInput />
    </div>


    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>采样数量</h3>
        <SampleSizeInput />
    </div>
    
  </Space>
);

export default InputPanel;
