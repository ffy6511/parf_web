import React, { useState, useEffect } from 'react';
import { CloseCircleOutlined, EditOutlined, EyeOutlined, MoreOutlined, PushpinOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Tooltip } from 'antd';

interface FileEntryProps {
  fileId: number;
  fileName: string;
  lastModified: string | null;
  onClick: (fileId: number) => void;
  onDelete: (fileId: number) => void;
  onEdit: () => void;
  onPreview: () => void;
  isSelected: boolean;
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [borderColor, setBorderColor] = useState('');

  useEffect(() => {
    setBorderColor(getRandomColor()); // 为图像生成随机颜色
  }, []);

  const fileInitials = fileName.substring(0, 2);
  const formattedTime = lastModified
    ? new Date(lastModified).toISOString().replace('T', ' ').slice(5, 19)
    : '';

  // 创建下拉菜单项
  const menu = (
    <Menu>
      <Menu.Item key="preview" icon={<EyeOutlined />} onClick={onPreview}>
        预览
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit}>
        修改
      </Menu.Item>
      <Menu.Item key="delete" icon={<CloseCircleOutlined />} onClick={() => onDelete(fileId)}>
      删除
    </Menu.Item>

    </Menu>
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(fileId)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '3px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#e6f7ff' : isHovered ? '#E9E9E9' : 'white',
        transform: isHovered ? 'scale(0.97)' : isSelected ? 'scale(1.02)' : 'scale(1.0)',
        transition: 'all 0.3s ease',
        position: 'relative',
        marginBottom: '10px',
        borderLeft: isSelected ? '4px solid #D9D9D9' : '#ccc',
        borderBottom: isSelected? '5px solid #D9D9D9' : '2px solid #ccc',
        marginLeft: '-3px',
        borderRadius:isSelected? '10px':isHovered? '20px' : '10px',
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
        <strong>
          {fileName.length > 7 ? fileName.substring(0, 7) + '.c' : fileName}
        </strong>
        <div style={{ color: '#888', fontSize: '12px' }}>{formattedTime}</div>
        <div
          style={{
            content: '',
            position: 'absolute',
            left: '0',
            right: '0',
            bottom: '0px',
            height: '0px',
          }}
        ></div>
      </div>
      {(isHovered || isSelected) && (
        <div style={{ position: 'absolute',
           top: '25px', 
           left: '43px',
           color:isSelected?'#1890ff':'grey', 
           fontSize: '15px',
           }}>
          <Tooltip title="已选中该文件" color="grey" mouseEnterDelay={0.1} mouseLeaveDelay={0.2}>
          <PushpinOutlined />
          </Tooltip>
        </div>  
      )}
      {isHovered && (
        <Dropdown overlay={menu} trigger={['click']} >
          <Button icon={<MoreOutlined />} style={{ 
            position: 'absolute',
             right:'15px',
             borderRadius:'50%',
             border:'none',
             padding:'10',
             backgroundColor:'transparent',
             fontSize:'25px',
              }} />
        </Dropdown>
      )}
    </div>
  );
};

export default FileEntry;
