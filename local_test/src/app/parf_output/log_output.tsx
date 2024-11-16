'use client'
import React, { useState, useEffect } from 'react';
import { Modal, Button, Tooltip, Spin } from 'antd';
import { ArrowsAltOutlined, UploadOutlined, LoadingOutlined, StopOutlined } from '@ant-design/icons';
import styles from './parf_output.module.css';
import { trpc } from '../../trpc/react';
import "~/styles/globals.css"


// 更新接口定义
interface GroupDetails {
  groupName: string;
  timeBudget: number;
  core: number;
  sampleSize: number;
}

interface FileDetails {
  id: number;
  fileName: string;
  fileContent?: ArrayBuffer;
  isFolder?: boolean;
  parentId?: number | null;
  path?: string;
  lastModified: string;
}

interface AnalyseResponse {
  result: string;
  tempPath?:string;
}

const Log_output: React.FC = () => {
  const [displayData, setDisplayData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpandedFully, setIsExpandedFully] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
  const [fileList, setFileList] = useState<FileDetails[]>([]);

  const [tempPath, setTempPathState] = useState<string | undefined>(() => {
    // 初始化时从 localStorage 读取
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tempPath') || undefined;
    }
    return undefined;
  });

  const setTempPath = (newPath: string | undefined) => {
    setTempPathState(newPath);
    if (typeof window !== 'undefined') {
      if (newPath) {
        localStorage.setItem('tempPath', newPath);
      } else {
        localStorage.removeItem('tempPath');
      }
    }
  };
  



  const mutation = trpc.analyse.executeCommand.useMutation();
  const folderMutation = trpc.analyse.analyseFolder.useMutation();
  const positionQuery = trpc.analyse.getQueueLength.useQuery(undefined, {
    refetchInterval: 2000,
  });

  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // 从IndexedDB加载文件列表
  useEffect(() => {
    const loadFileList = async () => {
      const request = indexedDB.open('FileStorage', 3);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          setFileList(getAllRequest.result);
        };
      };
    };

    loadFileList();
  }, []);

  // 从IndexedDB获取文件内容
  const getFileContentFromIndexedDB = async (fileId: number): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FileStorage', 3);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const fileRequest = store.get(fileId);

        fileRequest.onsuccess = () => {
          if (fileRequest.result) {
            const fileData = fileRequest.result.fileContent;
            const blob = new Blob([fileData]);
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.readAsText(blob);
          } else {
            resolve(null);
          }
        };

        fileRequest.onerror = () => {
          reject(new Error('Failed to load file from IndexedDB'));
        };
      };
    });
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
      throw new Error('文件夹中必须包含 config.txt 文件');
    }

    return result;
  };

  // 错误处理函数
  const handleError = (error: unknown, controller: AbortController) => {
    if (controller.signal.aborted) {
      setDisplayData('调用已中止');
    } else {
      console.error("Error executing command:", error);
      setDisplayData('命令执行失败,请检查代码文件');
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
      alert('请选择一个参数组和文件！');
      return;
    }

    const selectedGroup = JSON.parse(groupData) as GroupDetails;
    const selectedFile = JSON.parse(fileData) as FileDetails;
    
    if (!selectedGroup || !selectedFile) {
      alert('请选择一个参数组和文件！');
      return;
    }

    // 生成新的临时路径
    const newTempPath = `frama_c_folder_${Date.now()}`;
    setTempPath(newTempPath); // 使用 hook 设置新的临时路径


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
            files,
            folderPath: selectedFile.fileName,
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
      } else {
        // 处理单个文件
        const fileContent = await getFileContentFromIndexedDB(selectedFile.id);
        if (!fileContent) {
          alert('无法获取文件内容');
          setLoading(false);
          return;
        }

        mutation.mutate(
          {
            budget: selectedGroup.timeBudget,
            process: selectedGroup.core,
            sampleNum: selectedGroup.sampleSize,
            fileContent,
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
      setDisplayData('命令执行失败,请检查代码文件');
      setLoading(false);
    }
  };

  // 处理中止调用
  const handleAbort = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setSubmitted(false);
      setDisplayData('调用已中止');
    }
  };

  const toggleExpand = () => {
    setIsExpandedFully(!isExpandedFully);
  };

  const returnMessage = submitted
    ? displayData
      ? '点击查看详情'
      : positionQuery.isLoading
        ? <span style={{color: '#333399', fontWeight: 'bold' }}><Spin/> 正在调用𝑷𝒂𝒓𝒇分析: 加载中...</span>
        : positionQuery.isError
          ? '无法加载队列信息'
          : <span style={{color: '#333399', fontWeight: 'bold' }}><Spin/> --正在分析-- 所处队列位置: {(positionQuery.data?.queueLength ?? 0) + 1}</span>
    : '尚无待分析任务';

  return (
    <div className={styles.parfInputContainer}>
      <div className={styles.displayMonitor}>
        <strong>
          调用返回区
          {displayData && (
            <Tooltip title="查看分析结果">
              <ArrowsAltOutlined onClick={toggleExpand} className={styles.expandIcon} />
            </Tooltip>
          )}
        </strong>

        <div
          className={styles.codeBlock}
          style={
            submitted && displayData
              ? { fontSize: '23px', fontWeight:"bolder", color: '#19a9c6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%' }
              : { fontSize: '20px', color: 'grey', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%' }
          }
        >
          {returnMessage}
        </div>

      </div>

      <Modal
        title="查看返回数据"
        open={isExpandedFully}
        onCancel={toggleExpand}
        footer={[
          <Button key="close" type="primary" onClick={toggleExpand}>
            关闭
          </Button>,
        ]}
        width={800}
        style={{ top: 0 }}
      >
        <pre className={styles.modalCodeBlock}>{displayData}</pre>
      </Modal>

      <div>
          <Tooltip title={loading ? '中止当前调用' : '调用Parf分析当前设置'}>
            <button
              className={loading ? styles.submitButton_abort : styles.submitButton}
              onClick={loading ? handleAbort : handleSubmit}
              disabled={loading && !abortController}
            >
              {loading ? <StopOutlined /> : <UploadOutlined />}
              {loading ? ' 中止调用' : ' 提交调用'}
            </button>
          </Tooltip>
        </div>

    </div>
  );
};

export default Log_output;