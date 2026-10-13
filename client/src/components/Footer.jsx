import React from 'react';
import { Sprout, PhoneCall, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ maxWidth: '360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary-800)', fontWeight: 800, fontSize: '1.25rem' }}>
              <Sprout size={24} color="var(--primary-600)" />
              <span>Agri-Tech Platform</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Empowering farmers across India with hyper-local agro-meteorology, precision soil health analytics, automated pest alarms, direct input store, and community wisdom.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Platform Modules</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
              <li><a href="/farms">Farm Profiles & Crops</a></li>
              <li><a href="/soil">Soil Nutrient Testing</a></li>
              <li><a href="/weather">Weather & Pest Forecast</a></li>
              <li><a href="/store">Agricultural Inputs Store</a></li>
              <li><a href="/forum">Expert Farmer Consultation</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Kisan Call Center & Help</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary-700)', fontWeight: 700 }}>
              <PhoneCall size={18} />
              <span>Toll Free: 1800-180-1551</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              National Kisan Advisory Support (06:00 AM - 10:00 PM IST)
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-subtle)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--primary-600)" />
              <span>End-to-End Secure MERN Architecture</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            © {new Date().getFullYear()} Agri-Tech Smart Farming Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-subtle)' }}>
            Built with <Heart size={14} color="#ef4444" fill="#ef4444" /> for farming communities.
          </div>
        </div>
      </div>
    </footer>
  );
}
