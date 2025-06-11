
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, FileText, TrendingUp } from 'lucide-react';
import { ExtractedItem, TranscriptMetadata } from '@/hooks/useUserAppState';

interface StatsOverviewProps {
  filteredItems: ExtractedItem[];
  transcriptMetadata: TranscriptMetadata[];
}

const StatsOverview = ({ filteredItems, transcriptMetadata }: StatsOverviewProps) => {
  const stats = [
    { 
      title: 'Total Items', 
      value: filteredItems.length, 
      icon: CheckSquare, 
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    { 
      title: 'Approved', 
      value: filteredItems.filter(item => item.approved).length, 
      icon: CheckSquare, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      title: 'High Priority', 
      value: filteredItems.filter(item => item.priority === 'high').length, 
      icon: TrendingUp, 
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20'
    },
    { 
      title: 'Transcripts Processed', 
      value: transcriptMetadata.length, 
      icon: FileText, 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-muted-foreground/20'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className={`transition-all duration-200 hover:shadow-md hover:scale-105 ${stat.borderColor} ${stat.bgColor}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
