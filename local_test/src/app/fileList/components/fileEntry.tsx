import React, { useState, useEffect } from 'react';
import { CloseCircleOutlined, EditOutlined, EyeOutlined, MoreOutlined, PushpinOutlined } from '@ant-design/icons';
import { FolderOutlined, FileOutlined, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Tooltip } from 'antd';
import styles from '../fileList.module.css'

interface FileEntryProps {
  fileId: number;
  fileName: string;
  lastModified: string | null;
  onClick: (fileId: number) => void;
  onDelete: (fileId: number) => void;
  onEdit: () => void;
  onPreview: () => void;
  isSelected: boolean;
  isAnyHovered: boolean;
  parentId?: number | null;
  onDrop?: (fileId: number, targetParentId: number | null) => void;
  isFolder?: boolean;
  children?: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const FileEntry: React.FC<FileEntryProps> = ({
  fileId,
  fileName,
  lastModified,
  onClick,
  onDelete,
  onEdit,
  onPreview,
  isSelected,
  isAnyHovered,
  parentId,
  onDrop,
  isFolder,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [borderColor, setBorderColor] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setBorderColor(getRandomColor());
  }, []);

  const fileInitials = fileName.substring(0, 2);
  const formattedTime = lastModified
    ? new Date(lastModified).toISOString().replace('T', ' ').slice(5, 19)
    : '';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('fileId', fileId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.background = '#f0f0f0';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.style.background = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop) {
      const draggedFileId = parseInt(e.dataTransfer.getData('fileId'));
      onDrop(draggedFileId, parentId);
    }
    e.currentTarget.style.background = '';
  };

  const menu = (
    <Menu>
      {!isFolder && (
        <>
          <Menu.Item key="preview" icon={<EyeOutlined />} onClick={onPreview} className={styles.menu_turnOut}>
            Preview
          </Menu.Item>
          <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit} className={styles.menu_turnOut}>
            Edit
          </Menu.Item>
        </>
      )}
      <Menu.Item key="delete" icon={<CloseCircleOutlined />} onClick={() => onDelete(fileId)} className={styles.menu_turnOut_delete}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const handleFolderToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发父元素的点击事件
    setIsExpanded(!isExpanded);
  };

  // 文件图标的渲染逻辑
  const renderFileIcon = () => {
    if (isFolder) {
      return (
        <div onClick={handleFolderToggle} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          {isExpanded ? (
            <CaretDownOutlined style={{ marginRight: '4px', fontSize: '12px', color: '#555' }} />
          ) : (
            <CaretRightOutlined style={{ marginRight: '4px', fontSize: '12px', color: '#555' }} />
          )}
          <FolderOutlined style={{ 
            fontSize: '16px', 
            color: isSelected ? borderColor : isHovered ? '#1890ff' : '#8c8c8c'
          }} />
        </div>
      );
    }
    return (
      <FileOutlined style={{ 
        fontSize: '16px', 
        color: isSelected ? borderColor : isHovered ? '#1890ff' : '#8c8c8c',
        marginLeft: '16px' // 与文件夹图标对齐
      }} />
    );
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick(fileId)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          cursor: 'pointer',
          backgroundColor: isHovered ? '#E9E9E9' : 'rgba(255, 255, 255, 0.4)',
          borderLeft: isAnyHovered ? '0.5px solid #d6d9d9' : '0.3px solid #d6d9d9',
          borderRight: isAnyHovered ? '0.5px solid #d6d9d9' : '0.3px solid #d6d9d9',
          transform: isHovered ? 'scale(1.05)' : isSelected ? 'scale(1.01)' : 'scale(1.0)',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: isHovered ? 10 : 1,
          marginBottom: isAnyHovered ? '2px' : '1px',
          borderBottom: isAnyHovered ? '1.4px solid #ccc' : isSelected ? '2px solid #D9D9D9' : '1px solid #ccc',
          borderRadius: '10px',
        }}
      >
        {/* 文件图标区域 */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '24px' }}>
          {renderFileIcon()}
        </div>

        {/* 文件名和时间信息 */}
        <div style={{ flex: 1, marginLeft: '8px' }}>
          <div
            style={{
              color: isSelected ? borderColor : isHovered ? '#202122' : '#888',
              transition: 'all 0.3s ease',
              fontSize: isSelected ? '1.03em' : isHovered ? '1.05em' : '1em',
            }}
          >
            {fileName.length > 18 ? fileName.substring(0, 18) + '..' : fileName}
          </div>
          
          <div style={{ 
            color: isAnyHovered ? '#888' : 'transparent', 
            fontSize: '12px', 
            transition: 'all 0.3s ease'
          }}>
            {formattedTime}
          </div>
        </div>

        {/* 选中标记 */}
        {isSelected && (
          <div style={{
            marginLeft: '8px',
            color: isSelected ? '#1890ff' : 'grey',
            fontSize: '15px',
          }}>
            <Tooltip title="已选中该文件" color="grey" mouseEnterDelay={0.1} mouseLeaveDelay={0.2}>
              <PushpinOutlined />
            </Tooltip>
          </div>
        )}

        {/* 更多操作下拉菜单 */}
        {isHovered && (
          <Dropdown overlay={menu} trigger={['click']} className={styles.ant_dropdown}>
            <button className={styles.menu}></button>
          </Dropdown>
        )}
      </div>

      {/* 文件夹子内容 */}
      {isFolder && isExpanded && (
        <div style={{ marginLeft: '20px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default FileEntry;