import React, { useState } from 'react';
import axios from 'axios';
import styles from './parfInput.module.css';

const ParfInput: React.FC = () => {
  const [displayData, setDisplayData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 从 localStorage 获取当前选中的参数组
  const selectedGroup = localStorage.getItem('selectedGroup') ? JSON.parse(localStorage.getItem('selectedGroup') as string) : null;

  const handleSubmit = async () => {
    if (!selectedGroup) {
      alert('请选择一个参数组！');
      return;
    }

    setLoading(true);
    try {
      // 调用后端 API
      const response = await axios.post('/execute', {
        groupName: selectedGroup.groupName,
        timeBudget: selectedGroup.timeBudget,
        core: selectedGroup.core,
        sampleSize: selectedGroup.sampleSize,
      });

      setDisplayData(response.data); // 显示返回的数据
    } catch (error) {
      console.error('提交数据时出错:', error);
      setDisplayData('执行命令时发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.parfInputContainer}>
      {/* 显示器部分 */}
      <div className={styles.displayMonitor}>
        <strong>数据显示器</strong>
        <pre className={styles.codeBlock}>
          {displayData ? displayData : '等待数据返回...'}
        </pre>
      </div>
      
      {/* 提交按钮 */}
      <button className={styles.submitButton} onClick={handleSubmit} disabled={loading}>
        {loading ? '提交中...' : '提交数据'}
      </button>
    </div>
  );
};

export default ParfInput;
