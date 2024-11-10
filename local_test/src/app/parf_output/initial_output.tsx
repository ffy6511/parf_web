import React from 'react';
import styles from './parf_output.module.css';

const Initial_output = () => {
  return (
    <div className= {styles.parfInputContainer} style = {{ minWidth:'20vw'}}>
    <div className={styles.displayMonitor }  style = {{minHeight:'45vh'}}>
      <h3>左上显示区</h3>
      <p>数据待定...</p>
    </div>
    </div>
  );
};

export default Initial_output;
