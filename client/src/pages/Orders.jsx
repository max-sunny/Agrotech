import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function Orders() {
  const { t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my');
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by customer'
      });
      setCancellingId(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-info"><CheckCircle size={14} /> Approved</span>;
      case 'shipped':
        return <span className="badge badge-warning"><Truck size={14} /> Shipped</span>;
      case 'delivered':
        return <span className="badge badge-success"><CheckCircle size={14} /> Delivered</span>;
      case 'rejected':
        return <span className="badge badge-danger"><XCircle size={14} /> Rejected</span>;
      case 'cancelled':
        return <span className="badge badge-neutral"><RotateCcw size={14} /> Cancelled</span>;
      default:
        return <span className="badge badge-warning"><Clock size={14} /> Pending</span>;
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('myOrders')}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Track your agricultural inputs dispatch status and order history.
      </p>

      {error && (
        <div className="alert-box alert-danger" role="alert">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <PackageCheck size={36} />
          </div>
          <h3>No Orders Placed Yet</h3>
          <p>Browse our catalog to order high-grade seeds, bio-fertilizers, and irrigation equipment.</p>
          <a href="/store" className="btn btn-primary">
            <span>Browse Store</span>
            <ArrowRight size={16} />
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                    Order Placed: {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Order ID: <code>#{order._id.slice(-8).toUpperCase()}</code>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {getStatusBadge(order.status)}

                  {/* Allow cancellation if still pending (STORE-8) */}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => setCancellingId(order._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger-600)', fontSize: '0.8rem' }}
                    >
                      {t('cancelOrder')}
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-subtle)', marginLeft: '0.5rem' }}>
                        x {item.qty}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      ₹{item.price * item.qty}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer & Total */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  📍 Delivery to: <strong>{order.address?.street}, {order.address?.city} ({order.address?.pincode})</strong> | 📞 {order.address?.phone}
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                  Total: ₹{order.totalAmount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="modal-overlay" onClick={() => setCancellingId(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--danger-600)' }}>
              Confirm Order Cancellation
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel this pending order? Reserved inventory items will be returned to stock.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setCancellingId(null)} className="btn btn-secondary">
                {t('close')}
              </button>
              <button
                onClick={() => handleCancelOrder(cancellingId)}
                className="btn btn-danger"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
