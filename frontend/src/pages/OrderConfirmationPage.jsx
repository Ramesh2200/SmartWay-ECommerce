import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home, Truck, ShieldCheck, Sparkles, Clock, Printer, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { ProductImage } from '../components/ProductImage';

export const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    confetti({
      particleCount: 150,
      spread: 75,
      origin: { y: 0.6 }
    });

    const fetchOrderDetails = async () => {
      if (orderId) {
        try {
          const res = await api.getOrderById(orderId);
          if (res && res.success && res.data) {
            setOrder(res.data);
          }
        } catch (e) {
          console.warn('Order fetch in confirmation:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '780px', textAlign: 'center' }}>
      <div
        className="auth-card"
        style={{
          maxWidth: '100%',
          padding: '3rem 2.5rem',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Animated Checkmark Box */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--success)',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
          }}
        >
          <CheckCircle2 size={46} />
        </div>

        <span className="hero-badge-pill" style={{ color: 'var(--success)', borderColor: 'var(--success)', marginBottom: '0.75rem' }}>
          ✓ PAYMENT & ORDER CONFIRMED
        </span>

        <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', margin: '0.75rem 0 0.5rem', color: '#fff', fontWeight: 900 }}>
          Order Placed Successfully! 🎉
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Thank you for shopping with SmartWay. Your order has been recorded and is now listed in your purchase history.
        </p>

        {/* Order Meta Box */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            textAlign: 'left',
            marginBottom: '1.75rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Number:</span>
            <strong style={{ color: '#fff', fontFamily: 'monospace' }}>
              {order?.orderNumber || `SW-ORD-${orderId || 'SUCCESS'}`}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
            <strong style={{ color: '#fff' }}>
              {new Date(order?.createdAt || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Status:</span>
            <strong style={{ color: 'var(--success)' }}>
              ● {order?.status || order?.orderStatus || 'CONFIRMED'} (Ready for Packing)
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
            <strong style={{ color: '#fff' }}>
              {order?.paymentMethod || 'Razorpay / UPI'}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid:</span>
            <strong style={{ color: 'var(--primary-light)', fontSize: '1.05rem', fontWeight: 900 }}>
              ₹{Number(order?.totalAmount || order?.grandTotal || 0).toLocaleString('en-IN')}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery:</span>
            <strong style={{ color: 'var(--primary-light)' }}>
              ⚡ Within 2-3 Business Days
            </strong>
          </div>
        </div>

        {/* Items Summary in Confirmation */}
        {order?.items && order.items.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Items in this Order ({order.items.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#0D1424', flexShrink: 0 }}>
                      <ProductImage src={item.productImage || item.image || item.imageUrl} alt={item.productName || item.name} objectFit="contain" />
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{item.productName || item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Qty: {item.quantity} × ₹{Number(item.unitPrice || item.price || 0).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
                    ₹{Number(item.subtotal || ((item.quantity || 1) * Number(item.unitPrice || item.price || 0))).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to={`/orders?id=${order?.id || order?.orderId || orderId}`}
            className="btn btn-primary btn-lg"
            style={{ flex: 1, minWidth: '180px', height: '50px', fontSize: '1rem', fontWeight: 800 }}
          >
            <Package size={18} /> View in My Orders
          </Link>
          <Link
            to="/products"
            className="btn btn-secondary btn-lg"
            style={{ flex: 1, minWidth: '180px', height: '50px', fontSize: '1rem', fontWeight: 800 }}
          >
            <Home size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
