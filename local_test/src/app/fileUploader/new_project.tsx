import React, { useState, useEffect, useContext } from 'react';
import { Button, Input, Upload, message, Modal, Dropdown, Menu } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import styles from './fileUpload.module.css';
import TextArea from 'antd/lib/input/TextArea';
import { FileContext, FileDetails } from '../contexts/FileContext';
import type { RcFile } from 'antd/lib/upload';
import "~/styles/globals.css";
import { trpc } from '../../trpc/react';

interface FileUploadContainerProps {
  onFileUploadSuccess: () => void;
}

interface ExistingData{
  id: number;
}

// 定义文件夹结构接口，继承自FileDetails
interface FileNode extends Omit<FileDetails, 'id'> {
  id?: number;
  children?: FileNode[];
}

const FileUploadContainer: React.FC<FileUploadContainerProps> = ({ onFileUploadSuccess }) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState<boolean>(false);
  const [showFolderUploadPrompt, setShowFolderUploadPrompt] = useState<boolean>(false);

  const { reloadFileList } = useContext(FileContext)!;

  // 使用 useMutation Hook
  const { mutate: uploadFile } = trpc.file.uploadFile.useMutation({
    onSuccess: (data) => {
      // data 是后端函数的返回值，即 { id: fileId }
      const fileId = data.id; // 获取后端返回的 ID
      console.log('File uploaded successfully, file ID:', fileId);
      message.success(`File uploaded successfully with ID: ${fileId}`);

      // 将 fileId 保存到本地数据库
      const saveFileToDB = async () => {
        if (!db) return;

        try {
          const transaction = db.transaction(['files'], 'readwrite');
          const store = transaction.objectStore('files');

          const request = store.put({
            id: fileId,  // 使用后端返回的 fileId 作为 id
            fileName: fileName,
            isFolder: false,
            fileContent: new TextEncoder().encode(fileContent).buffer,
            parentId: null,
            path: fileName,
            lastModified: new Date().toISOString()
          });

          request.onsuccess = () => {
            console.log(`File with ID ${fileId} saved to database`);
            onFileUploadSuccess();
            reloadFileList();
          };

          request.onerror = () => {
            console.error('Failed to save file to database');
          };
        } catch (error) {
          console.error('Error saving file to database:', error);
        }
      };
      saveFileToDB();
    },
    onError: (error) => {
      message.error('Failed to upload file');
      console.error(error);
    }
  });


  useEffect(() => {
    const request = indexedDB.open('FileStorage', 3);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('files')) {
        const store = db.createObjectStore('files', { keyPath: 'id', autoIncrement: false }); // 关闭自增
        store.createIndex('parentId', 'parentId');
        store.createIndex('path', 'path');
        store.createIndex('isFolder', 'isFolder');
      }
    };
  
    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result);
    };
  }, []);


  // 读取文件内容
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error(reader.error?.message ||  'Failed to read file'))
      reader.readAsArrayBuffer(file);
    });
  };

  // 构建文件夹树结构
  const buildFileTree = async (files: RcFile[]): Promise<FileNode> => {

    if (!files || files.length === 0) {
      throw new Error('No files provided');
  }

  const firstFile = files[0];
  if (!firstFile || !firstFile.webkitRelativePath) {
      throw new Error('Invalid file structure');
  }

    const rootPath = firstFile.webkitRelativePath.split('/')[0];

    const root: FileNode = {
      fileName: rootPath as string,
      isFolder: true,
      parentId: null,
      children: [],
      path: rootPath!,
      lastModified: new Date().toISOString()
    };

    const pathMap = new Map<string, FileNode>();
    pathMap.set(root.path as string, root);

    for (const file of files) {
      const pathParts = file.webkitRelativePath.split('/');
      let currentPath = '';

      // 处理每一级路径
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath = (currentPath ? `${currentPath}/${part}` : part) as string;  

        if (!pathMap.has(currentPath)) {
          const isFile = i === pathParts.length - 1;
          const newNode: FileNode = {
            fileName: part as string,
            isFolder: !isFile,
            parentId: null, // 将在后续设置
            children: isFile ? undefined : [],
            path: currentPath,
            lastModified: new Date().toISOString()
          };

          if (isFile) {
            // 如果是文件，读取内容
            newNode.fileContent = await readFileAsArrayBuffer(file);
          }

          // 找到父节点并添加关系
          const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
          const parent = pathMap.get(parentPath);
          if (parent) {
            parent.children?.push(newNode);
            newNode.parentId = parent.id ?? null;
          }

          pathMap.set(currentPath, newNode);
        }
      }
    }

    return root;
  };

  // 保存文件树到数据库
  const saveFileTree = async (node: FileNode, parentId: number | null = null, nodeId?: number): Promise<number> => {
  if (!db) throw new Error('Database not initialized');

  const transaction = db.transaction(['files'], 'readwrite');
  const store = transaction.objectStore('files');

  // 检查是否已存在同路径文件
  const pathIndex = store.index('path');
  const existing = await new Promise<ExistingData | null>(resolve => {
    const request = pathIndex.get(node.path as string);
    request.onsuccess = () => resolve(request.result);
  });

  if (existing) {
    return existing.id;
  }

  // 简化存储的数据结构，确保 id 字段存在
  const nodeData = {
    id: nodeId || Math.floor(Math.random() * 1000000),  // 如果没有 nodeId，生成一个随机 ID
    fileName: node.fileName,
    path: node.path,
    isFolder: node.isFolder,
    parentId: parentId
  };

  // 保存节点
  try {
    await new Promise((resolve, reject) => {
      const request = store.add(nodeData);
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });

    // 递归保存子节点，确保传递正确的 parentId
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        await saveFileTree(child, nodeData.id);
      }
    }

    return nodeData.id;
  } catch (error) {
    console.error('Error saving node:', error);
    throw error;
  }
};

  // 处理文件夹上传
const handleFolderUpload = async (files: RcFile[]) => {
  if (!db) return;
  try {
    const filesArray = files;
    const folderName = `${filesArray[0]!.webkitRelativePath.split("/")[0]}`;

    // 检查是否已存在
    const transaction = db.transaction(["files"], "readwrite");
    const store = transaction.objectStore("files");
    const pathIndex = store.index("path");

    const existing = await new Promise((resolve) => {
      const request = pathIndex.get(folderName);
      request.onsuccess = () => resolve(request.result);
    });

    if (existing) {
      message.info(`Folder ${folderName} already exists`);
      return;
    }

    // 构建文件树
    const fileTree = await buildFileTree(filesArray);
    fileTree.fileName = folderName;
    fileTree.path = folderName;

    console.log("File Tree:", fileTree);

    // 整理文件数据
    const folderFiles = filesArray.map(async (file) => {
      const content = await readFileAsArrayBuffer(file);
      const uniquePath = file.webkitRelativePath.split("/").slice(1).join("/");
      return {
        content: new TextDecoder().decode(content),
        path: uniquePath,
        isFolder: false,
      };
    });

    console.log("Folder Files:", folderFiles);

    const resolvedFiles = await Promise.all(folderFiles);

    const requestBody = JSON.stringify({ json: resolvedFiles }); // 修改请求体结构
    //console.log("Request Body:", requestBody); // 检查请求体

    // 使用 fetch API 上传文件夹
    const response = await fetch("/parf/api/trpc/file.uploadFolder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    console.log("Response Status:", response.status); // 检查响应状态
    
    if (!response.ok) {
      throw new Error("Failed to upload folder");
    }

    const result = await response.json();
    const folderId = result.result.data.json.folderId;
    console.log("Folder ID:", folderId);

    // 保存到本地数据库
    await saveFileTree(fileTree, null, folderId);
    onFileUploadSuccess();
    await reloadFileList();
    setShowFolderUploadPrompt(false);
  } catch (error) {
    message.error("Failed to upload folder");
    console.error(error);
  }
};

  // 单文件上传处理
  const handleUpload = async (file: File) => {
    if (!db) return;

    try {
      const content = await readFileAsArrayBuffer(file);

      setFileName(file.name);

      // 先上传到后端
      uploadFile({ // 使用 mutate 函数
        content: new TextDecoder().decode(content),
        path: file.name,
        isFolder: false
      });
    } catch (error) {
      message.error('Failed to upload file');
      console.error(error);
    }
  };


  // UI 部分保持不变
  const menu = (
    <Menu>
      <Menu.Item key="upload" onClick={() => setShowUploadPrompt(true)}>
        Upload
      </Menu.Item>
      <Menu.Item key="folder" onClick={() => setShowFolderUploadPrompt(true)}>
        Upload Folder
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.fileUploadContainer}>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button type="primary" shape="round" >
          New
        </Button>
      </Dropdown>

      {/* Modals */}
      <Modal
        title="Upload"
        visible={showUploadPrompt}
        onCancel={() => setShowUploadPrompt(false)}
        footer={null}
        style={{maxWidth:'27vw'}}
      >
        <Upload
          action=''
          customRequest={({ file }) => {
            handleUpload(file as File); // 确保类型正确
          }}
          showUploadList={false}
          multiple
        >
          <div style={{ textAlign: 'center',alignItems:'center' }}>
            <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p>Click or drag to upload a file.</p>
            <p>Support for uploading code files up to 10MB, either individually or in batches.</p>
          </div>
        </Upload>
      </Modal>


      <Modal
        title="Upload Folder"
        visible={showFolderUploadPrompt}
        onCancel={() => setShowFolderUploadPrompt(false)}
        footer={null}
        style = {{padding:'10px'}}
      >
        <Upload
          action=''
          beforeUpload={(file, fileList) => {
            // 只在第一个文件时处理整个文件列表
            if (file === fileList[0]) {
              handleFolderUpload(fileList);
            }
            return false; // 阻止默认上传行为
          }}
          directory
          multiple
          showUploadList={false}
        >
          <div style={{ textAlign: 'center', alignItems:'center'}}>
            <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p>Click or drag to upload a folder.</p>
            <p>Support for uploading code files up to 10MB, either individually or in batches.</p>
          </div>
        </Upload>
      </Modal>
    </div>
  );
};

export default FileUploadContainer;
