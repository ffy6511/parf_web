'use client';
import styles from './index.module.css';
import React, { useState } from 'react';
import ParfInput from './parfInput/parfInput';
import FileUploadContainer from './fileUploader/display_2'; // 上传组件
import Display_1 from './fileList/display_1';  // 文件列表组件
import InputPanel from './paraInput/paraInput';
import { DockerOutlined, GithubOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd'; // 导入 Tooltip 组件

const Page: React.FC = () => {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isFileListVisible, setIsFileListVisible] = useState(true); // 控制文件列表显示
  const [isFileListExpanded, setIsFileListExpanded] = useState(true); // 控制文件列表的展开动画
  const [isHovered, setIsHovered] = useState(false); // 控制悬浮状态

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 主体内容部分 */}
      <div style={{ display: 'flex', flex: 1, maxHeight: '97vh' }}>
        {/* 控制按钮和文件列表的容器 */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            boxShadow: '1px 0 5px rgba(0, 0, 0, 0.3)',  
            background: 'linear-gradient(90deg, rgba(242, 242, 242, 0.5), rgba(241, 237, 234, 0.5), rgba(233, 226, 226, 0.5))',
          }}
        >
          {/* 控制按钮固定在左侧 */}
          <div
            style={{
              position: 'absolute',
              left: '25px',
              top: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: isHovered ? '#1890ff' : 'black',
            }}
            
          >
            {isFileListExpanded ? (
              // 当文件列表展开时显示图标和“文件列表”文本
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '17px', marginTop: '3px' }}>
                <Tooltip title="收起文件列表" color="grey" mouseEnterDelay={0.1} mouseLeaveDelay={0.2} onClick={toggleFileListVisibility}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                cursor = 'pointer'
                scale = 'isHovered ? 1.03 : 1'
                >
                  <MenuFoldOutlined style={{ filter: 'drop-shadow(3px 5px 3px grey)' }} />
                </Tooltip>
                <strong style={{ marginLeft: '8px', textShadow: '2px 3px 4px #a49f9f', color:'#454543' }}>文件列表</strong>
              </div>
            ) : (
              // 当文件列表收起时，只显示图标，通过 Tooltip 实现悬停提示
              <Tooltip title="展开文件列表" color="grey" 
              mouseEnterDelay={0.1} mouseLeaveDelay={0.2}
              onClick={toggleFileListVisibility}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}>
                <MenuUnfoldOutlined style={{ fontSize: '20px', marginTop: '2px',filter: 'drop-shadow(3px 5px 3px grey)' }} />
              </Tooltip>
            )}
          </div>
  
          {/* 文件列表 */}
          {isFileListVisible && (
            <div
              className={`${styles.fileListContainer} ${isFileListExpanded ? styles.fileListExpanded : ''}`}
              style={{
                marginTop: '45px',
                marginLeft: '10px',
                overflow: 'hidden',
                borderRight: '1.5px solid #e0e0e0',
                transition: 'max-height 0.5s ease, width 0.5s ease, opacity 0.5s ease',
              }}
            >
              <Display_1 key={reloadTrigger} />
            </div>
          )}
        </div>
  
        {/* 中间部分：文件上传组件 */}
        <div
          style={{
            flex: isFileListVisible ? 5 : 6,
            padding: '0px',
            transition: 'flex 0.7s ease',
          }}
        >
          <FileUploadContainer onFileUploadSuccess={handleFileUploadSuccess} />
          <ParfInput />
        </div>
  
        {/* 右侧部分：数据输入组件 */}
        <div
          style={{
            flex: isFileListVisible ? 3 : 4,
            padding: '20px',
            transition: 'flex 0.5s ease',
            borderLeft: '1.5px solid #e0e0e0',
          }}
        >
          <InputPanel />
        </div>
      </div>
  
      {/* 页脚部分 */}
      <footer style={footerStyle}>
        <a
          href="https://hub.docker.com/r/parfdocker/parf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
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
}

// 页脚样式
const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '14px',
  padding: '0px 0',  // 增加 padding 使页脚更大
  backgroundColor: '#f1f1f1',
  width: '100%',
  borderTop: '1px solid #e0e0e0',
  marginTop: '0px',  // 增加 margin-top 来调整页脚和内容之间的间距
  gap: '35px',
  flexShrink: 0,  // 确保页脚不会被压缩
};



export default Page;
