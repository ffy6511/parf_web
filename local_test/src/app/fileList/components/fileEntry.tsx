import React, { useState, useEffect } from 'react';
import { CloseCircleOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Modal } from 'antd';

interface FileEntryProps {
  fileId: number;
  fileName: string;
  lastModified: string | null;
  onClick: (fileId: number) => void;
  onDelete: (fileId: number) => void;
  onEdit: () => void;  // 新增用于编辑的回调
  onPreview: () => void;  // 新增用于预览的回调
  isSelected: boolean;
}

// 为图像生成随机颜色
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [borderColor, setBorderColor] = useState('');

  useEffect(() => {
    setBorderColor(getRandomColor()); // 为图像生成随机颜色
  }, []);

  const fileInitials = fileName.substring(0, 2); // 获取文件名的前两个字符
  const formattedTime = lastModified
    ? new Date(lastModified).toISOString().replace('T', ' ').slice(5, 19)
    : '';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(fileId)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#C8C8C8' : isHovered ? '#D9D9D9' : 'white',
        transform: isSelected ? 'scale(1.03)' : isHovered ? 'scale(1.05)' : 'scale(1.0)',
        transition: 'all 0.2s ease',
        position: 'relative',
        marginBottom: '10px',
        borderLeft: isSelected ? '4px solid #D9D9D9' : '#ccc',
        marginLeft: '-3px',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'white',
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

      <div style={{ flex: 1, paddingLeft: '5px', paddingRight: '10px', position: 'relative' }}>
        <strong>{fileName}</strong>
        <div style={{ color: '#888', fontSize: '12px' }}>{formattedTime}</div>
        <div
          style={{
            content: '',
            position: 'absolute',
            left: '0',
            right: '0',
            bottom: '-4px',
            height: '0.3px',
            backgroundColor: '#ccc',
          }}
        ></div>
      </div>
      
      {isHovered && (
        <Popconfirm
          title="确定删除该文件？"
          onConfirm={() => onDelete(fileId)}
          okText="确定"
          cancelText="取消"
        >
          <Button danger icon={<CloseCircleOutlined />} style={{ marginRight: '10px' }}>
            删除
          </Button>
        </Popconfirm>
      )}
      
      {/* 编辑按钮 */}
      <Button
        icon={<EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        style={{ marginRight: '10px' }}
      >
        修改
      </Button>

      {/* 预览按钮 */}
      <Button
        icon={<EyeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
      >
        预览
      </Button>

      
    </div>
  );
};


export default FileEntry;
