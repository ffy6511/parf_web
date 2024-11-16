"use client";

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CharBerProps {
  allValues: number[][];
  currentIteration: number;
}

const CharBer: React.FC<CharBerProps> = ({ allValues, currentIteration }) => {
  const values = allValues[currentIteration];
  const data = {
    labels: ['True', 'False'],
    datasets: [
      {
        label: `p=${values[0]}`,
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
    >
      <Bar data={data} options={{ scales: { y: { min: 0, max: 1 } } }} />
    </motion.div>
  );
};

export default CharBer;
