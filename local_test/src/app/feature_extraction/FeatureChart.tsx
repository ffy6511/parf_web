'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 引入数据标签插件

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels); // 注册插件

// 通用图表配置
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // 隐藏图例
      position: 'top',
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          return `${label}: ${value}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
    x: {
      display: true, 
    },
  },
};

interface FeatureChartProps {
  features: {
    loc: number;
    num_functions: number;
    nesting_depth: number;
    num_conditional_statements: number;
    num_variables: number;
    function_call_count: number;
    cyclomatic_complexity: number;
    memory_operations: number;
  };
}

const FeatureChart: React.FC<FeatureChartProps> = React.memo(({ features }) => {
  // 图表 1：loc 和 function_call_count
  const data1 = {
    labels: ['Lines of Code', 'Function Calls'],
    datasets: [
      {
        label: 'Key Metrics',
        data: [features.loc, features.function_call_count],
        backgroundColor: ['rgba(134, 63, 78, 0.8)', 'rgba(255, 159, 64, 0.8)'],
      },
    ],
  };

  // 图表 2：其余字段
  const data2 = {
    labels: ['Functions', 'Nesting Depth', 'Conditionals', 'Variables', 'Cyclomatic Complexity', 'Memory Operations'],
    datasets: [
      {
        label: 'Other Metrics',
        data: [
          features.num_functions,
          features.nesting_depth,
          features.num_conditional_statements,
          features.num_variables,
          features.cyclomatic_complexity,
          features.memory_operations,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
        ],
      },
    ],
  };

  const options1 = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Key Code Metrics',
      },
    },
  };

  const options2 = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Other Code Metrics',
      },
    },
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '20px' }}>
      <div style={{ flex: 1, height: '300px' }}>
        <Bar data={data1} options={options1} />
      </div>
      <div style={{ flex: 4, height: '300px' }}>
        <Bar data={data2} options={options2} />
      </div>
    </div>
  );
});

export default FeatureChart;