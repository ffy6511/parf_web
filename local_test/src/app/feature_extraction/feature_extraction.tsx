'use client';

import React, { useState, useContext, useEffect } from 'react';
import { analyzeCode } from './code_analyzer';
import { Button, Modal, Select, Radio, Flex, Collapse, Descriptions, Typography } from 'antd';
import { MessageOutlined, AreaChartOutlined } from '@ant-design/icons';
import { FileContext, FileDetails } from '../contexts/FileContext';
import styles from './feature_extraction.module.css';
import FeatureChart from './FeatureChart';
import ParametersChart from './ParametersChart';

const { Title } = Typography;
const { Panel } = Collapse;

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
    
    const paramArray = paramString.trim().split(/\s+/).filter(Boolean);
    
    let i = 0;
    while (i < paramArray.length) {
      if (paramArray[i].startsWith('-eva-')) {
        const key = paramArray[i].replace(/^-eva-/, '');
        if (i + 1 < paramArray.length && !paramArray[i + 1].startsWith('-eva-')) {
          const value = paramArray[i + 1];
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue)) {
            numbers[key] = numValue;
          } else {
            strings[key] = value;
          }
          i += 2;
        } else {
          strings[key] = '';
          i += 1;
        }
      } else {
        i += 1;
      }
    }
    
    return { numbers, strings };
  };

  // 规范化字符串参数
  const normalizeStringParameters = (strings: Record<string, string>) => {
    return Object.entries(strings).map(([key, value]) => {
      if (!value) return { key, values: [] };
      if (typeof value === 'string' && value.includes(',')) {
        return { key, values: value.split(',').map((v) => v.trim()) };
      }
      return { key, values: [value] };
    });
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

  // 规范化后的字符串参数
  const normalizedStringParams = normalizeStringParameters(parameters.strings);

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
        width={1000}
      >
        <div className={styles.container}>
          <div className={styles.resultArea}>
            {features && (
              <div className={styles.featureSection}>
                <h3>Code Features</h3>
                <FeatureChart features={features} parameters={parameters} />
              </div>
            )}
            <div className={styles.apiResponseSection}>
              <div>
                <h3>Notes:</h3>
                <p>{notes}</p>
              </div>
              {(Object.keys(parameters.numbers).length > 0 || normalizedStringParams.length > 0) && (
                <ParametersChart numbers={parameters.numbers} strings={normalizedStringParams} />
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