import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  ShieldAlert,
  AlertTriangle,
  Search,
  CheckCircle2,
  Calendar,
  Thermometer,
  Layers
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function Weather() {
  const { t } = useLanguage();

  const [locationInput, setLocationInput] = useState('Pune');
  const [currentLocation, setCurrentLocation] = useState('Pune');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (loc) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/weather?location=${encodeURIComponent(loc)}`);
      setWeatherData(res.data.data);
      setCurrentLocation(loc);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch meteorological data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Pune');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      fetchWeather(locationInput.trim());
    }
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'high') return 'badge-danger';
    if (severity === 'medium') return 'badge-warning';
    return 'badge-info';
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Page Title & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('weatherTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('weatherSubtitle')}</p>
        </div>

        {/* Location Search Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id="weather-search-input"
            type="text"
            className="form-control"
            placeholder="Search district / city..."
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            style={{ width: '220px' }}
          />
          <button id="weather-search-btn" type="submit" className="btn btn-primary btn-sm">
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Quick City Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Quick Locations:</span>
        {['Pune', 'Nashik', 'Kolhapur', 'Nagpur', 'Aurangabad', 'Solapur'].map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => {
              setLocationInput(city);
              fetchWeather(city);
            }}
            className={`btn btn-sm ${currentLocation.toLowerCase() === city.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
          >
            {city}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert-box alert-danger" role="alert">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : weatherData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Current Weather Banner */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
              color: '#ffffff',
              padding: '2.5rem 2rem'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                  <CloudSun size={20} />
                  <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {weatherData.displayName || weatherData.location} Agricultural Zone
                  </span>
                </div>
                <div style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1 }}>
                  {weatherData.temperature}°C
                </div>
                <div style={{ fontSize: '1.2rem', marginTop: '0.5rem', opacity: 0.95, textTransform: 'capitalize' }}>
                  {weatherData.condition}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.25rem' }}>
                  Recorded at {new Date(weatherData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Climate Telemetry Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <Droplets size={22} style={{ margin: '0 auto 0.25rem' }} />
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Humidity</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{weatherData.humidity}%</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <CloudRain size={22} style={{ margin: '0 auto 0.25rem' }} />
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Precipitation</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{weatherData.rainfall} mm</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <Wind size={22} style={{ margin: '0 auto 0.25rem' }} />
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Wind Velocity</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{weatherData.windSpeed} km/h</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Agro-Meteorological Forecast (WTH-2) */}
          <div className="card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--primary-600)" />
              <span>{t('forecast5Day')}</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {weatherData.forecast?.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.25rem 1rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>

                  <div style={{ color: 'var(--primary-600)', margin: '0.25rem 0' }}>
                    {day.rainfall > 3 ? <CloudRain size={32} /> : <Sun size={32} color="#d97706" />}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {day.condition}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '0.25rem' }}>
                    {day.tempMax}° / {day.tempMin}°C
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    💧 {day.humidity}% RH | 🌧️ {day.rainfall} mm
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Pest and Disease Warnings (PEST-1, PEST-2) */}
          <div className="card" style={{ borderTop: '4px solid #d97706' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={22} color="#d97706" />
                <h2 style={{ fontSize: '1.35rem' }}>{t('pestAlerts')}</h2>
              </div>
              <span className="badge badge-warning">Microclimate Rule Analysis</span>
            </div>

            {weatherData.pestAlert && weatherData.pestAlert.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {weatherData.pestAlert.map((alert, i) => (
                  <div
                    key={alert.id || i}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: alert.severity === 'high' ? 'var(--danger-50)' : alert.severity === 'medium' ? 'var(--warning-50)' : 'var(--primary-50)',
                      border: `1px solid ${alert.severity === 'high' ? '#fecaca' : alert.severity === 'medium' ? '#fde68a' : '#bbf7d0'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.1rem', color: alert.severity === 'high' ? '#991b1b' : alert.severity === 'medium' ? '#92400e' : '#14532d' }}>
                        {alert.title}
                      </h3>
                      <span className={`badge ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity} Risk
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '0.75rem' }}>
                      {alert.description}
                    </p>

                    <div style={{ padding: '0.65rem 0.9rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Recommended Agronomic Action: </strong>
                      <span style={{ color: 'var(--text-muted)' }}>{alert.recommendedAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} color="var(--primary-600)" style={{ margin: '0 auto 0.5rem' }} />
                <p>No high-risk pest warnings currently active for this region.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
