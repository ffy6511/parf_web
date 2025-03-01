'use client';

import React, { useState } from 'react';
import FileEntry from './components/fileEntry';
import { Modal, Button } from 'antd';
import styles from './fileList.module.css';
import TextArea from 'antd/lib/input/TextArea';
import { useFileOperations } from './hooks/useFileOperations';
interface FileData {
  id: number;
  fileName: string;
  lastModified: string;
  fileContent: ArrayBuffer;
  parentId: number | null;
  isFolder: boolean;
  path: string;  // 添加 path 字段
}

interface Display_1Props {
  isMultiSelect: boolean;
  selectedFiles: Set<number>;
  onMultiSelect: (fileId: number) => void;
}

interface DisplayRef {
  handleBatchDelete: (fileIds: number[]) => Promise<void>;
  handleCreateFolder: (folderName: string) => Promise<void>;
}

const Display_1 = React.forwardRef<DisplayRef, Display_1Props>((props, ref) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [isAnyHovered, setIsAnyHovered] = useState(false);
  const { isMultiSelect, selectedFiles, onMultiSelect } = props;
  
  const {
    fileList,
    selectedFileId,
    selectedFileContent,
    expandedFolders,
    handleCreateFolder,
    handleBatchDelete,
    handleDeleteFile,
    handleFileDrop,
    handleFilePreview,
    handleFileClick,
    handleFileOperation,
    handleSaveContent,
    toggleFolder,
    setSelectedFileContent
  } = useFileOperations();

  // useImperativeHandle to expose methods to parent
  React.useImperativeHandle(ref, () => ({
    handleBatchDelete,
    handleCreateFolder
  }));

  const renderFileTree = (parentId: number | null = null) => {
    const items = fileList.filter(item => item.parentId === parentId);
    
    return items.length > 0 ? (
      <ul style={{ 
        paddingLeft: parentId !== null ? '20px' : '0',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}>
        {items.map((item) => (
          <li key={item.id} 
            style={{ margin: 0, padding: 0 }}
            onMouseEnter={() => setIsAnyHovered(true)}
            onMouseLeave={() => setIsAnyHovered(false)}
          >
            <FileEntry
              fileId={item.id}
              fileName={item.fileName}
              lastModified={item.lastModified}
              onClick={handleFileClick}
              onDelete={handleDeleteFile}
              onEdit={() => handleFileOperation(item.id, 'edit')}
              onPreview={() => handleFileOperation(item.id, 'preview')}
              isSelected={selectedFileId === item.id}
              isAnyHovered={isAnyHovered}
              parentId={item.parentId}
              onDrop={handleFileDrop}
              isFolder={item.isFolder}
              isExpanded={expandedFolders.has(item.id)}
              onToggle={() => item.isFolder && toggleFolder(item.id)}
              isMultiSelect={isMultiSelect}
              isMultiSelected={selectedFiles.has(item.id)}
              onMultiSelect={onMultiSelect}
            >
              {item.isFolder && expandedFolders.has(item.id) && renderFileTree(item.id)}
            </FileEntry>
          </li>
        ))}
      </ul>
    ) : null;
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
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="save" type="primary" onClick={() => {
            handleSaveContent(selectedFileId!, selectedFileContent);
            setIsEditModalVisible(false);
          }}>
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
        visible={isPreviewModalVisible}
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
});

// 添加显示名称
Display_1.displayName = 'Display_1';


export default Display_1;