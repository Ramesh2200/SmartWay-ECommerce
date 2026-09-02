import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Phone,
  Building,
  Sparkles,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { ProductImage } from '../components/ProductImage';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TUpDWbsYfpR2m7';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart, grandTotal, subtotal, discountAmount, isFreeShipping, shippingFee, estimatedTax, clearCart } = useCart();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    phone: '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001'
  });

  // Delivery & Payment
  const [deliveryMethod, setDeliveryMethod] = useState('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const isSubmittingRef = React.useRef(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to proceed to checkout', 'info');
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate, showToast]);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName.trim() || !address.phone.trim() || !address.street.trim() || !address.pincode.trim()) {
      showToast('Please fill out all address fields', 'warning');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);

    const fullAddressStr = `${address.fullName}, Ph: ${address.phone}, ${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;

    const enrichedCartItems = cart.map((item) => ({
      productId: item.id,
      productName: item.name,
      name: item.name,
      productImage: item.image || item.imageUrl,
      image: item.image || item.imageUrl,
      category: item.category || 'General',
      quantity: item.quantity,
      price: Number(item.price),
      unitPrice: Number(item.price),
      subtotal: Number(item.price) * Number(item.quantity)
    }));

    // 1. CASH ON DELIVERY OPTION
    if (paymentMethod === 'COD') {
      try {
        const orderData = {
          userId: user?.userId || user?.id || Date.now(),
          userEmail: (user?.email || '').toLowerCase().trim(),
          customerName: user?.fullName || address.fullName || 'Customer',
          totalAmount: grandTotal,
          subtotal: subtotal,
          discountAmount: discountAmount,
          shippingFee: shippingFee,
          taxAmount: estimatedTax,
          shippingAddress: fullAddressStr,
          paymentMethod: 'COD',
          items: enrichedCartItems
        };

        const res = await api.createOrder(orderData);
        if (res && res.success) {
          const placedId = res.orderId || res.id || res.data?.id || res.data?.orderId;
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          clearCart();
          showToast('Order placed successfully (Cash on Delivery)! 🎉', 'success');
          navigate(`/order-success/${placedId}`);
        } else {
          showToast(res?.message || 'Failed to place order', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Order placement failed', 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. RAZORPAY GATEWAY CHECKOUT
    if (typeof window.Razorpay === 'undefined') {
      showToast('Razorpay SDK is loading, please try again in a moment.', 'info');
      setLoading(false);
      return;
    }

    try {
      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(grandTotal * 100), // amount in paise
        currency: 'INR',
        name: 'SmartWay Store',
        description: `Order for ${cart.length} item(s)`,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
        handler: async function (response) {
          try {
            const orderData = {
              userId: user?.userId || user?.id || Date.now(),
              userEmail: (user?.email || '').toLowerCase().trim(),
              customerName: user?.fullName || address.fullName || 'Customer',
              totalAmount: grandTotal,
              subtotal: subtotal,
              discountAmount: discountAmount,
              shippingFee: shippingFee,
              taxAmount: estimatedTax,
              shippingAddress: fullAddressStr,
              paymentMethod: 'RAZORPAY',
              paymentId: response.razorpay_payment_id,
              items: enrichedCartItems
            };

            const res = await api.createOrder(orderData);
            const placedId = res.orderId || res.id || res.data?.id || res.data?.orderId;
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            clearCart();
            showToast('Payment Successful! Order placed 🎉', 'success');
            navigate(`/order-success/${placedId}`);
          } catch (e) {
            showToast('Order creation error: ' + e.message, 'error');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: address.fullName || user?.fullName || '',
          email: user?.email || '',
          contact: address.phone || ''
        },
        theme: {
          color: '#6366F1'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            showToast('Payment cancelled', 'info');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setLoading(false);
        showToast(`Payment Failed: ${response.error.description || 'Unknown error'}`, 'error');
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      showToast('Razorpay Gateway error: ' + err.message, 'error');
    }
  };


  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Wizard Steps */}
      <div className="checkout-wizard-steps" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { num: 1, label: 'Shipping Address' },
          { num: 2, label: 'Payment & Confirm' }
        ].map((s) => (
          <div
            key={s.num}
            className={`step-indicator-item ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: step === s.num ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: step === s.num ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
              color: step === s.num ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step === s.num ? 'var(--primary)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff' }}>
              {step > s.num ? <CheckCircle2 size={16} /> : s.num}
            </div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="cart-page-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
        {/* LEFT: STEP CONTENT */}
        <div>
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <MapPin size={24} style={{ color: 'var(--primary-light)' }} />
                <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>1. Shipping Address</h2>
              </div>

              <form onSubmit={handleAddressSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                      Full Name
                    </label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        style={{ height: '44px', fontSize: '0.92rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                      Phone Number
                    </label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        style={{ height: '44px', fontSize: '0.92rem' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                    Street Address / House No.
                  </label>
                  <div className="input-with-icon">
                    <Building size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. #42, 100 Feet Road, Indiranagar"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      style={{ height: '44px', fontSize: '0.92rem' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      style={{ width: '100%', height: '44px', fontSize: '0.92rem', padding: '0 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                      State
                    </label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      style={{ width: '100%', height: '44px', fontSize: '0.92rem', padding: '0 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      style={{ width: '100%', height: '44px', fontSize: '0.92rem', padding: '0 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.75rem', height: '48px', fontSize: '1rem', fontWeight: 700 }}>
                  Continue to Payment <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD & CONFIRM */}
          {step === 2 && (
            <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <CreditCard size={24} style={{ color: 'var(--primary-light)' }} />
                <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>2. Select Payment Method</h2>
              </div>

              {/* Razorpay Gateway Badge */}
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={20} color="var(--primary-light)" />
                <span style={{ fontSize: '0.88rem', color: '#E2E8F0' }}>
                  Secured by <strong>Razorpay Payment Gateway</strong> (UPI, Cards, NetBanking, Wallets)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                {[
                  {
                    id: 'RAZORPAY',
                    label: 'Razorpay / Instant UPI / Cards / NetBanking',
                    desc: 'Pay instantly with Google Pay, PhonePe, Paytm, Cards or Net Banking via Razorpay',
                    badge: 'RECOMMENDED'
                  },
                  {
                    id: 'COD',
                    label: 'Cash on Delivery (COD)',
                    desc: 'Pay in cash directly to delivery partner upon arrival at your doorstep',
                    badge: null
                  }
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: paymentMethod === p.id ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                      background: paymentMethod === p.id ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{p.label}</span>
                      {p.badge && (
                        <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.desc}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ height: '48px', padding: '0 1.25rem' }}>
                  ← Back to Address
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{
                    flex: 1,
                    height: '48px',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    background: paymentMethod === 'RAZORPAY' ? 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)' : 'var(--primary)',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  {loading ? 'Processing Payment...' : (paymentMethod === 'RAZORPAY' ? `Pay ₹${grandTotal.toLocaleString('en-IN')} with Razorpay ⚡` : `Place Order (Pay ₹${grandTotal.toLocaleString('en-IN')})`)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: STICKY ORDER SUMMARY */}
        <div className="cart-summary-card" style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', position: 'sticky', top: '120px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff', fontWeight: 800 }}>
            Items in Order ({cart.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '240px', overflowY: 'auto' }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                  <ProductImage
                    src={item.image || item.imageUrl}
                    alt={item.name}
                    category={item.category}
                    gallery={item.images || []}
                    objectFit="contain"
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                    Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 700, color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--success)' }}>
              <span>Discount</span>
              <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--text-secondary)' }}>
            <span>Delivery</span>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>
              FREE
            </span>
          </div>

          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Includes GST (18%)</span>
            <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-total-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
            <span>Total Payable</span>
            <span style={{ color: 'var(--primary-light)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
