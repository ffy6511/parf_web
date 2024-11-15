import { useState } from "react";
import { trpc } from '../../../trpc/react';

export interface Parameter {
  type: "Char_Poi" | "Char_Ber" | "Char_BerVec";
  values:
    | { min: number; max: number; lambda: number }
    | number
    | number[];
}

export interface IterationData {
  [key: string]: Parameter;
}

export const useIterationData = () => {
  const [currentIteration, setCurrentIteration] = useState(0);

  const { data: iterationData = [], refetch } = trpc.iterationdata.getIterationData.useQuery(undefined, {
    onSuccess: (data) => {
      setCurrentIteration(data.length - 1); // 默认设置为最新迭代
    },
    refetchInterval: 5000, // 每5秒自动重新拉取数据
  });

  return [iterationData, currentIteration, refetch] as const;
};
