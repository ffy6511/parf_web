import React, { useState, useEffect } from 'react';
import { CloseCircleOutlined, EditOutlined, EyeOutlined, MoreOutlined, PushpinOutlined } from '@ant-design/icons';
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
  isFolder?:boolean;
  children?:React.ReactNode;
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
      <Menu.Item key="preview" icon={<EyeOutlined />} onClick={onPreview} className={styles.menu_turnOut}>
        Preview
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit} className={styles.menu_turnOut}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<CloseCircleOutlined />} onClick={() => onDelete(fileId)} className={styles.menu_turnOut_delete}>
        Delete
      </Menu.Item>
    </Menu>
  );


  const handleFolderToggle = () => {
    setIsExpanded(!isExpanded);
  };


  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(fileId)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0px',
        cursor: 'pointer',
        backgroundColor: isHovered ? '#E9E9E9' : 'rgba(255, 255, 255, 0.4)',
        borderLeft: isAnyHovered?'0.5px solid #d6d9d9':'0.3px solid #d6d9d9',
        borderRight: isAnyHovered?'0.5px solid #d6d9d9':'0.3px solid #d6d9d9',
        transform: isHovered ? 'scale(1.05)' : isSelected ? 'scale(1.01)' : 'scale(1.0)',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: isHovered ? 10 : 1,
        marginBottom: isAnyHovered? '-10px' : '-21px',
        borderBottom: isAnyHovered?'1.4px solid #ccc':isSelected? '2px solid #D9D9D9' : '1px solid #ccc',
        marginLeft: '-3px',
        borderRadius: '10px',
        paddingLeft: isFolder ? '20px' : '10px',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(3px)',
          color: borderColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '18px',
          marginRight: '10px',
          border: `3px solid ${borderColor}`,
          marginLeft: '6px',
        }}
      >
        {fileInitials}
      </div>

      <div style={{ flex: 1, paddingLeft: '5px', paddingRight: '35px', position: 'relative', marginTop:'5px', paddingTop:'11px' }}>
        <div
          style={{
            color: isSelected? `${borderColor}`: isHovered? '#202122':'#888',
            transition: 'all 0.3s ease',
            fontSize: isSelected? '1.03em': isHovered? '1.05em':'1em',
          }}
        >
          {fileName.length > 18 ? fileName.substring(0, 18) + '..' : fileName}
        </div>
        
        <div style={{ color: isAnyHovered? '#888' : 'transparent', fontSize: '12px', transition:'all 0.3s ease' }}>
          {formattedTime}
        </div>
        <div
          style={{
            content: '',
            position: 'absolute',
            left: '0',
            right: '0',
            bottom: '0px',
            height: '0px',
          }}
        />
      </div>


      {isFolder && (
        <div
          style={{
            cursor: 'pointer',
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            color: '#555',
          }}  
          onClick={handleFolderToggle}
        >
          {isExpanded ? '[-]' : '[+]'}
        </div>
      )}

    {isFolder && isExpanded && children}


      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '25px',
          left: '43px',
          color: isSelected?'#1890ff':'grey',
          fontSize: '15px',
        }}>
          <Tooltip title="已选中该文件" color="grey" mouseEnterDelay={0.1} mouseLeaveDelay={0.2}>
            <PushpinOutlined />
          </Tooltip>
        </div>
      )}
      {isHovered && (
        <Dropdown overlay={menu} trigger={['click']} className={styles.ant_dropdown}>
          <button className={styles.menu}></button>
        </Dropdown>
      )}

    {isFolder && isExpanded && children}


    </div>
  );
};

export default FileEntry;