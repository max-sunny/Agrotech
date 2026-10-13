import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare,
  ArrowLeft,
  Trash2,
  Send,
  User,
  ShieldCheck,
  AlertCircle,
  Clock
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [post, setPost] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState('');

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts/${id}`);
      setPost(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!replyBody.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await api.post(`/posts/${id}/replies`, { body: replyBody.trim() });
      setPost(res.data.data);
      setReplyBody('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this entire discussion thread?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/forum');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await api.delete(`/posts/${id}/replies/${replyId}`);
      fetchPost();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete reply');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="alert-box alert-danger">
          <AlertCircle size={20} />
          <span>{error || 'Post not found'}</span>
        </div>
        <Link to="/forum" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Forum</span>
        </Link>
      </div>
    );
  }

  const isPostAuthor = user && post.author?._id === user._id;
  const canDeletePost = isPostAuthor || isAdmin;

  return (
    <div className="container" style={{ maxWidth: '840px', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Link to="/forum" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Back to Discussions</span>
      </Link>

      {/* Main Post Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-info">{post.category}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
              Posted by <strong>{post.author?.name || 'Farmer'}</strong> ({post.author?.role}) on {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          {canDeletePost && (
            <button
              onClick={handleDeletePost}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger-600)' }}
              title="Delete Post"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', lineHeight: 1.3 }}>
          {post.title}
        </h1>

        <div style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {post.body}
        </div>
      </div>

      {/* Replies Thread */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="var(--primary-600)" />
          <span>Community & Expert Responses ({post.replies?.length || 0})</span>
        </h2>

        {post.replies && post.replies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {post.replies.map((reply) => {
              const isReplyAdmin = reply.author?.role === 'admin';
              const canDeleteReply = (user && reply.author?._id === user._id) || isAdmin;

              return (
                <div
                  key={reply._id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    background: isReplyAdmin ? '#f0fdf4' : '#ffffff',
                    borderLeft: isReplyAdmin ? '4px solid var(--primary-600)' : '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>
                        {reply.author?.name || 'Farmer'}
                      </span>

                      {isReplyAdmin && (
                        <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                          <ShieldCheck size={12} />
                          <span>Agri Expert / Officer</span>
                        </span>
                      )}

                      <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                        • {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {canDeleteReply && (
                      <button
                        onClick={() => handleDeleteReply(reply._id)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--danger-600)', cursor: 'pointer', padding: '0.2rem' }}
                        title="Delete Reply"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {reply.body}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No responses yet. Be the first to share your knowledge!</p>
          </div>
        )}
      </div>

      {/* Add Reply Form */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Write a Response</h3>

        {isAuthenticated ? (
          <form onSubmit={handleAddReply}>
            <div className="form-group">
              <textarea
                rows="4"
                className="form-control"
                placeholder="Share your agronomic advice, solution, or experience..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                id="submit-reply-btn"
                type="submit"
                className="btn btn-primary"
                disabled={submittingReply}
              >
                <Send size={16} />
                <span>{submittingReply ? 'Posting...' : 'Post Reply'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              You must be signed in to post a reply.
            </p>
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In to Reply
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
