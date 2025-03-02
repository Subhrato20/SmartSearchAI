import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCcw, Zap, Sun, Eye } from 'lucide-react';
import axios from 'axios';
import './SmartSearch.css';
import Card from './Card'; // Import the Card component
import VoicePrompt from './VoicePrompt'; // Import the VoicePrompt component

const SmartSearch = ({ onLoadChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [chatId, setChatId] = useState(() => Date.now().toString());

  const chatMainRef = useRef(null);
  const API_BASE_URL = 'http://localhost:3000/api/chat';

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    // Only save if there are messages
    if (messages.length > 0) {
      // Get existing chats from localStorage
      const existingChatsJSON = localStorage.getItem('chatHistory');
      const existingChats = existingChatsJSON ? JSON.parse(existingChatsJSON) : [];
      
      // Generate a title based on the first user message
      let chatTitle = "New Chat";
      const firstUserMessage = messages.find(msg => msg.user);
      if (firstUserMessage) {
        chatTitle = firstUserMessage.text.substring(0, 25);
        if (firstUserMessage.text.length > 25) chatTitle += "...";
      }
      
      // Create a chat object
      const chatToSave = {
        id: chatId,
        title: chatTitle,
        messages: messages,
        timestamp: new Date().toISOString()
      };
      
      // Check if this chat already exists by ID
      const existingChatIndex = existingChats.findIndex(chat => chat.id === chatId);
      
      if (existingChatIndex !== -1) {
        // Update the existing chat
        existingChats[existingChatIndex] = chatToSave;
      } else {
        // Add new chat to beginning of array
        existingChats.unshift(chatToSave);
      }
      
      // Limit to 10 chats to prevent localStorage from getting too full
      const limitedChats = existingChats.slice(0, 10);
      localStorage.setItem('chatHistory', JSON.stringify(limitedChats));
    }
  }, [messages, chatId]);

  // Function to load a chat from history
  const loadChatFromHistory = (historyChatId) => {
    const existingChatsJSON = localStorage.getItem('chatHistory');
    if (existingChatsJSON) {
      const existingChats = JSON.parse(existingChatsJSON);
      const chatToLoad = existingChats.find(chat => chat.id === historyChatId);
      
      if (chatToLoad) {
        setMessages(chatToLoad.messages);
        setChatId(chatToLoad.id);
        
        // If there are bot messages, set the last one as current
        const lastBotMessage = [...chatToLoad.messages]
          .reverse()
          .find(msg => !msg.user);
          
        if (lastBotMessage) {
          setCurrentMessage(lastBotMessage.text);
          setCharIndex(lastBotMessage.text.length); // Show full message immediately
        }
        
        return true;
      }
    }
    return false;
  };

  // Make the loadChatFromHistory function available to parent components
  useEffect(() => {
    if (onLoadChat) {
      onLoadChat(loadChatFromHistory);
    }
  }, [onLoadChat]);

  // Function to check if a message should show sources
  const shouldShowSources = (messageText) => {
    // List of keywords that indicate we should show sources
    const sourceKeywords = [
      'xfinity', 'internet', 'provider', 'faster', 'speed', 'connection',
      'wifi', 'broadband', 'fiber', 'cable', 'service', 'plan', 'package'
    ];
    
    const lowerText = messageText.toLowerCase();
    
    // Check if any of the keywords are in the message
    return sourceKeywords.some(keyword => lowerText.includes(keyword));
  };

  // Hardcoded sample sources for development
  const getSampleSources = () => {
    return {
      sources: [
        {
          id: 1,
          title: "Xfinity Gigabit Internet",
          url: "https://www.xfinity.com/learn/internet-service/gigabit",
          domain: "xfinity.com",
          logo: "/api/placeholder/24/24",
          brief: "Up to 1,200 Mbps download speeds"
        },
        {
          id: 2,
          title: "Xfinity Internet Plans Comparison",
          url: "https://www.xfinity.com/learn/internet-service",
          domain: "xfinity.com",
          logo: "/api/placeholder/24/24",
          brief: "Compare different Xfinity internet plans"
        },
        {
          id: 3,
          title: "Is Xfinity Internet Worth It?",
          url: "https://www.reviews.org/internet-service/xfinity-internet-review/",
          domain: "reviews.org",
          logo: "/api/placeholder/24/24",
          brief: "Independent review of Xfinity internet service"
        }
      ],
      additionalSources: 4
    };
  };

  const sendMessageToBackend = async (message) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/send`, { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message to backend:', error);
      throw error;
    }
  };

  const sendMessage = async (messageText) => {
    if (messageText.trim() === '') return;
    
    const userMessage = { text: messageText, user: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToBackend(messageText);
      
      // Check if we should show sources for this message
      const showSources = shouldShowSources(messageText);
      
      // Get sample sources if needed
      const sources = showSources ? getSampleSources() : null;
      
      // Create bot message with sources if applicable
      const botMessage = { 
        text: response.response, 
        user: false,
        showSources: showSources,
        sources: sources
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setCurrentMessage(botMessage.text);
      setCharIndex(0);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage = { text: "Sorry, I couldn't process that request.", user: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  useEffect(() => {
    if (currentMessage && charIndex < currentMessage.length) {
      const timer = setTimeout(() => {
        setCharIndex(prevIndex => prevIndex + 1);
      }, 20);

      return () => clearTimeout(timer);
    }
  }, [currentMessage, charIndex]);

  useEffect(() => {
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight;
    }
  }, [messages]);

  const displayedText = currentMessage.slice(0, charIndex);

  const handleRefresh = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setCurrentMessage('');
    setCharIndex(0);
    // Generate a new chatId for the next conversation
    setChatId(Date.now().toString());
    console.log('Chat refreshed');
  };

  const formatMessage = (text) => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const parts = text.split(codeBlockRegex);
    const codeBlocks = text.match(codeBlockRegex) || [];
    
    return parts.reduce((acc, part, index) => {
      acc.push(
        <span key={`text-${index}`}>
          {part.split('\n').map((line, lineIndex) => (
            <React.Fragment key={`line-${lineIndex}`}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </span>
      );
      if (codeBlocks[index]) {
        acc.push(
          <pre key={`code-${index}`} className="code-block">
            {codeBlocks[index].replace(/```/g, '').trim()}
          </pre>
        );
      }
      return acc;
    }, []);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>SmartSearch.ai</h1>
        <button onClick={handleRefresh} className="refresh-button" aria-label="Refresh chat">
          <RefreshCcw size={24} />
        </button>
      </header>
      <main className="chat-main" ref={chatMainRef}>
        {messages.length === 0 ? (
          <div className="suggestion-buttons">
            <button className="suggestion-button" onClick={() => handleSuggestion("Text inviting friend to wedding")}>
              <Zap className="suggestion-icon" size={24} />
              <span>Text inviting friend to wedding</span>
            </button>
            <button className="suggestion-button" onClick={() => handleSuggestion("Morning routine for productivity")}>
              <Sun className="suggestion-icon" size={24} />
              <span>Morning routine for productivity</span>
            </button>
            <button className="suggestion-button" onClick={() => handleSuggestion("Count the number of items in an image")}>
              <Eye className="suggestion-icon" size={24} />
              <span>Count the number of items in an image</span>
            </button>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.user ? 'user-message' : 'bot-message'}`}>
                {message.user ? (
                  // User message - just show the text
                  formatMessage(message.text)
                ) : (
                  // Bot message - first sources (if applicable), then text
                  <div className="bot-message-content">
                    {/* Show sources if this message has them and typing is complete */}
                    {message.showSources && message.sources && 
                     (index !== messages.length - 1 || displayedText === message.text) && (
                      <div className="sources-wrapper">
                        <Card sources={message.sources.sources} />
                      </div>
                    )}
                    
                    {/* Bot message text */}
                    <div className="bot-text">
                      {index === messages.length - 1 ? 
                        formatMessage(displayedText) : 
                        formatMessage(message.text)}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && <div className="message bot-message">Thinking...</div>}
          </div>
        )}
      </main>
      
      {/* THIS IS THE PART THAT NEEDS TO BE REPLACED - START */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '20px',
        padding: '0 6px',
        marginTop: '10px',
        height: '40px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask Anything!"
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            outline: 'none',
            height: '32px',
            padding: '0 8px',
            fontSize: '16px'
          }}
          disabled={isLoading}
        />
        <VoicePrompt onTranscript={sendMessage} disabled={isLoading} />
        <button 
          onClick={() => sendMessage(input)} 
          disabled={isLoading}
          style={{
            border: 'none',
            background: 'none',
            width: '28px',
            height: '28px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
            padding: 0
          }}
        >
          <Send size={18} />
        </button>
      </div>
      {/* THIS IS THE PART THAT NEEDS TO BE REPLACED - END */}
    </div>
  );
};

export default SmartSearch;