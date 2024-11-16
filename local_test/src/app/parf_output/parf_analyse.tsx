'use client'
import React from 'react';
import styles from './parf_output.module.css';

const Parf_analyse = () => {
    return (
        <div className= {styles.parfInputContainer} style = {{ minWidth:'20vw'}}>
        <div className={styles.displayMonitor}  style = {{minHeight:'45vh'}}>
          <h3>右上显示区</h3>
          <p>数据待定...</p>
        </div>
        </div>
      );
};

export default Parf_analyse;
