'use client'
import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Tooltip, Spin } from 'antd';
import { ArrowsAltOutlined, UploadOutlined, LoadingOutlined, StopOutlined } from '@ant-design/icons';
import styles from './parf_output.module.css';
import { trpc } from '../../trpc/react';
import path from 'path';
import { FileContext, FileDetails } from '../contexts/FileContext';
import "~/styles/globals.css"

// 更新接口定义
interface GroupDetails {
  groupName: string;
  timeBudget: number;
  core: number;
  sampleSize: number;
}

interface AnalyseResponse {
  result: string;
  tempPath?: string;
}

const Log_output: React.FC = () => {
  const [displayData, setDisplayData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpandedFully, setIsExpandedFully] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);

  const { fileList, reloadFileList, getFileContent } = useContext(FileContext)!;

  const [tempPath, setTempPathState] = useState<string | undefined>(() => {
    // 初始化时从 localStorage 读取
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tempPath') || undefined;
    }
    return undefined;
  });

  //获取configuration
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'selectedGroup') {
        setSelectedGroup(JSON.parse(event.newValue || 'null'));
      }
      if (event.key === 'selectedFile') {
        setSelectedFile(JSON.parse(event.newValue || 'null'));
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 初始化时从 localStorage 读取
  useEffect(() => {
    const groupData = localStorage.getItem('selectedGroup');
    const fileData = localStorage.getItem('selectedFile');
  
    if (groupData) {
      setSelectedGroup(JSON.parse(groupData));
    }
    if (fileData) {
      setSelectedFile(JSON.parse(fileData));
    }
  }, []);



  const setTempPath = (newPath: string | undefined) => {
    setTempPathState(newPath);
    if (typeof window !== 'undefined') {
      if (newPath) {
        localStorage.setItem('tempPath', newPath);
        window.dispatchEvent(new Event('tempPathUpdated')); 
      } else {
        localStorage.removeItem('tempPath');
      }
    }
  };

  const mutation = trpc.analyse.executeCommand.useMutation();
  const folderMutation = trpc.analyse.analyseFolder.useMutation();
  const positionQuery = trpc.analyse.getQueueLength.useQuery(undefined, {
    refetchInterval: loading ? 2000 : false, // 只在loading为true时才启用轮询
    enabled: loading, 
  });

  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // 初始化时加载文件列表
  useEffect(() => {
    reloadFileList();
  }, [reloadFileList]);

  // 从IndexedDB获取文件内容
  const getFileContentFromIndexedDB = async (fileId: number): Promise<string | null> => {
    const content = await getFileContent(fileId);
    if (content) {
      const blob = new Blob([content]);
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });
    }
    return null;
  };

  // 获取文件夹中所有文件的函数
  const getAllFilesInFolder = async (folderId: number): Promise<{ path: string; content: string }[]> => {
    const result: { path: string; content: string }[] = [];

    const getFiles = async (id: number, basePath: string = '') => {
      const currentFile = fileList.find(file => file.id === id);
      if (!currentFile) return;

      // 获取子文件和文件夹
      const children = fileList.filter(file => file.parentId === id);

      for (const child of children) {
        // 构建相对路径
        const childPath = basePath ? `${basePath}/${child.fileName}` : child.fileName;

        if (child.isFolder) {
          // 递归处理子文件夹
          await getFiles(child.id, childPath);
        } else {
          // 获取文件内容
          const content = await getFileContentFromIndexedDB(child.id);
          if (content) {
            // 检查是否是config.txt，如果是则确保它在数组的最前面
            if (child.fileName === 'config.txt') {
              result.unshift({
                path: childPath,
                content,
              });
            } else {
              result.push({
                path: childPath,
                content,
              });
            }
          }
        }
      }
    };

    await getFiles(folderId);

    // 确保存在 config.txt
    if (!result.some(file => file.path.endsWith('config.txt'))) {
      throw new Error('files must include config.txt.');
    }
    
    console.log('All files loaded:', result); // 添加日志
    return result;
  };

  // 错误处理函数
  const handleError = (error: unknown, controller: AbortController) => {
    if (controller.signal.aborted) {
      setDisplayData('Analysis has been aborted.');
    } else {
      console.error("Error executing command:", error);
      setDisplayData('Failed to analyse. Please check input files.');
    }
    setLoading(false);
  };

  // 处理提交按钮
  const handleSubmit = async () => {
    setSubmitted(true);
    setDisplayData("");

    const groupData = localStorage.getItem('selectedGroup');
    const fileData = localStorage.getItem('selectedFile');

    if (!groupData || !fileData) {
      alert('Please select a parameter group and files.');
      return;
    }

    const selectedGroup = JSON.parse(groupData) as GroupDetails;
    const selectedFile = JSON.parse(fileData) as FileDetails;

    if (!selectedGroup || !selectedFile) {
      alert('Please select a parameter group and files.');
      return;
    }

    // 生成新的临时路径
    const folderName = `frama_c_folder_${Date.now()}`;
    const newTempPath = path.join('output', folderName);
    setTempPath(newTempPath);

    setLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      if (selectedFile.isFolder) {
        // 处理文件夹
        const files = await getAllFilesInFolder(selectedFile.id);

        // 调用文件夹分析接口
        folderMutation.mutate(
          {
            budget: selectedGroup.timeBudget,
            process: selectedGroup.core,
            sampleNum: selectedGroup.sampleSize,
            folderId: String(selectedFile.id),
          },
          {
            onSuccess: (response: AnalyseResponse) => {
              setDisplayData(response.result);
              setLoading(false);
            },
            onError: (error) => {
              handleError(error, controller);
            },
          }
        );
      } else {
        // 处理单个文件
        const fileContent = await getFileContentFromIndexedDB(selectedFile.id);
        if (!fileContent) {
          alert('Failed to get file content. Please try again.');
          setLoading(false);
          return;
        }

        mutation.mutate(
          {
            budget: selectedGroup.timeBudget,
            process: selectedGroup.core,
            sampleNum: selectedGroup.sampleSize,
            fileContent: fileContent,
            tempDirPath: newTempPath,
          },
          {
            onSuccess: (response: AnalyseResponse) => {
              setDisplayData(response.result);
              setLoading(false);
            },
            onError: (error) => {
              handleError(error, controller);
            },
          }
        );
      }
    } catch (error) {
      console.error("Error executing command:", error);
      setDisplayData('Failed to analyse. Please check input files.');
      setLoading(false);
    }
  };

  // 处理中止调用
  const handleAbort = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setSubmitted(false);
      setDisplayData('Analysis has been aborted.');
    }
  };

  const toggleExpand = () => {
    setIsExpandedFully(!isExpandedFully);
  };

  const returnMessage = submitted
    ? displayData
      ? 'Click to expand and view details.'
      : positionQuery.isLoading
        ? <span style={{ color: '#333399', fontWeight: 'bold' }}><Spin /> Performing 𝑃𝑎𝑟𝑓 analysis: Loading...</span>
        : positionQuery.isError
          ? 'Unable to load queue information.'
          : <span style={{ color: '#333399', fontWeight: 'bold' }}><Spin /> --Analysing-- Current queue position: {(positionQuery.data?.queueLength ?? 0) + 1}</span>
    : 'No pending analysis tasks.';

  return (
    <div className={styles.parfOutputContainer}>
      <div className={styles.displayMonitor2}>
        <div
          className={styles.codeBlock}
          style={
            submitted && displayData
              ? { fontSize: '23px', fontWeight: "bolder", color: '#19a9c6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40%' }
              : { fontSize: '20px', color: 'grey', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40%' }
          }
        >
          {returnMessage}
        </div>
        
        <div>
          <Tooltip title={loading ? 'Cancel the current call.' : 'Click to analyse'}>
            <button
              className={loading ? styles.submitButton_abort : styles.submitButton}
              onClick={loading ? handleAbort : handleSubmit}
              disabled={loading && !abortController}
            >
              {loading ? <StopOutlined /> : <UploadOutlined />}
              {loading ? ' Abort' : ' Analyse'}
            </button>
          </Tooltip>
        </div>

        {displayData && (
          <Tooltip title="Click to check detailed analysis.">
            <ArrowsAltOutlined onClick={toggleExpand} className={styles.expandIcon} />
          </Tooltip>
        )}
      </div>

      <Modal
        title="View the detailed analysis"
        visible={isExpandedFully}
        onCancel={toggleExpand}
        footer={[
          <Button key="close" type="primary" onClick={toggleExpand}>
            Close
          </Button>,
        ]}
        width={800}
        style={{ top: 0 }}
      >
        <pre className={styles.modalCodeBlock}>{displayData}</pre>
      </Modal>
    </div>
  );
};

export default Log_output;