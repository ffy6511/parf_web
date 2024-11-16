"use client";

import React from 'react';
import styles from './parf_output.module.css';
import IterationTable from "./visual/IterationTable";

const Initial_output = () => {
  return (
    <div className= {styles.parfInputContainer} style = {{ minWidth:'20vw'}}>
    {/* <div className={styles.displayMonitor }  style = {{maxHeight:'80vh',overflow:'auto'}}> */}
    <div className={styles.displayMonitor }>
    <IterationTable />
    </div>
    </div>
  );
};

export default Initial_output;
