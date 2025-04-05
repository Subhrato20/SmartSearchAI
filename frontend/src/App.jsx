import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react'; // Import Menu icon
import SmartSearch from './components/SmartSearch.jsx';
import ChatHistory from './components/ChatHistory.jsx';
import './App.css'; // Import the CSS file

function App() {
  const [loadChatFunction, setLoadChatFunction] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false); // State for history visibility

  const handleSelectChat = (chatId) => {
    if (loadChatFunction) {
      loadChatFunction(chatId);
      // Close history panel on mobile after selection
      if (window.innerWidth <= 768) {
        setIsHistoryVisible(false);
      }
    }
  };

  const setLoadChat = (fn) => {
    setLoadChatFunction(() => fn);
  };

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  // Close history if window resizes to be larger than mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsHistoryVisible(false); // Ensure it's closed on larger screens if toggled open
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="app-container">
      {/* Overlay for closing history on mobile */}
      {isHistoryVisible && <div className="history-overlay" onClick={toggleHistory}></div>}

      {/* Hamburger Menu Button - visible only on small screens via CSS */}
      <button className="hamburger-menu" onClick={toggleHistory} aria-label="Toggle chat history">
        <Menu size={24} />
      </button>

      {/* Chat History Panel - add 'visible' class when toggled */}
      <div className={`chat-history-container ${isHistoryVisible ? 'visible' : ''}`}>
        <ChatHistory onSelectChat={handleSelectChat} onClose={toggleHistory} /> {/* Pass toggleHistory as onClose */}
      </div>

      {/* Smart Search Panel */}
      <div className="smart-search-container">
        <SmartSearch onLoadChat={setLoadChat} />
      </div>
    </div>
  );
}

export default App;