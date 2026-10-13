import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Clock,
  User,
  Trash2,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Forum() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [error, setError] = useState('');

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Ask an Expert',
    body: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page);
      params.append('limit', 15);

      const res = await api.get(`/posts?${params.toString()}`);
      setPosts(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to post in the community forum.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/posts', newPost);
      setShowCreateModal(false);
      setNewPost({ title: '', category: 'Ask an Expert', body: '' });
      setPage(1);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('forumTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('forumSubtitle')}</p>
        </div>

        <button
          id="create-post-btn"
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>{t('createPost')}</span>
        </button>
      </div>

      {/* Filter and Categories */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['all', 'Ask an Expert', 'Crops', 'Soil', 'Pests', 'Market'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setPage(1);
                }}
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                {cat === 'all' ? 'All Threads' : cat === 'Ask an Expert' ? '⭐ Ask an Expert' : cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="forum-search-input"
              type="text"
              className="form-control"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '220px' }}
            />
            <button id="forum-search-btn" type="submit" className="btn btn-secondary btn-sm">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="spinner"></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <MessageSquare size={36} />
          </div>
          <h3>No Discussions in this Category</h3>
          <p>Be the first to ask a question or share advice with the farming community!</p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Start a Discussion</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => {
            const isAuthor = user && post.author?._id === user._id;
            const canDelete = isAuthor || isAdmin;
            const isExpertCategory = post.category === 'Ask an Expert';

            return (
              <Link
                key={post._id}
                to={`/forum/${post._id}`}
                className="card"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '1.5rem',
                  borderLeft: isExpertCategory ? '4px solid #7c3aed' : '4px solid var(--primary-600)',
                  background: isExpertCategory ? 'linear-gradient(to right, #faf5ff, #ffffff)' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className={`badge ${
                        isExpertCategory ? 'badge-neutral' : 'badge-info'
                      }`}
                      style={{
                        background: isExpertCategory ? '#f3e8ff' : '#eff6ff',
                        color: isExpertCategory ? '#6b21a8' : '#1e40af'
                      }}
                    >
                      {post.category}
                    </span>

                    {isExpertCategory && (
                      <span className="badge badge-warning" style={{ fontSize: '0.725rem' }}>
                        ⭐ Priority Expert Review
                      </span>
                    )}

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      Posted by {post.author?.name || 'Farmer'} • {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {canDelete && (
                    <button
                      onClick={(e) => handleDeletePost(post._id, e)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.3rem 0.5rem', color: 'var(--danger-600)' }}
                      title="Delete Thread"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  {post.title}
                </h2>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.body}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-light)', paddingTop: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                    <MessageSquare size={16} />
                    <span>{post.replies?.length || 0} Replies</span>
                  </div>

                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Join Conversation</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>{t('createPost')}</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-post-cat">{t('postCategory')} *</label>
                <select
                  id="new-post-cat"
                  className="form-select"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  required
                >
                  <option value="Ask an Expert">Ask an Expert (Agronomist / Scientist)</option>
                  <option value="Crops">Crops & Varieties</option>
                  <option value="Soil">Soil & Fertilizers</option>
                  <option value="Pests">Pests & Diseases</option>
                  <option value="Market">Market & Mandi Trends</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-post-title">{t('postTitle')} *</label>
                <input
                  id="new-post-title"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Best bio-control spray for pink bollworm in cotton?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-post-body">{t('postBody')} *</label>
                <textarea
                  id="new-post-body"
                  rows="5"
                  className="form-control"
                  placeholder="Explain symptoms, crop age, weather conditions, or any previous applications..."
                  value={newPost.body}
                  onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  {t('cancel')}
                </button>
                <button id="submit-post-btn" type="submit" className="btn btn-primary" disabled={submitting}>
                  <span>{submitting ? 'Publishing...' : 'Publish Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
