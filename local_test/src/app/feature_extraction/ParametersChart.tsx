'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// 注册 Chart.js 所需的组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 定义固定的数值参数接口
interface Parameters {
  'widening-delay': number;
  'subdivide-non-linear': number;
  'slevel': number;
  'plevel': number;
  'partition-history': number;
  'min-loop-unroll': number;
  'ilevel': number;
  'auto-loop-unroll': number;
}

interface ParametersChartProps {
  parameters: Parameters;
}

// 通用图表配置（保持性能优化）
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0, // 禁用动画以提升性能
  },
  plugins: {
    legend: {
      display: false, // 隐藏图例
    },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      // 优化 tooltip 回调
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          return `${label}: ${value}`;
        },
      },
      // 减少 tooltip 的更新频率
    //   animation: false,
    //   backgroundColor: 'rgba(0, 0, 0, 0.7)',
    //   titleFont: { size: 12 },
    //   bodyFont: { size: 12 },
    //   padding: 6,
    },
    title: {
      display: true, // 启用标题（将在每个图表中设置）
      font: { size: 14 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Value',
        font: { size: 12 },
      },
      ticks: {
        precision: 0,
        font: { size: 10 },
      },
    },
    x: {
      display: true,
      title: {
        display: false,
        text: 'Parameter',
        font: { size: 12 },
      },
      ticks: {
        autoSkip: false,
        maxRotation: 45,
        minRotation: 45,
        font: { size: 10 },
      },
    },
  },
  hover: {
    mode: 'nearest' as const,
    intersect: true,
    animationDuration: 0,
  },
  elements: {
    bar: {
      borderWidth: 1,
    },
  },
};

// 使用 React.memo 避免不必要的重新渲染
const ParametersChart: React.FC<ParametersChartProps> = React.memo(({ parameters }) => {
  // 图表 1：前 4 个参数
  const data1 = {
    labels: ['Widening Delay', 'Subdivide Non-Linear', 'Slevel', 'Plevel'],
    datasets: [
      {
        label: 'Key Parameters',
        data: [
          parameters['widening-delay'],
          parameters['subdivide-non-linear'],
          parameters['slevel'],
          parameters['plevel'],
        ],
        backgroundColor: [
          'rgba(134, 63, 78, 0.8)', // Widening Delay
          'rgba(255, 159, 64, 0.8)', // Subdivide Non-Linear
          'rgba(54, 162, 235, 0.8)', // Slevel
          'rgba(255, 206, 86, 0.8)', // Plevel
        ],
        borderColor: [
          'rgba(134, 63, 78, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 图表 2：后 4 个参数
  const data2 = {
    labels: ['Partition History', 'Min Loop Unroll', 'Ilevel', 'Auto Loop Unroll'],
    datasets: [
      {
        label: 'Other Parameters',
        data: [
          parameters['partition-history'],
          parameters['min-loop-unroll'],
          parameters['ilevel'],
          parameters['auto-loop-unroll'],
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)', // Partition History
          'rgba(153, 102, 255, 0.8)', // Min Loop Unroll
          'rgba(199, 199, 199, 0.8)', // Ilevel
          'rgba(83, 102, 255, 0.8)', // Auto Loop Unroll
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 图表 1 的配置
  const options1 = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Key Parameters',
      },
    },
  };

  // 图表 2 的配置
  const options2 = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Other Parameters',
      },
    },
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '20px' }}>
      <div style={{ flex: 1, height: '300px' }}>
        <Bar data={data1} options={options1} />
      </div>
      <div style={{ flex: 1, height: '300px' }}>
        <Bar data={data2} options={options2} />
      </div>
    </div>
  );
});

export default ParametersChart;