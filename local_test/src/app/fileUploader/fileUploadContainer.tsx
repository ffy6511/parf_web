'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const FileUploadContainer: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<'upload' | 'input' | null>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');

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
        };
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleManualInputSubmit = () => {
    if (db && fileName && fileContent) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const data = {
        fileName: fileName,
        fileContent: new TextEncoder().encode(fileContent).buffer,
        lastModified: new Date().toISOString(),
      };
      store.add(data).onsuccess = () => {
        message.success(`文件 ${fileName} 已手动输入`);
        setFileName('');
        setFileContent('');
      };
    } else {
      message.error('请填写文件名和文件内容');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <Button
          type="primary"
          onClick={() => setActiveComponent('upload')}
          style={{ marginRight: '10px' }}
        >
          上传文件
        </Button>
        <Button
          type="default"
          onClick={() => setActiveComponent('input')}
        >
          手动输入
        </Button>
      </div>

      {activeComponent === 'upload' && (
        <div style={{ marginTop: '20px' }}>
          <Upload
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
            multiple={false}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </div>
      )}

      {activeComponent === 'input' && (
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
          <Button
            type="primary"
            onClick={handleManualInputSubmit}
            style={{ marginTop: '10px' }}
          >
            提交
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploadContainer;
