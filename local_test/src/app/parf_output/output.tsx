'use client'
import React from 'react';
import Parf_analyse from './parf_analyse';
import Initial_output from './initial_output';
import Log_output from './log_output';
import styles from './parf_output.module.css';

const Output_container = () => {
  return (
    <div className={styles.parentContainer} >
      <div className={styles.topSection}>
        <div className={styles.leftColumn} >
          <Initial_output/>
        </div>
        <div className={styles.rightColumn}>
          <Parf_analyse />
        </div>
      </div>
      <div className={styles.bottomSection}>
        <Log_output />
      </div>
    </div>
  );
};

export default Output_container;
