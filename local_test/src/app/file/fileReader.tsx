'use client'

import React from 'react';

interface FileReaderProps {
  fileContent: string | null;
  onClearFileContent: () => void; // 新增函数用于清空文件内容
}

const FileReaderComponent: React.FC<FileReaderProps> = ({ fileContent, onClearFileContent }) => {
  return (
    <div>
      <h3>File Content:</h3>
      {fileContent ? (
        <div>
            <button
                onClick={onClearFileContent}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                取消选中
            </button>
          <pre>{fileContent}</pre>
        </div>
      ) : (
        <p>No file content to display</p>
      )}
    </div>
  );
};

export default FileReaderComponent;
