import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Sprout,
  LayoutDashboard,
  MapPin,
  Wheat,
  Activity,
  CloudSun,
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  ShieldAlert,
  User,
  LogOut,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="container navbar-content">
        {/* Brand */}
        <Link to="/" className="brand" onClick={closeMenu}>
          <div className="brand-icon">
            <Sprout size={24} />
          </div>
          <div>
            <span>Agri-Tech</span>
            <span style={{ display: 'block', fontSize: '0.725rem', fontWeight: 500, color: 'var(--text-subtle)', lineHeight: 1 }}>
              {t('brandTagline')}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          {isAuthenticated ? (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={18} />
                  <span>{t('dashboard')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/farms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <MapPin size={18} />
                  <span>{t('myFarms')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/crops" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Wheat size={18} />
                  <span>{t('crops')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/soil" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Activity size={18} />
                  <span>{t('soilHealth')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/weather" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <CloudSun size={18} />
                  <span>{t('weatherAlerts')}</span>
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>{t('home')}</span>
              </NavLink>
            </li>
          )}

          <li>
            <NavLink to="/store" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShoppingBag size={18} />
              <span>{t('store')}</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/forum" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MessageSquare size={18} />
              <span>{t('forum')}</span>
            </NavLink>
          </li>

          {isAdmin && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ color: 'var(--earth-700)', fontWeight: 700 }}>
                <ShieldAlert size={18} />
                <span>{t('adminPanel')}</span>
              </NavLink>
            </li>
          )}
        </ul>

        {/* Right Tools: Language, Cart, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Globe size={16} color="var(--text-subtle)" />
            <select
              id="language-selector"
              aria-label="Select Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="mr">मराठी (MR)</option>
            </select>
          </div>

          {/* Cart Icon */}
          <Link
            to="/cart"
            id="nav-cart-btn"
            className="btn btn-secondary btn-sm"
            style={{ position: 'relative', padding: '0.5rem 0.75rem' }}
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'var(--primary-600)',
                  color: '#ffffff',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth State */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/orders"
                className="btn btn-outline btn-sm"
                title={t('myOrders')}
              >
                {t('myOrders')}
              </Link>
              <Link
                to="/profile"
                className="btn btn-secondary btn-sm"
                title={user?.name}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <User size={16} />
                <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--danger-600)' }}
                title={t('logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                {t('login')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
