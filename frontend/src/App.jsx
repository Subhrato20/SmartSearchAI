import React, { useState } from 'react'
import SmartSearch from './components/SmartSearch.jsx'
import ChatHistory from './components/ChatHistory.jsx'

function App() {
  const [loadChatFunction, setLoadChatFunction] = useState(null);

  const handleSelectChat = (chatId) => {
    if (loadChatFunction) {
      loadChatFunction(chatId);
    }
  };

  const setLoadChat = (fn) => {
    setLoadChatFunction(() => fn);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div style={{ width: '300px' }}>
        <ChatHistory onSelectChat={handleSelectChat} />
      </div>
      <div style={{ flex: 1 }}>
        <SmartSearch onLoadChat={setLoadChat} />
      </div>
    </div>
  )
}

export default App