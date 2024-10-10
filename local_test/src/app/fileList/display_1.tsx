// Display_1.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FileEntry from './components/fileEntry'; // 导入FileEntry组件
import { Modal, Input, Button, message } from 'antd';
import styles from './fileList.module.css';

interface FileData {
  id: number;
  fileName: string;
  lastModified: string;
  fileContent: ArrayBuffer;
}

const Display_1: React.FC = () => {
  const [fileList, setFileList] = useState<FileData[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // 编辑弹窗
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false); // 预览弹窗

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
      const dbResult = (event.target as IDBOpenDBRequest).result;
      setDb(dbResult);
      loadFilesFromDB(dbResult);
    };
  }, []);

  // 加载文件列表
  const loadFilesFromDB = (db: IDBDatabase) => {
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    const request = store.getAll();

    request.onsuccess = () => {
      setFileList(request.result);
    };
  };

  // 点击选中文件
  const handleFileClick = (fileId: number) => {
    setSelectedFileId(fileId);
  };

  // 编辑文件
  const handleFileEdit = (fileId: number) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(fileId);

      request.onsuccess = () => {
        if (request.result) {
          const fileData = request.result.fileContent;
          const blob = new Blob([fileData]);
          const reader = new FileReader();
          reader.onload = () => {
            setSelectedFileContent(reader.result as string);
            setIsEditModalVisible(true); // 打开编辑弹窗
          };
          reader.readAsText(blob);
        }
      };
    }
  };

  // 预览文件
  const handleFilePreview = (fileId: number) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(fileId);

      request.onsuccess = () => {
        if (request.result) {
          const fileData = request.result.fileContent;
          const blob = new Blob([fileData]);
          const reader = new FileReader();
          reader.onload = () => {
            setSelectedFileContent(reader.result as string);
            setIsPreviewModalVisible(true); // 打开预览弹窗
          };
          reader.readAsText(blob);
        }
      };
    }
  };

  
//删除文件
  const handleDeleteFile = (fileId: number) => {
    console.log('删除文件ID:', fileId); // 确保删除ID正确
    if (db) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.delete(fileId);
  
      request.onsuccess = () => {
        console.log('文件删除成功');
        setFileList((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
        if (fileId === selectedFileId) {
          setSelectedFileId(null);
          setSelectedFileContent(null);
        }
      };
  
      request.onerror = (event) => {
        console.error('删除文件时发生错误:', event);
      };
    }
  };
  

  // 保存编辑后的文件内容
  const handleSaveContent = () => {
    if (db && selectedFileId && selectedFileContent) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const encoder = new TextEncoder();
      const updatedContent = encoder.encode(selectedFileContent).buffer;

      const request = store.get(selectedFileId);
      request.onsuccess = () => {
        const fileData = request.result;
        if (fileData) {
          fileData.fileContent = updatedContent;
          store.put(fileData).onsuccess = () => {
            message.success('文件内容已保存');
            loadFilesFromDB(db); // 刷新文件列表
            setIsEditModalVisible(false); // 关闭编辑弹窗
          };
        }
      };
    }
  };

  return (
    <div className={styles.container}>
      
      {fileList.length > 0 ? (
        <ul style={{ padding: 10, listStyle: 'none',
          overflowY:'scroll',
          maxHeight:'78vh',
          overflowX:'hidden',
          scrollbarWidth: 'thin',
         }}>
          {fileList.map((file) => (
            <li key={file.id} style={{ marginBottom: '10px', }}>
              <FileEntry
                fileId={file.id}
                fileName={file.fileName}
                lastModified={file.lastModified}
                onClick={handleFileClick}
                onDelete={handleDeleteFile}
                onEdit={() => handleFileEdit(file.id)} // 传递编辑回调
                onPreview={() => handleFilePreview(file.id)} // 传递预览回调
                isSelected={selectedFileId === file.id}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>没有文件</p>
      )}

      {/* 编辑弹窗 */}
      <Modal
        title="编辑文件内容"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="save" type="primary" onClick={handleSaveContent}>
            保存
          </Button>,
        ]}
        width={800} // 调整宽度
        style={{ top: 20 }} // 调整距离顶部的高度
      >
        <Input.TextArea
          value={selectedFileContent}
          rows={25}
          onChange={(e) => setSelectedFileContent(e.target.value)}
        />
      </Modal>

      {/* 预览弹窗 */}
      <Modal
        title="预览文件内容"
        visible={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={null}
        width={800} // 调整宽度
        style={{ top: 20 }} // 调整距离顶部的高度
      >
        <pre>{selectedFileContent}</pre>
      </Modal>
    </div>
    
  );
};

export default Display_1;
