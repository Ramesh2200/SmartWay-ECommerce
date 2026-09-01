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
  Layers
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
  const [isScrolled, setIsScrolled] = useState(false);

  const searchContainerRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    const matchedProducts = PRODUCTS_DATA.filter(p =>
      p.name.toLowerCase().includes(q)
    ).slice(0, 4);

    const allBrands = Array.from(new Set(PRODUCTS_DATA.map(p => p.brand).filter(Boolean)));
    const matchedBrands = allBrands.filter(b => b.toLowerCase().includes(q)).slice(0, 3);

    const matchedCategories = CATEGORIES_DATA.filter(c =>
      c.name.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      products: matchedProducts,
      brands: matchedBrands,
      categories: matchedCategories
    };
  }, [searchQuery]);

  const hasSuggestions = suggestions.products.length > 0 || suggestions.brands.length > 0 || suggestions.categories.length > 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSuggestionsOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
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
      <div className="container">
        <div className="header-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', padding: '1rem 0' }}>
          
          {/* BRAND LOGO */}
          <Link to="/" className="brand-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div className="brand-icon-box">
              <ShoppingBag size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-title" style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>
                Smart<span style={{ color: 'var(--primary-light)' }}>Way</span>
              </span>
              <span className="brand-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                <ShieldCheck size={12} color="var(--success)" /> Official Store
              </span>
            </div>
          </Link>

          {/* DESKTOP SEARCH BAR WITH REAL-TIME AUTOCOMPLETE */}
          <div ref={searchContainerRef} style={{ position: 'relative', flex: 1, maxWidth: '580px' }} className="desktop-only">
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
                  style={{ width: '100%', height: '46px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', color: '#fff', padding: '0 2.8rem' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSuggestionsOpen(false); }}
                    className="search-clear-btn"
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* SUGGESTIONS DROPDOWN POPUP */}
            {suggestionsOpen && hasSuggestions && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  left: 0,
                  right: 0,
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
                  padding: '1rem',
                  zIndex: 1000,
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                {/* 1. PRODUCTS */}
                {suggestions.products.length > 0 && (
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
                      Products
                    </div>
                    {suggestions.products.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSuggestionsOpen(false);
                          navigate(`/products/${p.id}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 0.65rem',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        className="suggestion-row"
                      >
                        <img src={p.image || p.imageUrl} alt={p.name} style={{ width: '36px', height: '36px', objectFit: 'contain', background: '#0D1424', borderRadius: 'var(--radius-sm)', padding: '2px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {p.brand} • <strong style={{ color: 'var(--primary-light)' }}>₹{Number(p.price).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. BRANDS */}
                {suggestions.brands.length > 0 && (
                  <div style={{ marginBottom: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
                      Brands
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {suggestions.brands.map((b, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSuggestionsOpen(false);
                            navigate(`/products?brand=${encodeURIComponent(b)}`);
                          }}
                          style={{
                            background: 'rgba(99, 102, 241, 0.12)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: 'var(--radius-full)',
                            padding: '0.3rem 0.75rem',
                            color: '#fff',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} /> {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. CATEGORIES */}
                {suggestions.categories.length > 0 && (
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
                      Categories
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {suggestions.categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSuggestionsOpen(false);
                            navigate(`/products?category=${encodeURIComponent(cat.name)}`);
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-full)',
                            padding: '0.3rem 0.75rem',
                            color: '#fff',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Layers size={12} style={{ display: 'inline', marginRight: '4px' }} /> {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS (Wishlist, Cart, User Auth Profile) */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {/* Wishlist Link */}
            <Link to="/wishlist" className="header-icon-btn" title="Saved Wishlist" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}>
              <Heart size={20} />
              {totalWishlistItems > 0 && (
                <span className="cart-badge-count" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#EC4899', color: '#fff', fontSize: '0.72rem', fontWeight: 800, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="header-icon-btn" title="Shopping Cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}>
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="cart-badge-count" style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--primary)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div ref={userDropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 0.85rem',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>
                    {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="desktop-only">{user?.fullName?.split(' ')[0] || 'My Account'}</span>
                  <ChevronDown size={14} />
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '120%',
                      right: 0,
                      width: '220px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
                      padding: '0.5rem',
                      zIndex: 1000
                    }}
                  >
                    <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{user?.fullName || 'Customer'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', color: '#E2E8F0', fontSize: '0.88rem', textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}
                      className="user-dropdown-item"
                    >
                      <User size={16} /> Personal Profile
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', color: '#E2E8F0', fontSize: '0.88rem', textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}
                      className="user-dropdown-item"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); navigate('/'); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', color: '#FCA5A5', background: 'none', border: 'none', fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-sm)' }}
                      className="user-dropdown-item"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '0.45rem 1rem', fontSize: '0.88rem', fontWeight: 700 }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm desktop-only" style={{ padding: '0.45rem 1rem', fontSize: '0.88rem', fontWeight: 700 }}>
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm mobile-only"
              style={{ padding: '0.45rem', display: 'none' }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* BOTTOM NAVIGATION CATEGORY LINKS */}
        <nav className="header-nav desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', padding: '0.65rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {navCategories.map((item, index) => {
            const isActive = location.pathname + location.search === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`nav-link-item ${isActive ? 'active' : ''} ${item.isHot ? 'hot-deal-link' : ''}`}
                style={{
                  color: item.isHot ? '#F59E0B' : (isActive ? 'var(--primary-light)' : '#E2E8F0'),
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'color 0.2s ease'
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
