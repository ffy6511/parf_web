'use client';

import React, { useState, useEffect } from 'react';
import FileEntry from './components/fileEntry';
import { Modal, Button, message } from 'antd';
import styles from './fileList.module.css';
import TextArea from 'antd/lib/input/TextArea'; 

interface FileData {
  id: number;
  fileName: string;
  lastModified: string;
  fileContent: ArrayBuffer;
  parentId?: number | null;
  isFolder?: boolean;
}

const Display_1: React.FC = () => {
  const [fileList, setFileList] = useState<FileData[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string>("");
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [isAnyHovered, setIsAnyHovered] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 2);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const store = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
      store.createIndex('parentId', 'parentId');
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
      // 默认展开根目录下的所有文件夹
      const rootFolders = request.result
        .filter(item => item.isFolder && item.parentId === null)
        .map(folder => folder.id);
      setExpandedFolders(new Set(rootFolders));
    };
  };

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFileTree = (parentId: number | null = null) => {
    const items = fileList.filter(item => item.parentId === parentId);
    
    return items.length > 0 ? (
      <ul style={{ 
        paddingLeft: parentId !== null ? '20px' : '0',
        listStyle: 'none',
        margin: 0
      }}>
        {items.map((item) => (
          <li key={item.id} 
            style={{ marginBottom: '10px' }}
            onMouseEnter={() => setIsAnyHovered(true)}
            onMouseLeave={() => setIsAnyHovered(false)}
          >
            <FileEntry
              fileId={item.id}
              fileName={item.fileName}
              lastModified={item.lastModified}
              onClick={handleFileClick}
              onDelete={handleDeleteFile}
              onEdit={() => handleFileEdit(item.id)}
              onPreview={() => handleFilePreview(item.id)}
              isSelected={selectedFileId === item.id}
              isAnyHovered={isAnyHovered}
              parentId={item.parentId}
              onDrop={handleFileDrop}
              isFolder={item.isFolder}
              isExpanded={expandedFolders.has(item.id)}
              onToggle={() => item.isFolder && toggleFolder(item.id)}
            >
              {item.isFolder && expandedFolders.has(item.id) && renderFileTree(item.id)}
            </FileEntry>
          </li>
        ))}
      </ul>
    ) : null;
  };

  const handleFileDrop = (fileId: number, targetParentId: number | null) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      const isCircular = (fileId: number, targetParentId: number | null): boolean => {
        if (targetParentId === null) return false;
        if (targetParentId === fileId) return true;
        const parent = fileList.find(f => f.id === targetParentId);
        return parent ? isCircular(fileId, parent.parentId ?? null) : false;
      };

      if (isCircular(fileId, targetParentId)) {
        message.error('Cannot move a folder into its own subfolder');
        return;
      }

      store.get(fileId).onsuccess = (event) => {
        const file = (event.target as IDBRequest).result;
        if (file) {
          file.parentId = targetParentId;
          store.put(file).onsuccess = () => {
            loadFilesFromDB(db);
            message.success('File moved successfully');
          };
        }
      };
    }
  };

  const handleFileClick = (fileId: number) => {
    setSelectedFileId(fileId);
    const selectedFile = fileList.find((file) => file.id === fileId);
    if (selectedFile) {
      localStorage.setItem('selectedFile', JSON.stringify(selectedFile));
    }
  };

  const handleFileEdit = (fileId: number) => {
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
            setIsEditModalVisible(true);
          };
          reader.readAsText(blob);
        }
      };
    }
  };

  const handleFilePreview = (fileId: number) => {
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
            setIsPreviewModalVisible(true);
          };
          reader.readAsText(blob);
        }
      };
    }
  };

  const handleDeleteFile = (fileId: number) => {
    if (db) {
      const getAllChildren = (parentId: number): number[] => {
        const children = fileList.filter(file => file.parentId === parentId);
        return children.reduce((acc, child) => {
          return [...acc, child.id, ...getAllChildren(child.id)];
        }, [] as number[]);
      };

      const filesToDelete = [fileId, ...getAllChildren(fileId)];

      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      let deletedCount = 0;
      filesToDelete.forEach(id => {
        store.delete(id).onsuccess = () => {
          deletedCount++;
          if (deletedCount === filesToDelete.length) {
            setFileList(prevFiles => prevFiles.filter(file => !filesToDelete.includes(file.id)));
            if (filesToDelete.includes(selectedFileId!)) {
              setSelectedFileId(null);
              setSelectedFileContent("");
            }
            // 从展开的文件夹集合中移除被删除的文件夹
            setExpandedFolders(prev => {
              const newSet = new Set(prev);
              filesToDelete.forEach(id => newSet.delete(id));
              return newSet;
            });
          }
        };
      });
    }
  };

  const handleSaveContent = () => {
    if (db && selectedFileId && selectedFileContent) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const encoder = new TextEncoder();
      const updatedContent = encoder.encode(selectedFileContent).buffer;

      const request = store.get(selectedFileId);
      request.onsuccess = () => {
        const fileData = request.result;
        if (fileData) {
          fileData.fileContent = updatedContent;
          store.put(fileData).onsuccess = () => {
            message.success('文件内容已保存');
            loadFilesFromDB(db);
            setIsEditModalVisible(false);
          };
        }
      };
    }
  };

  return (
    <div className={styles.container}>
      {fileList.length > 0 ? (
        <div style={{ 
          padding: 8, 
          margin: 5,
          overflowY: 'scroll',
          maxHeight: '38vh',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
        }}>
          {renderFileTree(null)}
        </div>
      ) : (
        <div style={{color: '#6f6e6c'}}>𝐄𝐦𝐩𝐭𝐲 𝐋𝐢𝐬𝐭</div>
      )}

      <Modal
        title="编辑文件内容"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="save" type="primary" onClick={handleSaveContent}>
            保存
          </Button>,
        ]}
        width={800}
        style={{ top: 0 }}
      >
        <TextArea
          value={selectedFileContent}
          className={styles.modalCodeBlock}
          rows={25}
          onChange={(e) => setSelectedFileContent(e.target.value)}
        />
      </Modal>

      <Modal
        title="预览文件内容"
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={null}
        width={800}
        style={{ 
          top: '0px',
          borderRadius: '10px',
        }}
        className={styles.customModal}
      >
        <pre className={styles.modalCodeBlock}>{selectedFileContent}</pre>
      </Modal>
    </div>
  );
};

export default Display_1;