import React from 'react';
import './Input.css';

const Input = ({ className = '', error, ...props }) => {
  return (
    <input
      className={`input ${error ? 'error' : ''} ${className}`}
      {...props}
    />
  );
};

export default Input;

