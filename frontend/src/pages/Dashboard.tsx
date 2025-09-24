import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/posts/CreatePost';
import './Dashboard.css';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  status?: 'pending' | 'approved';
}

interface Post {
  id: string;
  author: {
    name: string;
    title: string;
    avatar: string;
    company?: string;
  };
  title?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  image?: string;
  tags: string[];
  postType: 'general' | 'research' | 'publication' | 'event';
  doi?: string;
  journal?: string;
  status?: 'pending' | 'approved';
}

const researchDomains = [
  'Machine Learning', 'Natural Language Processing', 'Computer Vision',
  'Data Science', 'Artificial Intelligence', 'Robotics', 'Cybersecurity',
  'Software Engineering', 'Human-Computer Interaction', 'Quantum Computing'
];

const popularTags = [
  'machine-learning', 'AI', 'data-science', 'research', 'innovation',
  'deep-learning', 'neural-networks', 'algorithms', 'python', 'tensorflow',
  'computer-vision', 'nlp', 'blockchain', 'cybersecurity', 'quantum-computing'
];

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const currentUser = {
    name: user?.name ?? 'User',
    title: user?.title ?? 'Professional',
    avatar:
      'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
    company: '',
    role: user?.role ?? 'user',
  };

  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Additional states
  const [feedFilter, setFeedFilter] = useState<'all' | 'trending' | 'recent' | 'bookmarked'>('recent');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  const [commentMenuOpen, setCommentMenuOpen] = useState<{ postId: string; commentId: string } | null>(null);
  const [editingComment, setEditingComment] = useState<{ postId: string; commentId: string } | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch posts from backend API
  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const fetchedPosts: Post[] = await response.json();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [token]);

  const filteredPosts = posts
    .filter((post) => {
      if (feedFilter === 'bookmarked') {
        return bookmarkedPosts.includes(post.id);
      }
      if (currentUser.role !== 'admin' && post.status === 'pending') {
        return false;
      }
      if (domainFilter !== 'all') {
        const domainTag = domainFilter.toLowerCase().replace(/\s+/g, '-');
        return post.tags.some(
          (tag) =>
            tag.toLowerCase().includes(domainTag) ||
            tag.toLowerCase().includes(domainFilter.toLowerCase()) ||
            domainFilter.toLowerCase().includes(tag.toLowerCase())
        );
      }
      if (tagFilter) {
        return post.tags.some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()));
      }
      return true;
    })
    .sort((a, b) => {
      if (feedFilter === 'trending') {
        return (
          b.likes + b.shares + b.comments.length - (a.likes + a.shares + a.comments.length)
        );
      }
      return 0;
    });

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId: string) => {
    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(bookmarkedPosts.filter((id) => id !== postId));
    } else {
      setBookmarkedPosts([...bookmarkedPosts, postId]);
    }
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  // Receive new post data from CreatePost component
  const handleNewPost = (
    newPost: Omit<
      Post,
      'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'isLiked' | 'isBookmarked' | 'status'
    >
  ) => {
    const post: Post = {
      ...newPost,
      id: Date.now().toString(),
      timestamp: 'now',
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      status: 'pending',
    };
    setPosts([post, ...posts]);
  };

  // Other handlers omitted for brevity: handleComment, toggleComments, handleDeletePost, etc.

  const openEditPostModal = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setMenuOpenId(null);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId));
    setMenuOpenId(null);
  };

  const handleComment = (postId: string) => {
    const commentTextForPost = commentText[postId];
    if (commentTextForPost && commentTextForPost.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: currentUser.name,
        content: commentTextForPost,
        timestamp: 'now',
        avatar: currentUser.avatar,
        status: 'pending',
      };
      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return { ...post, comments: [...post.comments, newComment] };
          }
          return post;
        })
      );
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    }
  };

  const handleSaveEdit = () => {
    if (editingPost && editContent.trim()) {
      setPosts(posts.map((post) => (post.id === editingPost.id ? { ...post, content: editContent } : post)));
      setEditingPost(null);
    }
  };

  React.useEffect(() => {
    if (!modalImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalImage]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your feed...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        {/* User Profile Card */}
        <div className="profile-card">
          <img src={currentUser.avatar} alt={currentUser.name} className="dashboard-profile-avatar" />
          <h3>{currentUser.name}</h3>
          <p>{currentUser.title}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">234</span>
              <span className="stat-label">Connections</span>
            </div>
            <div className="stat">
              <span className="stat-number">1.2k</span>
              <span className="stat-label">Views</span>
            </div>
          </div>
          <button className="view-profile-btn" onClick={() => navigate('/profile')}>
            View Profile
          </button>
        </div>

        {/* Quick Links */}
        <div className="quick-links-card">
          <h4>Quick Links</h4>
          <ul>
            <li>My Publications</li>
            <li>Research Groups</li>
            <li>Upcoming Events</li>
            <li>Messages</li>
          </ul>
        </div>

        {/* Popular Tags */}
        <div className="popular-tags-card">
          <h4>Popular Research Tags</h4>
          <div className="tag-cloud">
            {popularTags.map((tag) => (
              <span
                key={tag}
                className={`tag ${tagFilter === tag ? 'active' : ''}`}
                onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="main-feed">
        {/* Feed Controls */}
        <div className="feed-controls">
          <div className="feed-filters">
            <button className={feedFilter === 'recent' ? 'active' : ''} onClick={() => setFeedFilter('recent')}>
              Recent
            </button>
            <button className={feedFilter === 'trending' ? 'active' : ''} onClick={() => setFeedFilter('trending')}>
              Trending
            </button>
            <button className={feedFilter === 'bookmarked' ? 'active' : ''} onClick={() => setFeedFilter('bookmarked')}>
              Bookmarked
            </button>
          </div>
          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="domain-filter">
            <option value="all">All Domains</option>
            {researchDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        {/* Create Post */}
        <CreatePost currentUser={currentUser} onPostCreated={handleNewPost} popularTags={popularTags} token={token!} />

        {/* Posts Feed */}
        <div className="posts-feed">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              {/* Render post content */}
              <div className="post-header">
                <img src={post.author.avatar} alt={post.author.name} className="post-author-avatar" />
                <div className="post-author-info">
                  <h4>{post.author.name}</h4>
                  <p>
                    {post.author.title}
                    {post.author.company && ` at ${post.author.company}`}
                  </p>
                  <span className="post-timestamp">{post.timestamp}</span>
                </div>

                <div className="post-actions-menu">
                  <button
                    className="bookmark-btn"
                    onClick={() => handleBookmark(post.id)}
                    style={{
                      color: bookmarkedPosts.includes(post.id) ? '#ffd700' : '#718096',
                      fontSize: '18px',
                    }}
                  />
                  <button className="post-menu" onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}>
                    ⋯
                  </button>
                  {menuOpenId === post.id && (
                    <div className="post-menu-dropdown">
                      <button className="dropdown-btn" onClick={() => openEditPostModal(post)}>
                        Edit
                      </button>
                      <button className="dropdown-btn" onClick={() => handleDeletePost(post.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="post-content">
                {post.title && <h3 className="post-title">{post.title}</h3>}
                <p>{post.content}</p>

                {post.status === 'pending' && <div className="pending-approval-banner">Your post is pending admin approval.</div>}

                {post.postType === 'research' && (post.doi || post.journal) && (
                  <div className="publication-info">
                    {post.journal && <span className="journal">📄 {post.journal}</span>}
                    {post.doi && <span className="doi">🔗 DOI: {post.doi}</span>}
                  </div>
                )}

                {post.image && (
                  <div className="post-image">
                    <img
                      src={post.image}
                      alt="Post content"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setModalImage(post.image!)}
                    />
                  </div>
                )}

                {post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="post-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="post-stats">
                <span>{post.likes} likes • </span>
                <span>{post.comments.length} comments • </span>
                <span>{post.shares} shares</span>
              </div>

              <div className="post-actions">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`action-btn ${post.isLiked ? 'text-red-500' : ''}`}
                >
                  <span>{post.isLiked ? '❤️' : '🤍'}</span>
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                >
                  <span>💬</span>
                  <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="action-btn">
                  <span>➤</span>
                  <span className="text-sm font-medium">Share</span>
                </button>
                <button
                  className={`action-btn ${bookmarkedPosts.includes(post.id) ? 'bookmarked' : ''}`}
                  onClick={() => handleBookmark(post.id)}
                >
                  <span>️🏷</span>
                  <span className="text-sm font-medium">{bookmarkedPosts.includes(post.id) ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              </div>

              {showComments[post.id] && (
                <div className="comments-section">
                  {post.comments
                    .filter((c) => currentUser.role === 'admin' || c.status !== 'pending')
                    .map((comment) => {
                      const menuOpen = commentMenuOpen?.postId === post.id && commentMenuOpen?.commentId === comment.id;
                      const isEditing = editingComment?.postId === post.id && editingComment?.commentId === comment.id;
                      return (
                        <div key={comment.id} className="comment-item">
                          <img src={comment.avatar} alt="" className="comment-avatar" />
                          <div className="comment-content">
                            <span className="comment-author">{comment.author}</span>

                            {isEditing ? (
                              <>
                                <textarea
                                  className="comment-edit-textarea"
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  rows={2}
                                />
                                <button
                                  className="comment-save-btn"
                                  disabled={!editCommentText.trim()}
                                  onClick={() => {
                                    setPosts((prevPosts) =>
                                      prevPosts.map((p) =>
                                        p.id === post.id
                                          ? {
                                              ...p,
                                              comments: p.comments.map((c) =>
                                                c.id === comment.id ? { ...c, content: editCommentText } : c
                                              ),
                                            }
                                          : p
                                      )
                                    );
                                    setEditingComment(null);
                                    setCommentMenuOpen(null);
                                  }}
                                >
                                  Save
                                </button>
                                <button className="comment-cancel-btn" onClick={() => setEditingComment(null)}>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <p className="comment-text">{comment.content}</p>
                            )}
                            <span className="comment-time">{comment.timestamp}</span>

                            {comment.status === 'pending' && (
                              <div className="comment-pending-banner">This comment is pending admin approval.</div>
                            )}
                          </div>
                          {!isEditing && (
                            <button
                              className="comment-menu-btn"
                              onClick={() =>
                                setCommentMenuOpen(menuOpen ? null : { postId: post.id, commentId: comment.id })
                              }
                            >
                              ⋯
                            </button>
                          )}
                          {menuOpen && !isEditing && (
                            <div className="comment-menu-dropdown">
                              <button
                                className="dropdown-btn"
                                onClick={() => {
                                  setEditCommentText(comment.content);
                                  setEditingComment({ postId: post.id, commentId: comment.id });
                                  setCommentMenuOpen(null);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="dropdown-btn"
                                onClick={() => {
                                  setPosts((prevPosts) =>
                                    prevPosts.map((p) =>
                                      p.id === post.id ? { ...p, comments: p.comments.filter((c) => c.id !== comment.id) } : p
                                    )
                                  );
                                  setCommentMenuOpen(null);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  <div className="add-comment">
                    <img src={currentUser.avatar} alt="" className="comment-avatar" />
                    <div className="comment-input-container">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[post.id] || ''}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        className="comment-input"
                      />
                      <button onClick={() => handleComment(post.id)} className="comment-send-btn">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        <div className="trending-card">
          <h4> Trending Topics</h4>
          <ul>
            <li>#GPT-4-Research</li>
            <li>#QuantumML</li>
            <li>#AIEthics</li>
            <li>#OpenScience</li>
            <li>#NeurIPS2024</li>
          </ul>
        </div>

        <div className="suggestions-card">
          <h4>People You May Know</h4>
          <div className="suggestion-item">
            <img
              src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
              alt=""
            />
            <div>
              <h5>Dr. John Smith</h5>
              <p>ML Researcher at Google</p>
              <p>&nbsp;</p>
              <button className="connect-btn">Connect</button>
            </div>
          </div>
          <div className="suggestion-item">
            <img
              src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
              alt=""
            />
            <div>
              <h5>Prof. Lisa Wang</h5>
              <p>AI Professor at MIT</p>
              <p>&nbsp;</p>
              <button className="connect-btn">Connect</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit post modal */}
      {editingPost && (
        <div className="modal-overlay" onClick={() => setEditingPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Post</h3>
              <button className="close-btn" onClick={() => setEditingPost(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <textarea
                className="post-textarea"
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your post"
              />
            </div>
            <div className="modal-footer">
              <button className="post-btn" disabled={!editContent.trim()} onClick={handleSaveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen image modal */}
      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              background: 'white',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Full size"
              style={{ width: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }}
            />
            <button
              className="close-btn"
              style={{ position: 'absolute', top: 18, right: 22, zIndex: 20 }}
              onClick={() => setModalImage(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
