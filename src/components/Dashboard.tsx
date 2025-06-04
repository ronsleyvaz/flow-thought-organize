
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProcessingCard from './ProcessingCard';
import ExtractedItem from './ExtractedItem';
import { CheckSquare, Calendar, Lightbulb, User, FileText, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [extractedItems, setExtractedItems] = useState([
    {
      id: '1',
      type: 'task' as const,
      title: 'Review Q4 budget proposal with finance team',
      description: 'Schedule meeting to discuss budget allocations for next quarter',
      category: 'Business' as const,
      priority: 'high' as const,
      dueDate: 'Dec 15, 2024',
      assignee: 'Sarah Chen',
      confidence: 95,
      approved: false,
    },
    {
      id: '2',
      type: 'event' as const,
      title: 'Product demo for potential client',
      description: 'Prepare slides and demo environment for Acme Corp meeting',
      category: 'Business' as const,
      priority: 'high' as const,
      dueDate: 'Dec 12, 2024 2:00 PM',
      confidence: 88,
      approved: false,
    },
    {
      id: '3',
      type: 'idea' as const,
      title: 'Integration with Slack for real-time notifications',
      description: 'Allow users to receive extracted items directly in their Slack workspace',
      category: 'Projects' as const,
      priority: 'medium' as const,
      confidence: 76,
      approved: true,
    },
    {
      id: '4',
      type: 'task' as const,
      title: 'Pick up groceries for weekend dinner party',
      description: 'Get ingredients for Italian cuisine theme',
      category: 'Personal' as const,
      priority: 'low' as const,
      dueDate: 'Dec 14, 2024',
      confidence: 92,
      approved: false,
    },
  ]);

  const recentTranscripts = [
    {
      id: '1',
      name: 'Q4 Planning Meeting',
      status: 'review' as const,
      extractedItems: 12,
      timestamp: '2 hours ago',
      duration: '45 min',
      type: 'meeting' as const,
    },
    {
      id: '2',
      name: 'Weekend Planning Voice Memo',
      status: 'completed' as const,
      extractedItems: 5,
      timestamp: '4 hours ago',
      duration: '3 min',
      type: 'voice-memo' as const,
    },
    {
      id: '3',
      name: 'Product Brainstorm Session',
      status: 'processing' as const,
      extractedItems: 0,
      timestamp: '1 hour ago',
      duration: '28 min',
      type: 'brainstorm' as const,
    },
  ];

  const handleToggleApproval = (id: string) => {
    setExtractedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, approved: !item.approved } : item
      )
    );
  };

  const stats = [
    { title: 'Total Items', value: extractedItems.length, icon: CheckSquare, color: 'text-blue-600' },
    { title: 'Approved', value: extractedItems.filter(item => item.approved).length, icon: CheckSquare, color: 'text-green-600' },
    { title: 'High Priority', value: extractedItems.filter(item => item.priority === 'high').length, icon: TrendingUp, color: 'text-red-600' },
    { title: 'This Week', value: 3, icon: Calendar, color: 'text-purple-600' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transcripts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Transcripts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTranscripts.map((transcript) => (
              <ProcessingCard key={transcript.id} transcript={transcript} />
            ))}
          </CardContent>
        </Card>

        {/* Extracted Items Needing Review */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Items Needing Review
              </CardTitle>
              <Badge variant="outline">
                {extractedItems.filter(item => !item.approved).length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {extractedItems
              .filter(item => !item.approved)
              .slice(0, 3)
              .map((item) => (
                <ExtractedItem
                  key={item.id}
                  item={item}
                  onToggleApproval={handleToggleApproval}
                />
              ))}
            {extractedItems.filter(item => !item.approved).length > 3 && (
              <Button variant="outline" className="w-full mt-4">
                View All {extractedItems.filter(item => !item.approved).length} Items
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Upload Transcript
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Sync Calendar
            </Button>
            <Button variant="outline">
              <Lightbulb className="h-4 w-4 mr-2" />
              Export Ideas
            </Button>
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Manage Contacts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
