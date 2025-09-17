import React, { useState, useEffect, useRef } from 'react';
import './Messages.css';

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type?: 'text' | 'image';
  imageUrl?: string;
}

interface Chat {
  id: string;
  name: string;
  type: 'personal' | 'group' | 'public';
  participants: User[];
  messages: Message[];
  unreadCount: number;
  avatar?: string;
  createdBy?: string;
  isOnline?: boolean;
}

const currentUser: User = {
  id: 'current-user',
  name: 'John Doe',
  avatar: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
  isOnline: true,
};

const defaultAvatar = 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg';
const defaultGroupAvatar = 'https://as1.ftcdn.net/jpg/03/14/44/10/1000_F_314441066_71MAdbGS0XiIr1vxgIyGJEZCIHebslTp.jpg';

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    type: 'personal',
    participants: [
      currentUser,
      {
        id: '2',
        name: 'Sarah Johnson',
        avatar: defaultAvatar,
        isOnline: true,
      },
    ],
    messages: [
      {
        id: '1',
        senderId: '2',
        content: 'Hey! How are you doing?',
        timestamp: '10:30 AM',
        isRead: false,
      },
      {
        id: '2',
        senderId: 'current-user',
        content: "Hi Sarah! I'm doing great, thanks for asking.",
        timestamp: '10:32 AM',
        isRead: true,
      },
      {
        id: '3',
        senderId: '2',
        content: 'That sounds great! Want to grab coffee later?',
        timestamp: '10:35 AM',
        isRead: false,
      },
    ],
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Team Alpha',
    type: 'group',
    participants: [
      currentUser,
      {
        id: '3',
        name: 'Mike Chen',
        avatar: defaultAvatar,
        isOnline: false,
      },
      {
        id: '4',
        name: 'Emily Rodriguez',
        avatar: defaultAvatar,
        isOnline: true,
      },
    ],
    messages: [
      {
        id: '4',
        senderId: '3',
        content: 'Meeting scheduled for tomorrow at 10 AM',
        timestamp: '9:15 AM',
        isRead: true,
      },
      {
        id: '5',
        senderId: 'current-user',
        content: 'Perfect! I\'ll be there.',
        timestamp: '9:16 AM',
        isRead: true,
      },
    ],
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Joshna Aditya',
    type: 'public',
    participants: [
      currentUser,
      {
        id: '5',
        name: 'Alex Smith',
        avatar: defaultAvatar,
        isOnline: true,
      },
    ],
    messages: [
      {
        id: '6',
        senderId: '5',
        content: 'Check out this new React feature!',
        timestamp: '2:30 PM',
        isRead: false,
      },
      {
        id: '8',
        senderId: '5',
        content: 'Here\'s the documentation link',
        timestamp: '2:36 PM',
        isRead: false,
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      },
      {
        id: '7',
        senderId: 'current-user',
        content: 'Looks amazing! Thanks for sharing.',
        timestamp: '2:35 PM',
        isRead: true,
      },
    ],
    unreadCount: 3,
  },
];

const Messages: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null); // Changed from mockChats[0] to null
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    messageId: string;
  }>({ show: false, x: 0, y: 0, messageId: '' });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ show: false, x: 0, y: 0, messageId: '' });
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (chat: Chat) => {
    // Mark messages as read
    if (chat.unreadCount > 0) {
      const updatedChat = { ...chat, unreadCount: 0 };
      setChats(chats.map(c => c.id === chat.id ? updatedChat : c));
      setSelectedChat(updatedChat);
    } else {
      setSelectedChat(chat);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      };
      
      const updatedMessages = [...selectedChat.messages, message];
      const updatedChat = { ...selectedChat, messages: updatedMessages };
      
      setChats(chats.map(chat =>
        chat.id === selectedChat.id ? updatedChat : chat
      ));
      setSelectedChat(updatedChat);
      setNewMessage('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedChat) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const message: Message = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          content: 'Sent an image',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'image',
          imageUrl,
        };
        
        const updatedMessages = [...selectedChat.messages, message];
        const updatedChat = { ...selectedChat, messages: updatedMessages };
        
        setChats(chats.map(chat =>
          chat.id === selectedChat.id ? updatedChat : chat
        ));
        setSelectedChat(updatedChat);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRightClick = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    const message = selectedChat?.messages.find(m => m.id === messageId);
    if (message && message.senderId === currentUser.id && message.type === 'image') {
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        messageId,
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (selectedChat) {
      const updatedMessages = selectedChat.messages.filter(m => m.id !== messageId);
      const updatedChat = { ...selectedChat, messages: updatedMessages };
      
      setChats(chats.map(chat =>
        chat.id === selectedChat.id ? updatedChat : chat
      ));
      setSelectedChat(updatedChat);
    }
    setContextMenu({ show: false, x: 0, y: 0, messageId: '' });
  };

  const handleEditMessage = (messageId: string) => {
    // In a real app, you'd implement edit functionality
    console.log('Edit message:', messageId);
    setContextMenu({ show: false, x: 0, y: 0, messageId: '' });
  };

  const handleRenameChat = () => {
    if (selectedChat && newChatName.trim()) {
      const updatedChat = { ...selectedChat, name: newChatName };
      setChats(chats.map(chat =>
        chat.id === selectedChat.id ? updatedChat : chat
      ));
      setSelectedChat(updatedChat);
      setIsRenamingChat(false);
      setNewChatName('');
      setShowChatMenu(false);
    }
  };

const handleCreateNewChat = (chatName: string, chatType: 'personal' | 'group' | 'public') => {
  const newChat: Chat = {
    id: Date.now().toString(),
    name: chatName,
    type: chatType,
    participants: [currentUser],
    messages: [],
    unreadCount: 0,
    avatar: chatType === 'group' ? defaultGroupAvatar : defaultAvatar, // <-- Fixed here
    createdBy: currentUser.id,
  };
  setChats([newChat, ...chats]);
  setShowNewChatModal(false);
};

  const getChatDisplayName = (chat: Chat) => {
    if (chat.type === 'personal') {
      const otherUser = chat.participants.find(p => p.id !== currentUser.id);
      return otherUser?.name || chat.name;
    }
    return chat.name;
  };

const getChatAvatar = (chat: Chat) => {
  if (chat.avatar) return chat.avatar;
  if (chat.type === 'group') {
    return defaultGroupAvatar;
  }
  if (chat.type === 'personal') {
    const otherUser = chat.participants.find(p => p.id !== currentUser.id);
    return otherUser?.avatar || defaultAvatar;
  }
  return defaultAvatar;
};

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return 'No messages yet';
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.type === 'image' ? 'Sent an image' : lastMessage.content;
  };

  const getLastMessageTime = (chat: Chat) => {
    if (chat.messages.length === 0) return '';
    return chat.messages[chat.messages.length - 1].timestamp;
  };

  return (
    <div className="messages-container">
      {/* Sidebar */}
      <div className="messages-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button
            className="new-message-btn"
            onClick={() => setShowNewChatModal(true)}
          >
            <span>✉︎</span>
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="chat-list">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => handleChatSelect(chat)}
            >
              <div className="chat-avatar-container">
                <img
                  src={getChatAvatar(chat)}
                  alt={getChatDisplayName(chat)}
                  className="chat-avatar"
                />
                {chat.type === 'personal' && chat.isOnline && (
                  <div className="online-indicator"></div>
                )}
              </div>
              
              <div className="chat-info">
                <div className="chat-header-info">
                  <h4 className="chat-name">{getChatDisplayName(chat)}</h4>
                  <span className="chat-time">{getLastMessageTime(chat)}</span>
                </div>
                <div className="chat-preview">
                  <p className="last-message">{getLastMessage(chat)}</p>
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Chat Button */}
          <div className="add-chat-btn" onClick={() => setShowNewChatModal(true)}>
            <div className="add-chat-icon">+</div>
            <span>Add New Chat</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="messages-main">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <img
                  src={getChatAvatar(selectedChat)}
                  alt={getChatDisplayName(selectedChat)}
                  className="header-avatar"
                />
                <div className="header-text">
                  <h3>{getChatDisplayName(selectedChat)}</h3>
                  <p className="header-status">
                    {selectedChat.type === 'group' 
                      ? `${selectedChat.participants.length} members` 
                      : selectedChat.isOnline ? 'Active now' : 'Offline'
                    }
                  </p>
                </div>
              </div>
              
              <div className="chat-actions">
                <button
                  className="menu-btn"
                  onClick={() => setShowChatMenu(!showChatMenu)}
                >
                  ⋯
                </button>
                {showChatMenu && (
                  <div className="chat-menu">
                    <button
                      onClick={() => {
                        setIsRenamingChat(true);
                        setNewChatName(selectedChat.name);
                        setShowChatMenu(false);
                      }}
                    >
                      Rename Chat
                    </button>
                    <button onClick={() => setShowChatMenu(false)}>
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
<div className="messages-area">
  {selectedChat.messages.map((message) => {
    const sender = selectedChat.participants.find(p => p.id === message.senderId);
    const isCurrentUser = message.senderId === currentUser.id;
    const showSenderName = selectedChat.type === 'group' && !isCurrentUser;

    return (
      <div
        key={message.id}
        className={`message ${isCurrentUser ? 'sent' : 'received'}`}
      >
        {!isCurrentUser && (
          <img
            src={sender?.avatar || defaultAvatar}
            alt=""
            className="message-avatar"
          />
        )}
        <div className="message-bubble">
          {showSenderName && (
            <div className="sender-name">{sender?.name}</div>
          )}
          {message.type === 'image' ? (
            <img
              src={message.imageUrl}
              alt="Shared image"
              className="message-image"
              onContextMenu={(e) => handleRightClick(e, message.id)}
            />
          ) : (
            <p>{message.content}</p>
          )}
          <span className="message-time">{message.timestamp}</span>
        </div>
      </div>
    );
  })}
  {isTyping && (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  )}
  <div ref={messagesEndRef} />
</div>


            {/* Message Input */}
            <div className="message-input-container">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button
                className="attachment-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                ⛶
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="message-input"
              />
              <button
                onClick={handleSendMessage}
                className="send-btn"
                disabled={!newMessage.trim()}
              >
                <span>➤</span>
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a conversation to start messaging</h3>
            <p>Choose from existing conversations or start a new one</p>
          </div>
        )}
      </div>

      {/* Context Menu for Images */}
      {contextMenu.show && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
        >
          <button onClick={() => handleEditMessage(contextMenu.messageId)}>
            Edit
          </button>
          <button onClick={() => handleDeleteMessage(contextMenu.messageId)}>
            Delete
          </button>
        </div>
      )}

      {/* Rename Chat Modal */}
      {isRenamingChat && (
        <div className="modal-overlay" onClick={() => setIsRenamingChat(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rename Chat</h3>
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Enter new chat name"
              className="rename-input"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setIsRenamingChat(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleRenameChat} className="save-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onCreate={handleCreateNewChat}
        />
      )}
    </div>
  );
};

// New Chat Modal Component
const NewChatModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string, type: 'personal' | 'group' | 'public') => void;
}> = ({ onClose, onCreate }) => {
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState<'personal' | 'group' | 'public'>('personal');

  const handleCreate = () => {
    if (chatName.trim()) {
      onCreate(chatName, chatType);
      setChatName('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content new-chat-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Chat</h3>
        <input
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="Enter chat name"
          className="rename-input"
          autoFocus
        />
        <div className="chat-type-selector">
          <label>
            <input
              type="radio"
              name="chatType"
              value="personal"
              checked={chatType === 'personal'}
              onChange={(e) => setChatType(e.target.value as 'personal')}
            />
            Personal Chat
          </label>
          <label>
            <input
              type="radio"
              name="chatType"
              value="group"
              checked={chatType === 'group'}
              onChange={(e) => setChatType(e.target.value as 'group')}
            />
            Group Chat
          </label>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleCreate} className="save-btn">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
