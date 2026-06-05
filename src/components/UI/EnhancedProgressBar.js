import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './EnhancedProgressBar.css';

const EnhancedProgressBar = ({ 
  progress = 0, 
  showMilestones = true, 
  animated = true,
  size = 'medium',
  showPercentage = true,
  milestones = [25, 50, 75, 100]
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  const getMilestoneStatus = (milestone) => {
    if (animatedProgress >= milestone) return 'completed';
    if (animatedProgress >= milestone - 10) return 'active';
    return 'pending';
  };

  return (
    <div className={`enhanced-progress-container ${size}`}>
      <div className="progress-track">
        <div 
          className="progress-fill"
          style={{ width: `${animatedProgress}%` }}
        >
          <div className="progress-shine"></div>
        </div>
        
        {showMilestones && milestones.map((milestone, index) => (
          <div
            key={milestone}
            className={`milestone ${getMilestoneStatus(milestone)}`}
            style={{ left: `${milestone}%` }}
          >
            <div className="milestone-dot">
              {animatedProgress >= milestone && <span className="milestone-check">✓</span>}
            </div>
            <div className="milestone-label">{milestone}%</div>
          </div>
        ))}
      </div>
      
      {showPercentage && (
        <div className="progress-percentage">
          {Math.round(animatedProgress)}%
        </div>
      )}
    </div>
  );
};



// Auto-generated PropTypes
EnhancedProgressBar.propTypes = {
  animated: PropTypes.any,
  milestones: PropTypes.any,
  progress: PropTypes.any,
  showMilestones: PropTypes.any,
  showPercentage: PropTypes.any,
  size: PropTypes.any,
};

export default EnhancedProgressBar;