"use client";

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CharBerVecProps {
  allValues: number[][];
  currentIteration: number;
}

const CharBerVec: React.FC<CharBerVecProps> = ({ allValues, currentIteration }) => {
  const values = allValues[currentIteration];
  const labels = values.map((_, i) => `p${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: 'Joint Bernoulli',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
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

export default CharBerVec;
