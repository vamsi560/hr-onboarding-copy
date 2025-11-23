import React from 'react';
import { useToast } from '../../context/ToastContext';
import './ToastContainer.css';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <div className="toast-content">{toast.message}</div>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            title="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

const getIcon = (type) => {
  const icons = { success: '✓', error: '×', warning: '!', info: 'i' };
  return icons[type] || icons.info;
};

export default ToastContainer;

