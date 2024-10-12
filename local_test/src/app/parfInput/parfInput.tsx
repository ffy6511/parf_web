import React, { useState, useEffect } from 'react';
import styles from './parfInput.module.css';

const ParfInput: React.FC = () => {
  const [displayData, setDisplayData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  useEffect(() => {
    // Only access localStorage if in the browser environment
    if (typeof window !== 'undefined') {
      const groupData = localStorage.getItem('selectedGroup');
      if (groupData) {
        setSelectedGroup(JSON.parse(groupData));
      }
    }
  }, []);

  const handleSubmit = () => {
    if (!selectedGroup) {
      alert('请选择一个参数组！');
      return;
    }

    setLoading(true);

    // 模拟数据处理逻辑 - 暂时取消与后端交互
    setTimeout(() => {
      const simulatedResponse = `参数组名: ${selectedGroup.groupName}\n时间预算: ${selectedGroup.timeBudget} 秒\n核数: ${selectedGroup.core}\n采样数量: ${selectedGroup.sampleSize}`;
      setDisplayData(simulatedResponse);
      setLoading(false);
      setIsExpanded(true); // 接受返回数据时变宽
    }, 1000); // 模拟延迟 1 秒钟
  };

  useEffect(() => {
    if (!displayData) {
      setIsExpanded(false); // 如果没有数据，保持初始宽度
    }
  }, [displayData]);

  return (
    <div className={styles.parfInputContainer}>
      {/* 显示器部分 */}
      <div className={`${styles.displayMonitor} ${isExpanded ? styles.expanded : ''}`}>
        <strong>调用返回区</strong>
        <pre className={styles.codeBlock}>
          {displayData ? displayData : '等待数据返回...'}
        </pre>
      </div>
      
      {/* 提交按钮 */}
      <button className={styles.submitButton} onClick={handleSubmit} disabled={loading} style={{
         marginTop: '10px', marginLeft: '400px'
          }}>
        {loading ? '提交中...' : '提交调用'}
      </button>
    </div>
  );
};

export default ParfInput;
