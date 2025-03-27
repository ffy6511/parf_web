'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Collapse, Descriptions } from 'antd';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 注册 Chart.js 所需的组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const { Panel } = Collapse;

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

// 通用图表配置
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  hover: {
    mode: 'nearest',
    intersect: false,
    animationDuration: 0
  },
  events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      animation: false,
      position: 'nearest',
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
      color: '#666',
      font: { size: 12 },
      formatter: (value: number) => value
    },
    title: {
      display: true,
      font: { size: 14 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        maxTicksLimit: 5,
        precision: 0
      }
    },
    x: {
      display: true,
      grid: {
        display: false
      }
    },
  },
  devicePixelRatio: 1,
};

// 使用 React.memo 避免不必要的重新渲染
const ParametersChart: React.FC<ParametersChartProps> = React.memo(({ numbers, strings }) => {
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
    <div style={{ marginTop: '20px' }}>
      {/* 数值参数部分 */}
      {Object.keys(numbers).length > 0 && (
        <Collapse defaultActiveKey={['numeric']} expandIconPosition="right">
          <Panel header="Numeric Parameters" key="numeric">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '20px' }}>
              <div style={{ flex: 1, height: '300px' }}>
                <Bar data={data1} options={options1} />
              </div>
              <div style={{ flex: 1, height: '300px' }}>
                <Bar data={data2} options={options2} />
              </div>
            </div>
          </Panel>
        </Collapse>
      )}

      {/* 字符串参数部分 */}
      {strings.length > 0 && (
        <Collapse defaultActiveKey={['string']} expandIconPosition="right" style={{ marginTop: '20px' }}>
          <Panel header="String Parameters" key="string">
            <Descriptions bordered column={1}>
              {strings.map(({ key, values }) => (
                <Descriptions.Item label={key} key={key}>
                  {values.length === 0 ? (
                    <span style={{ color: '#999' }}> ✅</span>
                  ) : values.length === 1 ? (
                    <span>{values[0]}</span>
                  ) : (
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {values.map((val, index) => (
                        <li key={index}>{val}</li>
                      ))}
                    </ul>
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Panel>
        </Collapse>
      )}
    </div>
  );
});

export default ParametersChart;