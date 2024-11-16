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

  const factorial = (n: number): number => {
    return n <= 1 ? 1 : n * factorial(n - 1);
  };

  const x = Array.from(
    { length: allValues[currentIteration].max - allValues[currentIteration].min + 1 },
    (_, i) => allValues[currentIteration].min + i
  );

  const datasets = allValues.slice(0, currentIteration + 1).map((values, index) => {
    const y = x.map((v) => Math.exp(-values.lambda) * Math.pow(values.lambda, v) / factorial(v));
    return {
      label: `Iteration ${index} (λ=${values.lambda})`,
      data: y,
      borderColor: `rgba(75,192,192,${1 - (currentIteration - index) * 0.1})`, // 颜色逐渐变暗
      backgroundColor: `rgba(75,192,192,${0.2 - (currentIteration - index) * 0.02})`,
      borderWidth: index === currentIteration ? 2 : 1,
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
