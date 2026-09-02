import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Package,
  Heart,
  MapPin,
  Lock,
  LogOut,
  CheckCircle2,
  Calendar,
  Key,
  Edit3,
  Plus,
  ShoppingBag,
  Clock,
  ArrowRight,
  Award,
  Zap,
  Bell,
  CreditCard,
  Trash2,
  Smartphone,
  Save,
  Sparkles,
  ChevronRight,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { api } from '../services/api';
import { ProductImage } from '../components/ProductImage';
import confetti from 'canvas-confetti';

const ADDRESSES_STORAGE_KEY = 'smartway_saved_addresses';

const DEFAULT_ADDRESSES = [
  {
    id: 1,
    tag: 'Home',
    isDefault: true,
    name: 'Ramesh K',
    phone: '+91 98765 43210',
    street: '#42, 4th Cross, 100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038'
  },
  {
    id: 2,
    tag: 'Work',
    isDefault: false,
    name: 'Ramesh K (Office)',
    phone: '+91 98765 43210',
    street: 'Prestige Tech Park, Outer Ring Road, Marathahalli',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103'
  }
];

export const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || 'Valued Customer',
    email: user?.email || '',
    phone: user?.phone || '+91 98765 43210',
    gender: 'Male',
    dob: '1998-08-25',
    bio: 'Tech enthusiast & SmartWay verified member',
    language: 'English'
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    whatsappAlerts: true,
    promotionalOffers: true,
    securityAlerts: true
  });

  // Saved Addresses State
  const [addresses, setAddresses] = useState(() => {
    try {
      const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_ADDRESSES;
    } catch {
      return DEFAULT_ADDRESSES;
    }
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    tag: 'Home',
    name: user?.fullName || '',
    phone: user?.phone || '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: ''
  });

  // Passwords
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Sync user state
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login?redirect=/profile');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch user orders
  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await api.getMyOrders(user.userId || user.id, user.email);
          if (res && res.success && Array.isArray(res.data)) {
            setOrders(res.data);
          }
        } catch (e) {
          console.warn('Orders query:', e);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  const saveAddressesToStorage = (updated) => {
    setAddresses(updated);
    try {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
    showToast('Personal profile updated successfully! 🎉', 'success');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.pincode) {
      showToast('Please fill in street and pincode', 'warning');
      return;
    }
    const item = {
      ...newAddress,
      id: Date.now(),
      isDefault: addresses.length === 0
    };
    const updated = [...addresses, item];
    saveAddressesToStorage(updated);
    setShowAddressModal(false);
    setNewAddress({
      tag: 'Home',
      name: user?.fullName || '',
      phone: user?.phone || '',
      street: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: ''
    });
    showToast('New delivery address saved!', 'success');
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddressesToStorage(updated);
    showToast('Address removed', 'info');
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    saveAddressesToStorage(updated);
    showToast('Default delivery address updated!', 'success');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setUpdatingPassword(true);
    try {
      await api.resetPassword(user.email, passwords.newPass);
      showToast('Password updated securely! 🔒', 'success');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      showToast(err.message || 'Password update failed', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully. Come back soon!', 'info');
    navigate('/login');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const initials = (profileData.fullName || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="container profile-page-container animate-fade-in" style={{ paddingBottom: '5rem', paddingTop: '1rem' }}>
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'My Account' }, { label: 'Personal Profile' }]} />

      {/* TOP HERO PROFILE HEADER CARD */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-circle">
              {initials}
            </div>
            <div className="profile-avatar-badge" title="Verified Account">
              <ShieldCheck size={14} color="#fff" />
            </div>
          </div>

          <div className="profile-hero-info">
            <div className="profile-hero-name-row">
              <h1 className="profile-hero-name">{profileData.fullName}</h1>
              <span className="profile-vip-badge">
                <Sparkles size={13} /> VIP Member
              </span>
            </div>
            <div className="profile-hero-email-row">
              <span className="profile-hero-meta-item">
                <Mail size={14} color="var(--primary-light)" /> {user.email}
              </span>
              <span className="profile-hero-meta-item">
                <Phone size={14} color="var(--accent-emerald)" /> {profileData.phone}
              </span>
              <span className="profile-hero-meta-item">
                <Calendar size={14} color="var(--accent-amber)" /> Joined {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* PROFILE COMPLETION STATS */}
        <div className="profile-stats-grid">
          <div className="profile-stat-box" onClick={() => setActiveTab('orders')}>
            <div className="profile-stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
              <Package size={20} />
            </div>
            <div>
              <div className="profile-stat-num">{orders.length > 0 ? orders.length : '1+'}</div>
              <div className="profile-stat-label">Orders</div>
            </div>
          </div>

          <Link to="/wishlist" className="profile-stat-box" style={{ textDecoration: 'none' }}>
            <div className="profile-stat-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#F472B6' }}>
              <Heart size={20} />
            </div>
            <div>
              <div className="profile-stat-num">{totalWishlistItems}</div>
              <div className="profile-stat-label">Wishlist</div>
            </div>
          </Link>

          <div className="profile-stat-box" onClick={() => setActiveTab('payments')}>
            <div className="profile-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <Zap size={20} />
            </div>
            <div>
              <div className="profile-stat-num">₹500</div>
              <div className="profile-stat-label">SmartCoins</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN PROFILE LAYOUT */}
      <div className="profile-main-layout">
        
        {/* SIDEBAR NAVIGATION TABS */}
        <aside className="profile-sidebar-card">
          <div className="profile-sidebar-nav">
            {[
              { id: 'profile', label: 'Personal Information', icon: User, badge: 'Edit' },
              { id: 'orders', label: 'My Orders Hub', icon: Package, count: orders.length || 1 },
              { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, count: addresses.length },
              { id: 'payments', label: 'Razorpay & Wallet', icon: CreditCard, badge: 'Live' },
              { id: 'preferences', label: 'Notification Settings', icon: Bell },
              { id: 'security', label: 'Security & Privacy', icon: Lock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`profile-nav-tab ${isActive ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} className="profile-tab-icon" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="profile-tab-badge">{tab.badge}</span>
                  )}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="profile-tab-count">{tab.count}</span>
                  )}
                </button>
              );
            })}

            <button onClick={handleLogout} className="profile-logout-btn">
              <LogOut size={18} /> Sign Out Account
            </button>
          </div>
        </aside>

        {/* MAIN TAB CONTENT CONTAINER */}
        <main className="profile-content-card">

          {/* ──────────────────────────────────────────────────────────
              TAB 1: PERSONAL INFORMATION & BIO
             ────────────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="tab-pane animate-fade-in">
              <div className="tab-header-row">
                <div>
                  <h2 className="tab-title">Personal Information</h2>
                  <p className="tab-subtitle">Manage your personal details, contact info, and account preferences</p>
                </div>
                {!isEditingProfile ? (
                  <button onClick={() => setIsEditingProfile(true)} className="btn btn-secondary btn-sm">
                    <Edit3 size={15} /> Edit Profile
                  </button>
                ) : (
                  <button onClick={() => setIsEditingProfile(false)} className="btn btn-secondary btn-sm">
                    <X size={15} /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileSave} className="profile-form-grid">
                <div className="profile-field-card">
                  <label className="profile-field-label">Full Name</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      required
                    />
                  ) : (
                    <div className="profile-field-value">{profileData.fullName}</div>
                  )}
                </div>

                <div className="profile-field-card">
                  <label className="profile-field-label">Email Address (Verified)</label>
                  <div className="profile-field-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{profileData.email}</span>
                    <span className="verified-pill">
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  </div>
                </div>

                <div className="profile-field-card">
                  <label className="profile-field-label">Primary Mobile Number</label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      className="profile-input"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  ) : (
                    <div className="profile-field-value">{profileData.phone}</div>
                  )}
                </div>

                <div className="profile-field-card">
                  <label className="profile-field-label">Gender</label>
                  {isEditingProfile ? (
                    <select
                      className="profile-input"
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <div className="profile-field-value">{profileData.gender}</div>
                  )}
                </div>

                <div className="profile-field-card">
                  <label className="profile-field-label">Date of Birth</label>
                  {isEditingProfile ? (
                    <input
                      type="date"
                      className="profile-input"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                    />
                  ) : (
                    <div className="profile-field-value">
                      {new Date(profileData.dob).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  )}
                </div>

                <div className="profile-field-card">
                  <label className="profile-field-label">Preferred Language</label>
                  {isEditingProfile ? (
                    <select
                      className="profile-input"
                      value={profileData.language}
                      onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                    >
                      <option value="English">English (India)</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                    </select>
                  ) : (
                    <div className="profile-field-value">{profileData.language}</div>
                  )}
                </div>

                <div className="profile-field-card" style={{ gridColumn: '1 / -1' }}>
                  <label className="profile-field-label">Personal Bio / Notes</label>
                  {isEditingProfile ? (
                    <textarea
                      rows={3}
                      className="profile-input"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    />
                  ) : (
                    <div className="profile-field-value" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{profileData.bio}"
                    </div>
                  )}
                </div>

                {isEditingProfile && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                )}
              </form>

              {/* MEMBERSHIP PERKS STRIP */}
              <div className="profile-perks-box">
                <div className="perk-badge-item">
                  <div className="perk-icon-circle">
                    <Zap size={18} />
                  </div>
                  <div>
                    <div className="perk-title">Free Express Delivery</div>
                    <div className="perk-desc">On all orders above ₹999</div>
                  </div>
                </div>

                <div className="perk-badge-item">
                  <div className="perk-icon-circle" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="perk-title">100% Genuine Guarantee</div>
                    <div className="perk-desc">Official brand warranty</div>
                  </div>
                </div>

                <div className="perk-badge-item">
                  <div className="perk-icon-circle" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="perk-title">7-Day Easy Returns</div>
                    <div className="perk-desc">Hassle-free replacement</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 2: MY ORDERS HUB
             ────────────────────────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <div className="tab-pane animate-fade-in">
              <div className="tab-header-row">
                <div>
                  <h2 className="tab-title">My Orders ({orders.length})</h2>
                  <p className="tab-subtitle">Real-time tracking, GST invoice downloads, and order updates</p>
                </div>
                <Link to="/orders" className="btn btn-secondary btn-sm">
                  Orders Hub <ArrowRight size={15} />
                </Link>
              </div>

              {loadingOrders ? (
                <div style={{ padding: '3.5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="spin-animation" style={{ marginBottom: '0.75rem', display: 'inline-block' }} />
                  <div>Loading your real-time orders...</div>
                </div>
              ) : orders.length > 0 ? (
                <div className="profile-orders-list">
                  {orders.map((ord) => (
                    <div key={ord.orderId || ord.id} className="profile-order-card">
                      <div className="profile-order-card-header">
                        <div>
                          <span className="order-label-small">Order ID</span>
                          <div className="order-number-text">{ord.orderNumber || `SW-ORD-${ord.orderId || ord.id}`}</div>
                        </div>
                        <span className={`order-status-badge status-${(ord.orderStatus || ord.status || 'PLACED').toLowerCase()}`}>
                          {ord.orderStatus || ord.status || 'CONFIRMED'}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="profile-order-items">
                        {(ord.items || []).map((item, idx) => (
                          <div key={idx} className="profile-order-item-row">
                            <div className="profile-order-img-box">
                              <ProductImage src={item.productImage || item.image || item.imageUrl} alt={item.productName || 'Product'} objectFit="contain" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="profile-order-item-name">{item.productName || `Smart Product #${item.productId || item.menuId}`}</div>
                              <div className="profile-order-item-qty">
                                Qty: {item.quantity} × <strong style={{ color: 'var(--primary-light)' }}>₹{Number(item.price || item.unitPrice || 1499).toLocaleString('en-IN')}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="profile-order-card-footer">
                        <div>
                          <span className="order-label-small">Total Paid</span>
                          <div className="order-total-price">₹{Number(ord.totalAmount || ord.grandTotal || 1499).toLocaleString('en-IN')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/orders?id=${ord.orderId || ord.id}`} className="btn btn-secondary btn-sm">
                            Track Order →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-tab">
                  <div className="empty-tab-icon">
                    <Package size={40} />
                  </div>
                  <h3>No Orders Found Yet</h3>
                  <p>Explore thousands of premium products with fast doorstep delivery.</p>
                  <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Browse Products <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 3: DELIVERY ADDRESSES
             ────────────────────────────────────────────────────────── */}
          {activeTab === 'addresses' && (
            <div className="tab-pane animate-fade-in">
              <div className="tab-header-row">
                <div>
                  <h2 className="tab-title">Saved Delivery Addresses</h2>
                  <p className="tab-subtitle">Manage multiple shipping destinations for instant 1-click checkout</p>
                </div>
                <button onClick={() => setShowAddressModal(true)} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              <div className="profile-addresses-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? 'is-default' : ''}`}>
                    <div className="address-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="address-tag-badge">{addr.tag}</span>
                        {addr.isDefault && <span className="default-pill">DEFAULT</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="address-delete-btn"
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="address-card-name">{addr.name}</div>
                    <div className="address-card-text">
                      {addr.street}<br />
                      {addr.city}, {addr.state} - <strong>{addr.pincode}</strong><br />
                      <span style={{ color: 'var(--text-muted)' }}>Contact:</span> {addr.phone}
                    </div>

                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem' }}
                      >
                        Set as Default Address
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* ADD ADDRESS MODAL */}
              {showAddressModal && (
                <div className="address-modal-overlay" onClick={() => setShowAddressModal(false)}>
                  <div className="address-modal-dialog animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="tab-header-row" style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>Add Delivery Address</h3>
                      <button onClick={() => setShowAddressModal(false)} className="btn-close-modal">
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="profile-field-label">Address Tag</label>
                          <select
                            className="profile-input"
                            value={newAddress.tag}
                            onChange={(e) => setNewAddress({ ...newAddress, tag: e.target.value })}
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="profile-field-label">Recipient Name</label>
                          <input
                            type="text"
                            className="profile-input"
                            placeholder="Full name"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="profile-field-label">Phone Number</label>
                          <input
                            type="tel"
                            className="profile-input"
                            placeholder="+91 98765 43210"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="profile-field-label">PIN Code</label>
                          <input
                            type="text"
                            className="profile-input"
                            placeholder="560001"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="profile-field-label">Street Address & Flat / House No.</label>
                        <textarea
                          rows={2}
                          className="profile-input"
                          placeholder="e.g. #102, Sunrise Apts, 5th Cross Road"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="profile-field-label">City</label>
                          <input
                            type="text"
                            className="profile-input"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="profile-field-label">State</label>
                          <input
                            type="text"
                            className="profile-input"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                        <button type="button" onClick={() => setShowAddressModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 4: RAZORPAY & PAYMENT WALLET
             ────────────────────────────────────────────────────────── */}
          {activeTab === 'payments' && (
            <div className="tab-pane animate-fade-in">
              <div className="tab-header-row">
                <div>
                  <h2 className="tab-title">Payment Gateway & Wallet</h2>
                  <p className="tab-subtitle">Razorpay Live integration, saved payment methods & SmartCoins balance</p>
                </div>
              </div>

              <div className="payment-gateway-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="razorpay-logo-icon">
                    <ShieldCheck size={26} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                      Razorpay Live Payment Gateway
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '2px' }}>
                      Key ID: <code style={{ color: '#34D399', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>rzp_live_TUpDWbsYfpR2m7</code>
                    </div>
                  </div>
                </div>
                <div className="status-live-pill">
                  <span className="live-dot" /> LIVE & ACTIVE
                </div>
              </div>

              <div className="profile-wallet-grid">
                <div className="wallet-card">
                  <div className="wallet-card-header">
                    <span className="wallet-card-label">SmartCoins Balance</span>
                    <Sparkles size={20} color="var(--accent-amber)" />
                  </div>
                  <div className="wallet-card-balance">500 Coins (₹500.00)</div>
                  <p className="wallet-card-note">Automatically applicable at checkout for instant cash discounts!</p>
                </div>

                <div className="wallet-card">
                  <div className="wallet-card-header">
                    <span className="wallet-card-label">Supported Payment Rails</span>
                    <Zap size={20} color="var(--primary-light)" />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                    {['Google Pay (UPI)', 'PhonePe', 'Paytm UPI', 'Visa / Mastercard', 'RuPay', 'Net Banking (50+ Banks)', 'Cash on Delivery'].map((m, i) => (
                      <span key={i} className="payment-method-tag">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 5: NOTIFICATION SETTINGS
             ────────────────────────────────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="tab-pane animate-fade-in">
              <div className="tab-header-row">
                <div>
                  <h2 className="tab-title">Notification Preferences</h2>
                  <p className="tab-subtitle">Choose how and when SmartWay communicates order updates and offers</p>
                </div>
              </div>

              <div className="preferences-list">
                {[
                  {
                    key: 'orderUpdates',
                    title: 'Order Status & Tracking Updates',
                    desc: 'Instant notifications when your order is confirmed, shipped, and out for delivery.',
                    icon: Package
                  },
                  {
                    key: 'whatsappAlerts',
                    title: 'WhatsApp & SMS Delivery Alerts',
                    desc: 'Real-time OTP codes and driver tracking link sent via SMS and WhatsApp.',
                    icon: Smartphone
                  },
                  {
                    key: 'promotionalOffers',
                    title: 'Flash Sale & Price Drop Alerts',
                    desc: 'Personalized discounts on items in your wishlist and cart.',
                    icon: Sparkles
                  },
                  {
                    key: 'securityAlerts',
                    title: 'Account Security & Login Alerts',
                    desc: 'Immediate notification when a new sign-in is detected.',
                    icon: ShieldCheck
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = notifications[item.key];
                  return (
                    <div key={item.key} className="preference-item-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div className="pref-icon-box">
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="pref-title">{item.title}</div>
                          <div className="pref-desc">{item.desc}</div>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setNotifications({ ...notifications, [item.key]: !isChecked });
                            showToast('Preference updated!', 'info');
                          }}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 6: SECURITY & PRIVACY
             ────────────────────────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="tab-pane animate-fade-in">
              <div className="tab-header-row">
                <div>
                  <h2 className="tab-title">Account Security & Credentials</h2>
                  <p className="tab-subtitle">Protect your account with high-entropy encryption & password controls</p>
                </div>
              </div>

              <div className="security-section-wrapper">
                <form onSubmit={handlePasswordChange} className="password-update-form">
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1rem' }}>
                    Change Account Password
                  </h3>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="profile-field-label">New Password</label>
                    <input
                      type="password"
                      className="profile-input"
                      placeholder="Minimum 6 characters"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="profile-field-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="profile-input"
                      placeholder="Re-enter new password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    {updatingPassword ? (
                      <>
                        <RefreshCw size={16} className="spin-animation" /> Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock size={16} /> Update Password
                      </>
                    )}
                  </button>
                </form>

                {/* DEVICE & ACTIVE SESSIONS CARD */}
                <div className="sessions-card">
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1rem' }}>
                    Current Active Session
                  </h3>
                  <div className="session-info-item">
                    <Smartphone size={20} color="var(--primary-light)" />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>
                        Active Browser Session (Current Device)
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        Verified via Google Chrome / Mobile Safari • IP: Active
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', color: '#FCA5A5' }}>
                      <LogOut size={16} /> End All Sessions & Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
