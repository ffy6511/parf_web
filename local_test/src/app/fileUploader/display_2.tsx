// FileUploadContainer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface FileUploadContainerProps {
  onFileUploadSuccess: () => void; // 文件上传成功后的回调
}

const FileUploadContainer: React.FC<FileUploadContainerProps> = ({ onFileUploadSuccess }) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [fileName, setFileName] = useState<string>(''); // 手动输入的文件名
  const [fileContent, setFileContent] = useState<string>(''); // 手动输入的文件内容

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
      const dbResult = (event.target as IDBOpenDBRequest).result;
      setDb(dbResult);
    };
  }, []);

  // 文件上传处理
  const handleUpload = (file: File) => {
    if (db) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as ArrayBuffer;
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        const data = {
          fileName: file.name,
          fileContent: fileContent,
          lastModified: new Date().toISOString(),
        };
        store.add(data).onsuccess = () => {
          message.success(`文件 ${file.name} 上传成功`);
          onFileUploadSuccess(); // 上传成功后调用回调函数，通知Display_1刷新
        };
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // 手动输入提交
  const handleManualInputSubmit = () => {
    if (db && fileName && fileContent) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const data = {
        fileName: fileName,
        fileContent: new TextEncoder().encode(fileContent).buffer, // 将文本内容转为 ArrayBuffer
        lastModified: new Date().toISOString(),
      };
      store.add(data).onsuccess = () => {
        message.success(`文件 ${fileName} 已手动输入`);
        setFileName(''); // 清空文件名输入框
        setFileContent(''); // 清空文件内容输入框
        onFileUploadSuccess(); // 上传成功后调用回调函数，通知Display_1刷新
      };
    } else {
      message.error('请填写文件名和文件内容');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <Upload
          beforeUpload={(file) => {
            handleUpload(file);
            return false; // 阻止默认上传行为
          }}
        >
          <Button icon={<UploadOutlined />}>选择文件上传</Button>
        </Upload>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Input
          placeholder="文件名"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Input.TextArea
          placeholder="文件内容"
          rows={6}
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
        />
        <Button type="primary" onClick={handleManualInputSubmit} style={{ marginTop: '10px' }}>
          提交手动输入
        </Button>
      </div>
    </div>
  );
};

export default FileUploadContainer;
