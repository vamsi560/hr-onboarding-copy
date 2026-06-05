import React, { useState, useRef, useEffect } from 'react';
import './ContextualHelp.css';

const ContextualHelp = ({ 
  content, 
  title,
  position = 'top',
  trigger = 'hover',
  showIcon = true,
  type = 'info',
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Auto-adjust position if tooltip goes off-screen
      if (rect.top - tooltipRect.height < 10) {
        setTooltipPosition('bottom');
      } else if (rect.bottom + tooltipRect.height > window.innerHeight - 10) {
        setTooltipPosition('top');
      }
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') setIsVisible(false);
  };

  const handleClick = () => {
    if (trigger === 'click') setIsVisible(!isVisible);
  };

  const getIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'tip': return '💡';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="contextual-help-container">
      <div
        ref={triggerRef}
        className={`help-trigger ${trigger}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children || (showIcon && <span className="help-icon">{getIcon()}</span>)}
      </div>
      
      {isVisible && (
        <>
          <div className="help-overlay" onClick={() => setIsVisible(false)} />
          <div
            ref={tooltipRef}
            className={`help-tooltip ${tooltipPosition} ${type}`}
          >
            {title && <div className="tooltip-title">{title}</div>}
            <div className="tooltip-content">{content}</div>
            <div className={`tooltip-arrow ${tooltipPosition}`}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContextualHelp;