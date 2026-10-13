import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldAlert,
  Activity,
  CloudSun,
  ShoppingBag,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
          color: '#ffffff',
          padding: '5rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Sprout size={16} color="#86efac" />
              <span>Version 1.0 MERN Agricultural Platform</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: '1.5rem',
                letterSpacing: '-0.5px'
              }}
            >
              {t('heroTitle')}
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                color: '#e2e8f0',
                lineHeight: 1.6,
                marginBottom: '2.5rem'
              }}
            >
              {t('heroSubtitle')}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="btn btn-primary btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)'
                }}
              >
                <span>{isAuthenticated ? t('dashboard') : t('getStarted')}</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/store"
                className="btn btn-secondary btn-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
              >
                <ShoppingBag size={20} />
                <span>{t('exploreStore')}</span>
              </Link>
            </div>

            {/* Quick Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <CheckCircle2 size={18} color="#4ade80" />
                <span>Trilingual: English, हिन्दी, मराठी</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <CheckCircle2 size={18} color="#4ade80" />
                <span>Precision NPK Soil Scoring</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#4ade80' }}>
                <CheckCircle2 size={18} color="#4ade80" />
                <span>Automated Pest & Disease Early Warnings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
            {t('featuresHeading')}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Designed around the real agricultural lifecycle—from soil testing and crop sowing to climate protection and farm harvesting.
          </p>
        </div>

        <div className="grid-2">
          {/* Feature 1: Soil */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid #16a34a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon stat-icon-green">
                <Activity size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem' }}>{t('featureSoilTitle')}</h3>
                <span className="badge badge-success">0 - 100 Health Score</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', flex: 1 }}>
              {t('featureSoilDesc')}
            </p>
            <Link to="/soil" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span>Analyze Soil Health</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Feature 2: Weather & Pests */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid #d97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon stat-icon-amber">
                <CloudSun size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem' }}>{t('featureWeatherTitle')}</h3>
                <span className="badge badge-warning">Micro-climate Telemetry</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', flex: 1 }}>
              {t('featureWeatherDesc')}
            </p>
            <Link to="/weather" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span>View Weather & Alerts</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Feature 3: Store */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon stat-icon-blue">
                <ShoppingBag size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem' }}>{t('featureStoreTitle')}</h3>
                <span className="badge badge-info">Verified Quality Inputs</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', flex: 1 }}>
              {t('featureStoreDesc')}
            </p>
            <Link to="/store" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span>Browse Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Feature 4: Forum */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <MessageSquare size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem' }}>{t('featureForumTitle')}</h3>
                <span className="badge badge-neutral">Agronomist Q&A</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', flex: 1 }}>
              {t('featureForumDesc')}
            </p>
            <Link to="/forum" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span>Join Discussion</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container">
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
            color: '#ffffff',
            padding: '3rem 2.5rem',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Sprout size={32} color="#86efac" />
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', color: '#ffffff', marginBottom: '1rem', fontWeight: 800 }}>
              Ready to Modernize Your Farm Operations?
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Connect with fellow farmers, track your soil health, receive localized pest alerts, and order agricultural inputs directly to your doorstep.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                <span>Create Free Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/store" className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                <span>Explore Catalog</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
