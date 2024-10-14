import React, { useState, useEffect } from 'react';
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

  // 获取 tRPC 的 mutation hook
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

  // 处理提交按钮
  const handleSubmit = async () => {
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

  return (
    <div className={styles.parfInputContainer}>
      {/* 显示器部分 */}
      <div className={`${styles.displayMonitor} ${isExpandedFully ? styles.expandedFully : ''}`}>
        <strong>调用返回区</strong>
        <pre className={styles.codeBlock}>
          {displayData ? displayData : '等待数据返回...'}
        </pre>
        {displayData && (
          <button onClick={toggleExpand} className={styles.expandButton}>
            {isExpandedFully ? '折叠' : '展开'}
          </button>
        )}
      </div>

      {/* 提交按钮 */}
      <button className={styles.submitButton} onClick={handleSubmit} disabled={loading} style={{
        marginTop: '10px', marginLeft: '400px'
      }}>
        {loading ? '提交中...' : '提交调用'}
      </button>
    </div>
  );
};

export default ParfInput;
