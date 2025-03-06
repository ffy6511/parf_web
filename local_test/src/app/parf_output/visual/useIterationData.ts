import { useState, useEffect, useCallback } from "react";
import { trpc } from '../../../trpc/react';

export const useIterationData = () => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
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

  // 处理analysisTriggered事件
  const handleAnalysisTriggered = useCallback(() => {
    console.log('Analysis triggered, starting iteration data query');

    // 重新从 localStorage 获取 selectedFileId
    if (typeof window !== 'undefined') {
      const selectedFile = localStorage.getItem('selectedFile');
      if (selectedFile) {
        const parsedFile = JSON.parse(selectedFile);
        setSelectedFileId(parsedFile.id.toString());
      }
    }

    if (selectedFileId) {
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
  }, [getTimeBudget, selectedFileId]);

  // 初始化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selectedFile = localStorage.getItem('selectedFile');
      if (selectedFile) {
        const parsedFile = JSON.parse(selectedFile);
        setSelectedFileId(parsedFile.id.toString());
      }
    }

    const handleTrigger = () => {
      handleAnalysisTriggered();
    };

    window.addEventListener('analysisTriggered', handleTrigger);

    return () => {
      window.removeEventListener('analysisTriggered', handleTrigger);
    };
  }, [handleAnalysisTriggered]);

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
    { tempPath: selectedFileId || "" },
    {
      enabled: Boolean(selectedFileId) && isQueryEnabled,
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
