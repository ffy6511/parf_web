// InputPanel.tsx
import React, { useState } from 'react';
import { Col, InputNumber, Row, Slider, Space } from 'antd';

const TimeBudgetInput = () => {
  const [inputValue, setInputValue] = useState(1);
  
  const onChange = (newValue: number) => {
    setInputValue(newValue);
  };
  
  return (
    <Row>
      <Col span={12}>
        <Slider
          min={1}
          max={100} // You can adjust the max value according to your needs
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          step={1}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={1}
          max={100} // Same here for max value
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
          max={64} // You can adjust the max value according to your needs
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
          max={1000} // You can adjust the max value according to your needs
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          step={1}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={1}
          max={1000} // Same here for max value
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
    <h3>时间预算</h3>
    <TimeBudgetInput />
    <h3>核</h3>
    <CoreInput />
    <h3>采样数量</h3>
    <SampleSizeInput />
  </Space>
);

export default InputPanel;
