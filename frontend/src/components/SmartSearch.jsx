import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCcw, Zap, Sun, Eye } from 'lucide-react';
import axios from 'axios';
import './SmartSearch.css';
import Card from './Card';
import VoicePrompt from './VoicePrompt';

function mapProductItemsToCardSources(productItems) {
  return productItems.map((item, index) => {
    const domain = new URL(item.product_link).hostname;
    
    return {
      id: index + 1,
      title: item.product_name,
      url: item.product_link,
      domain: domain,
      logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`, // Get favicon dynamically
    };
  });
}

const SmartSearch = ({ onLoadChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [chatId, setChatId] = useState(() => Date.now().toString());

  const chatMainRef = useRef(null);
  const API_BASE_URL = 'http://127.0.0.1:5000/get_product_suggestions';

  useEffect(() => {
    // Save chat to localStorage
    if (messages.length > 0) {
      const existingChatsJSON = localStorage.getItem('chatHistory');
      const existingChats = existingChatsJSON ? JSON.parse(existingChatsJSON) : [];
      
      let chatTitle = "New Chat";
      const firstUserMessage = messages.find(msg => msg.user);
      if (firstUserMessage) {
        chatTitle = firstUserMessage.text.substring(0, 25);
        if (firstUserMessage.text.length > 25) {
          chatTitle += "...";
        }
      }
      
      const chatToSave = {
        id: chatId,
        title: chatTitle,
        messages: messages,
        timestamp: new Date().toISOString()
      };
      
      const existingChatIndex = existingChats.findIndex(chat => chat.id === chatId);
      
      if (existingChatIndex !== -1) {
        existingChats[existingChatIndex] = chatToSave;
      } else {
        existingChats.unshift(chatToSave);
      }
      
      const limitedChats = existingChats.slice(0, 10);
      localStorage.setItem('chatHistory', JSON.stringify(limitedChats));
    }
  }, [messages, chatId]);

  const loadChatFromHistory = (historyChatId) => {
    const existingChatsJSON = localStorage.getItem('chatHistory');
    if (existingChatsJSON) {
      const existingChats = JSON.parse(existingChatsJSON);
      const chatToLoad = existingChats.find(chat => chat.id === historyChatId);
      
      if (chatToLoad) {
        setMessages(chatToLoad.messages);
        setChatId(chatToLoad.id);
        
        const lastBotMessage = [...chatToLoad.messages]
          .reverse()
          .find(msg => !msg.user);
          
        if (lastBotMessage) {
          setCurrentMessage(lastBotMessage.text);
          setCharIndex(lastBotMessage.text.length);
        }
        
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (onLoadChat) {
      onLoadChat(loadChatFromHistory);
    }
  }, [onLoadChat]);

  const sendMessageToBackend = async (message) => {
    try {
      const response = await axios.post(API_BASE_URL, {
        question: message
      });
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
      const data = await sendMessageToBackend(messageText);
      // Expecting data:
      // { ai_salesman_response: "...", product_items: [ { product_name, product_link }, ... ] }
      
      const botText = data.ai_salesman_response || "I'm not sure how to respond.";
      const productItems = data.product_items || [];

      // Convert product_items to the shape <Card /> uses
      const mappedSources = mapProductItemsToCardSources(productItems);

      const botMessage = {
        text: botText,
        user: false,
        // store your dynamic sources here
        sources: mappedSources,
      };
      
      setMessages(prev => [...prev, botMessage]);
      setCurrentMessage(botMessage.text);
      setCharIndex(0);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage = { text: "Sorry, I couldn't process that request.", user: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentMessage && charIndex < currentMessage.length) {
      const timer = setTimeout(() => {
        setCharIndex(prev => prev + 1);
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
            <button onClick={() => sendMessage("What is the most cost-effective Xfinity Internet plan for a household with four devices?​")} className="suggestion-button">
              <Zap className="suggestion-icon" size={24} />
              <span>What is the most cost-effective Xfinity Internet plan for a household with four devices?​</span>
            </button>
            <button onClick={() => sendMessage("What are the differences between Xfinity's xFi Gateway and standard modems, and which is more suitable for high-speed Internet?")} className="suggestion-button">
              <Sun className="suggestion-icon" size={24} />
              <span>What are the differences between Xfinity's xFi Gateway and standard modems, and which is more suitable for high-speed Internet?</span>
            </button>
            <button onClick={() => sendMessage("What is the best plan if I want to watch English Premier League?")} className="suggestion-button">
              <Eye className="suggestion-icon" size={24} />
              <span>What is the best plan if I want to watch English Premier League?</span>
            </button>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.user ? 'user-message' : 'bot-message'}`}
              >
                {message.user ? (
                  formatMessage(message.text)
                ) : (
                  <div className="bot-message-content">
                    {message.sources && message.sources.length > 0 && (
                      <div className="sources-wrapper">
                        <Card sources={message.sources} />
                      </div>
                    )}

                    <div className="bot-text">
                      {index === messages.length - 1
                        ? formatMessage(displayedText)
                        : formatMessage(message.text)}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && <div className="message bot-message">Thinking...</div>}
          </div>
        )}
      </main>

      <div className="chat-input-container">
        <div className="input-with-buttons">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask Anything!"
            className="message-input"
            disabled={isLoading}
          />
          <VoicePrompt onTranscript={sendMessage} disabled={isLoading} />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading}
            className="send-button"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartSearch;