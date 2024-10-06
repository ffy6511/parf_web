import React, { useState } from 'react';
import FileUploadComponent from './components/uploadFile';
import TextInputComponent from './components/inputFile';

const FileInput: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>('null');

  const handleFileClick = (fileContent: string) => {
    console.log('File content:', fileContent);
  };

  return (
    <div>
      <div>
        <button onClick={() => setActiveComponent('upload')}>上传文件</button>
        <button onClick={() => setActiveComponent('input')}>手动输入</button>
      </div>

      <div>
        {activeComponent === 'upload' && (
          <FileUploadComponent onFileClick={handleFileClick} />
        )}
        {activeComponent === 'input' && (
           <TextInputComponent />
        )}

      </div>
    </div>
  );
};

export default FileInput;
