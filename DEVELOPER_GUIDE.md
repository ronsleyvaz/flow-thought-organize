
# TranscriptFlow Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Core Components](#core-components)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Authentication](#authentication)
8. [Styling & Theming](#styling--theming)
9. [Data Flow](#data-flow)
10. [Development Workflow](#development-workflow)
11. [Testing](#testing)
12. [Deployment](#deployment)

## Project Overview

TranscriptFlow is a React-based web application that processes audio and text inputs to extract actionable items using OpenAI's APIs. The application provides real-time recording, file upload capabilities, and AI-powered content analysis.

### Key Technologies
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **TailwindCSS** for utility-first styling
- **Shadcn/ui** for consistent UI components
- **Clerk** for authentication and user management
- **TanStack Query** for server state management
- **OpenAI APIs** for transcription and content extraction

## Architecture

The application follows a component-based architecture with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── services/           # API service layers
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

### Design Patterns
- **Custom Hooks**: Business logic encapsulation
- **Service Layer**: API abstraction
- **Component Composition**: Reusable UI building blocks
- **State Management**: Centralized app state with local component state

## File Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── AuthWrapper.tsx        # Authentication wrapper
│   ├── Dashboard.tsx          # Main dashboard component
│   ├── ExtractedItem.tsx      # Individual item display
│   ├── FileUploader.tsx       # File upload component
│   ├── Header.tsx             # Application header
│   ├── HowToUse.tsx          # User guide component
│   ├── LiveRecorder.tsx       # Audio recording component
│   ├── ProcessingCard.tsx     # Transcript processing status
│   ├── Settings.tsx           # Application settings
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── StateManager.tsx       # Data export/import
│   ├── TextInput.tsx          # Text input component
│   └── TranscriptDetailView.tsx # Detailed transcript view
├── hooks/
│   ├── useAppState.ts         # Local app state management
│   ├── useUserAppState.ts     # User-specific state with Clerk
│   └── use-toast.ts           # Toast notification hook
├── services/
│   ├── openaiService.ts       # OpenAI API integration
│   └── firefliesService.ts    # Fireflies.ai integration
├── pages/
│   ├── Index.tsx              # Main application page
│   └── NotFound.tsx           # 404 error page
└── lib/
    └── utils.ts               # Utility functions
```

## Core Components

### Dashboard (`src/components/Dashboard.tsx`)
The main application interface that orchestrates all functionality:
- **Props**: App state, view controls, CRUD operations
- **Features**: File processing, live recording, item management
- **State**: Processing status, selected transcripts, API key
- **Key Methods**:
  - `processTextWithOpenAI()`: Text processing pipeline
  - `processAudioFileWithOpenAI()`: Audio file processing
  - `addItemsFromExtractedData()`: Data transformation and storage

### LiveRecorder (`src/components/LiveRecorder.tsx`)
Handles real-time audio recording:
- **Features**: Microphone access, recording controls, playback
- **Audio Processing**: WebRTC MediaRecorder API
- **State Management**: Recording status, audio blob handling
- **Integration**: OpenAI Whisper for transcription

### ExtractedItem (`src/components/ExtractedItem.tsx`)
Individual item display and management:
- **Props**: Item data, CRUD callbacks
- **Features**: Inline editing, approval/rejection, priority management
- **UI Elements**: Badges, buttons, form inputs

### Sidebar (`src/components/Sidebar.tsx`)
Navigation and filtering interface:
- **Features**: View navigation, category filtering, item counts
- **Dynamic Content**: Real-time count updates based on app state
- **Integration**: App state for category statistics

## State Management

### useUserAppState Hook (`src/hooks/useUserAppState.ts`)
Centralized state management with Clerk integration:

```typescript
interface AppState {
  transcriptMetadata: TranscriptMetadata[];
  extractedItems: ExtractedItem[];
  lastSaved: Date | null;
  autoSave: boolean;
}

interface ExtractedItem {
  id: string;
  type: 'task' | 'event' | 'idea' | 'contact';
  title: string;
  description: string;
  category: 'Business' | 'Personal' | 'Home' | 'Projects';
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  approved: boolean;
  dueDate?: string;
  assignee?: string;
  sourceTranscriptId: string;
  extractedAt: Date;
}
```

**Key Methods**:
- `addExtractedItems()`: Bulk item addition
- `toggleItemApproval()`: Item approval management
- `editExtractedItem()`: Item modification
- `deleteExtractedItem()`: Item removal
- `exportState()` / `importState()`: Data persistence

### Local Storage Integration
- Automatic state persistence to localStorage
- User-specific data isolation using Clerk user ID
- Configurable auto-save functionality

## API Integration

### OpenAI Service (`src/services/openaiService.ts`)

#### Whisper Transcription
```typescript
export const transcribeAudio = async (audioFile: File, apiKey: string): Promise<string>
```
- **Input**: Audio file, API key
- **Output**: Transcribed text
- **Error Handling**: API errors, network issues

#### GPT Content Extraction
```typescript
export const extractItemsFromText = async (text: string, apiKey: string)
```
- **Input**: Text content, API key
- **Output**: Structured data (tasks, events, ideas, contacts)
- **Prompt Engineering**: Detailed extraction instructions

#### Extraction Prompt Structure
The AI prompt includes:
- Context setting for business/personal content
- Detailed output format specifications
- Examples of each item type
- Confidence scoring guidelines
- Contact information filtering rules

## Authentication

### Clerk Integration
- **Provider**: `ClerkProvider` wraps the entire application
- **Components**: `UserButton` for user management
- **Hooks**: `useUser()` for user state access
- **Protection**: `AuthWrapper` component for route protection

### User State Isolation
- Data segregation by Clerk user ID
- Automatic cleanup on user change
- Session persistence across browser refreshes

## Styling & Theming

### Amplify AI Brand Implementation
The application implements Amplify AI's brand guidelines:

#### Color Palette
```css
:root {
  --crimson: #ed1c24;      /* Primary brand color */
  --jet-black: #000000;    /* Secondary color */
  --lead: #58595b;         /* Tertiary color */
  --footprint: #c6c1a4;    /* Accent color */
}
```

#### Typography
- **Headings**: Bebas Neue (used sparingly)
- **Body Text**: Helvetica Neue
- **Logo Text**: Bebas Neue with letter spacing

#### Component Styling
- Custom Tailwind utilities for brand colors
- Consistent spacing and border radius
- Accessible color contrast ratios
- Responsive design patterns

## Data Flow

### Input Processing Pipeline
1. **Input Capture**: Audio recording, file upload, or text input
2. **Preprocessing**: File validation, format conversion
3. **API Processing**: OpenAI Whisper (audio) → GPT (extraction)
4. **Data Transformation**: Raw API response → typed interfaces
5. **State Update**: Add to application state
6. **UI Update**: Reactive component updates

### State Updates
```typescript
// Example data flow for new items
const extractedData = await extractItemsFromText(text, apiKey);
const transcriptId = addProcessedTranscript(metadata);
const formattedItems = transformExtractedData(extractedData, transcriptId);
addExtractedItems(formattedItems);
```

## Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting
- **File Naming**: PascalCase for components, camelCase for utilities

### Component Development
1. Create component in appropriate directory
2. Define TypeScript interfaces for props
3. Implement component logic
4. Add to parent component/router
5. Test functionality

### Adding New Features
1. **Plan**: Define requirements and user stories
2. **Design**: Create component structure and interfaces
3. **Implement**: Build components with TypeScript
4. **Test**: Manual testing and edge cases
5. **Document**: Update this guide and README

## Testing

### Manual Testing Checklist
- [ ] Audio recording functionality
- [ ] File upload (various formats)
- [ ] Text input processing
- [ ] Item CRUD operations
- [ ] Category filtering
- [ ] Export/import functionality
- [ ] Authentication flows
- [ ] Mobile responsiveness

### Error Scenarios
- [ ] Invalid API keys
- [ ] Network failures
- [ ] Corrupted audio files
- [ ] Large file uploads
- [ ] Browser permissions (microphone)

## Deployment

### Build Process
```bash
npm run build
```
Creates a `dist/` directory with optimized static files.

### Environment Variables
- **VITE_CLERK_PUBLISHABLE_KEY**: Clerk authentication key
- **VITE_OPENAI_API_KEY**: Optional default OpenAI key

### Hosting Requirements
- Static file hosting (Netlify, Vercel, S3)
- HTTPS required for microphone access
- Single Page Application (SPA) routing support

### Performance Considerations
- **Bundle Size**: Code splitting for large dependencies
- **Audio Processing**: Client-side audio handling
- **API Calls**: Debounced user inputs
- **State Persistence**: Efficient localStorage usage

## Security Considerations

### API Key Management
- Client-side storage (user responsibility)
- No server-side key storage
- Clear warnings about API key security

### Data Privacy
- Client-side processing only
- No server-side data storage
- User-controlled data export/import

### Audio Permissions
- Explicit microphone permission requests
- Graceful degradation when denied
- Clear user feedback

## Performance Optimization

### Code Splitting
- Lazy loading for heavy components
- Dynamic imports for optional features
- Bundle analysis and optimization

### Audio Handling
- Efficient blob management
- Memory cleanup after processing
- Progressive audio loading

### State Management
- Optimistic updates for better UX
- Debounced API calls
- Efficient re-renders with React.memo

## Common Issues & Solutions

### Audio Recording Problems
- **No microphone access**: Check browser permissions
- **Silent recordings**: Verify microphone hardware
- **Large file sizes**: Implement compression

### API Integration Issues
- **Rate limiting**: Implement request queuing
- **Invalid responses**: Add response validation
- **Network errors**: Retry logic with exponential backoff

### State Management
- **Data loss**: Implement auto-save
- **Performance issues**: Optimize re-renders
- **Memory leaks**: Clean up event listeners

## Future Enhancements

### Planned Features
- Real-time collaboration
- Advanced export formats
- Custom AI prompt templates
- Batch processing capabilities
- Mobile application

### Technical Debt
- Component refactoring for better modularity
- Comprehensive test suite implementation
- Performance monitoring and optimization
- Accessibility improvements

---

This developer guide should be updated as the application evolves. For questions or clarifications, consult the codebase or contact the development team.
