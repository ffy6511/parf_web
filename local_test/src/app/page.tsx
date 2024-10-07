'use client';

import React from 'react';
import FileUploadContainer from './fileUploader/fileUploadContainer'; // 上传组件
import Display_1 from './fileList/display_1';  // 文件列表组件

const Page: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 左侧：文件列表组件 */}
      <div style={{ flex: 1, borderRight: '1px solid #ccc' }}>
        <Display_1 />
      </div>

      {/* 右侧：文件上传或手动输入组件 */}
      <div style={{ flex: 1 }}>
        <FileUploadContainer />
      </div>
    </div>
  );
};

export default Page;
