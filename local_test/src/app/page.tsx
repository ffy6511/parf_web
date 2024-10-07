'use client';

import React , { useState, useEffect } from 'react';
import FileUploadContainer from './fileUploader/display_2'; // 上传组件
import Display_1 from './fileList/display_1';  // 文件列表组件
import InputPanel from './dataInput/dataInput'

const Page: React.FC = () => {
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleFileUploadSuccess = () => {
    // 当文件上传成功时，触发重新加载
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 主体内容部分 */}
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 3, padding: '20px' }}>
          <Display_1 key={reloadTrigger} />
        </div>
        <div style={{ flex: 5, padding: '20px' }}>
          <FileUploadContainer onFileUploadSuccess={handleFileUploadSuccess} />
        </div>
        <div style={{ flex: 2, padding: '20px' }}>
          <InputPanel />
        </div>
      </div>

      {/* 页脚部分 */}
      <footer style={footerStyle}>
        <a href="https://hub.docker.com/r/parfdocker/parf" target="_blank" rel="noopener noreferrer">
          Parfdocker
        </a>
        <a href="https://example2.com" target="_blank" rel="noopener noreferrer">
          Example Link 2
        </a>
        <a href="https://example3.com" target="_blank" rel="noopener noreferrer">
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
