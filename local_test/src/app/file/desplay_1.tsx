'use client';

import React, { useState, useEffect } from 'react';
import FileEntry from './components/fileEntry'; // 导入FileEntry组件
import { Modal } from 'antd';

interface FileData {
  id: number;
  fileName: string;
  lastModified: string;
  fileContent: ArrayBuffer;
}

const FileInput: React.FC = () => {
  const [fileList, setFileList] = useState<FileData[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
      const dbResult = (event.target as IDBOpenDBRequest).result;
      setDb(dbResult);
      loadFilesFromDB(dbResult);
    };
  }, []);

  const loadFilesFromDB = (db: IDBDatabase) => {
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    const request = store.getAll();

    request.onsuccess = () => {
      setFileList(request.result);
    };
  };

  const handleFileClick = (fileId: number) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(fileId);

      request.onsuccess = () => {
        if (request.result) {
          const fileData = request.result.fileContent;
          const blob = new Blob([fileData]);
          const reader = new FileReader();
          reader.onload = () => {
            setSelectedFileContent(reader.result as string);
            setSelectedFileId(fileId);
          };
          reader.readAsText(blob);
        }
      };
    }
  };

  const handleDeleteFile = (fileId: number) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      store.delete(fileId).onsuccess = () => {
        setFileList((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
        if (fileId === selectedFileId) {
          setSelectedFileId(null);
          setSelectedFileContent(null);
        }
      };
    }
  };

  return (
    <div>
      <h2>文件列表</h2>
      {fileList.length > 0 ? (
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {fileList.map((file) => (
            <li key={file.id} style={{ marginBottom: '10px' }}>
              <FileEntry
                fileId={file.id}
                fileName={file.fileName}
                lastModified={file.lastModified}
                onClick={handleFileClick}
                onDelete={handleDeleteFile}
                isSelected={selectedFileId === file.id}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>没有文件</p>
      )}

      {selectedFileContent && (
        <Modal
          title="文件内容"
          visible={!!selectedFileContent}
          onCancel={() => setSelectedFileContent(null)}
          footer={null}
        >
          <pre>{selectedFileContent}</pre>
        </Modal>
      )}
    </div>
  );
};

export default FileInput;
