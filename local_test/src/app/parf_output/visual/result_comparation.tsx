'use client'

import { useState, useEffect } from "react";
import { trpc } from '../../../trpc/react';
import styles from '../parf_output.module.css'

const ResultComparation = () => {
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [files, setFiles] = useState<{ fileName: string, content: string }[]>([]);

  // 发起查询的条件依赖于 tempPath
  const { data, isLoading, error } = trpc.iterationdata.getTxtFilesContent.useQuery({
    tempPath: tempPath || "", // 使用 tempPath 作为路径
  }, {
    enabled: !!tempPath // 只有当 tempPath 不为空时，才启用该查询
  });

  // 当查询数据返回时，更新文件内容
  useEffect(() => {
    if (data) {
      setFiles(data); // 更新文件内容
    }
  }, [data]);

  // 只有在组件加载完成后获取 tempPath
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTempPath = localStorage.getItem("tempPath");
      if (storedTempPath !== tempPath) {
        setTempPath(storedTempPath); // 更新 tempPath
      }
    }
  }, [tempPath]);

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
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }} className={styles.codeBlock}>
        <h3>{files[1]?.fileName}</h3>
        <pre>{files[1]?.content}</pre>
      </div>

      {/* 第二部分：显示第二个文件内容 */}
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }} className={styles.codeBlock} >
        <h3>{files[0]?.fileName}</h3>
        <pre>{files[0]?.content}</pre>
      </div>
    </div>
  );
}

export default ResultComparation;
