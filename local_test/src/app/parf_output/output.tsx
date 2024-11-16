import React, { useState } from 'react';
import Parf_analyse from './parf_analyse';
import Initial_output from './initial_output';
import Log_output from './log_output';
import styles from './parf_output.module.css';


const Output_container = () => {

  const [tempPath, setTempPath] = useState<string | undefined>(undefined);
  return (
    <div className={styles.parentContainer} >
      <div className={styles.topSection}>
        <div className={styles.leftColumn}>
          <Initial_output tempPath = {tempPath}/>
        </div>
        <div className={styles.rightColumn}>
          <Parf_analyse />
        </div>
      </div>
      <div className={styles.bottomSection}>
        <Log_output setTempPath={setTempPath}/>
      </div>
    </div>
  );
};

export default Output_container;
