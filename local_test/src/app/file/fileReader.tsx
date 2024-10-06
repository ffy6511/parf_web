'use client'

import React, { useState } from 'react';

const FileReaderComponent: React.FC = () => {
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setFileContent(reader.result);
      };

      reader.onerror = () => {
        console.error("File reading error");
      };

      reader.readAsText(file); // 读取文件作为文本
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {fileContent && (
        <div>
          <h3>文件内容：</h3>
          <pre>{fileContent.toString()}</pre>
        </div>
      )}
    </div>
  );
};

export default FileReaderComponent;
