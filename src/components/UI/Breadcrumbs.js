import React from 'react';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <div className="breadcrumbs">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          <span className={index === items.length - 1 ? 'current' : ''}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;

