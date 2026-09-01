import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
      <div className="empty-state-card" style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ fontSize: '5rem', fontWeight: 900, fontFamily: 'var(--font-display)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: '2rem', margin: '1rem 0 0.5rem', color: '#fff' }}>
          Oops! Page Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The page you are looking for might have been moved, removed, or is temporarily unavailable.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={18} /> Back to Home
        </Link>
      </div>
    </div>
  );
};
