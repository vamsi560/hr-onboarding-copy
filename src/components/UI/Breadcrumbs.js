import React from 'react';
import PropTypes from 'prop-types';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <div className="breadcrumbs">
      {items.map((item, index) => (
        <React.Fragment key={'item-' + index}>
          {index > 0 && <span>/</span>}
          <span className={index === items.length - 1 ? 'current' : ''}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};



// Auto-generated PropTypes
Breadcrumbs.propTypes = {
  items: PropTypes.any,
};

export default Breadcrumbs;

