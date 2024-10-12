import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import styles from './currentInput.module.css';

const CurrentInput: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  // 独立的动画控制状态
  const [isGroupAnimating, setIsGroupAnimating] = useState(false);
  const [isFileAnimating, setIsFileAnimating] = useState(false);

  const loadSelectedData = () => {
    // 处理参数组数据
    const groupData = localStorage.getItem('selectedGroup');
    const parsedGroupData = groupData ? JSON.parse(groupData) : null;

    // 如果新数据与之前不同，才更新状态
    if (JSON.stringify(parsedGroupData) !== JSON.stringify(selectedGroup)) {
      setSelectedGroup(parsedGroupData);
      setIsGroupAnimating(true); // 仅参数组数据改变时触发动画
    }

    // 处理文件数据
    const fileData = localStorage.getItem('selectedFile');
    const parsedFileData = fileData ? JSON.parse(fileData) : null;

    // 如果新数据与之前不同，才更新状态
    if (JSON.stringify(parsedFileData) !== JSON.stringify(selectedFile)) {
      setSelectedFile(parsedFileData);
      setIsFileAnimating(true); // 仅文件数据改变时触发动画
    }
  };

  useEffect(() => {
    // Initial load of the selected data
    loadSelectedData();

    // Listen for storage changes across tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'selectedGroup' || event.key === 'selectedFile') {
        loadSelectedData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Set up an interval to poll for changes every 0.5 seconds
    const intervalId = setInterval(loadSelectedData, 500);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId); // Clear interval on unmount
    };
  }, [selectedGroup, selectedFile]);

  const handleMouseEnterGroup = () => {
    if (selectedGroup) {
      const dbRequest = indexedDB.open('ParameterStorage', 1);

      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['parameters'], 'readonly');
        const store = transaction.objectStore('parameters');
        const request = store.get(selectedGroup.groupName);

        request.onsuccess = () => {
          setGroupDetails(request.result);
        };
      };
    }
  };

  return (
    <div className={styles.currentInputContainer}>
      {/* 左侧标题部分 */}
      <div className={styles.titleSection}>
        <strong>当前设置</strong>
      </div>

      {/* 右侧显示参数组和文件 */}
      <div className={styles.detailsSection}>
        {selectedGroup ? (
          <div className={styles.groupSection}>
            {/* 参数组名称部分 */}
            <Tooltip
              title={
                groupDetails ? (
                  <div>
                    <p>时间预算: {groupDetails.timeBudget} 秒</p>
                    <p>核数: {groupDetails.core}</p>
                    <p>采样数量: {groupDetails.sampleSize}</p>
                  </div>
                ) : (
                  '加载中...'
                )
              }
              overlayInnerStyle={{ backgroundColor: 'grey', color: '#ffffff' }}
            >
              <span
                onMouseEnter={handleMouseEnterGroup}
                className={`${styles.groupName} ${isGroupAnimating ? styles.animateText : ''}`}
                onAnimationEnd={() => setIsGroupAnimating(false)} // Reset group animation flag after animation ends
              >
                参数组: {selectedGroup.groupName}
              </span>
            </Tooltip>
          </div>
        ) : (
          <p>没有选中的参数组</p>
        )}

        {selectedFile ? (
          <div className={styles.fileSection}>
            {/* 文件名称部分 */}
            <Tooltip title={selectedFile.fileName} overlayInnerStyle={{ backgroundColor: 'grey', color: '#ffffff' }}>
              <span
                className={`${styles.fileName} ${isFileAnimating ? styles.animateText : ''}`}
                onAnimationEnd={() => setIsFileAnimating(false)} // Reset file animation flag after animation ends
              >
                文件: {selectedFile.fileName.length > 7 ? `${selectedFile.fileName.slice(0, 7)}...` : selectedFile.fileName}
              </span>
            </Tooltip>
          </div>
        ) : (
          <p>没有选中的文件</p>
        )}
      </div>
    </div>
  );
};

export default CurrentInput;
