import React from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface FileEntryProps {
  fileId: number;
  fileName: string;
  lastModified: string | null;
  onClick: (fileId: number) => void;
  onDelete: (fileId: number) => void;
  isSelected: boolean;
}

const FileEntry: React.FC<FileEntryProps> = ({
  fileId,
  fileName,
  lastModified,
  onClick,
  onDelete,
  isSelected,
}) => {
  const fileInitials = fileName.substring(0, 2);
  const formattedTime = lastModified ? new Date(lastModified).toISOString().replace('T', ' ').slice(5, 19) : '';

  return (
    <div
      onClick={() => onClick(fileId)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#C8C8C8' : '#F0F0F0',
        marginBottom: '10px',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '18px',
          marginRight: '10px',
        }}
      >
        {fileInitials}
      </div>

      <div style={{ flex: 1 }}>
        <strong>{fileName}</strong>
        <div style={{ color: '#888', fontSize: '12px' }}>{formattedTime}</div>
      </div>

      <Button
        style={{ backgroundColor: 'transparent', border: 'none', color: 'grey' }}
        onClick={(e) => {
          e.stopPropagation(); // 阻止点击冒泡
          onDelete(fileId);
        }}
      >
        <CloseCircleOutlined />
      </Button>
    </div>
  );
};

export default FileEntry;
