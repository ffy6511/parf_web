'use client';
import styles from './index.module.css';
import React, { useState } from 'react';
import FileUploadContainer from './fileUploader/display_2'; // 上传组件
import Display_1 from './fileList/display_1';  // 文件列表组件
import InputPanel from './dataInput/dataInput';
import { DockerOutlined, GithubOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd'; // 导入 Tooltip 组件

const Page: React.FC = () => {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isFileListVisible, setIsFileListVisible] = useState(true); // 控制文件列表显示
  const [isHovered, setIsHovered] = useState(false); // 控制悬浮状态

  const handleFileUploadSuccess = () => {
    // 当文件上传成功时，触发重新加载
    setReloadTrigger((prev) => prev + 1);
  };

  const toggleFileListVisibility = () => {
    setIsFileListVisible(!isFileListVisible);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 主体内容部分 */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* 控制按钮和文件列表的容器 */}
        <div style={{ display: 'flex', position: 'relative',backgroundColor: '#F5F5F5', }}>
          {/* 控制按钮固定在左侧 */}
          <div
            style={{
              position: 'absolute', // 固定按钮位置
              left: '25px', // 距离左侧的距离
              top: '10px', // 距离顶部的距离
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              scale: isHovered ? 1.2 : 1,
              justifyContent: 'center',
              transition: 'all 0.3s ease', // 过渡效果
              color: isHovered ? '#1890ff' : 'black', // 悬浮时改变颜色
            }}
            onClick={toggleFileListVisibility}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isFileListVisible ? (
              // 当文件列表展开时显示图标和“文件列表”文本
              <div style={{ display: 'flex', alignItems: 'center',fontSize: '25px',marginTop: '5px' }}>
                <Tooltip title="收起文件列表" color="grey" mouseEnterDelay={0.1} mouseLeaveDelay={0.2}>
                  <MenuFoldOutlined style={{ fontSize: '25px' }} />
                  <strong style={{ marginLeft: '8px'}}>文件列表</strong>
                </Tooltip>
                
              </div>
            ) : (
              // 当文件列表收起时，只显示图标，通过 Tooltip 实现悬停提示
              <Tooltip title="展开文件列表" color="grey" mouseEnterDelay={0.1} mouseLeaveDelay={0.2}>
                <MenuUnfoldOutlined style={{ fontSize: '25px' }} />
              </Tooltip>
            )}
          </div>

          {/* 文件列表 */}
          <div
            style={{
              marginTop: '35px',
              marginLeft: '10px', // 确保文件列表和按钮之间有足够的距离
              flex: isFileListVisible ? 1 : 0, // 控制文件列表的显示/隐藏
              padding: isFileListVisible ? '20px' : '0',
              overflow: 'hidden',
              transition: 'flex 0.3s ease',
              minWidth: isFileListVisible ? '300px' : '0',
              maxWidth: '400px',
              borderRight: '1.5px solid #e0e0e0',
              
            }}
          >
            {isFileListVisible && <Display_1 key={reloadTrigger} />}
          </div>
        </div>

        {/* 中间部分：文件上传组件 */}
        <div style={{ flex: isFileListVisible ? 5 : 6, padding: '20px', transition: 'flex 0.5s ease' }}>
          <FileUploadContainer onFileUploadSuccess={handleFileUploadSuccess} />
        </div>

        {/* 右侧部分：数据输入组件 */}
        <div style={{ 
          flex: isFileListVisible ? 3 : 4, 
          padding: '20px', 
          transition: 'flex 0.5s ease',
          borderLeft: '1.5px solid #e0e0e0',
          }}>
          <InputPanel />
        </div>
      </div>

      {/* 页脚部分 */}
      <footer style={footerStyle}>
        <a
          href="https://hub.docker.com/r/parfdocker/parf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <DockerOutlined /> parfdocker
        </a>
        <a href="https://example2.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
          <GithubOutlined />
        </a>
        <a href="https://example3.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
          Example Link 3
        </a>
      </footer>
    </div>
  );
};

// 页脚样式
const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px 0',
  backgroundColor: '#f1f1f1',
  position: 'relative',
  bottom: 0,
  width: '100%',
  borderTop: '1px solid #e0e0e0',
  marginTop: 'auto', // 确保页脚位于页面底部
  gap: '20px',
};

export default Page;
