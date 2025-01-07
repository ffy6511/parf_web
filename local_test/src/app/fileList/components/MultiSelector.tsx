// MultiSelector.tsx
import React from 'react';
import { Button } from 'antd';
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './component.module.css'

interface MultiSelectorProps {
  isMultiSelect: boolean;
  selectedCount: number;
  onToggleMultiSelect: () => void;
  onBatchDelete: () => void;
  className?: string;
}

const MultiSelector: React.FC<MultiSelectorProps> = ({
  isMultiSelect,
  selectedCount,
  onToggleMultiSelect,
  onBatchDelete,
  className
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Button
        type={isMultiSelect ? 'default' : 'default'}
        icon={isMultiSelect?null:<CheckCircleOutlined/>}
        onClick={onToggleMultiSelect}
        style={{
          padding: '8px',
          border: 'none',
          fontSize: '2em',
        }}
        className={`${styles.foldcreator} ${isMultiSelect ? styles.active : ''}`}
      >
        {isMultiSelect ? 'Done' : ''}
      </Button>
      {isMultiSelect && selectedCount > 0 && (
        <Button
          type = {'danger'}
          icon={<DeleteOutlined />}
          onClick={onBatchDelete}
          style={{
            padding: '8px',
            border: 'none',
            fontSize: '2em',
          }}
          className={styles.deleteButton}
        >
          ({selectedCount})
        </Button>
      )}
    </div>
  );
};

export default MultiSelector;