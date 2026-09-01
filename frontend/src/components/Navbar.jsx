import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, ShieldCheck, LogOut, Menu, X, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-box">
            <ShoppingBag className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Smart<span className="gradient-text">Way</span></span>
            <span className="brand-subtitle"><ShieldCheck size={12} className="security-icon" /> Official Store</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Shop</Link>
          {isAuthenticated && (
            <Link to="/orders" className="nav-link">
              <Package size={16} /> My Orders
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Cart Icon */}
          <Link to="/cart" className="cart-btn" aria-label="Shopping Cart">
            <ShoppingCart size={22} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {/* User Status / Login */}
          {isAuthenticated ? (
            <div className="user-dropdown-container">
              <Link to="/profile" className="user-profile-badge">
                <div className="avatar-circle">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-meta desktop-only">
                  <span className="user-name">{user.fullName}</span>
                  <span className="verified-chip">
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>
              </Link>
              <button onClick={handleLogout} className="btn-logout" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons desktop-only">
              <Link to="/login" className="btn-secondary">Sign In</Link>
              <Link to="/register" className="btn-primary">
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-menu-toggle mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Home</Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Shop</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="mobile-link">My Orders</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-link">My Profile</Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-link-logout">
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth-actions">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full">
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
