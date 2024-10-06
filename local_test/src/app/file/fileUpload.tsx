'use client';

import React, { useState, useEffect } from 'react';

interface StoredData {
  id?: number;
  fileName?: string;
  text: string;
  fileContent?: ArrayBuffer | null;
}

const FileUploadComponent: React.FC<{ onFileClick: (fileContent: string) => void }> = ({ onFileClick }) => {
  const [text, setText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [fileList, setFileList] = useState<StoredData[]>([]);

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 1);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
    };

    request.onsuccess = (event) => {
      const dbResult = (event.target as IDBOpenDBRequest).result;
      setDb(dbResult);
      loadFilesFromDB(dbResult); // 加载已上传的文件
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
    };
  }, []);

  // 加载存储在IndexedDB中的文件
  const loadFilesFromDB = (db: IDBDatabase) => {
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    const request = store.getAll();

    request.onsuccess = () => {
      setFileList(request.result);
    };

    request.onerror = (event) => {
      console.error('Error loading files:', event);
    };
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (db && file) {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const fileContent = fileReader.result as ArrayBuffer;

        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');

        const data: StoredData = {
          fileName: file.name,
          text: text,
          fileContent: fileContent
        };

        const request = store.add(data);

        request.onsuccess = () => {
          console.log('Data saved successfully');
          setText('');
          setFile(null);
          loadFilesFromDB(db); // 提交后更新文件列表
        };

        request.onerror = (event) => {
          console.error('Error saving data:', event);
        };
      };

      fileReader.readAsArrayBuffer(file); // 读取文件内容
    }
  };

  const handleFileClick = (fileContent: ArrayBuffer | null) => {
    if (fileContent) {
      const blob = new Blob([fileContent]);
      const reader = new FileReader();
      reader.onload = () => {
        onFileClick(reader.result as string);
      };
      reader.readAsText(blob);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text"
          className="border rounded px-2 py-1"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>
      <div>
        <h3>Uploaded Files:</h3>
        <ul>
          {fileList.map((fileData) => (
            <li key={fileData.id}>
              <button onClick={() => handleFileClick(fileData.fileContent || null)}>
                {fileData.fileName}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileUploadComponent;
