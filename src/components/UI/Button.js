import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};



// Auto-generated PropTypes
Button.propTypes = {
  children: PropTypes.any,
  className: PropTypes.any,
  disabled: PropTypes.any,
  onClick: PropTypes.any,
  type: PropTypes.any,
  variant: PropTypes.any,
};

export default Button;

