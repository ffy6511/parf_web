'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Descriptions, Typography } from 'antd';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme } from '~/context/ThemeContext';
import styles from './parametersChart.module.css';

// 注册 Chart.js 所需的组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const { Title: AntTitle } = Typography;

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

interface StringParameter {
  key: string;
  values: string[];
}

interface ParametersChartProps {
  numbers: Parameters;
  strings: StringParameter[];
}

// 全局设置Chart.js默认配置
ChartJS.defaults.plugins.tooltip.enabled = true;
ChartJS.defaults.plugins.tooltip.mode = 'index';
ChartJS.defaults.plugins.tooltip.intersect = false;
ChartJS.defaults.plugins.tooltip.position = 'nearest';
ChartJS.defaults.plugins.tooltip.displayColors = true;
ChartJS.defaults.plugins.tooltip.caretPadding = 0;
ChartJS.defaults.plugins.tooltip.caretSize = 0;
ChartJS.defaults.plugins.tooltip.titleMarginBottom = 6;
ChartJS.defaults.plugins.tooltip.bodySpacing = 4;
ChartJS.defaults.plugins.tooltip.padding = 8;
ChartJS.defaults.plugins.tooltip.cornerRadius = 4;
ChartJS.defaults.animation = false;

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
      animationDuration: 0
    },

    plugins: {
      legend: {
        display: false,
        labels: {
          color: textColor,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        animation: {
          duration: 0
        },
        position: 'nearest' as const,
        displayColors: true,
        caretPadding: 0,
        caretSize: 0,
        backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
        borderColor: isDarkMode ? 'rgba(80, 80, 80, 0.5)' : 'rgba(200, 200, 200, 0.5)',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 4,
        titleMarginBottom: 6,
        bodySpacing: 4,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
        },
      },
      datalabels: {
        display: false,
        color: isDarkMode ? '#aaa' : '#666',
        font: { size: 12 },
        formatter: (value: number) => value
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
          maxTicksLimit: 5,
          precision: 0,
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
    // 移除devicePixelRatio限制，允许高分辨率渲染
  };
};

// 使用 React.memo 避免不必要的重新渲染
const ParametersChart: React.FC<ParametersChartProps> = React.memo(({ numbers, strings }) => {
  // 获取当前主题
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // 获取图表配置
  const chartOptions = createChartOptions(isDarkMode);

  // 图表 1：前 4 个参数
  const data1 = {
    labels: ['WD', 'Non-Linear', 'Slevel', 'Plevel'],
    datasets: [
      {
        label: 'Key Parameters',
        data: [
          numbers['widening-delay'] || 0,
          numbers['subdivide-non-linear'] || 0,
          numbers['slevel'] || 0,
          numbers['plevel'] || 0,
        ],
        backgroundColor: [
          'rgba(134, 63, 78, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(134, 63, 78, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
      },
    ],
  };

  // 图表 2：后 4 个参数
  const data2 = {
    labels: ['Partition', 'Min Loop Unroll', 'Ilevel', 'Auto Loop Unroll'],
    datasets: [
      {
        label: 'Other Parameters',
        data: [
          numbers['partition-history'] || 0,
          numbers['min-loop-unroll'] || 0,
          numbers['ilevel'] || 0,
          numbers['auto-loop-unroll'] || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
        ],
      },
    ],
  };

  // 图表 1 的配置
  const options1 = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
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
        ...chartOptions.plugins.title,
        text: 'Other Parameters',
      },
    },
  };

  return (
    <div className={styles.container}>
      {/* 数值参数部分 */}
      {Object.keys(numbers).length > 0 && (
        <div>
          <AntTitle level={5} className={styles.sectionTitle}>Numeric Parameters</AntTitle>
          <div className={styles.chartsContainer}>
            <div className={styles.chartWrapper}>
              <Bar data={data1} options={options1} />
            </div>
            <div className={styles.chartWrapper}>
              <Bar data={data2} options={options2} />
            </div>
          </div>
        </div>
      )}

      {/* 字符串参数部分 */}
      {strings.length > 0 && (
        <div className={`${styles.stringParamsContainer} ${styles.descriptionsWrapper}`}>
          <AntTitle level={5} className={styles.sectionTitle}>String Parameters</AntTitle>
          <Descriptions
            bordered
            column={1}
            className={theme === 'dark' ? styles.darkDescriptions : ''}
          >
            {strings.map(({ key, values }) => (
              <Descriptions.Item
                label={key}
                key={key}
                className={theme === 'dark' ? styles.darkItem : ''}
              >
                {values.length === 0 ? (
                  <span className={styles.checkIcon}> ✅</span>
                ) : values.length === 1 ? (
                  <span className={theme === 'dark' ? styles.darkText : ''}>
                    {values[0]}
                  </span>
                ) : (
                  <ul className={styles.valuesList}>
                    {values.map((val, index) => (
                      <li key={index} className={theme === 'dark' ? styles.darkText : ''}>
                        {val}
                      </li>
                    ))}
                  </ul>
                )}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      )}
    </div>
  );
});

export default ParametersChart;