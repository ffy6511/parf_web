'use client'

import { useState, useEffect } from "react";
import { trpc } from '../../../trpc/react';
import path from 'path';

const ResultComparation = ()=>{
    const [tempPath,setTempPath] = useState<string | null>(null);
    const [files, setFiles] = useState<{ fileName: string, content: string }[]>([]);

    const { data, isLoading, error } = trpc.iterationdata.getTxtFilesContent.useQuery({
        tempPath:tempPath, // 使用默认路径
      });

    useEffect(() => {
    if (data) {
        setFiles(data); // 更新文件内容
    }
    }, [data]);

    if (isLoading) {
        return <div>Loading...</div>;
      }
    
      if (error) {
        return <div>Error: {error.message}</div>;
      }


    useEffect(() => {
        if (typeof window !== 'undefined') {
          const storedTempPath = localStorage.getItem('tempPath');
          setTempPath(storedTempPath);
        }
      }, []);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* 第一部分：显示第一个文件内容 */}
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
            <h3>{files[0]?.fileName}</h3>
            <pre>{files[0]?.content}</pre>
          </div>
    
          {/* 第二部分：显示第二个文件内容 */}
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
            <h3>{files[1]?.fileName}</h3>
            <pre>{files[1]?.content}</pre>
          </div>
        </div>
      );
}

export default ResultComparation;