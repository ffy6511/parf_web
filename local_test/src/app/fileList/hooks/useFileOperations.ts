'use client';

import { useState, useEffect } from 'react';
import { message } from 'antd';
import { trpc } from '../../../trpc/react';
import { FileData } from '../types';

export const useFileOperations = () => {
  const [fileList, setFileList] = useState<FileData[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const { mutate: deleteFile } = trpc.file.deleteFile.useMutation();

  useEffect(() => {
    const request = indexedDB.open('FileStorage', 3);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('files')) {
        const store = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
        store.createIndex('parentId', 'parentId');
        store.createIndex('path', 'path');
        store.createIndex('isFolder', 'isFolder');
      }
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
      const files = request.result.map((file) => ({
        ...file,
        fileContent: file.fileContent || file.content,
        parentId: file.parentId || null,
      }));
      setFileList(files);

      const rootFolders = files
        .filter((item) => item.isFolder && item.parentId === null)
        .map((folder) => folder.id);
      setExpandedFolders(new Set(rootFolders));
    };
  };

  const handleCreateFolder = async (folderName: string) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');

      const newFolder = {
        fileName: folderName,
        lastModified: new Date().toISOString(),
        isFolder: true,
        parentId: null,
        fileContent: new ArrayBuffer(0),
        path: folderName,
      };

      try {
        const pathIndex = store.index('path');
        const existing = await new Promise((resolve) => {
          const request = pathIndex.get(folderName);
          request.onsuccess = () => resolve(request.result);
        });

        if (existing) {
          message.error(`Folder ${folderName} already exists`);
          return;
        }

        const request = store.add(newFolder);
        request.onsuccess = () => {
          loadFilesFromDB(db);
          message.success('文件夹创建成功');
        };
      } catch (error) {
        message.error('创建文件夹时发生错误');
        console.error('创建文件夹错误:', error);
      }
    }
  };

  const handleBatchDelete = async (fileIds: number[]) => {
    if (db && fileIds.length > 0) {
      const getAllChildren = (parentId: number): number[] => {
        const children = fileList.filter((file) => file.parentId === parentId);
        return children.reduce((acc, child) => {
          return [...acc, child.id, ...getAllChildren(child.id)];
        }, [] as number[]);
      };
  
      const filesToDelete = fileIds.reduce((acc, fileId) => {
        const file = fileList.find((f) => f.id === fileId);
        if (file?.isFolder) {
          return [...acc, fileId, ...getAllChildren(fileId)];
        }
        return [...acc, fileId];
      }, [] as number[]);
  
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
  
      let deletedCount = 0;
      filesToDelete.forEach((id) => {
        store.delete(id).onsuccess = async () => {
          deletedCount++;
          if (deletedCount === filesToDelete.length) {
            setFileList((prevFiles) =>
              prevFiles.filter((file) => !filesToDelete.includes(file.id))
            );
            setExpandedFolders((prev) => {
              const newSet = new Set(prev);
              filesToDelete.forEach((id) => newSet.delete(id));
              return newSet;
            });
  
            try {
              // 为每个文件/文件夹调用删除时传入正确的 isFolder 参数
              for (const id of filesToDelete) {
                const file = fileList.find(f => f.id === id);
                await deleteFile({ 
                  id, 
                  isFolder: file?.isFolder ?? false 
                });
              }
              message.success(`Deleted ${filesToDelete.length} files successfully`);
            } catch (error) {
              message.error(`An error occurred while deleting the file: ${error}`);
              console.error('Delete file wtih error:', error);
            }
          }
        };
      });
    }
  };

  const handleFileDrop = (fileId: number, targetParentId: number | null) => {
    if (db) {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');

      const isCircular = (fileId: number, targetParentId: number | null): boolean => {
        if (targetParentId === null) return false;
        if (targetParentId === fileId) return true;
        const parent = fileList.find((f) => f.id === targetParentId);
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

  const handleFileClick = (fileId: number, isMultiSelect: boolean) => {
    if (!isMultiSelect) {
      setSelectedFileId(fileId);
      const selectedFile = fileList.find((file) => file.id === fileId);
      if (selectedFile) {
        localStorage.setItem('selectedFile', JSON.stringify(selectedFile));
      }
    }
  };


  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleDeleteFile = (fileId: number, isFolder:boolean) => {
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
        store.delete(id).onsuccess = async () => {
          deletedCount++;
          if (deletedCount === filesToDelete.length) {
            setFileList(prevFiles => prevFiles.filter(file => !filesToDelete.includes(file.id)));
            if (filesToDelete.includes(selectedFileId!)) {
              setSelectedFileId(null);
              setSelectedFileContent("");
            }
            setExpandedFolders(prev => {
              const newSet = new Set(prev);
              filesToDelete.forEach(id => newSet.delete(id));
              return newSet;
            });

            // 调用 tRPC 后端删除文件
            try {
              // 只发送第一个 ID 到后端，因为后端会递归删除文件夹内容
              await deleteFile({ 
                id: filesToDelete[0] as number, 
                isFolder 
              });
              message.success(`Deleted  ${filesToDelete.length} files successfully`);
            } catch (error) {
              message.error(`An error occurred while deleting the file: ${error}`);
              console.error('Delete file with error:', error);
            }
          }
        };
      });
    }
  };



  return {
    fileList,
    selectedFileId,
    selectedFileContent,
    expandedFolders,
    handleCreateFolder,
    handleBatchDelete,
    handleDeleteFile,
    handleFileDrop,
    handleFileClick,
    toggleFolder,
    setSelectedFileContent,
  };
};