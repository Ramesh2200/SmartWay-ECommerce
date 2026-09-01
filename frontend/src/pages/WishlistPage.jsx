import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';

export const WishlistPage = () => {
  const { wishlist, totalWishlistItems, clearWishlist } = useWishlist();

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumb items={[{ label: 'My Wishlist' }]} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0.5rem 0 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>My Saved Wishlist ❤️</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            <strong>{totalWishlistItems}</strong> items saved for later
          </p>
        </div>

        {totalWishlistItems > 0 && (
          <button onClick={clearWishlist} className="btn-clear-filter" style={{ color: 'var(--danger)' }}>
            Clear Wishlist
          </button>
        )}
      </div>

      {totalWishlistItems > 0 ? (
        <div className="products-grid">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          subtitle="Explore our product catalog and click the heart icon to save your favorite products."
          actionText="Explore Products"
          actionLink="/products"
        />
      )}
    </div>
  );
};
