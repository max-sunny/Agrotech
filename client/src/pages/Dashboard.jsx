import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Wheat,
  Activity,
  CloudSun,
  ShieldAlert,
  PlusCircle,
  ArrowRight,
  Droplets,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [farmsRes, cropsRes, alertsRes] = await Promise.all([
          api.get('/farms'),
          api.get('/crops'),
          api.get('/weather/alerts')
        ]);

        const farmList = farmsRes.data.data || [];
        setFarms(farmList);
        setCrops(cropsRes.data.data || []);
        setAlerts(alertsRes.data.data || []);

        // Fetch weather for first farm location or default
        const locationQuery = farmList.length > 0 ? farmList[0].location : 'Pune';
        const weatherRes = await api.get(`/weather?location=${encodeURIComponent(locationQuery)}`);
        setWeather(weatherRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Calculate stats
  const totalAcreage = farms.reduce((acc, f) => acc + (f.areaInAcres || 0), 0);
  const activeCrops = crops.filter((c) => c.status === 'sown' || c.status === 'growing');
  
  // Find latest soil report
  let latestReport = null;
  for (const crop of crops) {
    if (crop.soilReports && crop.soilReports.length > 0) {
      const sorted = [...crop.soilReports].sort((a, b) => new Date(b.date) - new Date(a.date));
      if (!latestReport || new Date(sorted[0].date) > new Date(latestReport.date)) {
        latestReport = { ...sorted[0], cropName: crop.name };
      }
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Welcome Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Namaste, {user?.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Farm Health & Operations Command Center | {farms.length} Farm Plots Managed
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/farms" className="btn btn-secondary btn-sm">
            <PlusCircle size={16} />
            <span>{t('addFarm')}</span>
          </Link>
          <Link to="/soil" className="btn btn-primary btn-sm">
            <Activity size={16} />
            <span>{t('submitSoilTest')}</span>
          </Link>
        </div>
      </div>

      {/* Critical Pest Warning Banner (PEST-2) */}
      {alerts.length > 0 && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            borderColor: '#fde68a',
            marginBottom: '2rem',
            padding: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: '#f59e0b', color: '#ffffff', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#92400e' }}>
                  {alerts[0].title}
                </h3>
                <span className={`badge ${alerts[0].severity === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                  {alerts[0].severity} risk
                </span>
              </div>
              <p style={{ color: '#78350f', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {alerts[0].description}
              </p>
              <div style={{ fontSize: '0.85rem', color: '#92400e', background: 'rgba(255, 255, 255, 0.6)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <strong>Agronomic Action:</strong> {alerts[0].recommendedAction}
              </div>
            </div>
            <Link to="/weather" className="btn btn-outline btn-sm" style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>
              <span>All Alerts</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        {/* Total Acreage */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Land</h4>
            <div className="stat-value">{totalAcreage.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Acres</span></div>
          </div>
        </div>

        {/* Active Crops */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">
            <Wheat size={24} />
          </div>
          <div className="stat-info">
            <h4>Active Crops</h4>
            <div className="stat-value">{activeCrops.length} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Crops</span></div>
          </div>
        </div>

        {/* Latest Soil Score */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h4>Soil Score</h4>
            <div className="stat-value">
              {latestReport ? `${latestReport.score}/100` : '--'}
              {latestReport && (
                <span
                  className="badge badge-success"
                  style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}
                >
                  {latestReport.rating}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Local Temperature */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <CloudSun size={24} />
          </div>
          <div className="stat-info">
            <h4>Current Climate</h4>
            <div className="stat-value">
              {weather ? `${weather.temperature}°C` : '--'}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-subtle)', display: 'block' }}>
                {weather?.displayName || 'Local'} ({weather?.humidity}% RH)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid-2">
        {/* Left Column: Registered Farms & Crops */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Farms Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} color="var(--primary-700)" />
                <h3 style={{ fontSize: '1.2rem' }}>{t('myFarms')}</h3>
              </div>
              <Link to="/farms" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                View All ({farms.length}) →
              </Link>
            </div>

            {farms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('noFarms')}</p>
                <Link to="/farms" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                  <PlusCircle size={14} />
                  <span>{t('addFarm')}</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {farms.slice(0, 3).map((farm) => (
                  <div
                    key={farm._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{farm.name}</h4>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        <span>📍 {farm.location}</span>
                        <span>📐 {farm.areaInAcres} Acres</span>
                        <span>💧 {farm.waterSource}</span>
                      </div>
                    </div>
                    <Link to={`/farms`} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Crops Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wheat size={20} color="var(--earth-600)" />
                <h3 style={{ fontSize: '1.2rem' }}>{t('crops')}</h3>
              </div>
              <Link to="/crops" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Manage Crops ({crops.length}) →
              </Link>
            </div>

            {crops.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('noCrops')}</p>
                <Link to="/crops" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                  <PlusCircle size={14} />
                  <span>{t('addCrop')}</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {crops.slice(0, 3).map((crop) => (
                  <div
                    key={crop._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1rem' }}>{crop.name}</h4>
                        <span className={`badge ${crop.status === 'growing' ? 'badge-success' : 'badge-neutral'}`}>
                          {crop.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Variety: {crop.variety || 'N/A'} | Sown: {new Date(crop.sowingDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Link to="/crops" className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Soil Insights & Weather Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Latest Soil Assessment Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.2rem' }}>{t('soilScore')}</h3>
              </div>
              <Link to="/soil" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Test History →
              </Link>
            </div>

            {latestReport ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', padding: '1rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800
                    }}
                  >
                    {latestReport.score}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{latestReport.cropName}</h4>
                    <span className="badge badge-success">Rating: {latestReport.rating}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                      Tested on {new Date(latestReport.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <h5 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Key Recommendations:</h5>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {latestReport.recommendations?.slice(0, 2).map((rec, i) => (
                    <li key={i} style={{ marginBottom: '0.35rem' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No soil tests logged yet.</p>
                <Link to="/soil" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                  <Activity size={14} />
                  <span>Run Soil Health Test</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Weather Forecast Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CloudSun size={20} color="var(--earth-500)" />
                <h3 style={{ fontSize: '1.2rem' }}>{weather?.displayName || 'Local'} Forecast</h3>
              </div>
              <Link to="/weather" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Detailed Weather →
              </Link>
            </div>

            {weather && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Temp</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{weather.temperature}°C</div>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Humidity</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{weather.humidity}%</div>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Rainfall</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{weather.rainfall} mm</div>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Wind</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{weather.windSpeed} km/h</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Condition: <strong>{weather.condition}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
