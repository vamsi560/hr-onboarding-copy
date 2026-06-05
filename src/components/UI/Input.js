import React from 'react';
import PropTypes from 'prop-types';
import './Input.css';

const Input = ({ className = '', error, ...props }) => {
  return (
    <input
      className={`input ${error ? 'error' : ''} ${className}`}
      {...props}
    />
  );
};



// Auto-generated PropTypes
Input.propTypes = {
  className: PropTypes.any,
  error: PropTypes.any,
};

export default Input;

