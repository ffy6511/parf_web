'use client';

import React, { useState, useContext, useEffect } from 'react';
import { analyzeCode } from './code_analyzer';
import { Button, Modal, Select, Radio, Flex } from 'antd';
import { MessageOutlined, AreaChartOutlined } from '@ant-design/icons';
import { FileContext, FileDetails } from '../contexts/FileContext';
import styles from './feature_extraction.module.css';
import FeatureChart from './FeatureChart';
import ParametersChart from './ParametersChart';

const FeatureExtraction: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('analyse_feature');
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
  const [features, setFeatures] = useState<any>(null);
  const [notes, setNotes] = useState<string>('');
  const [parameters, setParameters] = useState<{
    numbers: Parameters;
    strings: Record<string, string>;
  }>({ numbers: {} as Parameters, strings: {} });

  const { fileList } = useContext(FileContext)!;
  const filesWithContent = fileList.filter(file => file.fileContent);

  const showModal = () => setIsModalVisible(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedFile(null);
    setNotes('');
    setParameters({ numbers: {}, strings: {} });
  };

  const handleModeChange = (e: any) => setSelectedMode(e.target.value);

  const handleFileSelect = (file: FileDetails) => setSelectedFile(file);

  const parseParameters = (paramString: string): { numbers: Record<string, number>, strings: Record<string, string> } => {
    const numbers: Record<string, number> = {};
    const strings: Record<string, string> = {};
    
    // 按空格分割参数字符串，并过滤掉空字符串
    const paramArray = paramString.trim().split(/\s+/).filter(Boolean);
    
    let i = 0;
    while (i < paramArray.length) {
      // 确保当前元素是一个键（以 -eva- 开头）
      if (paramArray[i].startsWith('-eva-')) {
        const key = paramArray[i].replace(/^-eva-/, ''); // 移除 -eva- 前缀
        
        // 检查下一个元素是否存在且不是一个新的键（即不以 -eva- 开头）
        if (i + 1 < paramArray.length && !paramArray[i + 1].startsWith('-eva-')) {
          const value = paramArray[i + 1];
          // 尝试将值转换为数字
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue)) {
            numbers[key] = numValue;
          } else {
            strings[key] = value;
          }
          i += 2; // 跳过键和值，继续处理下一对
        } else {
          // 如果没有值（例如 -eva-remove-redundant-alarms），将其作为字符串参数，值为空
          strings[key] = '';
          i += 1; // 仅跳过键，继续处理下一个参数
        }
      } else {
        // 如果当前元素不是以 -eva- 开头，可能是解析错误，跳过
        i += 1;
      }
    }
    
    return { numbers, strings };
  };

  const handleSend = async () => {
    if (!selectedFile?.fileContent) return;

    const extractedFeatures = analyzeCode(new TextDecoder().decode(selectedFile.fileContent));
    setFeatures(extractedFeatures);
    const requestBody = {
      inputs: {
        mode: selectedMode,
        features: JSON.stringify(extractedFeatures),
      },
      response_mode: "blocking",
      user: "abc-123",
    };

    try {
      const response = await fetch('https://api.dify.ai/v1/workflows/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.data.outputs && data.data.outputs.KFP && data.data.outputs.KFP.trim()) {
        try {
          const kfpData = JSON.parse(data.data.outputs.KFP);
          setNotes(kfpData.notes || 'No notes available');

          if (kfpData.parameters) {
            const parsedParams = parseParameters(kfpData.parameters);
            setParameters(parsedParams);
            console.log('Parsed Parameters:', parsedParams);
          } else {
            setParameters({ numbers: {}, strings: {} });
          }
        } catch (parseError) {
          console.error('Error parsing KFP data:', parseError);
          setNotes('Error: Invalid KFP data format');
          setParameters({ numbers: {}, strings: {} });
        }
      } else {
        setNotes('No KFP data available');
        setParameters({ numbers: {}, strings: {} });
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setNotes('Error: Failed to fetch API response');
      setParameters({ numbers: {}, strings: {} });
    }
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Feature Extraction
      </Button>
      <Modal
        title="Feature Extraction"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <div className={styles.container}>
          <div className={styles.resultArea}>
            {features && (
              <div className={styles.featureSection}>
                <h3>Code Features</h3>
                <FeatureChart features={features} />
              </div>
            )}
            <div className={styles.apiResponseSection}>
              <h3>API Response</h3>
              <div>
                <h4>Notes:</h4>
                <p>{notes}</p>
              </div>
              {Object.keys(parameters.numbers).length > 0 && (
                <div>
                  <h4>Numeric Parameters:</h4>
                  <ParametersChart parameters={parameters.numbers} />
                </div>
              )}
              {Object.keys(parameters.strings).length > 0 && (
                <div>
                  <h4>String Parameters:</h4>
                  <ul>
                    {Object.entries(parameters.strings).map(([key, value]) => (
                      <li key={key}>{`${key}: ${value}`}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className={styles.inputArea}>
            <div className={styles.inputControls}>
              <Radio.Group
                className={styles.modeSelect}
                value={selectedMode}
                onChange={handleModeChange}
                optionType="button"
                buttonStyle="outline"
                options={[
                  {
                    value: 'chat',
                    label: (
                      <Flex gap="small" justify="center" align="center">
                        <MessageOutlined style={{ fontSize: 18 }} />
                        Chat
                      </Flex>
                    ),
                  },
                  {
                    value: 'analyse_feature',
                    label: (
                      <Flex gap="small" justify="center" align="center">
                        <AreaChartOutlined style={{ fontSize: 18 }} />
                        Analyse
                      </Flex>
                    ),
                  },
                ]}
              />
              <div className={styles.fileSelect}>
                <Select
                  placeholder="Select a file"
                  value={selectedFile?.fileName}
                  onChange={(_, option: any) => {
                    const file = filesWithContent.find(f => f.fileName === option.value);
                    if (file) handleFileSelect(file);
                  }}
                  options={filesWithContent.map(file => ({
                    value: file.fileName,
                    label: file.fileName,
                  }))}
                />
                {selectedFile && (
                  <Button className={styles.sendButton} onClick={handleSend}>
                    Send
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeatureExtraction;