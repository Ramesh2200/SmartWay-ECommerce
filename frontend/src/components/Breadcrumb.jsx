import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0', fontSize: 'var(--text-sm)' }}>
      <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Home size={15} /> Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            {isLast || !item.link ? (
              <span style={{ color: '#fff', fontWeight: 600 }}>{item.label}</span>
            ) : (
              <Link to={item.link} style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
