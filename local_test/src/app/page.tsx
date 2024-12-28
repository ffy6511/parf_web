'use client';
import styles from './index.module.css';
import React, { useState, useRef } from 'react';


import FolderCreator from './fileList/components/FolderCreator'; //新建文件夹
import MultiSelector from './fileList/components/MultiSelector'; //多选控制组件

import  Output_container from './parf_output/output';
import FileUploadContainer from './fileUploader/new_project'; // 上传组件
import Display_1 from './fileList/display_1';  // 文件列表组件
import InputPanel from './paraInput/paraInput';
import { DockerOutlined, FunctionOutlined , MenuUnfoldOutlined, MenuFoldOutlined,PaperClipOutlined,TeamOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd'; // 导入 Tooltip 组件

const Page: React.FC = () => {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isFileListVisible, setIsFileListVisible] = useState(true); // 控制文件列表显示
  const [isFileListExpanded, setIsFileListExpanded] = useState(true); // 控制文件列表的展开动画
  const [isHovered, setIsHovered] = useState(false); // 控制悬浮状态
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());


  const handleToggleMultiSelect = () => {
    setIsMultiSelect(!isMultiSelect);
    setSelectedFiles(new Set());
  };

  const handleMultiSelect = (fileId: number) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleBatchDelete = () => {
    // 可以通过ref调用Display_1的方法
    if (displayRef.current) {
      displayRef.current.handleBatchDelete(Array.from(selectedFiles));
    }
  };

  const handleCreateFolder = (name: string) => {
    if (displayRef.current) {
      displayRef.current.handleCreateFolder(name);
    }
  };

  // 添加ref用于调用Display_1的方法
  const displayRef = useRef<any>(null);

  // 在原有的 FileUploadContainer 旁边添加操作按钮
  const renderFileOperations = () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: '1vw',
      marginLeft: '0vw',
      fontSize: '0.6em',
    }}>
      <FolderCreator onFolderCreate={handleCreateFolder} />
      <MultiSelector
        isMultiSelect={isMultiSelect}
        selectedCount={selectedFiles.size}
        onToggleMultiSelect={handleToggleMultiSelect}
        onBatchDelete={handleBatchDelete}
      />
      <FileUploadContainer onFileUploadSuccess={handleFileUploadSuccess} />
    </div>
  );



  const handleFileUploadSuccess = () => {
    // 当文件上传成功时，触发重新加载
    setReloadTrigger((prev) => prev + 1);
  };

  const toggleFileListVisibility = () => {
    if (!isFileListVisible) {
      // 设置可见并开始展开动画
      setIsFileListVisible(true);
      setTimeout(() => {
        setIsFileListExpanded(true);
      }, 0); // 适当延迟以确保容器渲染后再展开
    } else {
      // 先折叠动画再隐藏
      setIsFileListExpanded(false);
      setTimeout(() => {
        setIsFileListVisible(false);
      }, 0); // 确保折叠动画完成后再隐藏
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column',minHeight:'100vh',overflow:'auto'}}>
      {/* 主体内容部分 */}
      <div style={{ display: 'flex', flex: 1,overflow:'auto' }}>
        {/* 控制按钮和文件列表的容器 */}
        <div
          style={{
            display: 'flex',
            marginTop:'-2vh',
            flex:isFileListVisible?3:0,
            flexDirection: 'column', 
            position: 'relative',
            boxShadow: '1px 0 5px rgba(0, 0, 0, 0.3)',  
            background: 'linear-gradient(90deg, rgba(242, 242, 242, 0.5), rgba(241, 237, 234, 0.5), rgba(233, 226, 226, 0.5))',
          }}
        >
          {/* 控制按钮固定在左侧 */}
          <div
            style={{
              padding: '1em',
              flexShrink: 0, 
              top: '0px',
              display: 'flex',
              // alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: isHovered ? '#1890ff' : 'black',
            }}
            
          >
            {isFileListExpanded ? (
              // 当文件列表展开时显示图标和“文件列表”文本
              <div
                style = {{
                  display:'flex',
                  flexDirection:'row',
                  marginTop:'-1vh',
                 marginRight:'auto'
                }}>
              <div 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '1em', 
                marginTop: '0px',
                }}>
                <Tooltip title="Close file list" color="grey" mouseEnterDelay={0.1} mouseLeaveDelay={0.2} onClick={toggleFileListVisibility}
                scale = 'isHovered ? 1.1 : 1'
                cursor = 'pointer' 
                >
                  <MenuFoldOutlined style={{ filter: 'drop-shadow(2px 2px 10px grey)',color:'#1ea0f2' }} />
                </Tooltip>
                <strong style={{ fontSize: '1.2em', marginTop: '0px', textShadow: '1px 1px 10px #a49f9f',marginLeft:'0.5em'  }}>Project</strong>
            
              </div>
                <div style = {{
                    marginLeft: '1vw',
                    fontSize:'0.6em',
                }}>
                   {renderFileOperations()}
                </div>
              </div>    //上传组件
            ): (
              // 当文件列表收起时，只显示图标，通过 Tooltip 实现悬停提示
              <Tooltip title="Unfold file list" color="grey" 
              mouseEnterDelay={0.1} mouseLeaveDelay={0.2}
              onClick={toggleFileListVisibility}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}>
                <MenuUnfoldOutlined style={{ fontSize: '20px', marginTop: '2px',filter: 'drop-shadow(3px 3px 5px grey)' }} />
              </Tooltip>
            )}
          </div>
  
          {/* 文件列表 */}
          {isFileListVisible && (
            <div
              className={`${styles.fileListContainer} ${isFileListExpanded ? styles.fileListExpanded : ''}`}
              style={{
                flex: 1,
                marginTop: '0vh',
                marginLeft: '0.5vw',
                overflow: 'auto',
                borderRight: '1.5px solid #e0e0e0',
                transition: 'max-height 0.5s ease, width 0.5s ease, opacity 0.5s ease',
                display: 'flex', // 添加这个样式使内容竖直排列
                flexDirection: 'column', // 设置为竖直排列

              }}
            >
             <div style={{ 
                flex: 1, 
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)',
                minHeight:'35vh'
                }}> {/* Display_1 */}
              <Display_1 
                ref={displayRef}
                key={reloadTrigger}
                isMultiSelect={isMultiSelect}
                selectedFiles={selectedFiles}
                onMultiSelect={handleMultiSelect}
              />
              </div>
             
              <div style={{ 
                flex: 1, 
                overflow: 'auto',
                marginTop:'1vh' ,
                minHeight:'35vh'
                }}> {/* InputPanel */}

              <strong style={{ fontSize: '1.2em', marginTop: '0px', textShadow: '1px 1px 10px #a49f9f' }}>
              <FunctionOutlined /> Hyperparameters Configuration
               </strong>

              <InputPanel />

             </div>

            </div>
        )}

        </div>

        <div
          style={{
            flex: isFileListVisible ? 7 : 10,
            padding: '0px',
            transition: 'flex 0.7s ease',
            marginLeft:isFileListVisible?'0.5vw' : '4vw'
          }}
        >
          <  Output_container />
        </div>

      </div>
  
      {/* 页脚部分 */}
      <footer className= {styles.footerStyle}>
        <a
          href="https://hub.docker.com/r/parfdocker/parf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <DockerOutlined /> Parfdocker
        </a>
        <a href="https://dl.acm.org/doi/10.1145/3691620.3695487" target="_blank" rel="noopener noreferrer" className={styles.link}>
        <PaperClipOutlined /> Article
        </a>
        <a href="https://fiction-zju.github.io" target="_blank" rel="noopener noreferrer" className={styles.link}>
        <TeamOutlined />FICTION
        </a>
      </footer>
    </div>
  );
}



export default Page;
