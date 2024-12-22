'use client'  

import { useState, useEffect } from "react";  
import { trpc } from '../../../trpc/react';  
import styles from '../parf_output.module.css'  

const ResultComparation = () => {  
  const [tempPath, setTempPath] = useState<string | null>(null);  
  const [files, setFiles] = useState<{ fileName: string, content: string }[]>([]);  
  const [delayedQuery, setDelayedQuery] = useState(false);  

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
        setDelayedQuery(false);  
      }  
    };  

    window.addEventListener('tempPathUpdated', handleTempPathUpdated);  

    return () => {  
      window.removeEventListener('tempPathUpdated', handleTempPathUpdated);  
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

  useEffect(() => {  
    if (tempPath !== null) {  
      const timeBudget = getTimeBudgetFromLocalStorage();  
      
      if (timeBudget > 0) {  
        const timer = setTimeout(() => {  
          setDelayedQuery(true);  
        }, timeBudget * 1000);  

        return () => clearTimeout(timer);  
      } else {  
        setDelayedQuery(true);  
      }  
    }  
  }, [tempPath]);  

  const { data, isLoading, error } = trpc.iterationdata.getTxtFilesContent.useQuery(  
    {  
      tempPath: tempPath || "",  
    },  
    {  
      enabled: !!tempPath && delayedQuery,  
      refetchOnWindowFocus: false,  
      refetchOnMount: false,  
      retry: false  
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
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto', overflowX: 'auto'}}>  
        <h3>Initial Analysis</h3>  
        <div  className={styles.codeBlock}>
          <pre>{files[1]?.content}</pre>  
        </div>
      </div>  

      <div style={{ flex: 1, padding: '10px', overflowY: 'auto', overflowX: 'auto'}} >  
        <h3>Final Analysis</h3>  
        <div  className={styles.codeBlock}>
          <pre>{files[0]?.content}</pre>  
        </div>
      </div>  
    </div>  
  );  
}  

export default ResultComparation;