'use client';

import React , { useState, useEffect } from 'react';
import FileUploadContainer from './fileUploader/display_2'; // 上传组件
import Display_1 from './fileList/display_1';  // 文件列表组件

const Page: React.FC = () => {
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleFileUploadSuccess = () => {
    // 当文件上传成功时，触发重新加载
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 3, padding: '20px' }}>
        <Display_1 key={reloadTrigger} />
      </div>
      <div style={{ flex: 6, padding: '20px' }}>
        <FileUploadContainer onFileUploadSuccess={handleFileUploadSuccess} />
      </div>
    </div>
  );
};

export default Page;