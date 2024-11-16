"use client";

import React from 'react';
import styles from './parf_output.module.css';
import IterationTable from "./visual/IterationTable";

const Initial_output = () => {
  return (
    <div className= {styles.parfInputContainer} style = {{ minWidth:'20vw'}}>
    {/* <div className={styles.displayMonitor }  style = {{maxHeight:'80vh',overflow:'auto'}}> */}
    <div className={styles.displayMonitor }>
    <h1 className="text-3xl font-bold text-center mb-8">参数分布迭代表</h1>
    <IterationTable />
    </div>
    </div>
  );
};

export default Initial_output;
