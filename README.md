
# TranscriptFlow by Amplify AI

TranscriptFlow is an AI-powered transcript processing and extraction tool that transforms conversations, meetings, and voice notes into actionable insights. Extract tasks, events, ideas, and contacts from any audio or text input with advanced artificial intelligence.

## Features

- **Live Recording**: Real-time audio capture with playback functionality
- **File Upload**: Support for audio files (MP3, WAV, M4A) and text documents
- **AI-Powered Extraction**: Automatically extract tasks, events, ideas, and contacts
- **Smart Categorization**: Organize items into Business, Personal, Home, and Projects
- **Review & Approval**: Edit and approve extracted items before finalizing
- **Export Functionality**: Export your data for use in other applications
- **Transcript Traceability**: Track which transcript each item was extracted from

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- OpenAI API key for AI processing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd transcriptflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Configuration

1. **OpenAI API Key**: Go to Settings and enter your OpenAI API key to enable AI processing
2. **Account Setup**: Sign up or sign in using the authentication system
3. **Start Processing**: Begin with live recording, file upload, or text input

## How to Use

### Step 1: Configure API Key
Navigate to Settings and enter your OpenAI API key. This is required for AI-powered transcript processing.

### Step 2: Input Content
Choose from three input methods:
- **Live Recording**: Click record and speak directly into your microphone
- **File Upload**: Upload audio files or text documents
- **Text Input**: Type or paste text directly

### Step 3: AI Processing
The system automatically processes your input and extracts:
- **Tasks**: Action items with due dates and assignees
- **Events**: Meetings, appointments, and deadlines
- **Ideas**: Creative concepts and project suggestions
- **Contacts**: People mentioned with their contact information

### Step 4: Review & Approve
Review the extracted items and approve the ones you want to keep. You can edit any item before approval.

### Step 5: Organize & Export
Items are automatically categorized and can be exported for use in other productivity tools.

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Amplify AI branding
- **UI Components**: Shadcn/ui component library
- **State Management**: React hooks and TanStack Query
- **Authentication**: Clerk for user management
- **AI Processing**: OpenAI GPT and Whisper APIs
- **Build Tool**: Vite
- **Fonts**: Bebas Neue (headings), Helvetica Neue (body)

## Brand Guidelines

TranscriptFlow follows Amplify AI's brand guidelines:
- **Primary Color**: Crimson (#ed1c24)
- **Secondary Colors**: Jet Black (#000000), Lead (#58595b), Footprint (#c6c1a4)
- **Typography**: Bebas Neue for headings (sparingly), Helvetica Neue for body text
- **Logo**: Amplify AI "A" logo with proper contrast requirements

## Deployment

TranscriptFlow can be deployed to any static hosting service:

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service of choice

## Support

For technical support or questions about TranscriptFlow, please contact the Amplify AI team.

## License

© 2024 Amplify AI. All rights reserved.
