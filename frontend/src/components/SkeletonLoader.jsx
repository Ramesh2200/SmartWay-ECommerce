import React from 'react';

export const ProductSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
};

export const DetailsSkeleton = () => {
  return (
    <div className="product-details-grid container" style={{ padding: '2rem 0' }}>
      <div className="skeleton-card" style={{ height: '480px' }}>
        <div className="skeleton-shimmer" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="skeleton-card" style={{ height: '60px' }}><div className="skeleton-shimmer" /></div>
        <div className="skeleton-card" style={{ height: '40px', width: '60%' }}><div className="skeleton-shimmer" /></div>
        <div className="skeleton-card" style={{ height: '120px' }}><div className="skeleton-shimmer" /></div>
        <div className="skeleton-card" style={{ height: '54px', width: '50%' }}><div className="skeleton-shimmer" /></div>
      </div>
    </div>
  );
};
