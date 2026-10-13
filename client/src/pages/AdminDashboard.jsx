import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Wheat,
  ShoppingBag,
  IndianRupee,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Truck,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Send,
  TrendingUp,
  Package,
  Layers,
  Search,
  Check
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'users', 'catalog', 'alerts'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Catalog Add Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'fertilizers',
    price: '',
    stock: '',
    unit: 'kg',
    description: '',
    image: ''
  });

  // Manual Alert State (PEST-3)
  const [alertForm, setAlertForm] = useState({
    location: 'All Regions',
    severity: 'high',
    title: '',
    description: '',
    recommendedAction: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, ordersRes, catalogRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/orders'),
        api.get('/resources?limit=50')
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setCatalog(catalogRes.data.data || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setMsg(`Order status updated to "${newStatus}"!`);
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order');
    }
  };

  // User status toggle
  const handleToggleUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/status`);
      setMsg('User status updated');
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  // Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resources', productForm);
      setShowProductModal(false);
      setProductForm({
        name: '',
        category: 'fertilizers',
        price: '',
        stock: '',
        unit: 'kg',
        description: '',
        image: ''
      });
      setMsg('New product added to catalog!');
      const res = await api.get('/resources?limit=50');
      setCatalog(res.data.data || []);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setMsg('Product removed');
      const res = await api.get('/resources?limit=50');
      setCatalog(res.data.data || []);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Broadcast Alert (PEST-3)
  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      await api.post('/weather/alerts', alertForm);
      setMsg('Regional pest alert published successfully!');
      setAlertForm({
        location: 'All Regions',
        severity: 'high',
        title: '',
        description: '',
        recommendedAction: ''
      });
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast alert');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-warning">Operator Portal</span>
            <h1 style={{ fontSize: '2rem' }}>{t('adminTitle')}</h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>{t('adminSubtitle')}</p>
        </div>

        {msg && (
          <div className="alert-box alert-success" style={{ margin: 0, padding: '0.5rem 1rem' }}>
            <Check size={18} />
            <span>{msg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '2px solid var(--border-light)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        {[
          { id: 'overview', label: '📊 System Analytics' },
          { id: 'orders', label: `📦 Orders (${orders.length})` },
          { id: 'users', label: `👨‍🌾 Farmers (${users.length})` },
          { id: 'catalog', label: `🛒 Catalog & Stock (${catalog.length})` },
          { id: 'alerts', label: '🚨 Broadcast Pest Alert' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: 600, fontSize: '0.9rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div>
              {/* Stat Cards Grid */}
              <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
                <div className="stat-card">
                  <div className="stat-icon stat-icon-green">
                    <Users size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>Registered Farmers</h4>
                    <div className="stat-value">{stats.cards?.totalUsers}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-amber">
                    <MapPin size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>Farm Plots</h4>
                    <div className="stat-value">{stats.cards?.totalFarms}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-blue">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>Total Orders</h4>
                    <div className="stat-value">{stats.cards?.totalOrders}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-green">
                    <IndianRupee size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>Gross Sales</h4>
                    <div className="stat-value">₹{stats.cards?.totalRevenue}</div>
                  </div>
                </div>
              </div>

              {/* Order Status & Inventory Alerts */}
              <div className="grid-2">
                {/* Order Status Breakdown */}
                <div className="card">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} color="var(--primary-600)" />
                    <span>Order Pipeline Status</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {['pending', 'approved', 'shipped', 'delivered', 'rejected', 'cancelled'].map((st) => {
                      const found = stats.orderStatusBreakdown?.find((item) => item._id === st);
                      const count = found ? found.count : 0;
                      return (
                        <div key={st} style={{ padding: '0.85rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                          <div style={{ textTransform: 'capitalize', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                            {st}
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="card">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-600)' }}>
                    <AlertTriangle size={20} />
                    <span>Low Stock Inventory Alerts (≤ 15 units)</span>
                  </h3>

                  {stats.lowStockResources && stats.lowStockResources.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {stats.lowStockResources.map((res) => (
                        <div
                          key={res._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.65rem 0.85rem',
                            background: 'var(--danger-50)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #fecaca'
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{res.name}</span>
                          <span className="badge badge-danger">
                            {res.stock} left in stock
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>
                      All product inventory levels are adequate.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                All Farmer Purchase Orders ({orders.length})
              </h3>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          #{o._id.slice(-6).toUpperCase()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.user?.name || 'Customer'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            {o.address?.city} • {o.address?.phone}
                          </div>
                        </td>
                        <td>
                          {o.items.map((it, idx) => (
                            <div key={idx} style={{ fontSize: '0.85rem' }}>
                              {it.name} (x{it.qty})
                            </div>
                          ))}
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{o.totalAmount}</td>
                        <td>
                          <span className={`badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'approved' ? 'badge-info' : o.status === 'shipped' ? 'badge-warning' : 'badge-neutral'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {o.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(o._id, 'approved')}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                              >
                                Approve
                              </button>
                            )}
                            {o.status === 'approved' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(o._id, 'shipped')}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                              >
                                Mark Shipped
                              </button>
                            )}
                            {o.status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(o._id, 'delivered')}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                              >
                                Mark Delivered
                              </button>
                            )}
                            {['pending', 'approved'].includes(o.status) && (
                              <button
                                onClick={() => handleUpdateOrderStatus(o._id, 'rejected')}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--danger-600)' }}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                User & Farmer Profiles ({users.length})
              </h3>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUser(u._id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATALOG & INVENTORY */}
          {activeTab === 'catalog' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Product Catalog ({catalog.length})</h3>
                <button
                  id="admin-add-product-btn"
                  onClick={() => setShowProductModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} />
                  <span>Add New Product</span>
                </button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Unit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalog.map((c) => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>
                          <span className="badge badge-info">{c.category}</span>
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{c.price}</td>
                        <td>
                          <span className={`badge ${c.stock <= 15 ? 'badge-danger' : 'badge-success'}`}>
                            {c.stock} units
                          </span>
                        </td>
                        <td>{c.unit}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteProduct(c._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger-600)', padding: '0.25rem 0.5rem' }}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PUBLISH REGIONAL PEST ALERT (PEST-3) */}
          {activeTab === 'alerts' && (
            <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <ShieldAlert size={24} color="#d97706" />
                <h3 style={{ fontSize: '1.35rem' }}>Publish Regional Pest & Disease Alert</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem' }}>
                Broadcast emergency agricultural advisories across farmer dashboards and weather forecasts.
              </p>

              <form onSubmit={handleBroadcastAlert}>
                <div className="form-group">
                  <label className="form-label" htmlFor="alert-loc">Target Region / District *</label>
                  <input
                    id="alert-loc"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Pune, Nashik, or All Regions"
                    value={alertForm.location}
                    onChange={(e) => setAlertForm({ ...alertForm, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="alert-sev">Risk Severity *</label>
                  <select
                    id="alert-sev"
                    className="form-select"
                    value={alertForm.severity}
                    onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                  >
                    <option value="high">High Risk (Immediate Spray/Intervention Required)</option>
                    <option value="medium">Medium Risk (Scout & Prepare Trap)</option>
                    <option value="low">Low Risk (Routine Advisory)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="alert-title">Advisory Title *</label>
                  <input
                    id="alert-title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Locust Swarm Alert in Western Region"
                    value={alertForm.title}
                    onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="alert-desc">Symptom & Weather Risk Description *</label>
                  <textarea
                    id="alert-desc"
                    rows="3"
                    className="form-control"
                    placeholder="Describe weather factors, vulnerable crops, and outbreak areas..."
                    value={alertForm.description}
                    onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="alert-action">Mandatory Remedial Action *</label>
                  <textarea
                    id="alert-action"
                    rows="3"
                    className="form-control"
                    placeholder="Specify recommended dosage, bio-agents, or irrigation schedule..."
                    value={alertForm.recommendedAction}
                    onChange={(e) => setAlertForm({ ...alertForm, recommendedAction: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button id="broadcast-alert-btn" type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={18} />
                  <span>Broadcast Advisory to Farmers</span>
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Add New Product</h2>

            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-name">Product Name *</label>
                <input
                  id="prod-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Certified Wheat Seeds"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-cat">Category *</label>
                  <select
                    id="prod-cat"
                    className="form-select"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="seeds">Seeds</option>
                    <option value="fertilizers">Fertilizers</option>
                    <option value="pesticides">Pesticides / Bio-Control</option>
                    <option value="tools">Irrigation & Tools</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-unit">Packaging Unit *</label>
                  <input
                    id="prod-unit"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 25 kg bag / 1L"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Price (₹) *</label>
                  <input
                    id="prod-price"
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="450"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-stock">Initial Stock Quantity *</label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="50"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-desc">Description *</label>
                <textarea
                  id="prod-desc"
                  rows="3"
                  className="form-control"
                  placeholder="Key agronomic benefits, application rate..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-img">Image URL</label>
                <input
                  id="prod-img"
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button id="save-product-btn" type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
