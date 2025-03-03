import React, { useState, useEffect } from 'react';
import { CloseCircleOutlined, EditOutlined, EyeOutlined, PushpinOutlined } from '@ant-design/icons';
import { FolderOutlined, FileOutlined, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Tooltip, Checkbox } from 'antd';
import styles from '../fileList.module.css'

interface FileEntryProps {
  fileId: number;
  fileName: string;
  lastModified: string | null;
  onClick: (fileId: number) => void;
  onDelete: (fileId: number, isFolder:boolean) => void;
  isSelected: boolean;
  isAnyHovered: boolean;
  parentId?: number | null;
  onDrop?: (fileId: number, targetParentId: number | null) => void;
  isFolder?: boolean;
  children?: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  isMultiSelect?: boolean;
  isMultiSelected?: boolean;
  onMultiSelect?: (fileId: number) => void;
}

const getRandomColor = () => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 20) + 80;
  const l = Math.floor(Math.random() * 20) + 25;

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  return hslToHex(h, s, l);
};

const FileEntry: React.FC<FileEntryProps> = ({
  fileId,
  fileName,
  lastModified,
  onClick,
  onDelete,
  isSelected,
  isAnyHovered,
  parentId,
  onDrop,
  isFolder,
  children,
  isExpanded,
  onToggle,
  isMultiSelect,
  isMultiSelected,
  onMultiSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [borderColor, setBorderColor] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setBorderColor(getRandomColor());
  }, []);

  const formattedTime = lastModified
    ? new Date(lastModified).toISOString().replace('T', ' ').slice(5, 19)
    : '';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('fileId', fileId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isFolder) {
      setIsDragOver(true);
      (e.currentTarget as HTMLElement).style.background = 'rgba(24, 144, 255, 0.1)';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    (e.currentTarget as HTMLElement).style.background = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    (e.currentTarget as HTMLElement).style.background = '';
    
    if (isFolder && onDrop) {
      const draggedFileId = parseInt(e.dataTransfer.getData('fileId'));
      if (draggedFileId !== fileId) {
        onDrop(draggedFileId, fileId);
      }
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="delete" icon={<CloseCircleOutlined />} onClick={() => onDelete(fileId, isFolder as boolean)} className={styles.menu_turnOut_delete}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const handleFolderToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMultiSelect && onMultiSelect) {
      onMultiSelect(fileId);
    } else {
      onClick(fileId);
    }
  };

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
        marginLeft: '16px'
      }} />
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      marginBottom: isFolder ? '4px' : '0px',
    }}>
      <div
        draggable={true}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 12px',
          cursor: 'pointer',
          backgroundColor: isDragOver ? 'rgba(24, 144, 255, 0.1)' : 
                       isMultiSelected ? 'rgba(24, 144, 255, 0.1)' :
                       isSelected? '#dedfe0':
                       isHovered ? '#E9E9E9' : 
                       'rgba(255, 255, 255, 0.4)',
          borderLeft: isAnyHovered ? '0.5px solid #d6d9d9' : '0.3px solid #d6d9d9',
          borderRight: isAnyHovered ? '0.5px solid #d6d9d9' : '0.3px solid #d6d9d9',
          transition: 'all 0s ease',
          position: 'relative',
          borderBottom: isAnyHovered ? '1.4px solid #ccc' : 
                       isSelected ? '2px solid #D9D9D9' : 
                       '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: isDragOver && isFolder ? '0 0 5px rgba(24,144,255,0.5)' : 'none',
          border: isDragOver && isFolder ? '1px dashed #1890ff' : undefined,
        }}
      >
        {isMultiSelect && (
          <Checkbox
            checked={isMultiSelected}
            onChange={(e:MouseEvent) => {
              e.stopPropagation();
              onMultiSelect?.(fileId);
            }}
            style={{ marginRight: 8 }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', minWidth: '24px' }}>
          {renderFileIcon()}
        </div>



        <div style={{ flex: 1, marginLeft: '8px' }}>
          <div
            style={{
              color: isSelected ? borderColor : isHovered ? '#202122' : '#888',
              transition: 'all 0.2s ease',
              marginBottom: '0px',
              marginLeft:'0.5em',
              textAlign:'left',
            }}
          >
            {fileName.length > 18 ? fileName.substring(0, 18) + '..' : fileName}
          </div>
          
        </div>

        {isHovered && !isMultiSelect && (
          <Dropdown overlay={menu} trigger={['click']} className={styles.ant_dropdown}>
            <button className={styles.menu}></button>
          </Dropdown>
        )}
      </div>

      {isFolder && isExpanded && (
        <div style={{ 
          marginLeft: '1vw',
          marginTop: '0px',
          paddingLeft: '1vw',
          borderLeft: '1px dashed #d9d9d9'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default FileEntry;