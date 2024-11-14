import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, message, Modal, Dropdown, Menu } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
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
  const [showFolderUploadPrompt, setShowFolderUploadPrompt] = useState<boolean>(false); // For folder upload modal

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

  // File upload handling for single file
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
          message.success(`文件 ${file.name} 存储到本地成功`);
        };
      };
      reader.readAsArrayBuffer(file);
    }
    return false; // Prevent the default upload action
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

  // Folder upload handling
  const handleFolderUpload = (files: File[]) => {
    if (db) {
      // Iterate over each file in the folder
      files.forEach((file) => {
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
            message.success(`文件夹中的文件 ${file.name} 存储到本地成功`);
          };
        };
        reader.readAsArrayBuffer(file); // Read the content of each file
      });
      setShowFolderUploadPrompt(false); // Close folder upload prompt after success
    }
  };

  // Dropdown menu
  const menu = (
    <Menu>
      <Menu.Item key="upload" onClick={() => setShowUploadPrompt(true)}>
        Upload
      </Menu.Item>
      <Menu.Item key="manual" onClick={() => setShowManualInput(true)}>
        Input File
      </Menu.Item>
      <Menu.Item key="folder" onClick={() => setShowFolderUploadPrompt(true)}>
        Upload Folder
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.fileUploadContainer}>
      {/* Dropdown button for New Project */}
      <Dropdown overlay={menu} trigger={['click']}>
        <Button type="primary" shape="round" className={styles.newProjectButton}>
          New Project
        </Button>
      </Dropdown>

      {/* Upload Modal for file */}
      <Modal
        title="Upload"
        visible={showUploadPrompt}
        onCancel={() => setShowUploadPrompt(false)}
        footer={null}
        style = {{maxWidth:'27vw'}}
      >
        <Upload
          beforeUpload={(file: File) => {
            handleUpload(file); // Use beforeUpload to store files to indexedDB
            return false; // Prevent default upload behavior
          }}
          showUploadList={false}
          action=""
          multiple={true}
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
        <Button onClick={handleManualInputSubmit} type="primary" style={{ marginTop: '10px' }}>
          Submit
        </Button>
      </Modal>

      {/* Folder Upload Modal */}
      <Modal
        title="Upload Folder"
        visible={showFolderUploadPrompt}
        onCancel={() => setShowFolderUploadPrompt(false)}
        footer={null}
        style={{maxWidth:'20vw'}}
      >
        <Upload
          beforeUpload={(file: File) => {
            handleFolderUpload([file]); // Handle each file from the folder
            return false; // Prevent default upload behavior
          }}
          showUploadList={false}
          action=""
          multiple={true}
          directory={true} // Enable folder upload
        >
          <div style={{ textAlign: 'center'}}>
            <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p>点击或拖拽文件夹上传</p>
            <p>支持上传文件夹中的所有文件</p>
          </div>
        </Upload>
      </Modal>
    </div>
  );
};

export default FileUploadContainer;
