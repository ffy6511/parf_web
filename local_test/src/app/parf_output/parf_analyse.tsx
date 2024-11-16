'use client'
import React from 'react';
import styles from './parf_output.module.css';
import ResultComparation from './visual/result_comparation'


const Parf_analyse = () => {
  return (
    <div className={styles.parfInputContainer} style={{ maxWidth: '30vw' }}>
      {/* <div className={styles.displayMonitor}  style = {{maxHeight:'80vh',overflow:'auto'}}> */}
      <div className={styles.displayMonitor} >
        <div className="text-3xl font-bold text-center mb-8">
        <h2 className="text-2xl font-bold text-center mb-4">Analysis Results</h2>
        </div>
        <ResultComparation />
      </div>
    </div>
  );
};

export default Parf_analyse;
