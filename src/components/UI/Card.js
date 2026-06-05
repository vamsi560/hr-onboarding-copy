import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};



// Auto-generated PropTypes
Card.propTypes = {
  children: PropTypes.any,
  className: PropTypes.any,
};

export default Card;

