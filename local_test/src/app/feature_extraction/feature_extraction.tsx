'use client';

import React, { useState, useContext, useEffect } from 'react';
import { analyzeCode } from './code_analyzer';
import { Button, Modal, Select, Radio, Flex, Collapse, Descriptions, Typography, Tooltip } from 'antd';
import { MessageOutlined, AreaChartOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined, RadarChartOutlined, ExperimentOutlined, ApiOutlined, FunctionOutlined, CodeOutlined } from '@ant-design/icons';
import { FileContext, FileDetails } from '../contexts/FileContext';
import styles from './feature_extraction.module.css';
import FeatureChart from './FeatureChart';
import ParametersChart from './ParametersChart';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import ShinyText from '../_components/ShinyText';
import { useTheme } from '~/context/ThemeContext';

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
  // 状态管理
  const [isFeatureLoading, setIsFeatureLoading] = useState(false); // 控制特征提取区域的加载状态
  const [isRequestLoading, setIsRequestLoading] = useState(false); // 控制API请求和参数区域的加载状态
  const [isHovered, setIsHovered] = useState(false); // 控制按钮悬浮状态

  // 获取主题信息
  const { theme } = useTheme();

  // 获取FileContext中的文件列表更新函数
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

  const handleFileSelect = (file: FileDetails) => {
    setSelectedFile(file);
    if (file.features) {
      setFeatures(file.features);
    }
    if (file.preferredParameters) {
      setParameters(file.preferredParameters);
      setNotes('Loaded from previous analysis');
    }
  };

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



    setIsFeatureLoading(true);
    const extractedFeatures = analyzeCode(new TextDecoder().decode(selectedFile.fileContent));
    setFeatures(extractedFeatures);

    // 强制显示至少1秒的加载状态
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsFeatureLoading(false);

    setIsRequestLoading(true);
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

            // 更新文件列表中的特征和推荐参数
            // 更新IndexedDB中的文件数据
            const request = indexedDB.open('FileStorage', 3);
            request.onsuccess = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              const transaction = db.transaction(['files'], 'readwrite');
              const store = transaction.objectStore('files');
              const getRequest = store.get(selectedFile.id);

              getRequest.onsuccess = () => {
                if (getRequest.result) {
                  const updatedFile = {
                    ...getRequest.result,
                    features: extractedFeatures,
                    preferredParameters: parsedParams
                  };
                  store.put(updatedFile);
                }
              };
            };
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
    } finally {
      setIsRequestLoading(false);
    }
  };

  // 规范化后的字符串参数
  const normalizedStringParams = normalizeStringParameters(parameters.strings);

  return (
    <div>
      <Tooltip
        title="Feature Extraction"
        placement="top"
        color={theme === 'dark' ? '#2d2d2d' : '#f9efef'}
        overlayInnerStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Button
          className={styles.featureButton}
          onClick={showModal}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          icon={<ExperimentOutlined style={{ fontSize: '1.2em' }} />}
        />
      </Tooltip>

      <Modal
        title="Feature Extraction"
        className={styles.modalWrapper}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <div className={styles.container}>
          <div className={styles.resultArea}>
            {/* 特征提取区域 */}
            {isFeatureLoading ? (
              <div className={`${styles.featureSection} ${styles.featureSectionLoading}`}>
                <Stack spacing={2} direction="row" style={{alignItems:'center'}}>
                  <CircularProgress size="3em" />
                </Stack>
              </div>
            ) : features ? (
              <div className={styles.featureSection}>
                <h3>Code Features</h3>
                <FeatureChart features={features} />
              </div>
            ) : (
              <div className={styles.featureSection}>
                <h3>Code Features</h3>
                <p>Select a file to interact with LLM</p>
              </div>
            )}
            {/* API响应区域 */}
            <div className={styles.apiResponseSection}>
              {isRequestLoading ? (
                <div className={styles.apiResponseLoading}>
                  <ShinyText text="Analysing Prefered Parameters" speed={3} styles={{ fontSize: "1.3em" }} />
                </div>
              ) : (
                <>
                  <div>
                    <h3>Predicted Optimal Initial Parameters</h3>
                    <p className={styles.notesText}>{notes}</p>
                  </div>
                  {(Object.keys(parameters.numbers).length > 0 || normalizedStringParams.length > 0) && (
                    <ParametersChart numbers={parameters.numbers} strings={normalizedStringParams} />
                  )}
                </>
              )}
            </div>
          </div>
          <div className={styles.inputArea}>
            <div className={styles.inputControls}>
              <Radio.Group
                value={selectedMode}
                onChange={handleModeChange}
                optionType="button"
                buttonStyle="outline"
                className={styles.modeSelect}
              >
                <Radio.Button value="chat">
                  <Flex gap="small" justify="center" align="center">
                    <MessageOutlined style={{ fontSize: 18 }} />
                    Chat
                  </Flex>
                </Radio.Button>
                <Radio.Button value="analyse_feature">
                  <Flex gap="small" justify="center" align="center">
                    <AreaChartOutlined style={{ fontSize: 18 }} />
                    Analyse
                  </Flex>
                </Radio.Button>
              </Radio.Group>
              <div className={styles.fileSelect}>
                <Select
                  placeholder="Select a file"
                  value={selectedFile?.fileName}
                  onChange={(value, option: any) => {
                    const file = filesWithContent.find(f => f.fileName === value);
                    if (file) handleFileSelect(file);
                  }}
                  showSearch={true}
                  style={{ width: '15em' }}
                >
                  {filesWithContent.map(file => (
                    <Select.Option key={file.fileName} value={file.fileName}>
                      {file.fileName}
                    </Select.Option>
                  ))}
                </Select>
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