'use client';
import styles from './index.module.css';
import React, { useState } from 'react';
import FileUploadContainer from './fileUploader/display_2'; // 上传组件
import Display_1 from './fileList/display_1';  // 文件列表组件
import InputPanel from './dataInput/dataInput';
import { DockerOutlined, GithubOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';

const Page: React.FC = () => {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isFileListVisible, setIsFileListVisible] = useState(true); // 控制文件列表显示

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
      <div style={{ flex: 1, display: 'flex' }}>
        {/* 左侧部分，包括控制图标和文件列表 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', // 控制图标和文件列表上下排列
            alignItems: 'center', // 水平居中对齐
            width: isFileListVisible ? '300px' : '40px', // 文件列表显示时固定宽度，隐藏时宽度较窄
            transition: 'width 0.3s ease', // 平滑过渡
            padding: '10px', // 设置内边距
          }}
        >
          {/* 控制按钮 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginBottom: '10px', // 控制按钮和文件列表之间的间距
            }}
            onClick={toggleFileListVisibility}
          >
            {isFileListVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            {isFileListVisible && <span style={{ marginLeft: '8px' }}>文件列表</span>}
          </div>

          {/* 文件列表 */}
          {isFileListVisible && (
            <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
              <Display_1 key={reloadTrigger} />
            </div>
          )}
        </div>


        {/* 中间部分：文件上传组件 */}
        <div style={{ flex: isFileListVisible ? 5 : 6, padding: '20px', transition: 'flex 0.3s ease' }}>
          <FileUploadContainer onFileUploadSuccess={handleFileUploadSuccess} />
        </div>

        {/* 右侧部分：数据输入组件 */}
        <div style={{ flex: 2, padding: '20px' }}>
          <InputPanel />
        </div>
      </div>

      {/* 页脚部分 */}
      <footer style={footerStyle}>
        <a href="https://hub.docker.com/r/parfdocker/parf" target="_blank" rel="noopener noreferrer" className={styles.link}>
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
