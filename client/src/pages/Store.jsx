import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  ShoppingCart,
  Plus,
  Check,
  Package,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

export default function Store() {
  const { t } = useLanguage();
  const { addToCart, totalItems } = useCart();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [addedNotice, setAddedNotice] = useState('');

  // Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/resources?${params.toString()}`);
      setResources(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedNotice(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedNotice(''), 3000);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header & Cart Shortcut */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('storeTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('storeSubtitle')}</p>
        </div>

        <Link to="/cart" id="store-view-cart-btn" className="btn btn-primary" style={{ position: 'relative' }}>
          <ShoppingCart size={18} />
          <span>View Cart ({totalItems} items)</span>
        </Link>
      </div>

      {addedNotice && (
        <div className="alert-box alert-success" role="status" style={{ position: 'sticky', top: '80px', zIndex: 90 }}>
          <Check size={20} />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          {/* Categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              { id: 'all', label: 'All Inputs' },
              { id: 'seeds', label: 'Seeds (बीज)' },
              { id: 'fertilizers', label: 'Fertilizers (खाद)' },
              { id: 'pesticides', label: 'Plant Protection (दवा)' },
              { id: 'tools', label: 'Irrigation & Tools (अवजारे)' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="store-search-input"
              type="text"
              className="form-control"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '200px' }}
            />
            <button id="store-search-btn" type="submit" className="btn btn-secondary btn-sm">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Product Catalog Grid */}
      {loading ? (
        <div className="spinner"></div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package size={36} />
          </div>
          <h3>No products match your filter</h3>
          <p>Try searching for a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
          {resources.map((item) => (
            <div
              key={item._id}
              className="card"
              onClick={() => setSelectedProduct(item)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                overflow: 'hidden'
              }}
            >
              {/* Image preview */}
              <div
                style={{
                  height: '180px',
                  background: '#f1f5f9',
                  backgroundImage: item.image ? `url(${item.image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
              >
                <span
                  className="badge badge-neutral"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {item.category}
                </span>

                <span
                  className={`badge ${item.stock > 0 ? 'badge-success' : 'badge-danger'}`}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px'
                  }}
                >
                  {item.stock > 0 ? `${item.stock} in stock` : t('outOfStock')}
                </span>
              </div>

              {/* Product Info */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', lineHeight: 1.3 }}>{item.name}</h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                      ₹{item.price}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      per {item.unit || 'unit'}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(item, e)}
                    disabled={item.stock <= 0}
                    className="btn btn-primary btn-sm"
                    title={t('addToCart')}
                  >
                    <Plus size={16} />
                    <span>{t('addToCart')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '40px' }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Product Detail Modal (STORE-2) */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedProduct.image && (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                  {selectedProduct.category}
                </span>
                <h2 style={{ fontSize: '1.4rem' }}>{selectedProduct.name}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                  ₹{selectedProduct.price}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  per {selectedProduct.unit || 'unit'}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '1rem 0' }}>
              {selectedProduct.description}
            </p>

            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)' }}>Current Inventory Stock:</span>
              <span style={{ fontWeight: 700, color: selectedProduct.stock > 0 ? 'var(--primary-700)' : 'var(--danger-600)' }}>
                {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Out of Stock'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setSelectedProduct(null)} className="btn btn-secondary">
                {t('close')}
              </button>
              <button
                onClick={(e) => {
                  handleAddToCart(selectedProduct, e);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.stock <= 0}
                className="btn btn-primary"
              >
                <ShoppingCart size={18} />
                <span>{t('addToCart')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
