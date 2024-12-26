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

  const safeIteration = Math.min(Math.max(0, currentIteration), allValues.length - 1);
  const currentValue = allValues[safeIteration];
  if (!currentValue) return <div>数据无效</div>;

  // 优化阶乘计算
  const factorial = (n: number): number => {
    if (n < 0) return 0;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  // 计算有意义的最大 x 值（概率大于 0.0001 的最大值）
  const findEffectiveMaxX = (lambda: number): number => {
    let x = Math.ceil(lambda);
    while (
      Math.exp(-lambda) * Math.pow(lambda, x) / factorial(x) > 0.0001 &&
      x <= currentValue.max
    ) {
      x++;
    }
    return Math.min(x, currentValue.max);
  };

  const effectiveMaxX = Math.max(
    ...allValues.map(values => findEffectiveMaxX(values.lambda))
  );

  // 生成 x 轴数据点，使用动态步长
  const generateXPoints = (min: number, max: number): number[] => {
    const totalPoints = 50; // 想要显示的大致点数
    const step = Math.max(1, Math.floor((max - min) / totalPoints));
    const points: number[] = [];
    for (let i = min; i <= max; i += step) {
      points.push(i);
    }
    if (points[points.length - 1] !== max) {
      points.push(max);
    }
    return points;
  };

  const x = generateXPoints(currentValue.min, effectiveMaxX);

  const datasets = allValues.slice(0, safeIteration + 1).map((values, index) => {
    const y = x.map((v) => {
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
      tension: 0.4,
    };
  });

  const data = {
    labels: x,
    datasets: datasets,
  };

  const chartOptions = {
    animation: {
      duration: 0
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawOnChartArea: true,
        },
        ticks: {
          maxTicksLimit: 50, // 限制横轴显示的刻度数量
          callback: function(value: any) {
            return Number(value).toFixed(0);
          }
        }
      },
      y: {
        min: 0,
        max: Math.max(...datasets.flatMap((d) => d.data)) * 1.1,
        grid: {
          drawBorder: false,
          color: 'rgba(0,0,0,0.1)',
        },
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%', width: '100%' }}
    >
      <Line data={data} options={chartOptions} />
    </motion.div>
  );
};

export default CharPoi;