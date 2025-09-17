import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Add this import
import './Dashboard.css';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
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

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Dr. Sarah Chen',
      title: 'Research Scientist',
      avatar: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
      company: 'MIT AI Lab',
    },
    title: 'Breakthrough in Neural Network Architecture',
    content: "Excited to share our latest research on transformer architecture improvements that achieve 15% better performance on NLP benchmarks. This work has been accepted at #ICLR2024",
    timestamp: '2h',
    likes: 124,
    comments: [],
    shares: 12,
    isLiked: false,
    isBookmarked: false,
    tags: ['machine-learning', 'neural-networks', 'research'],
    postType: 'research',
    doi: '10.1000/xyz123',
    journal: 'ICLR 2024',
  },
  {
    id: '2',
    author: {
      name: 'Aditya VA',
      title: 'PhD Student',
      avatar: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
      company: 'VIT Research Center',
    },
    content: "Just won the National AI Hackathon! Our team developed an innovative solution for real-time medical diagnosis using computer vision. Grateful for this amazing opportunity to showcase our research.",
    timestamp: '6h',
    likes: 196,
    comments: [],
    shares: 15,
    isLiked: false,
    isBookmarked: false,
    tags: ['computer-vision', 'medical-AI', 'hackathon'],
    postType: 'general',
  },
  {
    id: '3',
    author: {
      name: 'Prof. Maria Rodriguez',
      title: 'Professor of Data Science',
      avatar: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
      company: 'Stanford University',
    },
    title: 'Annual ML Conference 2024',
    content: "Join us for the Annual Machine Learning Conference 2024! Call for papers is now open. Deadline: March 15, 2024. Topics include #DeepLearning, #ReinforcementLearning, and #ExplainableAI",
    timestamp: '1d',
    likes: 89,
    comments: [],
    shares: 23,
    isLiked: false,
    isBookmarked: false,
    tags: ['conference', 'machine-learning', 'call-for-papers'],
    postType: 'event',
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUser = {
    name: user?.name ?? 'User',
    title: user?.title ?? 'Professional', 
    avatar: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
    company: '',
  };

  // Existing states
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [modalImage, setModalImage] = useState<string | null>(null);

  // New states for enhanced features
  const [postTitle, setPostTitle] = useState('');
  const [postType, setPostType] = useState<'general' | 'research' | 'publication' | 'event'>('general');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedFilter, setFeedFilter] = useState<'all' | 'trending' | 'recent' | 'bookmarked'>('recent');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [doi, setDoi] = useState('');
  const [journal, setJournal] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter posts based on selected filters
  const filteredPosts = posts.filter(post => {
  if (feedFilter === 'bookmarked') {
    return bookmarkedPosts.includes(post.id);
  }
  if (domainFilter !== 'all') {
    // Convert domain name to tag format for matching
    const domainTag = domainFilter.toLowerCase().replace(/\s+/g, '-');
    return post.tags.some(tag => 
      tag.toLowerCase().includes(domainTag) || 
      tag.toLowerCase().includes(domainFilter.toLowerCase()) ||
      domainFilter.toLowerCase().includes(tag.toLowerCase())
    );
  }
  if (tagFilter) {
    return post.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()));
  }
  return true;
}).sort((a, b) => {
  if (feedFilter === 'trending') {
    return (b.likes + b.shares + b.comments.length) - (a.likes + a.shares + a.comments.length);
  }
  return 0; // Recent is default order
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
      setBookmarkedPosts(bookmarkedPosts.filter(id => id !== postId));
    } else {
      setBookmarkedPosts([...bookmarkedPosts, postId]);
    }
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const handleCreatePost = () => {
    if (newPost.trim() || selectedImage) {
      const post: Post = {
        id: Date.now().toString(),
        author: currentUser,
        title: postTitle || undefined,
        content: newPost,
        timestamp: 'now',
        likes: 0,
        comments: [],
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        image: selectedImage || undefined,
        tags: selectedTags,
        postType: postType,
        doi: doi || undefined,
        journal: journal || undefined,
      };
      setPosts([post, ...posts]);
      setNewPost('');
      setPostTitle('');
      setSelectedTags([]);
      setSelectedImage(null);
      setPostType('general');
      setDoi('');
      setJournal('');
      setIsPostModalOpen(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComment = (postId: string) => {
    const comment = commentText[postId];
    if (comment && comment.trim()) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    id: Date.now().toString(),
                    author: currentUser.name,
                    content: comment,
                    timestamp: 'now',
                    avatar: currentUser.avatar,
                  }
                ]
              }
            : post
        )
      );
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId));
    setMenuOpenId(null);
  };

  const openEditPostModal = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setMenuOpenId(null);
  };

  const handleSaveEdit = () => {
    if (editingPost && editContent.trim()) {
      setPosts(
        posts.map((post) =>
          post.id === editingPost.id ? { ...post, content: editContent } : post
        )
      );
      setEditingPost(null);
      setEditContent('');
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  // Handle closing modal on Escape press
  React.useEffect(() => {
    if (!modalImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalImage(null);
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
          <button className="view-profile-btn"
          onClick={() => navigate('/profile')}
          >View Profile</button>
        </div>

        {/* Quick Links */}
        <div className="quick-links-card">
          <h4>Quick Links</h4>
          <ul>
            <li><span></span> My Publications</li>
            <li><span></span> Research Groups</li>
            <li><span></span> Upcoming Events</li>
            <li><span></span> Messages</li>
          </ul>
        </div>

        {/* Popular Tags */}
        <div className="popular-tags-card">
          <h4>Popular Research Tags</h4>
          <div className="tag-cloud">
            {popularTags.map(tag => (
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
            <button 
              className={feedFilter === 'recent' ? 'active' : ''}
              onClick={() => setFeedFilter('recent')}
            >
              Recent
            </button>
            <button 
              className={feedFilter === 'trending' ? 'active' : ''}
              onClick={() => setFeedFilter('trending')}
            >
              Trending
            </button>
            <button 
              className={feedFilter === 'bookmarked' ? 'active' : ''}
              onClick={() => setFeedFilter('bookmarked')}
            >
              Bookmarked
            </button>
          </div>
          <select 
            value={domainFilter} 
            onChange={(e) => setDomainFilter(e.target.value)}
            className="domain-filter"
          >
            <option value="all">All Domains</option>
            {researchDomains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>

        {/* Create Post */}
        <div className="create-post-card">
          <div className="create-post-header">
            <img
              className="user-avatar"
              src={currentUser.avatar}
              alt={currentUser.name}
            />
            <input
              className="create-post-input"
              placeholder={`Share your research insights, ${currentUser.name}...`}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onFocus={() => setIsPostModalOpen(true)}
              readOnly
            />
          </div>
        </div>

        {/* Posts Feed */}
        <div className="posts-feed">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="post-author-avatar"
                />
                <div className="post-author-info">
                  <h4>{post.author.name}</h4>
                  <p>
                    {post.author.title}
                    {post.author.company && ` at ${post.author.company}`}
                  </p>
                  <span className="post-timestamp">{post.timestamp}</span>
                </div>
                <div className="post-actions-menu">
                  {/* FIXED: Added bookmark button with proper emoji */}
                  <button
                    className="bookmark-btn"
                    onClick={() => handleBookmark(post.id)}
                    style={{ 
                      color: bookmarkedPosts.includes(post.id) ? '#ffd700' : '#718096',
                      fontSize: '18px'
                    }}
                  >
                    
                  </button>
                  <button
                    className="post-menu"
                    onClick={() =>
                      setMenuOpenId(menuOpenId === post.id ? null : post.id)
                    }
                  >
                    ⋯
                  </button>
                  {menuOpenId === post.id && (
                    <div className="post-menu-dropdown">
                      <button
                        className="dropdown-btn"
                        onClick={() => openEditPostModal(post)}
                      >
                        Edit
                      </button>
                      <button
                        className="dropdown-btn"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="post-content">
                {post.title && <h3 className="post-title">{post.title}</h3>}
                <p>{post.content}</p>
                
                {/* Research Publication Info */}
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

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="post-tag">#{tag}</span>
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
                  onClick={() => toggleComments(post.id)}
                >
                  <span>💬</span>
                  <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="action-btn">
                  <span>➤</span>
                  <span className="text-sm font-medium">Share</span>
                </button>
                {/* ADDED: Bookmark action button */}
                <button 
                  className={`action-btn ${bookmarkedPosts.includes(post.id) ? 'bookmarked' : ''}`}
                  onClick={() => handleBookmark(post.id)}
                >
                  <span>️🏷</span>
                  <span className="text-sm font-medium">
                    {bookmarkedPosts.includes(post.id) ? 'Bookmarked' : 'Bookmark'}
                  </span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="comments-section">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <img src={comment.avatar} alt="" className="comment-avatar" />
                      <div className="comment-content">
                        <span className="comment-author">{comment.author}</span>
                        <p className="comment-text">{comment.content}</p>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="add-comment">
                    <img src={currentUser.avatar} alt="" className="comment-avatar" />
                    <div className="comment-input-container">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ 
                          ...prev, 
                          [post.id]: e.target.value 
                        }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        className="comment-input"
                      />
                      <button 
                        onClick={() => handleComment(post.id)}
                        className="comment-send-btn"
                      >
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
        {/* Trending Topics */}
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

        {/* Suggested Connections */}
        <div className="suggestions-card">
          <h4>People You May Know</h4>
          <div className="suggestion-item">
            <img src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg" alt="" />
            <div>
              <h5>Dr. John Smith</h5>
              <p>ML Researcher at Google</p>
              <p>&nbsp;</p>
              <button className="connect-btn">Connect</button>
            </div>
          </div>
          <div className="suggestion-item">
            <img src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg" alt="" />
            <div>
              <h5>Prof. Lisa Wang</h5>
              <p>AI Professor at MIT</p>
              <p>&nbsp;</p>
              <button className="connect-btn">Connect</button>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="events-card">
          <h4> Upcoming Events</h4>
          <div className="event-item">
            <span className="event-date">Mar 15</span>
            <div>
              <h5>ICLR 2024 Workshop</h5>
              <p>Virtual Conference</p>
            </div>
          </div>
          <div className="event-item">
            <span className="event-date">Apr 20</span>
            <div>
              <h5>AI Ethics Symposium</h5>
              <p>Stanford University</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Create Post Modal */}
      {isPostModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPostModalOpen(false)}>
          <div className="modal-content enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Research Post</h3>
              <button className="close-btn" onClick={() => setIsPostModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-user">
                <img src={currentUser.avatar} alt={currentUser.name} />
                <h4>{currentUser.name}</h4>
              </div>

              {/* Post Type Selector */}
              <div className="post-type-selector">
                <label>Post Type:</label>
                <select value={postType} onChange={(e) => setPostType(e.target.value as any)}>
                  <option value="general">General Post</option>
                  <option value="research">Research Finding</option>
                  <option value="publication">Publication</option>
                  <option value="event">Event/Conference</option>
                </select>
              </div>

              {/* Title Input */}
              {(postType === 'research' || postType === 'publication' || postType === 'event') && (
                <input
                  type="text"
                  className="post-title-input"
                  placeholder="Enter title..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              )}

              <textarea
                className="post-textarea"
                rows={4}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your research insights, findings, or thoughts..."
              />

              {/* Research-specific fields */}
              {postType === 'publication' && (
                <>
                  <input
                    type="text"
                    className="doi-input"
                    placeholder="DOI (e.g., 10.1000/xyz123)"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                  />
                  <input
                    type="text"
                    className="journal-input"
                    placeholder="Journal/Conference name"
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                  />
                </>
              )}

              {/* Tags Section */}
              <div className="tags-section">
                <label>Add Tags:</label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    placeholder="Type a tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        const tag = target.value.trim();
                        if (tag) {
                          addTag(tag);
                          target.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div className="selected-tags">
                  {selectedTags.map(tag => (
                    <span key={tag} className="selected-tag">
                      #{tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="suggested-tags">
                  {popularTags.filter(tag => !selectedTags.includes(tag)).slice(0, 5).map(tag => (
                    <button key={tag} className="suggested-tag" onClick={() => addTag(tag)}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image preview */}
              {selectedImage && (
                <div className="image-preview">
                  <img src={selectedImage} alt="Preview" className="preview-image" />
                  <button 
                    className="remove-image-btn"
                    onClick={() => setSelectedImage(null)}
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div className="modal-footer">
              <div className="modal-actions">
                <button
                  className="media-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add Photo"
                >
                  ⛶
                </button>
              </div>
              <button
                className="post-btn"
                disabled={!newPost.trim() && !selectedImage}
                onClick={handleCreatePost}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

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
              <button
                className="post-btn"
                disabled={!editContent.trim()}
                onClick={handleSaveEdit}
              >
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
              background: 'white'
            }} 
            onClick={e => e.stopPropagation()}
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
            >&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
