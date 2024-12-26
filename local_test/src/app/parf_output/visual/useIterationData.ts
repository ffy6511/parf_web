import { useState, useEffect } from "react";  
import { trpc } from '../../../trpc/react';  

export const useIterationData = () => {  
  const [tempPath, setTempPath] = useState<string | null>(null);  
  const [currentIteration, setCurrentIteration] = useState(0);  
  const [isQueryEnabled, setIsQueryEnabled] = useState(false);  

  // 从 localStorage 获取时间预算  
  const getTimeBudgetFromLocalStorage = () => {  
    const selectedGroup = localStorage.getItem('selectedGroup');  
    if (selectedGroup) {  
      const groupData = JSON.parse(selectedGroup);  
      return Math.max(groupData.timeBudget || 30, 3);  
    }  
    return 30;  
  };  

  // 初始化和监听 tempPath 变化  
  useEffect(() => {  
    // 立即获取初始值  
    const storedTempPath = localStorage.getItem('tempPath');  
    console.log('初始 tempPath:', storedTempPath);  
    if (storedTempPath) {  
      setTempPath(storedTempPath);  
    }  

    // 设置事件监听器  
    const handleTempPathUpdated = () => {  
      const updatedPath = localStorage.getItem('tempPath');  
      console.log('tempPath 更新为:', updatedPath);  
      if (updatedPath) {  
        setTempPath(updatedPath);  
        setIsQueryEnabled(false); // 重置查询状态  
      }  
    };  

    // 监听自定义事件  
    window.addEventListener('tempPathUpdated', handleTempPathUpdated);  
    // 同时监听 storage 事件，以捕获其他标签页的更改  
    window.addEventListener('storage', (e) => {  
      if (e.key === 'tempPath') {  
        console.log('storage event tempPath 更新为:', e.newValue);  
        if (e.newValue) {  
          setTempPath(e.newValue);  
          setIsQueryEnabled(false);  
        }  
      }  
    });  

    return () => {  
      window.removeEventListener('tempPathUpdated', handleTempPathUpdated);  
      window.removeEventListener('storage', handleTempPathUpdated);  
    };  
  }, []); // 空依赖数组，只在组件挂载时运行一次  

  // 处理查询启用和时间限制  
  useEffect(() => {  
    if (tempPath) {  
      console.log('启动查询流程, tempPath:', tempPath);  
      const timeBudget = getTimeBudgetFromLocalStorage();  
      console.log('时间预算:', timeBudget, '秒');  

      // 立即启用查询  
      setIsQueryEnabled(true);  

      // 设置定时器在时间预算到期后停止查询  
      const timer = setTimeout(() => {  
        console.log('查询时间到期');  
        setIsQueryEnabled(false);  
      }, timeBudget * 1000);  

      return () => {  
        clearTimeout(timer);  
        setIsQueryEnabled(false);  
      };  
    }  
  }, [tempPath]);  

  // 使用 trpc 查询  
  const { data: iterationData = [], refetch } = trpc.iterationdata.getIterationData.useQuery(  
    { tempPath: tempPath || "" },  
    {  
      enabled: Boolean(tempPath) && isQueryEnabled,  
      refetchInterval: (data) => {  
        return isQueryEnabled ? 5000 : false;  
      },  
      retry: 1,  
      refetchOnWindowFocus: false,  
      refetchOnMount: true,  
    }  
  );  

  // 更新当前迭代  
  useEffect(() => {  
    if (iterationData.length > 0) {  
      setCurrentIteration(iterationData.length - 1);  
      console.log('更新当前迭代为:', iterationData.length - 1);  
    }  
  }, [iterationData]);  

  // 导出数据和状态  
  return [iterationData, currentIteration, refetch] as const;  
};