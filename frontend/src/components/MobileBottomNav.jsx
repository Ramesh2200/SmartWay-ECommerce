import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = () => {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Compass size={20} />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrap">
          <Heart size={20} />
          {totalWishlistItems > 0 && (
            <span className="bottom-nav-badge wishlist-badge">{totalWishlistItems}</span>
          )}
        </div>
        <span>Wishlist</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrap">
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span className="bottom-nav-badge cart-badge">{totalItems}</span>
          )}
        </div>
        <span>Cart</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/profile' : '/login'}
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrap">
          {isAuthenticated && user?.fullName ? (
            <div className="bottom-nav-avatar">
              {user.fullName[0].toUpperCase()}
            </div>
          ) : (
            <User size={20} />
          )}
        </div>
        <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
      </NavLink>
    </nav>
  );
};
