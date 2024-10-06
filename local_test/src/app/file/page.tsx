'use client';

import React, { useState, useEffect } from 'react';
import FileInput from './fileInput';
import FileReaderComponent from './fileReader';

const UploadPage: React.FC = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 1);
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
    };

    request.onsuccess = (event) => {
      const dbResult = (event.target as IDBOpenDBRequest).result;
      setDb(dbResult);
    };
  }, []);

  // 根据 fileId 获取文件内容并展示
  const handleFileClick = (fileId: number) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(fileId);

      request.onsuccess = () => {
        if (request.result) {
          const fileData = request.result.fileContent;
          if (fileData) {
            const blob = new Blob([fileData]);
            const reader = new FileReader();
            reader.onload = () => {
              setFileContent(reader.result as string);
            };
            reader.readAsText(blob);
          }
        }
      };

      request.onerror = (event) => {
        console.error('Error retrieving file:', event);
      };
    }
  };

  // 清空文件内容
  const handleClearFileContent = () => {
    setFileContent(null); // 清空文件内容
  };

  return (
    <div>
      <p>上传代码文件</p>
      <FileInput onFileClick={handleFileClick} /> {/* 传递回调函数 */}
      <FileReaderComponent fileContent={fileContent} onClearFileContent={handleClearFileContent} />
    </div>
  );
};

export default UploadPage;
