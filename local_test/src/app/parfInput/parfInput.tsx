import React, { useState, useEffect } from 'react';
import { Modal, Button, Tooltip, Spin } from 'antd';
import { ArrowsAltOutlined } from '@ant-design/icons';
import styles from './parfInput.module.css';
import { trpc } from '../../trpc/react'; // 导入 trpc 客户端

// 定义 Group 和 File 的接口类型
interface GroupDetails {
  groupName: string;
  timeBudget: number;
  core: number;
  sampleSize: number;
}

interface FileDetails {
  id: number;
  fileName: string;
}

interface AnalyseResponse {
  result: string; 
}

const ParfInput: React.FC = () => {
  const [displayData, setDisplayData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpandedFully, setIsExpandedFully] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);

  const mutation = trpc.analyse.executeCommand.useMutation();

  // 从localStorage加载文件和参数组
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const groupData = localStorage.getItem('selectedGroup');
      if (groupData) {
        setSelectedGroup(JSON.parse(groupData) as GroupDetails);
      }

      const fileData = localStorage.getItem('selectedFile');
      if (fileData) {
        setSelectedFile(JSON.parse(fileData) as FileDetails);
      }
    }
  }, []);

  // 从IndexedDB获取文件内容
  const getFileContentFromIndexedDB = (fileId: number) => {
    return new Promise<string | null>((resolve, reject) => {
      const request = indexedDB.open('FileStorage', 1);

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
          reject('Failed to load file from IndexedDB');
        };
      };
    });
  };

  // 添加一个状态来跟踪是否已经点击了提交按钮
  const [submitted, setSubmitted] = useState(false);

  // 处理提交按钮
  const handleSubmit = async () => {
    setSubmitted(true); // 用户点击了提交按钮，更新状态
    setDisplayData("");//重置显示区数据
    if (!selectedGroup || !selectedFile) {
      alert('请选择一个参数组和文件！');
      return;
    }

    setLoading(true);

    try {
      // 获取文件内容
      const fileContent = await getFileContentFromIndexedDB(selectedFile.id);

      if (!fileContent) {
        alert('无法获取文件内容');
        setLoading(false);
        return;
      }

      // 向后端提交请求，通过调用 mutate 方法
      mutation.mutate(
        {
          budget: selectedGroup.timeBudget,
          process: selectedGroup.core,
          sampleNum: selectedGroup.sampleSize,
          fileContent: fileContent,
        },
        {
          onSuccess: (response: AnalyseResponse) => {
            setDisplayData(response.result);
          },
          onError: (error) => {
            console.error("Error executing command:", error);
            setDisplayData('命令执行失败');
          },
        }
      );

    } catch (error) {
      console.error("Error executing command:", error);
      setDisplayData('命令执行失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    setIsExpandedFully(!isExpandedFully);
  };

  // 根据submitted和displayData的值决定返回区的显示内容
  const returnMessage = submitted
  ? displayData
    ? '点击查看详情'
    : <Spin/>
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
        {/* <pre className={styles.codeBlock}>
          {displayData ? '点击查看详情' : '等待数据返回...'}
        </pre> */}
        {/* <pre className={styles.codeBlock} style={displayData ? { fontSize: '30px', color: 'green' } : { fontSize: '30px', color: 'grey' }}>
          {displayData ? '点击查看详情' : '等待数据返回...'}
        </pre> */}
        <div className={styles.codeBlock}
          style={
            submitted && displayData
              ? { fontSize: '20px', color: 'green', display:'flex',alignItems: 'center', justifyContent: 'center', height: '60%' }
              : { fontSize: '20px', color: 'grey', display:'flex',alignItems: 'center', justifyContent: 'center', height: '60%'}
          }
        >
          {returnMessage}
        </div>
        <div>
          <button 
          className={styles.submitButton} 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? '提交中...' : '提交调用'}
      </button>
        </div>
        
      </div>



      <Modal
        title="查看返回数据"
        visible={isExpandedFully}
        onCancel={toggleExpand}
        footer={[
          <Button key="close" type="primary" onClick={toggleExpand}>
            关闭
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <pre className={styles.modalCodeBlock}>{displayData}</pre>
      </Modal>
    </div>
  );
};

export default ParfInput;


