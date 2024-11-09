'use client';
import styles from './index.module.css';
import React, { useState } from 'react';
import ParfInput from './parfInput/parfInput';
import FileUploadContainer from './fileUploader/new_project'; // 上传组件
import Display_1 from './fileList/display_1';  // 文件列表组件
import InputPanel from './paraInput/paraInput';
import { DockerOutlined, AlignLeftOutlined, MenuUnfoldOutlined, MenuFoldOutlined,PaperClipOutlined,TeamOutlined } from '@ant-design/icons';
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
      <div style={{ display: 'flex', flex: 1 }}>
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
              left: '1em',
              top: '0px',
              display: 'flex',
              alignItems: 'center',
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
                  marginTop:'-2vh',
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
                <Tooltip title="收起文件列表" color="grey" mouseEnterDelay={0.1} mouseLeaveDelay={0.2} onClick={toggleFileListVisibility}
                scale = 'isHovered ? 1.1 : 1'
                cursor = 'pointer' 
                >
                  <MenuFoldOutlined style={{ filter: 'drop-shadow(2px 2px 10px grey)',color:'#1ea0f2' }} />
                </Tooltip>
                <strong style={{ fontSize: '1.2em', marginTop: '0px', textShadow: '1px 1px 10px #a49f9f',marginLeft:'0.5em'  }}>File List</strong>
            
              </div>
                <div style = {{
                    marginLeft: '12vw',
                    fontSize:'0.6em',
                }}>
                  <FileUploadContainer onFileUploadSuccess={handleFileUploadSuccess} />
                </div>
              </div>    //上传组件
            ): (
              // 当文件列表收起时，只显示图标，通过 Tooltip 实现悬停提示
              <Tooltip title="展开文件列表" color="grey" 
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
                marginTop: '8vh',
                marginLeft: '0.5vw',
                overflow: 'hidden',
                borderRight: '1.5px solid #e0e0e0',
                transition: 'max-height 0.5s ease, width 0.5s ease, opacity 0.5s ease',
                display: 'flex', // 添加这个样式使内容竖直排列
                flexDirection: 'column', // 设置为竖直排列

              }}
            >
             <div style={{ 
                flex: 1, 
                minHeight: '50%',
                overflow: 'auto',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)'
                }}> {/* Display_1 */}
              <Display_1 key={reloadTrigger} />
              </div>
             
              <div style={{ 
                flex: 1, 
                minHeight: '50%', 
                overflow: 'auto',
                marginTop:'1vh' ,
                }}> {/* InputPanel */}

              <strong style={{ fontSize: '1.2em', marginTop: '0px', textShadow: '1px 1px 10px #a49f9f' }}>
                 <AlignLeftOutlined /> Hyperparameters Configuration
               </strong>

              <InputPanel />

             </div>
            </div>
        )}

        </div>

        <div
          style={{
            flex: isFileListVisible ? 5 : 6,
            padding: '0px',
            transition: 'flex 0.7s ease',
            marginLeft:'2vw',
          }}
        >
          <ParfInput />
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

// 页脚样式
const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.8em',
  padding: '0px 0',  // 增加 padding 使页脚更大
  backgroundColor: '#f1f1f1',
  width: '100%',
  borderTop: '1px solid #e0e0e0',
  marginTop: '0px',  // 增加 margin-top 来调整页脚和内容之间的间距
  gap: '5vw',
  flexShrink: 0,  // 确保页脚不会被压缩
};



export default Page;
