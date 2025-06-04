
import { FileText, CheckSquare, Calendar, Lightbulb, Users, Home, Briefcase, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', icon: Home, current: true },
    { name: 'Recent Transcripts', icon: FileText, current: false },
    { name: 'Tasks', icon: CheckSquare, current: false },
    { name: 'Calendar Events', icon: Calendar, current: false },
    { name: 'Ideas', icon: Lightbulb, current: false },
    { name: 'Contacts', icon: Users, current: false },
  ];

  const categories = [
    { name: 'Business', icon: Briefcase, count: 12, color: 'bg-blue-100 text-blue-700' },
    { name: 'Personal', icon: Users, count: 8, color: 'bg-green-100 text-green-700' },
    { name: 'Home', icon: Home, count: 5, color: 'bg-purple-100 text-purple-700' },
    { name: 'Projects', icon: FolderOpen, count: 15, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6">
      <nav className="space-y-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href="#"
            className={cn(
              item.current
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100',
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
            )}
          >
            <item.icon
              className={cn(
                item.current ? 'text-blue-500' : 'text-gray-400',
                'mr-3 h-5 w-5'
              )}
            />
            {item.name}
          </a>
        ))}
      </nav>

      <div className="mt-8">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Categories
        </h3>
        <div className="mt-3 space-y-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="flex items-center">
                <category.icon className="mr-3 h-4 w-4 text-gray-400" />
                {category.name}
              </div>
              <span className={cn(category.color, 'px-2 py-1 text-xs font-medium rounded-full')}>
                {category.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
