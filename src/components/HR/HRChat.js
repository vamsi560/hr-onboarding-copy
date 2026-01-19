import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import './HRChat.css';

const HRChat = () => {
  const { showToast } = useToast();
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatFilter, setChatFilter] = useState('messages');
  const [messageInput, setMessageInput] = useState('');
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('hrChats');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        candidateId: 1,
        name: 'Sai Surya Vamsi Sapireddy',
        avatar: 'SS',
        status: 'last online 5 hours ago',
        lastSeen: '5 hours ago',
        messages: [
          {
            id: 1,
            sender: 'candidate',
            text: 'Hello! Finally found the time to write to you) I need your help in filling up the W4 Form for our new candidate.',
            timestamp: '4 days ago',
            type: 'text'
          },
          {
            id: 2,
            sender: 'candidate',
            text: 'Can I send you files?',
            timestamp: '4 days ago',
            type: 'text'
          },
          {
            id: 3,
            sender: 'candidate',
            text: 'Form.zip',
            timestamp: '4 days ago',
            type: 'file',
            fileName: 'Form.zip',
            fileSize: '41.36 Mb'
          },
          {
            id: 4,
            sender: 'hr',
            text: 'Hey! Okay, send out.',
            timestamp: '4 days ago',
            type: 'text'
          },
          {
            id: 5,
            sender: 'hr',
            text: 'Hello! I made everything you asked. I am sending the finished file.',
            timestamp: '3 days ago',
            type: 'text'
          },
          {
            id: 6,
            sender: 'hr',
            text: 'New_Form.zip',
            timestamp: '3 days ago',
            type: 'file',
            fileName: 'New_Form.zip',
            fileSize: '52.05 Mb',
            link: true
          }
        ],
        unread: 0,
        lastMessage: 'Let me know asap.',
        lastMessageTime: '3 days ago'
      },
      {
        id: 2,
        candidateId: 2,
        name: 'Shashank Tudum',
        avatar: 'ST',
        status: '...writes',
        lastSeen: 'online',
        messages: [
          {
            id: 1,
            sender: 'candidate',
            text: 'Just filtered and reviewed the CVs. When can we discuss some of them?',
            timestamp: '1 minute ago',
            type: 'text'
          }
        ],
        unread: 2,
        lastMessage: 'Just filtered and reviewed the CVs. When can we discuss some of them?',
        lastMessageTime: '1 minute ago'
      },
      {
        id: 3,
        candidateId: 3,
        name: 'Pankaj Kumar',
        avatar: 'PK',
        status: '• records voice message',
        lastSeen: 'online',
        messages: [
          {
            id: 1,
            sender: 'candidate',
            text: 'Voice message',
            timestamp: '1 minute ago',
            type: 'voice',
            duration: '01:15'
          },
          {
            id: 2,
            sender: 'candidate',
            text: 'Files',
            timestamp: '1 minute ago',
            type: 'files',
            fileCount: 2
          },
          {
            id: 3,
            sender: 'candidate',
            text: 'Photo',
            timestamp: '1 minute ago',
            type: 'photo'
          }
        ],
        unread: 1,
        lastMessage: 'Voice message (01:15)',
        lastMessageTime: '1 minute ago'
      }
    ];
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('hrChats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (selectedChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat, chats]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChatData = chats.find(c => c.id === selectedChat);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChat) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: Date.now(),
              sender: 'hr',
              text: messageInput,
              timestamp: 'Just now',
              type: 'text'
            }
          ],
          lastMessage: messageInput,
          lastMessageTime: 'Just now',
          unread: 0
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setMessageInput('');
    showToast('Message sent', 'success');
  };

  const handleCreateNewChat = () => {
    showToast('Select a candidate from the list to start a chat', 'info');
  };

  return (
    <div className="hr-chat">
      <div className="back-button-container">
        <button className="back-button" onClick={() => window.location.hash = '#hr'}>
          ← Back
        </button>
      </div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Chat' }]} />
      <div className="chat-container">
        {/* Left Panel - Chat List */}
        <div className="chat-list-panel">
          <div className="chat-list-header">
            <h2>Chat</h2>
            <div className="chat-list-controls">
              <div className="recent-chats-dropdown">
                <span>Recent Chats</span>
                <span className="dropdown-arrow">▼</span>
              </div>
              <Button onClick={handleCreateNewChat} className="create-chat-btn">
                + Create New Chat
              </Button>
            </div>
          </div>

          <div className="chat-search-section">
            <div className="chat-search-bar">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="chat-filter-tabs">
              <button
                className={`filter-tab ${chatFilter === 'messages' ? 'active' : ''}`}
                onClick={() => setChatFilter('messages')}
              >
                Messages <span className="dropdown-arrow">▼</span>
              </button>
            </div>
          </div>

          <div className="chat-list">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="chat-avatar">
                  {chat.avatar}
                </div>
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <span className="chat-name">{chat.name}</span>
                    <span className="chat-time">{chat.lastMessageTime}</span>
                  </div>
                  <div className="chat-item-footer">
                    <span className={`chat-status ${chat.status.includes('online') ? 'online' : chat.status.includes('writes') ? 'typing' : ''}`}>
                      {chat.status}
                    </span>
                    {chat.unread > 0 && (
                      <span className="unread-badge">{chat.unread}</span>
                    )}
                  </div>
                  <div className="chat-preview">{chat.lastMessage}</div>
                  {chat.messages.some(m => m.type === 'voice' || m.type === 'files' || m.type === 'photo') && (
                    <div className="chat-attachments">
                      {chat.messages.find(m => m.type === 'voice') && (
                        <span className="attachment-icon">Voice message ({chat.messages.find(m => m.type === 'voice')?.duration})</span>
                      )}
                      {chat.messages.find(m => m.type === 'files') && (
                        <span className="attachment-icon">Files (x{chat.messages.find(m => m.type === 'files')?.fileCount})</span>
                      )}
                      {chat.messages.find(m => m.type === 'photo') && (
                        <span className="attachment-icon">Photo</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Active Chat */}
        <div className="chat-conversation-panel">
          {selectedChatData ? (
            <>
              <div className="conversation-header">
                <div className="conversation-user-info">
                  <div className="conversation-avatar">{selectedChatData.avatar}</div>
                  <div>
                    <div className="conversation-name">{selectedChatData.name}</div>
                    <div className={`conversation-status ${selectedChatData.status.includes('online') ? 'online' : ''}`}>
                      {selectedChatData.status}
                    </div>
                  </div>
                </div>
                <div className="conversation-actions">
                  <button className="action-icon" title="Attachments">📎</button>
                  <button className="action-icon" title="More options">⋯</button>
                </div>
              </div>

              <div className="conversation-messages">
                {selectedChatData.messages.map(message => (
                  <div
                    key={message.id}
                    className={`message-bubble ${message.sender === 'hr' ? 'sent' : 'received'}`}
                  >
                    {message.type === 'text' && (
                      <div className="message-text">{message.text}</div>
                    )}
                    {message.type === 'file' && (
                      <div className="message-file">
                        <div>
                          {message.link ? (
                            <button type="button" className="file-link">{message.fileName}</button>
                          ) : (
                            <span className="file-name">{message.fileName}</span>
                          )}
                          <span className="file-size">{message.fileSize}</span>
                        </div>
                      </div>
                    )}
                    {message.type === 'voice' && (
                      <div className="message-voice">
                        <span>Voice message ({message.duration})</span>
                      </div>
                    )}
                    {message.type === 'files' && (
                      <div className="message-files">
                        <span>Files (x{message.fileCount})</span>
                      </div>
                    )}
                    {message.type === 'photo' && (
                      <div className="message-photo">
                        <span>Photo</span>
                      </div>
                    )}
                    <div className="message-time">{message.timestamp}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="conversation-input">
                <button className="input-action-btn">+</button>
                <div className="input-attachments">
                  <button className="attachment-btn" title="Document">Doc</button>
                  <button className="attachment-btn" title="Photo">Img</button>
                  <button className="attachment-btn" title="Folder">Folder</button>
                </div>
                <input
                  type="text"
                  placeholder="Type a message here"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <div className="input-actions">
                  <button className="emoji-btn" title="Emoji">Emoji</button>
                  <button className="send-btn" onClick={handleSendMessage} title="Send">Send</button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon"></div>
              <h3>Select a chat to start messaging</h3>
              <p>Choose a conversation from the list to view messages and communicate with employees.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRChat;

