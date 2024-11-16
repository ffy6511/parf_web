import { useState, useEffect } from "react";
import { trpc } from '../../../trpc/react';

export const useIterationData = () => {
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [intervalId, setINTERVALId] = useState<NodeJS.Timeout | null>(null);

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
        setTempPath(updatedPath); // 更新 tempPath
      }
    };

    window.addEventListener('tempPathUpdated', handleTempPathUpdated);

    return () => {
      window.removeEventListener('tempPathUpdated', handleTempPathUpdated);
    };
  }, []);
  

  const { data: iterationData = [], refetch } = trpc.iterationdata.getIterationData.useQuery(
    { tempPath },
    {
      enabled: tempPath !== null, // 只有当 tempPath 加载完成后才发起请求
    }
  );

  useEffect(() => {
    if (iterationData.length > 0) {
      setCurrentIteration(iterationData.length - 1); // 当数据加载成功时更新当前迭代
    }
  }, [iterationData]); // 监听 iterationData 的变化

  // 设置定时器，每隔一段时间检查新文件
  useEffect(() => {
    const fetchInterval = 5000; // 检查间隔时间，单位为毫秒
    const interval = setInterval(() => {
      refetch(); // 触发重新获取数据
    }, fetchInterval);

    // 清除定时器
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [refetch]); // 依赖项包括 refetch

  return [iterationData, currentIteration, refetch] as const;
};