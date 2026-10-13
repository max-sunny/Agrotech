import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Cart() {
  const { items, updateQty, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    phone: user?.phone || ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          resource: i.resourceId,
          qty: i.qty
        })),
        address
      };

      const res = await api.post('/orders', orderPayload);
      clearCart();
      setSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to place order. Please review product stock.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ maxWidth: '580px', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--primary-100)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            <CheckCircle size={44} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--primary-900)' }}>
            Order Placed Successfully!
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your order has been submitted for admin fulfillment under Cash on Delivery. Redirecting to your orders list...
          </p>
          <Link to="/orders" className="btn btn-primary">
            <span>View My Orders</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('cart')}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Review your agricultural inputs, set delivery address, and place order.
      </p>

      {error && (
        <div className="alert-box alert-danger" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ShoppingCart size={36} />
          </div>
          <h3>Your Shopping Cart is Empty</h3>
          <p>Explore our catalog of certified seeds, fertilizers, and irrigation tools.</p>
          <Link to="/store" className="btn btn-primary">
            <span>Browse Store</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Cart Item List */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Order Items ({totalItems})</h2>
              <button
                onClick={clearCart}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', color: 'var(--danger-600)' }}
              >
                Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <div
                  key={item.resourceId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{item.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 700 }}>
                      ₹{item.price} <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>per {item.unit || 'unit'}</span>
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => updateQty(item.resourceId, item.qty - 1)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', minHeight: '30px' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.resourceId, item.qty + 1)}
                      disabled={item.qty >= item.stock}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', minHeight: '30px' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      ₹{item.price * item.qty}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.resourceId)}
                      style={{ border: 'none', background: 'transparent', color: 'var(--danger-600)', cursor: 'pointer', fontSize: '0.75rem', marginTop: '0.2rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '2px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                <span style={{ fontWeight: 600 }}>₹{totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Farm Gate Delivery:</span>
                <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>FREE (Govt Scheme)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <span>{t('total')}:</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Checkout Form */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--primary-600)" />
              <span>{t('deliveryAddress')}</span>
            </h2>

            {!isAuthenticated && (
              <div className="alert-box alert-warning" style={{ fontSize: '0.9rem' }}>
                Please sign in to place and track your orders.
              </div>
            )}

            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label className="form-label" htmlFor="addr-name">Farmer / Recipient Name *</label>
                <input
                  id="addr-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Baliram Patil"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addr-street">Village / Farm Address / Street *</label>
                <input
                  id="addr-street"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Patil Mala, Post Baramati"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-city">City / District *</label>
                  <input
                    id="addr-city"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Pune"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="addr-pincode">Postal Pincode *</label>
                  <input
                    id="addr-pincode"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 413102"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addr-phone">Contact Mobile Number *</label>
                <input
                  id="addr-phone"
                  type="tel"
                  className="form-control"
                  placeholder="e.g. +91 94220 55441"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  required
                />
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--primary-900)' }}>
                <strong>Payment Mode:</strong> Cash on Delivery (COD) / Pay upon delivery verification.
              </div>

              <button
                id="place-order-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                <span>{submitting ? 'Placing Order...' : t('placeOrder')}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
