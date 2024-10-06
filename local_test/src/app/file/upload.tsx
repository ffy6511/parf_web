'use client'

import React, { useState } from 'react';

// IndexedDB 存储的基础函数
const dbName = 'FileStorageDB';
const storeName = 'Files';

const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const saveFileToIndexedDB = (file: File) => {
  return openDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const fileReader = new FileReader();
      fileReader.onload = () => {
        const content = fileReader.result;
        store.add({ fileName: file.name, fileType: file.type, content });
        resolve();
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  });
};

// 前端组件
const FileUploadComponent: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [fileList, setFileList] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFileList((prevFiles) => [...prevFiles, ...fileArray]);

      // 将文件存储到 IndexedDB
      fileArray.forEach((file) => {
        saveFileToIndexedDB(file).then(() => {
          console.log(`${file.name} has been saved to IndexedDB`);
        });
      });
    }
  };

  return (
    <div>
      <label>
        <input
          type="file"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <button
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          上传文件
        </button>
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="请输入内容"
      />
      <div>
        <h3>已上传文件列表：</h3>
        <ul>
          {fileList.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileUploadComponent;
