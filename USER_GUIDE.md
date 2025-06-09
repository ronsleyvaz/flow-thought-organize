
# TranscriptFlow User Guide

*Transform your conversations into actionable insights with AI*

## Welcome to TranscriptFlow

TranscriptFlow by Amplify AI is your intelligent assistant for extracting actionable items from audio recordings, meetings, and conversations. Whether you're capturing meeting notes, brainstorming sessions, or personal voice memos, TranscriptFlow automatically identifies tasks, events, ideas, and contacts from your content.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Setting Up Your Account](#setting-up-your-account)
3. [Configuring OpenAI Integration](#configuring-openai-integration)
4. [Input Methods](#input-methods)
5. [Understanding Extracted Items](#understanding-extracted-items)
6. [Managing Your Data](#managing-your-data)
7. [Categories and Organization](#categories-and-organization)
8. [Export and Integration](#export-and-integration)
9. [Tips for Best Results](#tips-for-best-results)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Microphone access (for live recording)
- OpenAI API account (for AI processing)

### First Steps
1. **Sign Up**: Create your account using the sign-up button
2. **Configure API**: Add your OpenAI API key in Settings
3. **Start Recording**: Begin with a test recording or file upload
4. **Review Results**: Check extracted items and approve relevant ones

## Setting Up Your Account

### Creating an Account
1. Click "Sign Up" on the main page
2. Enter your email address and create a password
3. Verify your email address
4. Complete your profile setup

### Account Security
- Use a strong, unique password
- Enable two-factor authentication when available
- Keep your API keys secure and private

## Configuring OpenAI Integration

### Getting an OpenAI API Key
1. Visit [OpenAI's website](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key (you won't see it again)

### Adding Your API Key to TranscriptFlow
1. Click the Settings button in the top navigation
2. Locate the "OpenAI Configuration" section
3. Paste your API key in the designated field
4. Click "Save" to store your configuration

**Important**: Your API key is stored locally in your browser and is never sent to our servers. Keep it secure and don't share it with others.

### API Usage and Costs
- Transcription uses OpenAI's Whisper model
- Content extraction uses GPT models
- Costs are billed directly by OpenAI based on usage
- Monitor your usage in the OpenAI dashboard

## Input Methods

### Live Recording
Perfect for capturing meetings, interviews, or voice memos in real-time.

**How to Use:**
1. Click "Live Recording" in the header
2. Grant microphone permissions when prompted
3. Click the red "Record" button to start
4. Speak clearly into your microphone
5. Click "Stop" when finished
6. Review the recording (optional playback)
7. Click "Process" to extract items

**Tips:**
- Speak clearly and at a normal pace
- Minimize background noise
- Mention specific dates, names, and action items
- Use the playback feature to verify audio quality

### File Upload
Upload pre-recorded audio files or text documents for processing.

**Supported Formats:**
- **Audio**: MP3, WAV, M4A (up to 25MB)
- **Text**: TXT files, plain text

**How to Use:**
1. Click "Upload" in the header
2. Drag and drop files or click to browse
3. Select your file(s)
4. Wait for upload completion
5. Click "Process" to extract items

**Tips:**
- Ensure audio files have good quality
- For large files, expect longer processing times
- Text files should contain conversational content

### Text Input
Directly paste or type content for immediate processing.

**How to Use:**
1. Navigate to the Dashboard
2. Find the "Text Input" card
3. Paste or type your content
4. Click "Process Text"
5. Review extracted items

**Best For:**
- Meeting transcripts
- Email conversations
- Notes from interviews
- Brainstorming session notes

## Understanding Extracted Items

TranscriptFlow identifies four types of actionable items:

### Tasks
Action items that need to be completed.

**Examples:**
- "Send the report to John by Friday"
- "Schedule a follow-up meeting next week"
- "Review the budget proposal"

**Fields:**
- Title and description
- Due date (when mentioned)
- Assignee (person responsible)
- Priority level

### Events
Scheduled meetings, appointments, and deadlines.

**Examples:**
- "Team meeting on Thursday at 2 PM"
- "Project deadline is March 15th"
- "Conference call with clients tomorrow"

**Fields:**
- Event title and description
- Date and time
- Location (when mentioned)

### Ideas
Creative concepts, suggestions, and innovations.

**Examples:**
- "We should consider adding a mobile app"
- "What about partnering with local businesses?"
- "New feature idea for the website"

**Fields:**
- Idea title and description
- Category assignment
- Confidence score

### Contacts
People mentioned with their details.

**Examples:**
- "Contact Sarah Johnson at sarah@company.com"
- "John Smith's phone number is 555-0123"
- "Meet with Alex from the marketing team"

**Fields:**
- Name and role
- Company/organization
- Contact information (email, phone)

## Managing Your Data

### Reviewing Extracted Items
1. All extracted items appear in the main dashboard
2. Each item shows a confidence score (how certain the AI is)
3. Items are marked as "Pending Approval" by default
4. Review each item for accuracy

### Approving Items
1. Click the checkmark button to approve an item
2. Approved items are marked with a green badge
3. Only approved items are included in exports
4. You can toggle approval status at any time

### Editing Items
1. Click the edit button (pencil icon) on any item
2. Modify title, description, dates, or assignments
3. Change category or priority level
4. Save your changes

### Deleting Items
1. Click the delete button (trash icon)
2. Confirm deletion in the popup
3. Deleted items cannot be recovered
4. Consider editing instead of deleting when possible

## Categories and Organization

### Category Types
- **Business**: Work-related items, meetings, projects
- **Personal**: Individual tasks, appointments, ideas
- **Home**: Household tasks, family events, maintenance
- **Projects**: Specific project-related items

### Filtering by Category
1. Use the sidebar navigation to filter items
2. Click any category to see only those items
3. Numbers show how many items are in each category
4. "All" shows items across all categories

### Changing Categories
1. Edit any item to change its category
2. Select from the dropdown menu
3. Items are automatically re-categorized
4. Use filtering to verify the change

## Export and Integration

### Exporting Your Data
1. Navigate to the "State Manager" section
2. Click "Export Data"
3. Download a JSON file with all your data
4. This includes both approved and pending items

### Importing Data
1. Use the import function to restore previous exports
2. Select your JSON file
3. Choose to merge or replace existing data
4. Verify the import was successful

### Integration with Other Tools
- Export data can be processed by other applications
- JSON format allows for custom integrations
- Consider using tools like Zapier for automation
- Contact information can be imported into CRM systems

## Tips for Best Results

### Audio Quality
- **Clear Speech**: Speak distinctly and at normal pace
- **Minimize Noise**: Record in quiet environments
- **Good Microphone**: Use quality recording equipment when possible
- **Test First**: Do a short test recording to check quality

### Content Structure
- **Be Specific**: Mention dates, names, and details explicitly
- **Use Keywords**: Say "task," "meeting," "deadline" to help AI recognition
- **Organize Thoughts**: Structure your speech logically
- **Include Context**: Provide background information for better understanding

### Effective Processing
- **Review Everything**: Always check extracted items before approving
- **Edit When Needed**: Correct any inaccuracies in the extracted data
- **Categorize Properly**: Ensure items are in the right categories
- **Set Priorities**: Use priority levels to organize importance

### Workflow Optimization
- **Regular Processing**: Process recordings soon after creation
- **Batch Similar Content**: Group related recordings for efficiency
- **Export Regularly**: Back up your data with regular exports
- **Clean Up**: Remove irrelevant items to keep data organized

## Troubleshooting

### Recording Issues

**Problem**: No audio is being recorded
**Solutions:**
- Check microphone permissions in browser settings
- Verify microphone is connected and working
- Try refreshing the page and allowing permissions again
- Test with other applications to confirm microphone works

**Problem**: Poor audio quality
**Solutions:**
- Move closer to the microphone
- Reduce background noise
- Check microphone settings in your operating system
- Consider using an external microphone

### Processing Issues

**Problem**: No items are being extracted
**Solutions:**
- Verify your OpenAI API key is correct
- Check that your API account has available credits
- Ensure the content contains actionable items
- Try with simpler, more direct language

**Problem**: Inaccurate extractions
**Solutions:**
- Speak more clearly and specifically
- Include more context in your recordings
- Edit items manually after extraction
- Try breaking long recordings into shorter segments

### Technical Issues

**Problem**: Page won't load or is slow
**Solutions:**
- Check your internet connection
- Clear browser cache and cookies
- Try a different browser
- Disable browser extensions temporarily

**Problem**: Data not saving
**Solutions:**
- Ensure you're signed in to your account
- Check browser local storage isn't full
- Try the export function to backup data
- Contact support if issues persist

### API Key Issues

**Problem**: API key not working
**Solutions:**
- Verify the key was copied correctly (no extra spaces)
- Check that your OpenAI account is active
- Ensure you have available API credits
- Try generating a new API key

## Getting Help

### In-App Resources
- **How to Use**: Comprehensive guide within the application
- **Settings**: Configuration options and preferences
- **Dashboard**: Real-time feedback and status updates

### Best Practices
- Start with short test recordings
- Review the How to Use guide regularly
- Keep your API key secure
- Export your data regularly
- Organize items by category for better workflow

### Support Channels
For additional help or questions:
- Review this user guide thoroughly
- Check the in-app How to Use section
- Contact Amplify AI support team
- Visit our knowledge base for updates

---

**Remember**: TranscriptFlow is designed to enhance your productivity by automatically extracting actionable items from your conversations. The more specific and clear your input, the better the results will be. Take time to review and approve items to maintain high data quality.

*© 2024 Amplify AI. All rights reserved.*
