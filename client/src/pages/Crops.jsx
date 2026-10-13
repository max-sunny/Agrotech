import React, { useState, useEffect } from 'react';
import {
  Wheat,
  Plus,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  Activity,
  CheckCircle2,
  Clock,
  Filter,
  Check
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function Crops() {
  const { t } = useLanguage();

  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedFarmFilter, setSelectedFarmFilter] = useState('all');

  // Add/Edit Crop Modal
  const [showCropModal, setShowCropModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropForm, setCropForm] = useState({
    farmId: '',
    name: '',
    variety: '',
    sowingDate: '',
    expectedHarvest: '',
    status: 'sown'
  });

  // Log Activity Modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activeCropForLog, setActiveCropForLog] = useState(null);
  const [activityForm, setActivityForm] = useState({
    type: 'irrigation',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropsRes, farmsRes] = await Promise.all([
        api.get('/crops'),
        api.get('/farms')
      ]);
      setCrops(cropsRes.data.data || []);
      const farmList = farmsRes.data.data || [];
      setFarms(farmList);
      if (farmList.length > 0 && !cropForm.farmId) {
        setCropForm((prev) => ({ ...prev, farmId: farmList[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddCrop = () => {
    if (farms.length === 0) {
      setError('Please add a farm first before adding crops.');
      return;
    }
    setEditingCrop(null);
    setCropForm({
      farmId: farms[0]._id,
      name: '',
      variety: '',
      sowingDate: new Date().toISOString().split('T')[0],
      expectedHarvest: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      status: 'sown'
    });
    setShowCropModal(true);
  };

  const handleOpenEditCrop = (crop) => {
    setEditingCrop(crop);
    setCropForm({
      farmId: crop.farm?._id || crop.farm,
      name: crop.name,
      variety: crop.variety || '',
      sowingDate: crop.sowingDate ? new Date(crop.sowingDate).toISOString().split('T')[0] : '',
      expectedHarvest: crop.expectedHarvest ? new Date(crop.expectedHarvest).toISOString().split('T')[0] : '',
      status: crop.status || 'sown'
    });
    setShowCropModal(true);
  };

  const handleCropSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingCrop) {
        await api.put(`/crops/${editingCrop._id}`, cropForm);
        setSuccessMsg('Crop updated successfully!');
      } else {
        await api.post(`/crops/farm/${cropForm.farmId}`, cropForm);
        setSuccessMsg('New crop registered successfully!');
      }
      setShowCropModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save crop');
    }
  };

  const handleDeleteCrop = async (id) => {
    try {
      await api.delete(`/crops/${id}`);
      setDeletingId(null);
      setSuccessMsg('Crop deleted successfully');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete crop');
    }
  };

  const handleOpenActivityModal = (crop) => {
    setActiveCropForLog(crop);
    setActivityForm({
      type: 'irrigation',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowActivityModal(true);
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activeCropForLog) return;

    try {
      await api.post(`/crops/${activeCropForLog._id}/activities`, activityForm);
      setSuccessMsg(`Activity logged for ${activeCropForLog.name}!`);
      setShowActivityModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log activity');
    }
  };

  const filteredCrops = selectedFarmFilter === 'all'
    ? crops
    : crops.filter((c) => (c.farm?._id || c.farm) === selectedFarmFilter);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('cropsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('cropsSubtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Farm filter */}
          {farms.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <Filter size={16} color="var(--text-subtle)" />
              <select
                value={selectedFarmFilter}
                onChange={(e) => setSelectedFarmFilter(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: '0.875rem', outline: 'none' }}
              >
                <option value="all">All Farms ({crops.length})</option>
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          <button id="add-crop-btn" onClick={handleOpenAddCrop} className="btn btn-primary">
            <Plus size={18} />
            <span>{t('addCrop')}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert-box alert-success" role="status">
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert-box alert-danger" role="alert">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : filteredCrops.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Wheat size={36} />
          </div>
          <h3>{t('noCrops')}</h3>
          <p>Add your first crop to plan sowing cycles, monitor expected harvest date, and record field activities.</p>
          <button onClick={handleOpenAddCrop} className="btn btn-primary">
            <Plus size={18} />
            <span>{t('addCrop')}</span>
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {filteredCrops.map((crop) => (
            <div key={crop._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{crop.name}</h3>
                    <span
                      className={`badge ${
                        crop.status === 'growing'
                          ? 'badge-success'
                          : crop.status === 'sown'
                          ? 'badge-info'
                          : crop.status === 'harvested'
                          ? 'badge-neutral'
                          : 'badge-warning'
                      }`}
                    >
                      {crop.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Farm: <strong>{crop.farm?.name || 'Local Farm'}</strong> | Variety: <em>{crop.variety || 'Standard'}</em>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => handleOpenEditCrop(crop)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem' }}
                    title={t('edit')}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingId(crop._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem', color: 'var(--danger-600)' }}
                    title={t('delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Dates Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--primary-600)" />
                  <div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Sown Date</div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--earth-600)" />
                  <div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Est. Harvest</div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {crop.expectedHarvest ? new Date(crop.expectedHarvest).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities section (CROP-3) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Activity Logs ({crop.activityLogs?.length || 0})
                  </h4>
                  <button
                    onClick={() => handleOpenActivityModal(crop)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.775rem', padding: '0.2rem 0.5rem' }}
                  >
                    <PlusCircle size={14} />
                    <span>Log Activity</span>
                  </button>
                </div>

                {crop.activityLogs && crop.activityLogs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '130px', overflowY: 'auto' }}>
                    {crop.activityLogs.slice(0, 3).map((act, i) => (
                      <div
                        key={act._id || i}
                        style={{
                          fontSize: '0.825rem',
                          padding: '0.4rem 0.6rem',
                          background: '#ffffff',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}
                      >
                        <div>
                          <strong style={{ textTransform: 'capitalize', color: 'var(--primary-800)' }}>
                            {act.type}:
                          </strong>{' '}
                          <span>{act.notes || 'Routine maintenance'}</span>
                        </div>
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {new Date(act.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                    No field activities logged yet.
                  </div>
                )}
              </div>

              {/* Soil Health Status summary */}
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem' }}>
                  Soil Tests:{' '}
                  <strong>{crop.soilReports?.length || 0}</strong>
                </div>
                <a
                  href="/soil"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                >
                  <Activity size={14} />
                  <span>Test Soil</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Crop Modal */}
      {showCropModal && (
        <div className="modal-overlay" onClick={() => setShowCropModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>
                {editingCrop ? 'Edit Crop Details' : t('addCrop')}
              </h2>
              <button onClick={() => setShowCropModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCropSubmit}>
              {!editingCrop && (
                <div className="form-group">
                  <label className="form-label" htmlFor="crop-farm-select">Assigned Farm *</label>
                  <select
                    id="crop-farm-select"
                    className="form-select"
                    value={cropForm.farmId}
                    onChange={(e) => setCropForm({ ...cropForm, farmId: e.target.value })}
                    required
                  >
                    {farms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="crop-name-input">{t('cropName')} *</label>
                <input
                  id="crop-name-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Wheat, Sugarcane, Cotton"
                  value={cropForm.name}
                  onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="crop-variety-input">{t('variety')}</label>
                <input
                  id="crop-variety-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sharbati / HD-2967"
                  value={cropForm.variety}
                  onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="crop-sowing-input">{t('sowingDate')} *</label>
                  <input
                    id="crop-sowing-input"
                    type="date"
                    className="form-control"
                    value={cropForm.sowingDate}
                    onChange={(e) => setCropForm({ ...cropForm, sowingDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="crop-harvest-input">{t('expectedHarvest')} *</label>
                  <input
                    id="crop-harvest-input"
                    type="date"
                    className="form-control"
                    value={cropForm.expectedHarvest}
                    onChange={(e) => setCropForm({ ...cropForm, expectedHarvest: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="crop-status-select">Crop Status *</label>
                <select
                  id="crop-status-select"
                  className="form-select"
                  value={cropForm.status}
                  onChange={(e) => setCropForm({ ...cropForm, status: e.target.value })}
                >
                  <option value="planned">Planned (नियोजित)</option>
                  <option value="sown">Sown (बोई गई)</option>
                  <option value="growing">Growing (बढ़ रही है)</option>
                  <option value="harvested">Harvested (कटाई पूरी)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCropModal(false)} className="btn btn-secondary">
                  {t('cancel')}
                </button>
                <button id="save-crop-btn" type="submit" className="btn btn-primary">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Activity Modal (CROP-3) */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>
                Log Activity for {activeCropForLog?.name}
              </h2>
              <button onClick={() => setShowActivityModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleActivitySubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="activity-type-select">{t('activityType')} *</label>
                <select
                  id="activity-type-select"
                  className="form-select"
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  required
                >
                  <option value="irrigation">Irrigation (सिंचाई)</option>
                  <option value="fertilizing">Fertilizing (उर्वरक अनुप्रयोग)</option>
                  <option value="spraying">Spraying (कीटनाशक छिड़काव)</option>
                  <option value="weeding">Weeding (निराई-गुड़ाई)</option>
                  <option value="harvesting">Harvesting (कटाई)</option>
                  <option value="other">Other Field Work</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="activity-date-input">{t('date')} *</label>
                <input
                  id="activity-date-input"
                  type="date"
                  className="form-control"
                  value={activityForm.date}
                  onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="activity-notes-input">{t('notes')}</label>
                <textarea
                  id="activity-notes-input"
                  rows="3"
                  className="form-control"
                  placeholder="e.g. Applied 25kg Urea; Drip running for 2.5 hours"
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowActivityModal(false)} className="btn btn-secondary">
                  {t('cancel')}
                </button>
                <button id="save-activity-btn" type="submit" className="btn btn-primary">
                  Record Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Crop Modal */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--danger-600)' }}>
              Confirm Crop Deletion
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Are you sure you want to remove this crop record and all its associated soil reports and activity logs?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary">
                {t('cancel')}
              </button>
              <button
                id="confirm-delete-crop-btn"
                onClick={() => handleDeleteCrop(deletingId)}
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
