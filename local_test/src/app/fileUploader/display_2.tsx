import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, message, Modal } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import styles from './fileUpload.module.css';
import TextArea from 'antd/lib/input/TextArea'; 
import CurrentInput from '../currentInput/currentInput';
import "~/styles/globals.css"

interface FileUploadContainerProps {
  onFileUploadSuccess: () => void;
}

const FileUploadContainer: React.FC<FileUploadContainerProps> = ({ onFileUploadSuccess }) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [fileName, setFileName] = useState<string>(''); // 手动输入的文件名
  const [fileContent, setFileContent] = useState<string>(''); // 手动输入的文件内容
  const [showManualInput, setShowManualInput] = useState<boolean>(false); // 控制弹窗的显示

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
          onFileUploadSuccess(); // 上传成功后调用回调函数
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
        fileContent: new TextEncoder().encode(fileContent).buffer,
        lastModified: new Date().toISOString(),
      };
      store.add(data).onsuccess = () => {
        message.success(`文件 ${fileName} 已手动输入`);
        setFileName(''); // 清空文件名输入框
        setFileContent(''); // 清空文件内容输入框
        setShowManualInput(false); // 关闭弹窗
        onFileUploadSuccess(); // 上传成功后调用回调函数
      };
    } else {
      message.error('请填写文件名和文件内容');
    }
  };

  return (
    <div className={styles.fileUploadContainer}>
      {/* 左侧文件上传区域 */}
      <div className={styles.uploadSection}>
      <div className={styles.gradient_text}>
        文件上传与 𝑷𝒂𝒓𝒇 调用
      </div>

        <div className={styles.uploader}>
          <Upload
            action='NULL'
            beforeUpload={(file: File) => {
              handleUpload(file);
              return false; // 阻止默认上传行为
            }}
            showUploadList={false}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p className={styles.logo}>
                <InboxOutlined />
              </p>
              <p className="ant-upload-text" style={{ marginTop: '10px', color:"#6f6e6c" }}>
                点击或拖拽代码文件到此处上传
              </p>
              <p className="ant-upload-hint" style={{ marginTop: '1px',color:'#6f6e6c' }}>
                （支持单个代码文件或批量上传）
              </p>
            </div>
          </Upload>
        </div>
      </div>

      {/* 右侧 CurrentInput 和 手动输入区域 */}
      <div className={styles.rightSection}>
        <div className={styles.currentInputWrapper}>
          <CurrentInput />
        </div>
        <div className={styles.manualInputButtonWrapper}>
          <Button
            type="primary"
            onClick={() => setShowManualInput(true)}
            className="sendButton"
          >
            手动输入
          </Button>
        </div>
      </div>

      {/* 手动输入表单弹窗 */}
      <Modal
        title="手动输入文件"
        visible={showManualInput}
        onCancel={() => setShowManualInput(false)}
        footer={null}
      >
        <Input
          placeholder="文件名"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <TextArea
          placeholder="文件内容"
          rows={15}
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
        />
        <Button
          onClick={handleManualInputSubmit}
          className={styles.buttonCustom}
        >
          提交手动输入
        </Button>
      </Modal>
    </div>
  );
};

export default FileUploadContainer;
