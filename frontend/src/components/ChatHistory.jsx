import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // Import X icon
import './ChatHistory.css';

const ChatHistory = ({ onSelectChat, onClose }) => { // Add onClose prop
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  // Load chats from localStorage on component mount
  useEffect(() => {
    const loadChats = () => {
      const savedChats = localStorage.getItem('chatHistory');
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);
        
        // Set the first chat as active if there are any
        if (parsedChats.length > 0 && !activeChat) {
          setActiveChat(parsedChats[0].id);
        }
      }
    };
    
    // Load chats initially
    loadChats();
    
    // Set up an interval to refresh the chat list
    const interval = setInterval(loadChats, 2000);
    
    return () => clearInterval(interval);
  }, [activeChat]);

  // Handle selecting a chat
  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    if (onSelectChat) {
      onSelectChat(chatId);
    }
  };

  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If it's today, show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show the date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chat-history">
      <div className="chat-history-header"> {/* Added header container */}
        <h2>Chat History</h2>
        {/* Close button - visible only on mobile via CSS */}
        <button onClick={onClose} className="close-history-button" aria-label="Close chat history">
          <X size={20} />
        </button>
      </div>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="no-chats">No chat history</div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-item ${chat.id === activeChat ? 'active' : ''}`}
              onClick={() => handleChatSelect(chat.id)}
            >
              <div className="chat-item-title">{chat.title || "New Chat"}</div>
              <div className="chat-item-date">{formatDate(chat.timestamp)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;