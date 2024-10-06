'use client'

import React, { useState, useEffect } from 'react';

interface StoredData {
  id?: number;
  fileName?: string;
  text?: string;
  fileContent?: ArrayBuffer | null;
}

const FileUploadComponent: React.FC<{ onFileClick: (fileContent: string) => void }> = ({ onFileClick }) => {
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
          fileContent: fileContent
        };

        const request = store.add(data);

        request.onsuccess = () => {
          console.log('File saved successfully');
          setFile(null); // 清空文件输入
          loadFilesFromDB(db); // 提交后更新文件列表
        };

        request.onerror = (event) => {
          console.error('Error saving file:', event);
        };
      };

      fileReader.readAsArrayBuffer(file);
    }
  };

  const handleDeleteFile = (fileId: number) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.delete(fileId);

      request.onsuccess = () => {
        console.log('File deleted successfully');
        loadFilesFromDB(db); // 删除后更新文件列表
      };

      request.onerror = (event) => {
        console.error('Error deleting data:', event);
      };
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
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <div>
        <h3>Uploaded Files:</h3>
        {fileList.length > 0 ? (
          <ul>
            {fileList.map((fileData) => (
              <li key={fileData.id}>
                <button onClick={() => handleFileClick(fileData.fileContent || null)}>
                  {fileData.fileName}
                </button>
                <button onClick={() => handleDeleteFile(fileData.id || 0)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default FileUploadComponent;
