
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar 
          activeView={activeView}
          activeCategory={activeCategory}
          onViewChange={setActiveView}
          onCategoryChange={setActiveCategory}
        />
        <main className="flex-1">
          <Dashboard 
            activeCategory={activeCategory === 'all' ? undefined : activeCategory}
            activeView={activeView}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
