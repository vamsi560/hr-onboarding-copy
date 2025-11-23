import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value, className = '', style = {} }) => {
  return (
    <div className={`progress ${className}`} style={style}>
      <span className="progress-bar" style={{ width: `${value}%` }}></span>
    </div>
  );
};

export default ProgressBar;

