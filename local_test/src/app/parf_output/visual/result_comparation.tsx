'use client'

import { useState, useEffect } from "react";
import { trpc } from '../../../trpc/react';
import styles from '../parf_output.module.css';

const ResultComparation = () => {
  const [files, setFiles] = useState<{ fileName: string, content: string }[]>([]);
  const [delayedQuery, setDelayedQuery] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // 初始化时从 localStorage 获取 selectedFileId
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selectedFile = localStorage.getItem('selectedFile');
      if (selectedFile) {
        const parsedFile = JSON.parse(selectedFile);
        setSelectedFileId(parsedFile.id.toString());
      }
    }
  }, []);

  // 监听 analysisTriggered 自定义事件
  useEffect(() => {
    const handleAnalysisTriggered = () => {
      // 重新从 localStorage 获取 selectedFileId
      if (typeof window !== 'undefined') {
        const selectedFile = localStorage.getItem('selectedFile');
        if (selectedFile) {
          const parsedFile = JSON.parse(selectedFile);
          setSelectedFileId(parsedFile.id.toString());
        }
      }

      const timeBudget = getTimeBudgetFromLocalStorage();

      if (timeBudget > 0) {
        const timer = setTimeout(() => {
          setDelayedQuery(true);
        }, (timeBudget + 5) * 1000);
        setFiles([]);

        return () => clearTimeout(timer);
      } else {
        setDelayedQuery(true);
      }
    };

    window.addEventListener('analysisTriggered', handleAnalysisTriggered);

    return () => {
      window.removeEventListener('analysisTriggered', handleAnalysisTriggered);
    };
  }, []);

  // 获取 selectedGroup 中的 timeBudget
  const getTimeBudgetFromLocalStorage = () => {
    const selectedGroup = localStorage.getItem('selectedGroup');
    if (selectedGroup) {
      const groupData = JSON.parse(selectedGroup);
      return groupData.timeBudget || 30;
    }
    return 30;
  };

  const { data, isLoading, error } = trpc.iterationdata.getTxtFilesContent.useQuery(
    {
      tempPath: selectedFileId || "", // 使用 selectedFileId
    },
    {
      enabled: !!selectedFileId && delayedQuery,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 5,
    }
  );

  useEffect(() => {
    if (data) {
      setFiles(data);
    }
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 如果任意一个内容不存在，就显示 Loading 文本 */}
      {(!files[1]?.content || !files[0]?.content) ? (
        <div
          style={{
            fontSize: '1.3rem',
            padding: '20px',
            textAlign: 'center',
            marginTop: '20vh',
            marginLeft: '5vw',
            marginRight: '5vw',
            border: '0.5px dashed gray',
            overflowY: 'hidden',
            borderRadius: '15px',
            color: 'gray',
          }}
        >
          No Analysis result
          <div style={{ fontSize: '1rem', padding: '5px', textAlign: 'center', marginTop: '5vh' }}>
            Select files to analyse.
          </div>
        </div>
      ) : (
        // 如果内容都存在，则显示主内容
        <>
          <div style={{ flex: 1, padding: '10px', overflowY: 'hidden', overflowX: 'auto' }}>
            <div className="text-3xl font-bold text-center mb-8">
              <h2 className="text-2xl font-bold text-center mb-4">Analysis Results</h2>
            </div>
            <h3>Initial Analysis</h3>
            <div className={styles.codeBlock}>
              <pre>{files[1].content}</pre>
            </div>
          </div>

          <div style={{ flex: 1, padding: '10px', overflowY: 'auto', overflowX: 'auto' }}>
            <h3>Final Analysis</h3>
            <div className={styles.codeBlock}>
              <pre>{files[0].content}</pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultComparation;