'use client';

import React, { useState, useContext } from 'react';
import { analyzeCode } from './code_analyzer';
import { Button, Modal, Select, Radio, Flex } from 'antd';
import { MessageOutlined, AreaChartOutlined } from '@ant-design/icons';
import { FileContext, FileDetails } from '../contexts/FileContext';
import styles from './feature_extraction.module.css';
import { env } from '../../env';
import FeatureChart from './FeatureChart';

const FeatureExtraction: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('analyse_feature');
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
  const [features, setFeatures] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<string>('');
  const { fileList } = useContext(FileContext)!;

  const filesWithContent = fileList.filter(file => file.fileContent);

  const showModal = () => setIsModalVisible(true);
  
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedFile(null);
  };

  const handleModeChange = (e: any) => setSelectedMode(e.target.value);

  const handleFileSelect = (file: FileDetails) => setSelectedFile(file);

  const handleSend = async () => {
    if (!selectedFile?.fileContent) return;

    // 将 ArrayBuffer 转换为字符串后再进行分析
    const extractedFeatures = analyzeCode(new TextDecoder().decode(selectedFile.fileContent));
    setFeatures(extractedFeatures);
    const requestBody = {
      inputs: {
        mode: selectedMode,
        feature: JSON.stringify(features)
      },
      response_mode: "streaming",
      user: "abc-123"
    };

    // try {
    //   const response = await fetch('https://api.dify.ai/v1/workflows/run', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(requestBody)
    //   });

    //   const data = await response.json();
      
    //   // 处理非空字段
    //   const nonEmptyFields: Record<string, any> = {};
    //   if (data.CDP !== null) nonEmptyFields.CDP = data.CDP;
    //   if (data.KFP !== null) {
    //     try {
    //       nonEmptyFields.KFP = JSON.parse(data.KFP);
    //     } catch (e) {
    //       nonEmptyFields.KFP = data.KFP;
    //     }
    //   }
      
    //   setApiResponse(JSON.stringify(nonEmptyFields, null, 2));
    // } catch (error) {
    //   console.error('Error sending request:', error);
    // }

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
                <FeatureChart features={features} />
                {/* <pre>{JSON.stringify(features, null, 2)}</pre> */}
              </div>
            )}
            {apiResponse && (
              <div className={styles.apiResponseSection}>
                <h3>API Response:</h3>
                <pre>{apiResponse}</pre>
              </div>
            )}
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
                    label: file.fileName
                  }))}
                />
                {selectedFile && (
                  <Button 
                    className={styles.sendButton}
                    onClick={handleSend}
                  >
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