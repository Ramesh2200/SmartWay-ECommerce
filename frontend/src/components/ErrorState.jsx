import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load data from server. Please try again.',
  onRetry
}) => {
  return (
    <div className="empty-state-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
      <div className="empty-state-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
        <AlertCircle size={40} />
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>{title}</h3>
      <p style={{ maxWidth: '440px', margin: '0 auto 1.75rem', color: 'var(--text-secondary)' }}>
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
};
