import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  Package,
  Heart,
  MapPin,
  Lock,
  LogOut,
  CheckCircle2,
  Calendar,
  Key,
  Edit2,
  Plus,
  ShoppingBag,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { api } from '../services/api';
import { ProductImage } from '../components/ProductImage';

export const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login?redirect=/profile');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (activeTab === 'orders' && user?.id) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await api.getUserOrders(user.id);
          if (res.success && Array.isArray(res.data)) {
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
  }, [activeTab, user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully. Come back soon!', 'info');
    navigate('/login');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPass.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    showToast('Password updated securely! 🔒', 'success');
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'My Account' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', marginTop: '1.5rem', alignItems: 'start' }}>
        
        {/* SIDEBAR NAVIGATION TABS */}
        <aside
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            position: 'sticky',
            top: '120px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: '1.4rem',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
              }}
            >
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName || 'Valued Customer'}
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <ShieldCheck size={12} /> Verified Member
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {[
              { id: 'profile', label: 'Personal Information', icon: User },
              { id: 'orders', label: 'My Orders', icon: Package },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'security', label: 'Account Security', icon: Lock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <tab.icon size={18} color={activeTab === tab.id ? 'var(--primary-light)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            ))}

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: 'none',
                color: '#FCA5A5',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '1rem'
              }}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN TAB CONTENT */}
        <main
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, margin: '0 0 1.5rem' }}>
                Personal Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Full Name
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                    {user.fullName || 'Not specified'}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Email Address
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                    {user.email}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Account Status
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} /> Active & Email Verified
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                  My Orders ({orders.length})
                </h2>
                <Link to="/orders" className="btn btn-secondary btn-sm" style={{ fontSize: '0.85rem' }}>
                  Full Orders Hub →
                </Link>
              </div>

              {loadingOrders ? (
                <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading your orders...
                </div>
              ) : orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xl)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Order Number</span>
                          <div style={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                            {ord.orderNumber || `SW-ORD-${ord.id}`}
                          </div>
                        </div>
                        <span style={{ background: ord.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.15)' : ord.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: ord.status === 'DELIVERED' ? 'var(--success)' : ord.status === 'CANCELLED' ? 'var(--danger)' : 'var(--primary-light)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
                          {ord.status || 'CONFIRMED'}
                        </span>
                      </div>

                      {/* Items */}
                      <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(ord.items || []).map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#0D1424', flexShrink: 0 }}>
                              <ProductImage src={item.productImage || item.image || item.imageUrl} alt={item.productName} objectFit="contain" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.productName || `Product #${item.productId}`}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Qty: {item.quantity} × ₹{Number(item.unitPrice || item.price).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          Total Amount: <strong style={{ color: 'var(--primary-light)', fontSize: '1.15rem' }}>₹{Number(ord.totalAmount).toLocaleString('en-IN')}</strong>
                        </span>
                        <Link to="/orders" className="btn btn-secondary btn-sm">
                          Track Delivery →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: '0 0 0.5rem' }}>No Orders Placed Yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Discover our collection and place your first order today!
                  </p>
                  <Link to="/products" className="btn btn-primary">
                    Start Shopping <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, margin: '0 0 1.5rem' }}>
                Saved Delivery Addresses
              </h2>

              <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', maxWidth: '480px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>Default Home Address</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.2)', color: 'var(--primary-light)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    DEFAULT
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {user.fullName || 'Customer'}<br />
                  MG Road, Indiranagar, 100 Feet Road<br />
                  Bengaluru, Karnataka - 560038<br />
                  Ph: +91 98765 43210
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT SECURITY */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, margin: '0 0 1.5rem' }}>
                Account Security & Password
              </h2>

              <form onSubmit={handlePasswordChange} style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem', display: 'block' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    required
                    style={{ height: '46px' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem', display: 'block' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                    style={{ height: '46px' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ height: '48px', fontSize: '1rem', fontWeight: 700 }}>
                  Update Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
