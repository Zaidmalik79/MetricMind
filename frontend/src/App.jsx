import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ChatView from './components/ChatView';
import RootCauseView from './components/RootCauseView';
import DataExplorerView from './components/DataExplorerView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatPrompt, setChatPrompt] = useState('');

  const handleNavigateToChat = (prompt) => {
    setChatPrompt(prompt);
    setActiveTab('chat');
  };

  const handleNavigateToRootCause = () => {
    setActiveTab('rootcause');
  };

  const handleClearChatPrompt = () => {
    setChatPrompt('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateToChat={handleNavigateToChat}
            onNavigateToRootCause={handleNavigateToRootCause}
          />
        )}
        {activeTab === 'chat' && (
          <ChatView
            initialPrompt={chatPrompt}
            onClearInitialPrompt={handleClearChatPrompt}
          />
        )}
        {activeTab === 'rootcause' && (
          <RootCauseView
            onNavigateToChat={handleNavigateToChat}
          />
        )}
        {activeTab === 'explorer' && (
          <DataExplorerView />
        )}
      </main>
    </div>
  );
}
