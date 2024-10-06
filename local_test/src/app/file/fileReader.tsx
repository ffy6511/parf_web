'use client'

import React from 'react';

interface FileReaderProps {
  fileContent: string | null;
}

const FileReaderComponent: React.FC<FileReaderProps> = ({ fileContent }) => {
  return (
    <div>
      <h3>File Content:</h3>
      {fileContent ? (
        <pre>{fileContent}</pre>
      ) : (
        <p>No file content to display</p>
      )}
    </div>
  );
};

export default FileReaderComponent;
