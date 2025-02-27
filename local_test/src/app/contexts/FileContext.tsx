import React, { createContext, useState, useEffect, ReactNode } from 'react';

// 定义文件类型
export interface FileDetails {
  id: number;
  fileName: string;
  isFolder: boolean;
  parentId: number | null;
  path: string;
  lastModified: string;
  fileContent?: ArrayBuffer;
}

// 定义 Context 的类型
interface FileContextType {
  fileList: FileDetails[];
  reloadFileList: () => Promise<void>;
  getFileContent: (fileId: number) => Promise<ArrayBuffer | null>;
}

// 创建 Context
export const FileContext = createContext<FileContextType | undefined>(undefined);

// Provider 组件
const FileContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fileList, setFileList] = useState<FileDetails[]>([]);

  // 从 IndexedDB 加载文件列表
  const loadFileListFromIndexedDB = async (): Promise<FileDetails[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FileStorage', 3);

    // 确保对象存储存在
     request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', { keyPath: 'id' });
          store.createIndex('path', 'path', { unique: true });
        }
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = () => {
          reject(new Error('Failed to load files from IndexedDB'));
        };
      };

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
    });
  };

  // 重新加载文件列表
  const reloadFileList = async () => {
    try {
      const files = await loadFileListFromIndexedDB();
      setFileList(files);
    } catch (error) {
      console.error('Failed to reload file list:', error);
    }
  };

  // 按需加载文件内容
  const getFileContent = async (fileId: number): Promise<ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FileStorage', 3);

       // 确保对象存储存在
       request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', { keyPath: 'id' });
          store.createIndex('path', 'path', { unique: true });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const getRequest = store.get(fileId);

        getRequest.onsuccess = () => {
          if (getRequest.result) {
            resolve(getRequest.result.fileContent || null);
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = () => {
          reject(new Error('Failed to load file content from IndexedDB'));
        };
      };

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
    });
  };

  // 初始化时加载文件列表
  useEffect(() => {
    (async () => {
        try {
            await reloadFileList();
        } catch (error) {
            console.error('Failed to load file list:', error);
        }
    })();
}, []);

  return (
    <FileContext.Provider value={{ fileList, reloadFileList, getFileContent }}>
      {children}
    </FileContext.Provider>
  );
};

export default FileContextProvider;