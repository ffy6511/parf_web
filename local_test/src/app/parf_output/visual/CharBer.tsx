"use client";  

import React from 'react';  
import { Bar } from 'react-chartjs-2';  
import { motion } from 'framer-motion';  
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';  

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);  

const chartOptions = {
  animation: {
    duration: 0 // 禁用动画
  },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
  },
  scales: {
    y: { 
      min: 0, 
      max: 1,
      ticks: {
        stepSize: 0.1
      }
    }
  }
};

interface CharBerProps {  
  allValues: number[][];  
  currentIteration: number;  
}  

const CharBer: React.FC<CharBerProps> = ({ allValues, currentIteration }) => {  
  // 基础数据验证  
  if (!allValues || !Array.isArray(allValues) || allValues.length === 0) {  
    return <div>暂无数据</div>;  
  }  

  // 确保 currentIteration 在有效范围内  
  const safeIteration = Math.min(Math.max(0, currentIteration), allValues.length - 1);  
  
  // 安全地获取当前值  
  const values = allValues[safeIteration];  
  if (!values || !Array.isArray(values) || values.length < 2) {  
    return <div>数据无效</div>;  
  }  

  const data = {  
    labels: ['True', 'False'],  
    datasets: [  
      {  
        label: `p=${values[0]?.toFixed(3) ?? 0}`,  
        data: values,  
        backgroundColor: ['rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'],  
      },  
    ],  
  };  

  return (  
    <motion.div  
      initial={{ opacity: 0 }}  
      animate={{ opacity: 1 }}  
      transition={{ duration: 0.5 }}  
      style={{ height: '100%' }}
    >  
      <Bar data={data} options={chartOptions} />  
    </motion.div>  
  );  
};  

export default CharBer;