
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Settings from '@/components/Settings';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('all');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');

  const renderMainContent = () => {
    switch (activeView) {
      case 'settings':
        return <Settings onApiKeyChange={setApiKey} />;
      default:
        return (
          <Dashboard 
            activeCategory={activeCategory === 'all' ? undefined : activeCategory}
            activeView={activeView}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        onViewChange={setActiveView}
        activeView={activeView}
      />
      <div className="flex">
        <Sidebar 
          activeView={activeView}
          activeCategory={activeCategory}
          onViewChange={setActiveView}
          onCategoryChange={setActiveCategory}
        />
        <main className="flex-1">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
