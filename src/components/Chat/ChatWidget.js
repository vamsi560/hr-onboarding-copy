import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';
import './ChatWidget.css';

const ChatWidget = () => {
  const { chatHistory, addChatMessage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    addChatMessage(inputValue, 'user');
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const responses = {
        'how to upload': 'To upload documents, go to the Documents section and either drag & drop files or click to browse. Supported formats: PDF, JPG, PNG.',
        'required': 'Required documents include: ID Proof, Address Proof, Education Certificate, Bank Proof, Tax Document, and Photo.',
        'help': 'I can help you with document uploads, form completion, and answering questions about the onboarding process.'
      };

      let response = responses['help'];
      Object.keys(responses).forEach(key => {
        if (inputValue.toLowerCase().includes(key)) response = responses[key];
      });

      addChatMessage(response, 'bot');
    }, 1500);
  };

  if (!isOpen) {
    return (
      <div className="chat-fab" onClick={() => setIsOpen(true)} title="Open chat">
        Chat
      </div>
    );
  }

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div>Onboarding Assistant</div>
        <div style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '18px', opacity: 0.8 }} onClick={() => setIsOpen(false)} title="Close">
          ×
        </div>
      </div>
      <div className="chat-body">
        {chatHistory.length === 0 && (
          <div className="chat-message bot">
            <div className="chat-message-bubble">
              Hi John — I can help you upload documents, explain what is required, and send reminders to candidates.
            </div>
          </div>
        )}
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.type}`}>
            <div className="chat-message-bubble">{msg.message}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-typing">Assistant is typing...</div>
        )}
      </div>
      <div className="chat-input">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask something..."
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};

export default ChatWidget;

