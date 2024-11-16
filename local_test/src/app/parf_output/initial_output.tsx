"use client";

import React from 'react';
import styles from './parf_output.module.css';
import IterationTable from "./visual/IterationTable";

interface Initial_outputProps{
  tempPath?:string;
}
const Initial_output:React.FC <Initial_outputProps>= ({tempPath}) => {
  return (
    <div className= {styles.parfInputContainer} style = {{ minWidth:'20vw'}}>
    <div className={styles.displayMonitor }  style = {{minHeight:'45vh'}}>
    <h1 className="text-3xl font-bold text-center mb-8">参数分布迭代表</h1>
    <IterationTable tempPath = {tempPath}/>
    </div>
    </div>
  );
};

export default Initial_output;
