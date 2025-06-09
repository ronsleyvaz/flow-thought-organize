
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Upload, FileText, CheckSquare, Calendar, Lightbulb, Users, Settings } from 'lucide-react';

const HowToUse = () => {
  const steps = [
    {
      title: "Configure OpenAI API Key",
      description: "Go to Settings and enter your OpenAI API key to enable AI-powered processing",
      icon: Settings,
      badge: "Required",
      color: "bg-crimson text-white"
    },
    {
      title: "Input Your Content",
      description: "Choose from three input methods:",
      icon: Upload,
      badge: "Step 1",
      color: "bg-lead text-white",
      substeps: [
        "Live Recording: Click the record button and speak directly",
        "File Upload: Upload audio files (MP3, WAV) or text documents",
        "Text Input: Paste or type text directly into the input field"
      ]
    },
    {
      title: "AI Processing",
      description: "Our AI automatically extracts actionable items from your content",
      icon: FileText,
      badge: "Step 2",
      color: "bg-footprint text-jet-black",
      substeps: [
        "Tasks: Action items with due dates and assignees",
        "Events: Meeting dates, appointments, and deadlines",
        "Ideas: Creative concepts and project suggestions", 
        "Contacts: People mentioned with their details"
      ]
    },
    {
      title: "Review & Approve",
      description: "Review extracted items and approve the ones you want to keep",
      icon: CheckSquare,
      badge: "Step 3",
      color: "bg-crimson text-white"
    },
    {
      title: "Organize & Export",
      description: "Items are automatically categorized and can be exported for use in other tools",
      icon: Calendar,
      badge: "Step 4",
      color: "bg-lead text-white"
    }
  ];

  const features = [
    {
      title: "Live Recording",
      description: "Real-time audio capture with playback before processing",
      icon: Mic
    },
    {
      title: "File Upload", 
      description: "Support for audio files and text documents",
      icon: Upload
    },
    {
      title: "Smart Categorization",
      description: "Automatic sorting into Business, Personal, Home, and Projects",
      icon: FileText
    },
    {
      title: "Item Management",
      description: "Edit, approve, and organize extracted items",
      icon: CheckSquare
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bebas text-jet-black mb-2 tracking-wider">HOW TO USE TRANSCRIPTFLOW</h1>
        <p className="text-lg text-lead">Transform your conversations into actionable insights with AI</p>
      </div>

      {/* Getting Started Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bebas text-crimson tracking-wide">GETTING STARTED</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-crimson rounded-full flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-jet-black">{step.title}</h3>
                  <Badge className={step.color}>{step.badge}</Badge>
                </div>
                <p className="text-lead mb-3">{step.description}</p>
                {step.substeps && (
                  <ul className="space-y-1">
                    {step.substeps.map((substep, subIndex) => (
                      <li key={subIndex} className="text-sm text-lead flex items-center">
                        <span className="w-2 h-2 bg-crimson rounded-full mr-3 flex-shrink-0"></span>
                        {substep}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bebas text-crimson tracking-wide">KEY FEATURES</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <feature.icon className="h-8 w-8 text-crimson flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-jet-black mb-1">{feature.title}</h4>
                  <p className="text-sm text-lead">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bebas text-crimson tracking-wide">TIPS & BEST PRACTICES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-crimson-50 rounded-lg">
              <h4 className="font-bold text-crimson mb-2">Audio Quality</h4>
              <p className="text-sm text-jet-black">Ensure clear audio with minimal background noise for better transcription accuracy.</p>
            </div>
            <div className="p-4 bg-lead/10 rounded-lg">
              <h4 className="font-bold text-lead mb-2">Speaking Clearly</h4>
              <p className="text-sm text-jet-black">Speak clearly and mention specific dates, names, and action items explicitly.</p>
            </div>
            <div className="p-4 bg-footprint/20 rounded-lg">
              <h4 className="font-bold text-footprint mb-2">Review Items</h4>
              <p className="text-sm text-jet-black">Always review extracted items before approving to ensure accuracy.</p>
            </div>
            <div className="p-4 bg-crimson-50 rounded-lg">
              <h4 className="font-bold text-crimson mb-2">Categories</h4>
              <p className="text-sm text-jet-black">Use the category filters to organize and find specific types of items quickly.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bebas text-crimson tracking-wide">SUPPORTED FORMATS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Mic className="h-8 w-8 text-crimson mx-auto mb-2" />
              <h4 className="font-bold text-jet-black mb-1">Audio Recording</h4>
              <p className="text-sm text-lead">Live microphone input</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Upload className="h-8 w-8 text-crimson mx-auto mb-2" />
              <h4 className="font-bold text-jet-black mb-1">Audio Files</h4>
              <p className="text-sm text-lead">MP3, WAV, M4A</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <FileText className="h-8 w-8 text-crimson mx-auto mb-2" />
              <h4 className="font-bold text-jet-black mb-1">Text Files</h4>
              <p className="text-sm text-lead">TXT, direct input</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HowToUse;
