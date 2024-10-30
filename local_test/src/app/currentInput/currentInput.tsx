import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import styles from './currentInput.module.css';

// 定义参数组和文件的类型
interface GroupDetails {
  groupName: string;
  timeBudget: number;
  core: number;
  sampleSize: number;
}

interface FileDetails {
  fileName: string;
}

const CurrentInput: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);

  // 独立的动画控制状态
  const [isGroupAnimating, setIsGroupAnimating] = useState(false);
  const [isFileAnimating, setIsFileAnimating] = useState(false);

  const loadSelectedData = () => {
    // 处理参数组数据
    const groupData = localStorage.getItem('selectedGroup');
    const parsedGroupData: GroupDetails | null = groupData ? JSON.parse(groupData) : null;

    // 如果新数据与之前不同，才更新状态
    if (JSON.stringify(parsedGroupData) !== JSON.stringify(selectedGroup)) {
      setSelectedGroup(parsedGroupData);
      setIsGroupAnimating(true); // 仅参数组数据改变时触发动画
    }

    // 处理文件数据
    const fileData = localStorage.getItem('selectedFile');
    const parsedFileData: FileDetails | null = fileData ? JSON.parse(fileData) : null;

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
          setGroupDetails(request.result as GroupDetails);
        };
      };
    }
  };

  return (
    <div className={styles.currentInputContainer}>
      {/* 左侧标题部分 */}
      <div className={styles.titleSection}>
        <strong>Current Setting</strong>
      </div>

      {/* 文件名称部分 */}
      {selectedFile ? (
        <div className={styles.fileSection}>
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
        <p className={styles.noFile}>没有选中的文件</p>
      )}

      {/* 参数组名称部分 */}
      {selectedGroup ? (
        <div className={styles.groupSection}>
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
        <p className={styles.noGroup}>没有选中的参数组</p>
      )}
    </div>
  );
};

export default CurrentInput;
