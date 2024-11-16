'use client'

import { useState, useEffect } from "react";
import { trpc } from '../../../trpc/react';
import styles from '../parf_output.module.css'

const ResultComparation = () => {
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [files, setFiles] = useState<{ fileName: string, content: string }[]>([]);


  // 初始化时从 localStorage 获取 tempPath
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTempPath = localStorage.getItem('tempPath');
      setTempPath(storedTempPath);
    }
  }, []);

  // 监听 tempPathUpdated 自定义事件
  useEffect(() => {
    const handleTempPathUpdated = () => {
      if (typeof window !== 'undefined') {
        const updatedPath = localStorage.getItem('tempPath');
        setTempPath(updatedPath);
      }
    };

    window.addEventListener('tempPathUpdated', handleTempPathUpdated);

    return () => {
      window.removeEventListener('tempPathUpdated', handleTempPathUpdated);
    };
  }, []);

    // 发起查询的条件依赖于 tempPath
    const { data, isLoading, error } = trpc.iterationdata.getTxtFilesContent.useQuery({
      tempPath: tempPath || "", // 使用 tempPath 作为路径
    }, {
      enabled: !!tempPath // 只有当 tempPath 不为空时，才启用该查询
    });
  


  // 如果数据正在加载
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 如果发生了错误
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 第一部分：显示第一个文件内容 */}
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto',overflowX:'auto'}}>
        <h3>Initial Analysis</h3>
        <pre>{files[1]?.content}</pre>
      </div>

      {/* 第二部分：显示第二个文件内容 */}
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto' ,overflowX:'auto'}} >
        <h3>Final Analysis </h3>
        <pre>{files[0]?.content}</pre>
      </div>
    </div>
  );
}

export default ResultComparation;
