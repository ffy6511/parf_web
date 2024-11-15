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
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState<boolean>(false);
  const [showFolderUploadPrompt, setShowFolderUploadPrompt] = useState<boolean>(false);

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 2);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('files')) {
        const store = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
        store.createIndex('parentId', 'parentId');
        store.createIndex('isFolder', 'isFolder');
      }
    };

    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result);
    };
  }, []);

  const handleUpload = async (file: File) => {
    if (!db) return;

    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');

    try {
      const content = await new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(file);
      });

      const fileData = {
        fileName: file.name,
        fileContent: content,
        lastModified: new Date().toISOString(),
        parentId: null,
        isFolder: false,
      };

      await new Promise((resolve, reject) => {
        const request = store.add(fileData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      message.success(`File ${file.name} saved successfully`);
      onFileUploadSuccess();
    } catch (error) {
      message.error('Failed to upload file');
      console.error(error);
    }
  };

  const handleManualInputSubmit = () => {
    if (!db || !fileName || !fileContent) {
      message.error('Please fill in both file name and content');
      return;
    }

    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    const data = {
      fileName,
      fileContent: new TextEncoder().encode(fileContent).buffer,
      lastModified: new Date().toISOString(),
      parentId: null
    };

    store.add(data).onsuccess = () => {
      message.success(`File ${fileName} created successfully`);
      setFileName('');
      setFileContent('');
      setShowManualInput(false);
      onFileUploadSuccess();
    };
  };

  const handleFolderUpload = async (files: FileList) => {
    if (!db) return;
  
    try {
      const folderName = files[0].webkitRelativePath.split('/')[0];
      
      // 创建一个事务来处理文件夹创建
      const folderTransaction = db.transaction(['files'], 'readwrite');
      const folderStore = folderTransaction.objectStore('files');
      
      // 创建文件夹记录
      const folderData = {
        fileName: folderName,
        isFolder: true,
        lastModified: new Date().toISOString(),
        parentId: null
      };
      
      const folderId = await new Promise((resolve, reject) => {
        const request = folderStore.add(folderData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
  
      // 读取所有文件内容
      const fileContents = await Promise.all(
        Array.from(files).map(async (file) => ({
          file,
          content: await readFileAsArrayBuffer(file)
        }))
      );
  
      // 处理所有文件写入
      const fileTransaction = db.transaction(['files'], 'readwrite');
      const fileStore = fileTransaction.objectStore('files');
      
      await Promise.all(
        fileContents.map(({file, content}) => 
          new Promise<void>((resolve, reject) => {
            const request = fileStore.add({
              fileName: file.name,
              fileContent: content,
              lastModified: new Date().toISOString(),
              parentId: folderId,
              path: file.webkitRelativePath
            });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
        )
      );
  
      message.success(`Folder ${folderName} uploaded successfully`);
      onFileUploadSuccess();
      setShowFolderUploadPrompt(false);
    } catch (error) {
      message.error('Failed to upload folder');
      console.error(error);
    }
  };
  
  // 辅助函数
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

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
      <Dropdown overlay={menu} trigger={['click']}>
        <Button type="primary" shape="round" className={styles.newProjectButton}>
          New Project
        </Button>
      </Dropdown>

      <Modal
        title="Upload"
        visible={showUploadPrompt}
        onCancel={() => setShowUploadPrompt(false)}
        footer={null}
        style={{maxWidth:'27vw'}}
      >
        <Upload
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
          showUploadList={false}
          multiple
        >
          <div style={{ textAlign: 'center' }}>
            <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p>点击或拖拽代码文件上传</p>
            <p>支持不超过10MB的代码文件单个或批量上传</p>
          </div>
        </Upload>
      </Modal>

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

      <Modal
        title="Upload Folder"
        visible={showFolderUploadPrompt}
        onCancel={() => setShowFolderUploadPrompt(false)}
        footer={null}
        style={{maxWidth:'20vw'}}
      >
        <Upload
          beforeUpload={(file, fileList) => {
            handleFolderUpload(fileList);
            return false;
          }}
          directory
          multiple
          showUploadList={false}
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