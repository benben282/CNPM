import React, { useState, useCallback } from 'react';
// Nhưng để nhanh ta dùng pattern observer đơn giản
let toastListener = null;

export const useToast = () => {
  const showToast = useCallback((title, message, type = 'success') => {
    if (toastListener) {
      toastListener({ id: Date.now(), title, message, type });
    }
  }, []);

  return showToast;
};

// Hook nội bộ cho ToastContainer
export const useToastInternal = () => {
  const [toasts, setToasts] = useState([]);

  useCallback(() => {
    toastListener = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };
  }, []);

  React.useEffect(() => {
    toastListener = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };
    return () => { toastListener = null; };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, removeToast };
};
