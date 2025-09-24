import React, { useState, useRef } from 'react';

interface Author {
  name: string;
  title: string;
  avatar: string;
  company?: string;
}

interface CreatePostData {
  author: Author;
  title?: string;
  content: string;
  image?: string;
  tags: string[];
  postType: 'general' | 'research' | 'publication' | 'event';
  doi?: string;
  journal?: string;
}

interface CreatePostProps {
  currentUser: Author & { role?: string };
  onPostCreated: (post: CreatePostData) => void;
  popularTags: string[];
  token: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated, popularTags, token }) => {
  const [newPost, setNewPost] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postType, setPostType] = useState<'general' | 'research' | 'publication' | 'event'>('general');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [doi, setDoi] = useState('');
  const [journal, setJournal] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePost = async () => {
    if (newPost.trim() || selectedImage) {
      const postData: CreatePostData = {
        author: currentUser,
        title: postTitle || undefined,
        content: newPost,
        image: selectedImage || undefined,
        tags: selectedTags,
        postType: postType,
        doi: doi || undefined,
        journal: journal || undefined,
      };

      try {
        const response = await fetch('http://localhost:8000/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newPost }),
        });

        if (response.ok) {
          onPostCreated(postData);
          setNewPost('');
          setPostTitle('');
          setSelectedTags([]);
          setSelectedImage(null);
          setPostType('general');
          setDoi('');
          setJournal('');
          setIsPostModalOpen(false);
        } else {
          const errorText = await response.text();
          alert('Failed to create post: ' + errorText);
        }
      } catch (error) {
        alert('Error creating post: ' + error);
      }
    } else {
      alert('Please enter some content or image for the post.');
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

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  return (
    <>
      {/* Create Post Card */}
      <div className="create-post-card">
        <div className="create-post-header">
          <img className="user-avatar" src={currentUser.avatar} alt={currentUser.name} />
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

              <div className="post-type-selector">
                <label>Post Type:</label>
                <select value={postType} onChange={(e) => setPostType(e.target.value as any)}>
                  <option value="general">General Post</option>
                  <option value="research">Research Finding</option>
                  <option value="publication">Publication</option>
                  <option value="event">Event/Conference</option>
                </select>
              </div>

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
                  {selectedTags.map((tag) => (
                    <span key={tag} className="selected-tag">
                      #{tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="suggested-tags">
                  {popularTags
                    .filter((tag) => !selectedTags.includes(tag))
                    .slice(0, 5)
                    .map((tag) => (
                      <button key={tag} className="suggested-tag" onClick={() => addTag(tag)}>
                        #{tag}
                      </button>
                    ))}
                </div>
              </div>

              {selectedImage && (
                <div className="image-preview">
                  <img src={selectedImage} alt="Preview" className="preview-image" />
                  <button className="remove-image-btn" onClick={() => setSelectedImage(null)}>
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
    </>
  );
};

export default CreatePost;
