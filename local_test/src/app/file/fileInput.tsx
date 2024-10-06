import React, { useState, useEffect } from 'react';
import FileUploadComponent from './components/uploadFile';
import TextInputComponent from './components/inputFile';

interface FileInputProps {
  onFileClick: (fileId: number) => void; // 通过 fileId 传递
}

const FileInput: React.FC<FileInputProps> = ({ onFileClick }) => {
  const [activeComponent, setActiveComponent] = useState<string>('null');
  const [fileList, setFileList] = useState<{ id: number; fileName: string }[]>([]);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 1);
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
    };

    request.onsuccess = (event) => {
      const dbResult = (event.target as IDBOpenDBRequest).result;
      setDb(dbResult);
      loadFilesFromDB(dbResult);
    };
  }, []);

  // 从 IndexedDB 中加载文件列表
  const loadFilesFromDB = (db: IDBDatabase) => {
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    const request = store.getAll();

    request.onsuccess = () => {
      const files = request.result.map((file: any) => ({
        id: file.id,
        fileName: file.fileName,
      }));
      setFileList(files);
    };

    request.onerror = (event) => {
      console.error('Error loading files:', event);
    };
  };

  return (
    <div>
      <div>
        <button onClick={() => setActiveComponent('upload')}>上传文件</button>
        <button onClick={() => setActiveComponent('input')}>手动输入</button>
      </div>

      <div>
        {activeComponent === 'upload' && (
          <FileUploadComponent onFileClick={onFileClick} />
        )}
        {activeComponent === 'input' && (
          <TextInputComponent />
        )}
      </div>

      <h3>文件列表:</h3>
      {fileList.length > 0 ? (
        <ul>
          {fileList.map((file) => (
            <li key={file.id}>
              <button onClick={() => onFileClick(file.id)}>
                {file.fileName}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>没有文件上传</p>
      )}
    </div>
  );
};

export default FileInput;
