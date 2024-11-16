import { useState, useEffect } from "react";
import { trpc } from '../../../trpc/react';

export const useIterationData = () => {
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [intervalId, setINTERVALId] = useState<NodeJS.Timeout | null>(null);

  // 在客户端安全地访问 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTempPath = localStorage.getItem('tempPath');
      if (storedTempPath !== tempPath) {
        setTempPath(storedTempPath); // 更新 tempPath
      }
    }
  }, [tempPath]);

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