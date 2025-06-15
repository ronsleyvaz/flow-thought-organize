import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign, CheckCircle2, CalendarClock, Lightbulb, User2, Home, Briefcase, FolderOpen } from 'lucide-react';
import { AppState, ExtractedItem, TranscriptMetadata } from '@/hooks/useUserAppState';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardProps {
  activeCategory?: string;
  activeView?: string;
  appState: AppState;
  exportState: () => void;
  importState: (file: File) => void;
  toggleItemApproval: (id: string) => void;
  toggleItemCompletion: (id: string) => void;
  editExtractedItem: (id: string, updates: Partial<ExtractedItem>) => void;
  deleteExtractedItem: (id: string) => void;
  clearAllData: () => void;
  addProcessedTranscript: (metadata: any) => string;
  addExtractedItems: (items: any[]) => void;
  apiKey: string;
}

const Dashboard = ({
  activeCategory,
  activeView,
  appState,
  exportState,
  importState,
  toggleItemApproval,
  toggleItemCompletion,
  editExtractedItem,
  deleteExtractedItem,
  clearAllData,
  addProcessedTranscript,
  addExtractedItems,
  apiKey,
}: DashboardProps) => {
  const extractedItems = appState?.extractedItems || [];
  const transcriptMetadata = appState?.transcriptMetadata || [];

  const filteredItems = activeCategory
    ? extractedItems.filter(item => item.category === activeCategory)
    : extractedItems;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Business': return Briefcase;
      case 'Personal': return User2;
      case 'Home': return Home;
      case 'Projects': return FolderOpen;
      default: return Lightbulb;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Business': return 'bg-blue-100 text-blue-700';
      case 'Personal': return 'bg-green-100 text-green-700';
      case 'Home': return 'bg-purple-100 text-purple-700';
      case 'Projects': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = [
    { label: 'Total Items', value: extractedItems.length, icon: Lightbulb },
    { label: 'Completed Tasks', value: extractedItems.filter(item => item.completed).length, icon: CheckCircle2 },
    { label: 'Upcoming Events', value: extractedItems.filter(item => item.type === 'event').length, icon: CalendarClock },
    { label: 'Total Transcripts', value: transcriptMetadata.length, icon: CircleDollarSign },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extracted Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] w-full">
            <div className="divide-y divide-gray-200">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const CategoryIcon = getCategoryIcon(item.category);
                  const categoryColor = getCategoryColor(item.category);

                  return (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CategoryIcon className="h-5 w-5 text-gray-400" />
                          <div className="text-sm font-medium">{item.title}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={categoryColor}>{item.category}</Badge>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description?.substring(0, 100)}...
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500">No items found in this category.</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transcripts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px] w-full">
            <div className="divide-y divide-gray-200">
              {transcriptMetadata.length > 0 ? (
                transcriptMetadata.map((transcript) => (
                  <div key={transcript.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{transcript.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(transcript.processedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No transcripts processed yet.</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
