import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, message, Modal, Dropdown, Menu } from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './fileUpload.module.css';
import TextArea from 'antd/lib/input/TextArea';
import "~/styles/globals.css";

interface FileUploadContainerProps {
  onFileUploadSuccess: () => void;
}

const FileUploadContainer: React.FC<FileUploadContainerProps> = ({ onFileUploadSuccess }) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false); // For manual input modal
  const [showUploadPrompt, setShowUploadPrompt] = useState<boolean>(false); // For upload prompt modal

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

  // File upload handling
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
          onFileUploadSuccess();
          setShowUploadPrompt(false); // Close the upload prompt after success
        };
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Manual input submit handling
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
        setShowManualInput(false); // Close modal after successful input
        onFileUploadSuccess();
      };
    } else {
      message.error('请填写文件名和文件内容');
    }
  };

  
  const menu = (
    <Menu >
      <Menu.Item
        key="upload"
        onClick={() => setShowUploadPrompt(true)} // Open the upload prompt
      >
        Upload
      </Menu.Item>
      <Menu.Item
        key="manual"
        onClick={() => setShowManualInput(true)} // Open the manual input modal
      >
        Input File
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.fileUploadContainer}>
      {/* Elliptical New Project Button with Dropdown */}
      <Dropdown overlay={menu} trigger={['click']}>
        <Button
          type="primary"
          shape="round"
          className={styles.newProjectButton}
        >
          New Project
        </Button>
      </Dropdown>

      {/* Upload Modal */}
      <Modal
        title="Upload"
        visible={showUploadPrompt}
        onCancel={() => setShowUploadPrompt(false)}
        footer={null}
      >
        <Upload
          beforeUpload={(file: File) => {
            handleUpload(file);
            return false; // Prevent default upload behavior
          }}
          showUploadList={false}
          action=''
        >
          <div style={{ textAlign: 'center' }}>
            <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p>点击或拖拽代码文件上传</p>
            <p>支持不超过10MB的代码文件单个或批量上传</p>
          </div>
        </Upload>
      </Modal>

      {/* Manual Input Modal */}
      <Modal
        title="Input File"
        visible={showManualInput}
        onCancel={() => setShowManualInput(false)}
        footer={null}
      >
        <Input
          placeholder="File Name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <TextArea
          placeholder="Please enter file content here."
          rows={8}
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
        />
        <Button
          onClick={handleManualInputSubmit}
          type="primary"
          style={{ marginTop: '10px' }}
        >
          Submit
        </Button>
      </Modal>
    </div>
  );
};

export default FileUploadContainer;
