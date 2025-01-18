import { useState, useEffect, useCallback } from "react";
import { trpc } from '../../../trpc/react';

export const useIterationData = () => {
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [isQueryEnabled, setIsQueryEnabled] = useState(false);
  const [queryEndTime, setQueryEndTime] = useState<number | null>(null);
  const INITIAL_DELAY = 3000; // 3秒的初始延迟

  // 获取时间预算，设置最小值为3秒
  const getTimeBudget = useCallback(() => {
    try {
      const selectedGroup = localStorage.getItem('selectedGroup');
      if (selectedGroup) {
        const groupData = JSON.parse(selectedGroup);
        return Math.max(groupData.timeBudget || 30, 3);
      }
    } catch (error) {
      console.error('Error parsing time budget:', error);
    }
    return 30;
  }, []);

  // 处理tempPath更新
  const handleTempPathUpdate = useCallback((newPath: string | null) => {
    console.log('Handling tempPath update:', newPath);
    if (newPath) {
      setTempPath(newPath);
      // 先设置 isQueryEnabled 为 false，等待延迟后再启用
      setIsQueryEnabled(false);
      const budget = getTimeBudget();
      
      // 设置结束时间为：当前时间 + 初始延迟 + 预算时间
      const endTime = Date.now() + INITIAL_DELAY + (budget * 1000);
      setQueryEndTime(endTime);
      
      console.log(`Query will start in 3 seconds and run for ${budget} seconds until ${new Date(endTime).toISOString()}`);
      
      // 延迟启用查询
      setTimeout(() => {
        console.log('Starting delayed query');
        setIsQueryEnabled(true);
      }, INITIAL_DELAY);
    }
  }, [getTimeBudget]);

  // 初始化
  useEffect(() => {
    const storedPath = localStorage.getItem('tempPath');
    if (storedPath) {
      handleTempPathUpdate(storedPath);
    }

    const handleTempPathUpdated = () => {
      const updatedPath = localStorage.getItem('tempPath');
      handleTempPathUpdate(updatedPath);
    };

    window.addEventListener('tempPathUpdated', handleTempPathUpdated);

    return () => {
      window.removeEventListener('tempPathUpdated', handleTempPathUpdated);
    };
  }, [handleTempPathUpdate]);

  // 查询时间控制
  useEffect(() => {
    if (!queryEndTime || !isQueryEnabled) return;

    const timeRemaining = queryEndTime - Date.now();
    if (timeRemaining <= 0) {
      console.log('Query time budget expired');
      setIsQueryEnabled(false);
      setQueryEndTime(null);
      return;
    }

    const timer = setTimeout(() => {
      console.log('Query time budget expired');
      setIsQueryEnabled(false);
      setQueryEndTime(null);
    }, timeRemaining);

    return () => clearTimeout(timer);
  }, [queryEndTime, isQueryEnabled]);

  // TRPC查询
  const { data: iterationData = [], refetch } = trpc.iterationdata.getIterationData.useQuery(
    { tempPath: tempPath || "" },
    {
      enabled: Boolean(tempPath) && isQueryEnabled,
      refetchInterval: (data) => {
        if (!isQueryEnabled) return false;
        if (!queryEndTime || Date.now() >= queryEndTime) {
          setIsQueryEnabled(false);
          return false;
        }
        return 3000; // 3秒间隔
      },
      retry: 5,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  // 更新当前迭代
  useEffect(() => {
    if (iterationData.length > 0) {
      setCurrentIteration(iterationData.length - 1);
      console.log('Current iteration updated:', iterationData.length - 1);
    }
  }, [iterationData]);

  return [iterationData, currentIteration, refetch] as const;
};