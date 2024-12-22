"use client";  

import React from "react";  
import { Line } from "react-chartjs-2";  
import { motion } from "framer-motion";  
import {  
  Chart as ChartJS,  
  CategoryScale,  
  LinearScale,  
  LineElement,  
  Title,  
  Tooltip,  
  Legend,  
  PointElement,  
} from "chart.js";  

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);  

interface CharPoiProps {  
  allValues: { min: number; max: number; lambda: number }[];  
  currentIteration: number;  
}  

const CharPoi: React.FC<CharPoiProps> = ({ allValues, currentIteration }) => {  
  if (!allValues || allValues.length === 0) return <div>暂无数据</div>;  

  // 确保 currentIteration 在有效范围内  
  const safeIteration = Math.min(Math.max(0, currentIteration), allValues.length - 1);  

  // 优化阶乘计算，避免栈溢出  
  const factorial = (n: number): number => {  
    if (n < 0) return 0;  
    let result = 1;  
    for (let i = 2; i <= n; i++) {  
      result *= i;  
    }  
    return result;  
  };  

  // 安全地访问数组  
  const currentValue = allValues[safeIteration];  
  if (!currentValue) return <div>数据无效</div>;  

  const x = Array.from(  
    { length: currentValue.max - currentValue.min + 1 },  
    (_, i) => currentValue.min + i  
  );  

  const datasets = allValues.slice(0, safeIteration + 1).map((values, index) => {  
    const y = x.map((v) => {  
      // 添加数值检查  
      if (v < 0 || !Number.isFinite(values.lambda)) return 0;  
      return Math.exp(-values.lambda) * Math.pow(values.lambda, v) / factorial(v);  
    });  

    return {  
      label: `Iteration ${index} (λ=${values.lambda})`,  
      data: y,  
      borderColor: `rgba(75,192,192,${1 - (safeIteration - index) * 0.1})`,  
      backgroundColor: `rgba(75,192,192,${0.2 - (safeIteration - index) * 0.02})`,  
      borderWidth: index === safeIteration ? 2 : 1,  
      fill: true,  
    };  
  });  

  const data = {  
    labels: x,  
    datasets: datasets,  
  };  

  return (  
    <motion.div  
      initial={{ opacity: 0 }}  
      animate={{ opacity: 1 }}  
      transition={{ duration: 0.5 }}  
    >  
      <Line  
        data={data}  
        options={{  
          scales: {  
            y: { min: 0, max: Math.max(...datasets.flatMap((d) => d.data)) * 1.1 },  
          },  
        }}  
      />  
    </motion.div>  
  );  
};  

export default CharPoi;