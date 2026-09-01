import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'No Products Found',
  subtitle = 'Try adjusting your search query or filter options.',
  actionText = 'Continue Shopping',
  actionLink = '/products'
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">
        <Icon size={40} />
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>{title}</h3>
      <p style={{ maxWidth: '440px', margin: '0 auto 1.75rem', color: 'var(--text-muted)' }}>
        {subtitle}
      </p>
      {actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
};
