"use client";

import { useState, useEffect, useCallback } from 'react';

export const useTempPath = () => {
  // 初始状态设为 undefined
  const [tempPath, setTempPathState] = useState<string | undefined>(undefined);

  // 使用 useEffect 在客户端初始化
  useEffect(() => {
    const saved = localStorage.getItem('tempPath');
    if (saved) {
      setTempPathState(saved);
    }
  }, []); // 只在组件挂载时执行一次

  // 使用 useCallback 创建稳定的 setter 函数
  const setTempPath = useCallback((newPath: string | undefined) => {
    setTempPathState(newPath);
    if (newPath) {
      localStorage.setItem('tempPath', newPath);
    } else {
      localStorage.removeItem('tempPath');
    }
  }, []);

  return [tempPath, setTempPath] as const;
};