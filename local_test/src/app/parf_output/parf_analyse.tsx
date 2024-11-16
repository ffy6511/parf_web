'use client'
import React from 'react';
import styles from './parf_output.module.css';
import ResultComparation  from './visual/result_comparation'


const Parf_analyse = () => {
    return (
        <div className= {styles.parfInputContainer} style = {{ maxWidth:'30vw'}}>
        {/* <div className={styles.displayMonitor}  style = {{maxHeight:'80vh',overflow:'auto'}}> */}
        <div className={styles.displayMonitor}>
          <h3>右上显示区</h3>
          <ResultComparation/>
        </div>
        </div>
      );
};

export default Parf_analyse;
