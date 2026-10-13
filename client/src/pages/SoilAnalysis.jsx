import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Printer,
  TrendingUp,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Check
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function SoilAnalysis() {
  const { t } = useLanguage();

  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [soilReports, setSoilReports] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [soilForm, setSoilForm] = useState({
    pH: '6.5',
    nitrogen: '320',
    phosphorus: '40',
    potassium: '220',
    moisture: '55'
  });

  const fetchCropsAndData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/crops');
      const cropList = res.data.data || [];
      setCrops(cropList);

      if (cropList.length > 0) {
        const cropToUse = selectedCropId || cropList[0]._id;
        setSelectedCropId(cropToUse);
        await fetchCropSoilHistory(cropToUse);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  };

  const fetchCropSoilHistory = async (cropId) => {
    try {
      const res = await api.get(`/soil/crop/${cropId}`);
      const reports = res.data.data?.reports || [];
      setSoilReports(reports);
      if (reports.length > 0) {
        setLatestReport(reports[0]);
      } else {
        setLatestReport(null);
      }
    } catch (err) {
      console.warn('No existing reports for crop');
      setSoilReports([]);
      setLatestReport(null);
    }
  };

  useEffect(() => {
    fetchCropsAndData();
  }, []);

  const handleCropChange = async (e) => {
    const id = e.target.value;
    setSelectedCropId(id);
    await fetchCropSoilHistory(id);
  };

  const handlePreset = (type) => {
    if (type === 'optimal') {
      setSoilForm({ pH: '6.8', nitrogen: '380', phosphorus: '45', potassium: '250', moisture: '55' });
    } else if (type === 'acidic') {
      setSoilForm({ pH: '5.2', nitrogen: '190', phosphorus: '18', potassium: '110', moisture: '30' });
    } else if (type === 'alkaline') {
      setSoilForm({ pH: '8.2', nitrogen: '520', phosphorus: '65', potassium: '380', moisture: '75' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCropId) {
      setError('Please select a crop to link this soil test.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await api.post(`/soil/crop/${selectedCropId}`, soilForm);
      const { report, breakdown: newBreakdown } = res.data.data;
      setLatestReport(report);
      setBreakdown(newBreakdown);
      setSuccessMsg('Soil health analysis computed successfully!');
      await fetchCropSoilHistory(selectedCropId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze soil test');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a'; // Green
    if (score >= 60) return '#2563eb'; // Blue
    if (score >= 40) return '#d97706'; // Amber
    return '#dc2626'; // Red
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Title & Print Button */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('soilTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('soilSubtitle')}</p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn btn-secondary btn-sm"
          title="Print Diagnostic Report (SOIL-5)"
        >
          <Printer size={16} />
          <span>Print Diagnostic Report</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert-box alert-success" role="status">
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert-box alert-danger" role="alert">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : crops.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Activity size={36} />
          </div>
          <h3>No Crops Registered Yet</h3>
          <p>Soil tests must be linked to a crop. Please register a crop plot first.</p>
          <a href="/crops" className="btn btn-primary">
            <span>Register a Crop</span>
            <ArrowRight size={16} />
          </a>
        </div>
      ) : (
        <div className="grid-2">
          {/* Left Column: Soil Test Input Form */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Enter Soil Test Parameters</h2>
              {/* Presets */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handlePreset('optimal')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  Optimal
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('acidic')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  Acidic/Low N
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('alkaline')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  Alkaline
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="soil-crop-select">Selected Crop Plot *</label>
                <select
                  id="soil-crop-select"
                  className="form-select"
                  value={selectedCropId}
                  onChange={handleCropChange}
                  required
                >
                  {crops.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.farm?.name || 'Local Farm'})
                    </option>
                  ))}
                </select>
              </div>

              {/* pH Level */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="form-label" htmlFor="soil-ph">{t('phLabel')} *</label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Ideal: 6.0 - 7.5</span>
                </div>
                <input
                  id="soil-ph"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  className="form-control"
                  value={soilForm.pH}
                  onChange={(e) => setSoilForm({ ...soilForm, pH: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Nitrogen */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" htmlFor="soil-n">Nitrogen (N) *</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>280-560 kg/ha</span>
                  </div>
                  <input
                    id="soil-n"
                    type="number"
                    step="1"
                    min="0"
                    className="form-control"
                    value={soilForm.nitrogen}
                    onChange={(e) => setSoilForm({ ...soilForm, nitrogen: e.target.value })}
                    required
                  />
                </div>

                {/* Phosphorus */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" htmlFor="soil-p">Phosphorus (P) *</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>25-60 kg/ha</span>
                  </div>
                  <input
                    id="soil-p"
                    type="number"
                    step="1"
                    min="0"
                    className="form-control"
                    value={soilForm.phosphorus}
                    onChange={(e) => setSoilForm({ ...soilForm, phosphorus: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Potassium */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" htmlFor="soil-k">Potassium (K) *</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>150-350 kg/ha</span>
                  </div>
                  <input
                    id="soil-k"
                    type="number"
                    step="1"
                    min="0"
                    className="form-control"
                    value={soilForm.potassium}
                    onChange={(e) => setSoilForm({ ...soilForm, potassium: e.target.value })}
                    required
                  />
                </div>

                {/* Moisture */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" htmlFor="soil-m">{t('moistureLabel')} *</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>40 - 70%</span>
                  </div>
                  <input
                    id="soil-m"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    className="form-control"
                    value={soilForm.moisture}
                    onChange={(e) => setSoilForm({ ...soilForm, moisture: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                id="submit-soil-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={submitting}
              >
                <Activity size={18} />
                <span>{submitting ? 'Computing Score...' : 'Calculate Soil Health Score'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Score & Diagnostic Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {latestReport ? (
              <div className="card" style={{ borderTop: `4px solid ${getScoreColor(latestReport.score)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.25rem' }}>Diagnostic Health Score</h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                    {new Date(latestReport.date).toLocaleDateString()}
                  </span>
                </div>

                {/* Circular Score Gauge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      background: `conic-gradient(${getScoreColor(latestReport.score)} ${latestReport.score * 3.6}deg, #e2e8f0 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: getScoreColor(latestReport.score)
                      }}
                    >
                      {latestReport.score}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                      Overall Health
                    </div>
                    <h3 style={{ fontSize: '1.4rem', textTransform: 'capitalize', color: getScoreColor(latestReport.score) }}>
                      {latestReport.rating} Condition
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      pH: {latestReport.pH} | N: {latestReport.nitrogen} | P: {latestReport.phosphorus} | K: {latestReport.potassium} | Moisture: {latestReport.moisture}%
                    </div>
                  </div>
                </div>

                {/* Plain-Language Recommendations (SOIL-3) */}
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={18} color="var(--primary-600)" />
                    <span>Actionable Agronomic Advice:</span>
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {latestReport.recommendations?.map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'var(--primary-50)',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: '3px solid var(--primary-600)',
                          fontSize: '0.9rem',
                          color: 'var(--primary-950)'
                        }}
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <Activity size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Soil Test Logged for Selected Crop</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Submit the test values on the left to generate the instant health score and recommendations.
                </p>
              </div>
            )}

            {/* Historical Trend List (SOIL-4) */}
            {soilReports.length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={18} color="var(--primary-700)" />
                    <h3 style={{ fontSize: '1.1rem' }}>Historical Test Record ({soilReports.length})</h3>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Score</th>
                        <th>pH</th>
                        <th>N-P-K</th>
                        <th>Moisture</th>
                      </tr>
                    </thead>
                    <tbody>
                      {soilReports.map((r, i) => (
                        <tr key={r._id || i}>
                          <td style={{ fontSize: '0.85rem' }}>{new Date(r.date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: r.score >= 80 ? '#dcfce7' : r.score >= 60 ? '#dbeafe' : '#fef3c7',
                                color: getScoreColor(r.score)
                              }}
                            >
                              {r.score}/100
                            </span>
                          </td>
                          <td>{r.pH}</td>
                          <td>{r.nitrogen}-{r.phosphorus}-{r.potassium}</td>
                          <td>{r.moisture}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
