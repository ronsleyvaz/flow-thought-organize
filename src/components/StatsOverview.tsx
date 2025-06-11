
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, FileText, TrendingUp } from 'lucide-react';
import { ExtractedItem, TranscriptMetadata } from '@/hooks/useUserAppState';

interface StatsOverviewProps {
  filteredItems: ExtractedItem[];
  transcriptMetadata: TranscriptMetadata[];
}

const StatsOverview = ({ filteredItems, transcriptMetadata }: StatsOverviewProps) => {
  const stats = [
    { title: 'Total Items', value: filteredItems.length, icon: CheckSquare, color: 'text-blue-600' },
    { title: 'Approved', value: filteredItems.filter(item => item.approved).length, icon: CheckSquare, color: 'text-green-600' },
    { title: 'High Priority', value: filteredItems.filter(item => item.priority === 'high').length, icon: TrendingUp, color: 'text-red-600' },
    { title: 'Transcripts Processed', value: transcriptMetadata.length, icon: FileText, color: 'text-purple-600' },
  ];

  return (
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
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
