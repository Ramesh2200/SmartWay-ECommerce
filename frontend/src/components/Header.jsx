import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Search,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Package,
  Sparkles,
  Zap,
  ArrowRight,
  ChevronDown,
  Tag,
  Layers,
  PhoneCall,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS_DATA } from '../data/productsData';
import { CATEGORIES_DATA } from '../data/categoriesData';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdowns when navigating to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setSuggestionsOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search suggestions
  const suggestions = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || q.length < 2) return { products: [], brands: [], categories: [] };

    const matchedProducts = PRODUCTS_DATA.filter((p) =>
      p.name.toLowerCase().includes(q)
    ).slice(0, 4);

    const allBrands = Array.from(new Set(PRODUCTS_DATA.map((p) => p.brand).filter(Boolean)));
    const matchedBrands = allBrands.filter((b) => b.toLowerCase().includes(q)).slice(0, 3);

    const matchedCategories = CATEGORIES_DATA.filter((c) =>
      c.name.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      products: matchedProducts,
      brands: matchedBrands,
      categories: matchedCategories
    };
  }, [searchQuery]);

  const hasSuggestions =
    suggestions.products.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.categories.length > 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSuggestionsOpen(false);
      setMobileSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navCategories = [
    { name: 'All Products', path: '/products', icon: Sparkles },
    { name: 'Electronics', path: '/products?category=Electronics' },
    { name: 'Fashion', path: '/products?category=Fashion' },
    { name: 'Home & Living', path: '/products?category=Home%20%26%20Living' },
    { name: 'Beauty & Care', path: '/products?category=Beauty%20%26%20Care' },
    { name: 'Sports & Fitness', path: '/products?category=Sports%20%26%20Fitness' },
    { name: 'Deals & Offers 🔥', path: '/products?offer=deals', isHot: true }
  ];

  return (
    <header className={`header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="header-top">
          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-btn"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          {/* BRAND LOGO */}
          <Link to="/" className="brand-logo">
            <div className="brand-icon-box">
              <ShoppingBag size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                Smart<span className="brand-highlight">Way</span>
              </span>
              <span className="brand-subtitle desktop-only">
                <ShieldCheck size={12} color="var(--success)" /> Official Store
              </span>
            </div>
          </Link>

          {/* DESKTOP SEARCH BAR WITH REAL-TIME AUTOCOMPLETE */}
          <div ref={searchContainerRef} className="desktop-search-container desktop-only">
            <form onSubmit={handleSearchSubmit} className="header-search">
              <div className="search-input-wrap">
                <Search size={18} className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories (e.g. iPhone, Dell)..."
                  value={searchQuery}
                  onFocus={() => setSuggestionsOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSuggestionsOpen(true);
                  }}
                  className="header-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestionsOpen(false);
                    }}
                    className="search-clear-btn"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* SUGGESTIONS DROPDOWN POPUP */}
            {suggestionsOpen && hasSuggestions && (
              <div className="search-suggestions-dropdown">
                {/* 1. PRODUCTS */}
                {suggestions.products.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-section-title">Products</div>
                    {suggestions.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSuggestionsOpen(false);
                          navigate(`/products/${p.id}`);
                        }}
                        className="suggestion-row"
                      >
                        <img
                          src={p.image || p.imageUrl}
                          alt={p.name}
                          className="suggestion-img"
                        />
                        <div className="suggestion-info">
                          <div className="suggestion-name">{p.name}</div>
                          <div className="suggestion-meta">
                            {p.brand} •{' '}
                            <strong className="suggestion-price">
                              ₹{Number(p.price).toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. BRANDS */}
                {suggestions.brands.length > 0 && (
                  <div className="suggestion-section suggestion-section-border">
                    <div className="suggestion-section-title">Brands</div>
                    <div className="suggestion-tags-row">
                      {suggestions.brands.map((b, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSuggestionsOpen(false);
                            navigate(`/products?brand=${encodeURIComponent(b)}`);
                          }}
                          className="suggestion-tag-btn"
                        >
                          <Tag size={12} /> {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. CATEGORIES */}
                {suggestions.categories.length > 0 && (
                  <div className="suggestion-section suggestion-section-border">
                    <div className="suggestion-section-title">Categories</div>
                    <div className="suggestion-tags-row">
                      {suggestions.categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSuggestionsOpen(false);
                            navigate(`/products?category=${encodeURIComponent(cat.name)}`);
                          }}
                          className="suggestion-tag-btn suggestion-category-btn"
                        >
                          <Layers size={12} /> {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS (Mobile Search, Wishlist, Cart, User Profile) */}
          <div className="header-actions">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="header-icon-btn mobile-only"
              title="Search"
              aria-label="Toggle search bar"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="header-icon-btn"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {totalWishlistItems > 0 && (
                <span className="cart-badge-count wishlist-count">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="header-icon-btn"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="cart-badge-count">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div ref={userDropdownRef} className="user-dropdown-wrapper">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="user-profile-btn"
                  aria-label="User profile menu"
                >
                  <div className="user-avatar-badge">
                    {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="desktop-only user-display-name">
                    {user?.fullName?.split(' ')[0] || 'My Account'}
                  </span>
                  <ChevronDown size={14} className="desktop-only" />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{user?.fullName || 'Customer'}</div>
                      <div className="user-dropdown-email">{user?.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="user-dropdown-item"
                    >
                      <User size={16} /> Personal Profile
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="user-dropdown-item"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="user-dropdown-item logout-item"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-auth-buttons">
                <Link to="/login" className="btn btn-secondary btn-sm auth-btn-signin">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm desktop-only">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH EXPANDABLE BAR */}
        {mobileSearchOpen && (
          <div ref={mobileSearchRef} className="mobile-search-bar animate-fade-in mobile-only">
            <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
              <button type="submit" className="mobile-search-submit">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* BOTTOM NAVIGATION CATEGORY LINKS (DESKTOP) */}
        <nav className="header-nav desktop-only" aria-label="Desktop Categories">
          {navCategories.map((item, index) => {
            const isActive = location.pathname + location.search === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`nav-link-item ${isActive ? 'active' : ''} ${
                  item.isHot ? 'hot-deal-link' : ''
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* MOBILE SLIDE-OVER NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="mobile-drawer-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-brand">
                <div className="brand-icon-box">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <div className="brand-title" style={{ fontSize: '1.25rem' }}>
                    Smart<span className="brand-highlight">Way</span>
                  </div>
                  <div className="brand-subtitle">
                    <ShieldCheck size={11} color="var(--success)" /> Verified Marketplace
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="drawer-close-btn"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Search */}
            <div className="drawer-search-wrap">
              <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                <Search size={16} className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Search 1,000+ items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mobile-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="search-clear-btn"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>
            </div>

            {/* Drawer Auth & Account Box */}
            <div className="drawer-auth-box">
              {isAuthenticated ? (
                <div className="drawer-user-info">
                  <div className="drawer-avatar">
                    {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="drawer-user-details">
                    <div className="drawer-user-name">{user?.fullName || 'Customer'}</div>
                    <div className="drawer-user-email">{user?.email}</div>
                  </div>
                </div>
              ) : (
                <div className="drawer-guest-box">
                  <p className="drawer-guest-text">Sign in for personalized recommendations & faster checkout</p>
                  <div className="drawer-guest-btns">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Categories & Navigation Links */}
            <div className="drawer-links-section">
              <div className="drawer-section-title">Shop by Category</div>
              <div className="drawer-links-list">
                {navCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={cat.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`drawer-link-item ${cat.isHot ? 'drawer-hot-link' : ''}`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight size={16} className="drawer-chevron" />
                  </Link>
                ))}
              </div>

              {/* Quick Links */}
              <div className="drawer-section-title" style={{ marginTop: '1.25rem' }}>
                Account & Help
              </div>
              <div className="drawer-links-list">
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="drawer-link-item"
                >
                  <Package size={18} />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="drawer-link-item"
                >
                  <Heart size={18} />
                  <span>Wishlist ({totalWishlistItems})</span>
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="drawer-link-item"
                >
                  <ShoppingCart size={18} />
                  <span>Cart ({totalItems})</span>
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="drawer-link-item"
                  >
                    <User size={18} />
                    <span>Account Settings</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            {isAuthenticated && (
              <div className="drawer-footer">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="drawer-logout-btn"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
