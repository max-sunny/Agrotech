import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Droplets,
  Layers,
  AlertCircle,
  Wheat,
  Activity,
  Check
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function Farms() {
  const { t } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    areaInAcres: '',
    soilType: 'Loamy',
    waterSource: 'Borewell'
  });

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farms');
      setFarms(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      location: '',
      areaInAcres: '',
      soilType: 'Loamy',
      waterSource: 'Borewell'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      location: farm.location,
      areaInAcres: farm.areaInAcres,
      soilType: farm.soilType,
      waterSource: farm.waterSource
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (editingFarm) {
        await api.put(`/farms/${editingFarm._id}`, formData);
        setSuccessMsg('Farm updated successfully!');
      } else {
        await api.post('/farms', formData);
        setSuccessMsg('New farm added successfully!');
      }
      setShowModal(false);
      fetchFarms();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/farms/${id}`);
      setDeletingId(null);
      setSuccessMsg('Farm deleted successfully!');
      fetchFarms();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete farm');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('farmsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('farmsSubtitle')}</p>
        </div>

        <button id="add-farm-btn" onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>{t('addFarm')}</span>
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
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : farms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <MapPin size={36} />
          </div>
          <h3>{t('noFarms')}</h3>
          <p>Add your farm plot acreage, water supply, and soil class to begin tracking agronomic parameters.</p>
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={18} />
            <span>{t('addFarm')}</span>
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {farms.map((farm) => (
            <div key={farm._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{farm.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <MapPin size={16} color="var(--primary-600)" />
                    <span>{farm.location}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => handleOpenEditModal(farm)}
                    className="btn btn-secondary btn-sm"
                    title={t('edit')}
                    style={{ padding: '0.4rem' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingId(farm._id)}
                    className="btn btn-secondary btn-sm"
                    title={t('delete')}
                    style={{ padding: '0.4rem', color: 'var(--danger-600)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.85rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Acreage</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-800)' }}>
                    {farm.areaInAcres} Acres
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Soil Type</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {farm.soilType}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Water Source</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--info-600)' }}>
                    <Droplets size={16} />
                    <span>{farm.waterSource}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                <a href="/crops" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Wheat size={16} />
                  <span>View Farm Crops</span>
                </a>
                <a href="/soil" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Activity size={16} />
                  <span>Soil Tests</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>
                {editingFarm ? 'Edit Farm Plot' : t('addFarm')}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="farm-name-input">{t('farmName')} *</label>
                <input
                  id="farm-name-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sahyadri Organic Orchards"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="farm-location-input">{t('location')} *</label>
                <input
                  id="farm-location-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Pune / Baramati"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="farm-area-input">{t('areaInAcres')} *</label>
                <input
                  id="farm-area-input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-control"
                  placeholder="e.g. 5.5"
                  value={formData.areaInAcres}
                  onChange={(e) => setFormData({ ...formData, areaInAcres: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="farm-soil-input">{t('soilType')}</label>
                  <select
                    id="farm-soil-input"
                    className="form-select"
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  >
                    <option value="Loamy">Loamy (दोमट)</option>
                    <option value="Black">Black Soil (काली मिट्टी)</option>
                    <option value="Alluvial">Alluvial (जलोढ़)</option>
                    <option value="Red">Red Soil (लाल मिट्टी)</option>
                    <option value="Sandy">Sandy (बलुई)</option>
                    <option value="Clay">Clay (चिकनी मिट्टी)</option>
                    <option value="Laterite">Laterite (लैटेराइट)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="farm-water-input">{t('waterSource')}</label>
                  <select
                    id="farm-water-input"
                    className="form-select"
                    value={formData.waterSource}
                    onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
                  >
                    <option value="Borewell">Borewell (नलकूप / बोरवेल)</option>
                    <option value="Drip Irrigation">Drip Irrigation (ठिबक)</option>
                    <option value="Canal">Canal (नहर / कालवा)</option>
                    <option value="Rainfed">Rainfed (वर्षा आधारित)</option>
                    <option value="River">River (नदी)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  {t('cancel')}
                </button>
                <button id="save-farm-btn" type="submit" className="btn btn-primary">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (PRD FARM-3: with confirmation) */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--danger-600)' }}>
              Confirm Farm Deletion
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this farm? This action will permanently remove all associated crops, soil test history, and activity logs.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary">
                {t('cancel')}
              </button>
              <button
                id="confirm-delete-farm-btn"
                onClick={() => handleDelete(deletingId)}
                className="btn btn-danger"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
