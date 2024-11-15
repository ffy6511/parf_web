// components/MultiSelector.tsx
import React from 'react';
import { Button } from 'antd';
import { SelectOutlined, DeleteOutlined } from '@ant-design/icons';

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
    <div style = {{display:'flex', flexDirection:'row'}}>
      <Button
        type={isMultiSelect ? 'primary' : 'default'}
        icon={<SelectOutlined />}
        onClick={onToggleMultiSelect}
        style={{ marginRight: 8 }}
      >
        {isMultiSelect ? 'Exit' : 'Mul'}
      </Button>
      {isMultiSelect && selectedCount > 0 && (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={onBatchDelete}
        >
        ({selectedCount})
        </Button>
      )}
    </div>
  );
};

export default MultiSelector;