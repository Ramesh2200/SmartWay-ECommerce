import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Printer,
  Download,
  FileText,
  MapPin,
  CreditCard,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmptyState } from '../components/EmptyState';
import { ProductImage } from '../components/ProductImage';

export const OrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const uid = user.userId || user.id;
      const res = await api.getMyOrders(uid, user.email);
      if (res && res.success && Array.isArray(res.data)) {
        const seen = new Set();
        const unique = [];
        for (const o of res.data) {
          const k = String(o.orderNumber || o.id || o.orderId);
          if (!seen.has(k)) {
            seen.add(k);
            unique.push(o);
          }
        }
        setOrders(unique);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to remove this order from history?')) return;
    try {
      await api.deleteOrder(orderId);
      showToast('Order removed from list', 'info');
      fetchOrders();
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
        setSelectedOrder(null);
      }
    } catch (err) {
      showToast('Could not remove order', 'error');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [user, isAuthenticated]);

  // Open target order modal if specified in URL params or search query
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const targetId = params.orderId || queryParams.get('id') || queryParams.get('orderId');
    if (targetId && orders.length > 0) {
      const matched = orders.find(
        (o) =>
          String(o.id) === String(targetId) ||
          String(o.orderId) === String(targetId) ||
          String(o.orderNumber) === String(targetId)
      );
      if (matched) {
        setSelectedOrder(matched);
      }
    }
  }, [params, location.search, orders]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be returned to the store.')) {
      return;
    }
    setCancellingId(orderId);
    try {
      const uid = user?.userId || user?.id;
      const res = await api.cancelOrder(orderId, uid);
      if (res && res.success) {
        showToast('Order cancelled successfully', 'info');
        fetchOrders();
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
          setSelectedOrder(res.data || { ...selectedOrder, status: 'CANCELLED', orderStatus: 'CANCELLED' });
        }
      } else {
        showToast(res.message || 'Could not cancel order', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        addToCart(
          {
            id: item.productId || item.id,
            name: item.productName || item.name,
            price: Number(item.unitPrice || item.price),
            image: item.productImage || item.image
          },
          item.quantity || 1
        );
      });
      showToast(`Added ${order.items.length} items to your cart! 🛍️`, 'success');
      navigate('/cart');
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to print invoices', 'warning');
      return;
    }

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.productName || item.name}</strong><br/>
            <small style="color: #666;">Item ID: ${item.productId || item.id}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.unitPrice || item.price).toLocaleString('en-IN')}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.subtotal || (item.quantity * Number(item.unitPrice || item.price))).toLocaleString('en-IN')}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366F1; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #6366F1; }
            .meta-box { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8f9fa; padding: 10px; text-align: left; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #ddd; }
            .total-box { float: right; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .grand-total { font-size: 18px; font-weight: bold; color: #6366F1; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">🛍️ SmartWay E-Commerce</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">GSTIN: 29AABCS1429B1ZB | support@smartway.in</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #333;">TAX INVOICE</h2>
              <div style="font-size: 14px; font-weight: bold; margin-top: 5px;">${order.orderNumber}</div>
              <div style="font-size: 12px; color: #666;">Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
            </div>
          </div>

          <div class="meta-box" style="display: flex; justify-content: space-between;">
            <div>
              <strong>Billed & Shipped To:</strong><br/>
              <span style="font-size: 14px; line-height: 1.5;">${order.shippingAddress}</span>
            </div>
            <div style="text-align: right;">
              <strong>Payment Details:</strong><br/>
              <span>Method: ${order.paymentMethod || 'Razorpay / UPI'}</span><br/>
              <span>Status: <strong style="color: green;">${order.paymentStatus || 'PAID'}</strong></span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-box">
            <div class="total-row"><span>Subtotal:</span> <span>₹${Number(order.subtotal || order.totalAmount).toLocaleString('en-IN')}</span></div>
            <div class="total-row"><span>Shipping:</span> <span>FREE</span></div>
            <div class="total-row grand-total"><span>Grand Total:</span> <span>₹${Number(order.totalAmount).toLocaleString('en-IN')}</span></div>
          </div>

          <div style="clear: both; margin-top: 60px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Thank you for shopping with SmartWay! For warranty and support, visit https://ecommerce-gmail-auth.vercel.app/
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    const s = (status || 'CONFIRMED').toUpperCase();
    if (s === 'DELIVERED') {
      return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: 'rgba(16, 185, 129, 0.4)', icon: CheckCircle2 };
    }
    if (s === 'CANCELLED') {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: 'rgba(239, 68, 68, 0.4)', icon: X };
    }
    if (s === 'SHIPPED' || s === 'OUT FOR DELIVERY') {
      return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: 'rgba(59, 130, 246, 0.4)', icon: Truck };
    }
    return { bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', border: 'rgba(99, 102, 241, 0.4)', icon: Clock };
  };

  const timelineSteps = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (status) => {
    const s = (status || 'CONFIRMED').toUpperCase();
    if (s === 'CANCELLED') return -1;
    if (s === 'DELIVERED') return 5;
    if (s === 'OUT FOR DELIVERY') return 4;
    if (s === 'SHIPPED') return 3;
    if (s === 'PROCESSING') return 2;
    if (s === 'CONFIRMED' || s === 'PLACED') return 1;
    return 0;
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'My Account', link: '/profile' }, { label: 'My Orders' }]} />

      <div style={{ margin: '1rem 0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="hero-badge-pill" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> PURCHASE HISTORY
          </span>
          <h1 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', color: '#fff', fontWeight: 900, margin: 0 }}>
            My Orders ({orders.length})
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Track active delivery status, download tax invoices, manage returns, and reorder past purchases.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={fetchOrders} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={15} /> Refresh Orders
          </button>
          <Link to="/products" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={15} /> Browse Store
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2].map((n) => (
            <div key={n} style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', height: '180px' }} className="skeleton" />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-xl)' }}>
          <AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{error}</h3>
          <button onClick={fetchOrders} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {orders.map((order) => {
            const currentStatus = order.status || order.orderStatus || 'CONFIRMED';
            const badge = getStatusBadge(currentStatus);
            const isCancellable = !['CANCELLED', 'DELIVERED', 'SHIPPED'].includes(currentStatus.toUpperCase());
            const orderKey = order.id || order.orderId;

            return (
              <div
                key={orderKey}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Header Row */}
                <div
                  style={{
                    padding: '1.25rem 1.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                        Order Placed
                      </span>
                      <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>
                        {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                        Total Amount
                      </span>
                      <div style={{ fontSize: '1.05rem', color: 'var(--primary-light)', fontWeight: 900 }}>
                        ₹{Number(order.totalAmount || order.grandTotal || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                        Order Number
                      </span>
                      <div style={{ fontSize: '0.92rem', color: '#E2E8F0', fontWeight: 700, fontFamily: 'monospace' }}>
                        {order.orderNumber || `SW-ORD-${orderKey}`}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    <badge.icon size={14} />
                    <span>{currentStatus}</span>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#0D1424', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                          <ProductImage
                            src={item.productImage || item.image || item.imageUrl}
                            alt={item.productName || item.name || 'Product item'}
                            category="Electronics"
                            objectFit="contain"
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <h4 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 800, margin: '0 0 0.35rem' }}>
                            {item.productName || item.name || `Product #${item.productId || item.id}`}
                          </h4>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            Qty: <strong style={{ color: '#fff' }}>{item.quantity || 1}</strong> • Unit Price: <strong style={{ color: 'var(--primary-light)' }}>₹{Number(item.unitPrice || item.price || 0).toLocaleString('en-IN')}</strong>
                          </span>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                          <div style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 900 }}>
                            ₹{Number(item.subtotal || ((item.quantity || 1) * Number(item.unitPrice || item.price || 0))).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Shipping to: <span style={{ color: '#E2E8F0' }}>{order.shippingAddress || 'Default Address'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <FileText size={14} /> Invoice
                      </button>

                      {isCancellable && (
                        <button
                          onClick={() => handleCancelOrder(orderKey)}
                          disabled={cancellingId === orderKey}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#FCA5A5', borderColor: 'rgba(239,68,68,0.3)', fontSize: '0.85rem' }}
                        >
                          {cancellingId === orderKey ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}

                      <button
                        onClick={() => handleReorder(order)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <RotateCcw size={14} /> Buy Again
                      </button>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <Eye size={14} /> View Details & Tracking
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(orderKey)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#94A3B8', padding: '0.35rem 0.6rem' }}
                        title="Remove order from history"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No Orders Placed Yet"
          subtitle="You haven't placed an order yet. Browse our catalog and enjoy express doorstep delivery across India!"
          actionText="Start Shopping"
          actionLink="/products"
        />
      )}

      {/* DETAILED ORDER MODAL WITH VISUAL TIMELINE */}
      {selectedOrder && (
        <div className="mobile-drawer-overlay" onClick={() => setSelectedOrder(null)} style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div
            className="auth-card"
            style={{ maxWidth: '680px', width: '100%', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Package size={24} color="var(--primary-light)" />
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                    Order Details
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {selectedOrder.orderNumber || `SW-ORD-${selectedOrder.id || selectedOrder.orderId}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePrintInvoice(selectedOrder)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <Printer size={14} /> Print Invoice
              </button>
            </div>

            {/* Visual Tracking Timeline */}
            <div style={{ margin: '1.5rem 0 2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
                Delivery Progress Tracker
              </div>

              {(selectedOrder.status || selectedOrder.orderStatus) === 'CANCELLED' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 700 }}>
                  <X size={18} /> This order was cancelled.
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {timelineSteps.map((stepName, i) => {
                    const currentIndex = getStepIndex(selectedOrder.status || selectedOrder.orderStatus);
                    const isCompleted = i <= currentIndex;
                    const isCurrent = i === currentIndex;

                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1, textAlign: 'center' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isCompleted ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            border: isCurrent ? '2px solid #fff' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            boxShadow: isCompleted ? '0 0 10px rgba(99,102,241,0.5)' : 'none'
                          }}
                        >
                          {isCompleted ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: isCompleted ? '#fff' : 'var(--text-muted)', fontWeight: isCurrent ? 800 : 500, lineHeight: 1.2 }}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items in Modal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {(selectedOrder.items || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#0D1424' }}>
                      <ProductImage src={item.productImage || item.image || item.imageUrl} alt={item.productName || item.name} objectFit="contain" />
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>{item.productName || item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Qty: {item.quantity || 1} × ₹{Number(item.unitPrice || item.price || 0).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#fff' }}>
                    ₹{Number(item.subtotal || ((item.quantity || 1) * Number(item.unitPrice || item.price || 0))).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Address & Payment Summary */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery Address</span>
                <p style={{ color: '#CBD5E1', marginTop: '0.25rem', lineHeight: 1.5, margin: 0 }}>
                  {selectedOrder.shippingAddress || '123 SmartWay Tech Park, Bengaluru, Karnataka 560001'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment Details</span>
                <div style={{ color: '#CBD5E1', marginTop: '0.25rem' }}>
                  Method: <strong style={{ color: '#fff' }}>{selectedOrder.paymentMethod || 'Razorpay / UPI'}</strong><br />
                  Status: <strong style={{ color: selectedOrder.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--primary-light)' }}>{selectedOrder.paymentStatus || 'PAID'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
