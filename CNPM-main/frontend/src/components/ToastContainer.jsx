import React from 'react';
import { useToastInternal } from '../hooks/useToast';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastInternal();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle />;
      case 'error': return <FaExclamationCircle />;
      default: return <FaInfoCircle />;
    }
  };

  return (
    <div id="toastContainer" className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type} show`}>
          <div className="toast-icon">
            {getIcon(toast.type)}
          </div>
          <div className="toast-content">
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <FaExclamationCircle style={{ transform: 'rotate(45deg)' }} /> {/* Dùng tạm thành dấu X */}
          </button>
          <div className="toast-progress"></div>
        </div>
      ))}
    </div>
  );
}
