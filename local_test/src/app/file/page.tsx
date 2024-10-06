'use client';

import React, { useState } from 'react';
import FileUploadComponent from './fileUpload';
import FileReaderComponent from './fileReader';

const UploadPage: React.FC = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);

  const handleFileClick = (content: string) => {
    setFileContent(content);
  };

  const handleClearFileContent = () => {
    setFileContent(null); // 清空文件内容
  };

  return (
    <div>
      <p>上传代码文件</p>
      <FileUploadComponent onFileClick={handleFileClick} />
      <FileReaderComponent fileContent={fileContent} onClearFileContent={handleClearFileContent}/>
    </div>
  );
};

export default UploadPage;
