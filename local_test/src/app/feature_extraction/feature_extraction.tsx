'use client';

import React, { useState, useContext } from 'react';
import { Button, Modal, Select, Radio, Flex } from 'antd';
import { MessageOutlined, AreaChartOutlined } from '@ant-design/icons';
import { FileContext, FileDetails } from '../contexts/FileContext';
import styles from './feature_extraction.module.css';

const FeatureExtraction: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('analyse_feature');
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
  const { fileList } = useContext(FileContext)!;

  const filesWithContent = fileList.filter(file => file.fileContent);

  const showModal = () => setIsModalVisible(true);
  
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedFile(null);
  };

  const handleModeChange = (e: any) => setSelectedMode(e.target.value);

  const handleFileSelect = (file: FileDetails) => setSelectedFile(file);

  const handleSend = () => {
    console.log('Sending request with:', { mode: selectedMode, file: selectedFile });
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
          <div className={styles.resultArea} />
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