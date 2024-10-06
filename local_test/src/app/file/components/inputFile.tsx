'use client'

import React, { useState, useEffect } from 'react';

interface StoredData {
  id?: number;
  fileName: string;
  text?: string;
  fileContent?: ArrayBuffer | null;
}

const TextInputComponent: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
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

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  const handleSubmit = () => {
    if (db && fileName && text) {
    // 将文本转换为 ArrayBuffer
    const textEncoder = new TextEncoder();
    const fileContent = textEncoder.encode(text).buffer;

      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');

      const data: StoredData = {
        fileName: fileName,
        fileContent: fileContent
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('Text saved successfully');
        setFileName(''); // 清空文件名输入
        setText(''); // 清空文本输入
      };

      request.onerror = (event) => {
        console.error('Error saving text:', event);
      };
    }
  };

  return (
    <div>
      <div>
        <input type="text" value={fileName} onChange={handleFileNameChange} placeholder="File Name" />
        <input type="text" value={text} onChange={handleTextChange} placeholder="Enter text" />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default TextInputComponent;
