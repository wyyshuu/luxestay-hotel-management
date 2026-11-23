import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { removeToast } from '../store/uiSlice';

function ToastItem({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 4500);

    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--danger)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--info)' }} />;
    }
  };

  return (
    <div className={`toast toast-${toast.type} animate-fade-in`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="btn-toast-close"
        title="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useSelector((state) => state.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
