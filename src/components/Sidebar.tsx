
import { FileText, CheckSquare, Calendar, Lightbulb, Users, Home, Briefcase, FolderOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppState } from '@/hooks/useUserAppState';

interface SidebarProps {
  activeView?: string;
  activeCategory?: string;
  onViewChange?: (view: string) => void;
  onCategoryChange?: (category: string) => void;
  appState?: AppState;
}

const Sidebar = ({ activeView = 'dashboard', activeCategory, onViewChange, onCategoryChange, appState }: SidebarProps) => {
  const navigation = [
    { name: 'Dashboard', key: 'dashboard', icon: Home },
    { name: 'Recent Transcripts', key: 'transcripts', icon: FileText },
    { name: 'Tasks', key: 'task', icon: CheckSquare },
    { name: 'Calendar Events', key: 'event', icon: Calendar },
    { name: 'Ideas', key: 'idea', icon: Lightbulb },
    { name: 'Contacts', key: 'contact', icon: Users },
    { name: 'Settings', key: 'settings', icon: Settings },
  ];

  // Calculate actual counts from appState
  const extractedItems = appState?.extractedItems || [];
  
  const allCount = extractedItems.length;
  const businessCount = extractedItems.filter(item => item.category === 'Business').length;
  const personalCount = extractedItems.filter(item => item.category === 'Personal').length;
  const homeCount = extractedItems.filter(item => item.category === 'Home').length;
  const projectsCount = extractedItems.filter(item => item.category === 'Projects').length;

  const categories = [
    { name: 'All', key: 'all', icon: Home, count: allCount, color: 'bg-gray-100 text-gray-700' },
    { name: 'Business', key: 'Business', icon: Briefcase, count: businessCount, color: 'bg-blue-100 text-blue-700' },
    { name: 'Personal', key: 'Personal', icon: Users, count: personalCount, color: 'bg-green-100 text-green-700' },
    { name: 'Home', key: 'Home', icon: Home, count: homeCount, color: 'bg-purple-100 text-purple-700' },
    { name: 'Projects', key: 'Projects', icon: FolderOpen, count: projectsCount, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6">
      <nav className="space-y-2">
        {navigation.map((item) => (
          <button
            key={item.key}
            onClick={() => onViewChange?.(item.key)}
            className={cn(
              activeView === item.key
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100',
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left'
            )}
          >
            <item.icon
              className={cn(
                activeView === item.key ? 'text-blue-500' : 'text-gray-400',
                'mr-3 h-5 w-5'
              )}
            />
            {item.name}
          </button>
        ))}
      </nav>

      {activeView !== 'settings' && (
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Categories
          </h3>
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => onCategoryChange?.(category.key)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors w-full text-left",
                  activeCategory === category.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center">
                  <category.icon className="mr-3 h-4 w-4 text-gray-400" />
                  {category.name}
                </div>
                <span className={cn(category.color, 'px-2 py-1 text-xs font-medium rounded-full')}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
