'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 引入数据标签插件
import { useTheme } from '~/context/ThemeContext';
import styles from './featureChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels); // 注册插件

// 创建图表配置函数，根据主题返回不同配置
const createChartOptions = (isDarkMode: boolean) => {
  const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    hover: {
      mode: 'nearest' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // 隐藏图例
        position: 'top' as const,
        labels: {
          color: textColor
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        animation: {
          duration: 0
        },
        backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
        borderColor: isDarkMode ? 'rgba(80, 80, 80, 0.5)' : 'rgba(200, 200, 200, 0.5)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
        },
      },
      title: {
        display: true,
        font: {
          size: 14,
          weight: 'bold' as const
        },
        color: textColor,
        padding: {
          top: 10,
          bottom: 10
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          font: {
            size: 11
          },
          padding: 5
        },
        grid: {
          color: gridColor,
          drawBorder: false
        }
      },
      x: {
        display: true,
        ticks: {
          color: textColor,
          font: {
            size: 11
          },
          padding: 5
        },
        grid: {
          display: false,
          drawBorder: false
        }
      },
    },
  };
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
  parameters?: any; // 添加可选的parameters属性
}

const FeatureChart: React.FC<FeatureChartProps> = React.memo(({ features }) => {
  // 获取当前主题
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // 获取图表配置
  const chartOptions = createChartOptions(isDarkMode);

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
    labels: ['Functions', 'Nesting', 'Conditionals', 'Variables', 'Cyclomatic', 'Memory Op.'],
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
        ...chartOptions.plugins.title,
        text: 'Key Code Metrics',
      },
    },
  };

  const options2 = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: 'Other Code Metrics',
      },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <Bar data={data1} options={options1} />
      </div>
      <div className={styles.wideChartWrapper}>
        <Bar data={data2} options={options2} />
      </div>
    </div>
  );
});

export default FeatureChart;