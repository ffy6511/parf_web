'use client'
import React from 'react';
import styles from './parf_output.module.css';
import ResultComparation  from './visual/result_comparation'


const Parf_analyse = () => {
    return (
        <div className= {styles.parfInputContainer} style = {{ minWidth:'20vw'}}>
        <div className={styles.displayMonitor}  style = {{maxHeight:'45vh'}}>
          <h3>右上显示区</h3>
          <ResultComparation/>
        </div>
        </div>
      );
};

export default Parf_analyse;
