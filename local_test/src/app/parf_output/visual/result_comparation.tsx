'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from '../../../trpc/react';
import styles from '../parf_output.module.css';

const ResultComparation = () => {
  const [files, setFiles] = useState<{ fileName: string, content: string }[]>([]);
  const [delayedQuery, setDelayedQuery] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  // 添加一个请求标识符，用于强制触发新的请求
  const [requestId, setRequestId] = useState(0);
  // 使用 ref 来跟踪定时器
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取 selectedGroup 中的 timeBudget
  const getTimeBudgetFromLocalStorage = useCallback(() => {
    try {
      const selectedGroup = localStorage.getItem('selectedGroup');
      if (selectedGroup) {
        const groupData = JSON.parse(selectedGroup);
        return groupData.timeBudget || 30;
      }
    } catch (error) {
      console.error('Error parsing selectedGroup:', error);
    }
    return 30;
  }, []);

  // 从 localStorage 获取 selectedFileId
  const getSelectedFileIdFromLocalStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const selectedFile = localStorage.getItem('selectedFile');
        if (selectedFile) {
          const parsedFile = JSON.parse(selectedFile);
          return parsedFile.id.toString();
        }
      }
    } catch (error) {
      console.error('Error parsing selectedFile:', error);
    }
    return null;
  }, []);

  // 处理 analysisTriggered 事件的回调函数
  const handleAnalysisTriggered = useCallback(() => {
    console.log('Analysis triggered event received in ResultComparation');
    
    // 清除之前的定时器（如果有）
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // 重新从 localStorage 获取 selectedFileId
    const fileId = getSelectedFileIdFromLocalStorage();
    if (fileId) {
      console.log('Setting selectedFileId to:', fileId);
      setSelectedFileId(fileId);
    } else {
      console.warn('No fileId found in localStorage');
    }

    // 重置状态
    setFiles([]);
    setDelayedQuery(false);
    
    const timeBudget = getTimeBudgetFromLocalStorage();
    console.log(`Time budget: ${timeBudget} seconds`);

    if (timeBudget > 0) {
      console.log(`Setting delayed query timer for ${timeBudget + 5} seconds`);
      
      // 存储定时器引用
      timerRef.current = setTimeout(() => {
        console.log('Timer expired, setting delayedQuery to true');
        setDelayedQuery(true);
        // 增加请求标识符，强制触发新的请求
        setRequestId(prev => prev + 1);
      }, (timeBudget + 5) * 1000);
    } else {
      console.log('No time budget, setting delayedQuery to true immediately');
      setDelayedQuery(true);
      // 增加请求标识符，强制触发新的请求
      setRequestId(prev => prev + 1);
    }
  }, [getSelectedFileIdFromLocalStorage, getTimeBudgetFromLocalStorage]);

  // 初始化时从 localStorage 获取 selectedFileId
  useEffect(() => {
    console.log('Component mounted, initializing selectedFileId');
    const fileId = getSelectedFileIdFromLocalStorage();
    if (fileId) {
      console.log('Initial selectedFileId set to:', fileId);
      setSelectedFileId(fileId);
    }
    
    // 组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [getSelectedFileIdFromLocalStorage]);

  // 监听 analysisTriggered 自定义事件
  useEffect(() => {
    console.log('Setting up event listener for analysisTriggered');
    
    // 使用一个包装函数来确保我们调用的是最新的 handleAnalysisTriggered
    const eventHandler = () => {
      console.log('analysisTriggered event caught');
      handleAnalysisTriggered();
    };

    window.addEventListener('analysisTriggered', eventHandler);

    // 返回清理函数
    return () => {
      console.log('Removing event listener for analysisTriggered');
      window.removeEventListener('analysisTriggered', eventHandler);
    };
  }, [handleAnalysisTriggered]);

  // 监听 selectedFileId、delayedQuery 和 requestId 变化，用于调试
  useEffect(() => {
    console.log('State updated - selectedFileId:', selectedFileId, 'delayedQuery:', delayedQuery, 'requestId:', requestId);
  }, [selectedFileId, delayedQuery, requestId]);

  // TRPC 查询
  const { data, isLoading, error } = trpc.iterationdata.getTxtFilesContent.useQuery(
    {
      tempPath: selectedFileId || "", // 使用 selectedFileId
    },
    {
      enabled: !!selectedFileId && delayedQuery,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 5,
      // 使用 requestId 作为 queryKey 的一部分，确保每次触发都是新的查询
      queryKey: ['iterationdata.getTxtFilesContent', { tempPath: selectedFileId || "" }, requestId],
      onSuccess: (data) => {
        console.log('Query successful, received data:', data?.length || 0, 'files');
      },
      onError: (error) => {
        console.error('Query error:', error.message);
      }
    }
  );

  // 更新 files 状态
  useEffect(() => {
    if (data) {
      console.log('Updating files state with new data');
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