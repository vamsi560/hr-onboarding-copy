import React from 'react';
import PropTypes from 'prop-types';
import './ProgressBar.css';

const ProgressBar = ({ value, className = '', style = {} }) => {
  return (
    <div className={`progress ${className}`} style={style}>
      <span className="progress-bar" style={{ width: `${value}%` }}></span>
    </div>
  );
};



// Auto-generated PropTypes
ProgressBar.propTypes = {
  className: PropTypes.any,
  style: PropTypes.any,
  value: PropTypes.any,
};

export default ProgressBar;

