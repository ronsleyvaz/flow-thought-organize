
export interface ExtractedData {
  tasks: Array<{
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignee?: string;
  }>;
  events: Array<{
    title: string;
    description?: string;
    date?: string;
    time?: string;
  }>;
  ideas: Array<{
    title: string;
    description?: string;
  }>;
  contacts: Array<{
    name: string;
    role?: string;
    company?: string;
    email?: string;
    phone?: string;
  }>;
}

export const transcribeAudio = async (audioFile: File, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required for transcription');
  }

  // Check file size (Whisper has a 25MB limit)
  if (audioFile.size > 25 * 1024 * 1024) {
    throw new Error('Audio file is too large. Maximum size is 25MB.');
  }

  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('language', 'en'); // Set language to English for better accuracy
  formData.append('response_format', 'json'); // Ensure JSON response

  try {
    console.log('Sending audio to Whisper API:');
    console.log('- File name:', audioFile.name);
    console.log('- File size:', audioFile.size, 'bytes');
    console.log('- File type:', audioFile.type);
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    console.log('Whisper API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key in settings.');
      } else if (response.status === 413) {
        throw new Error('Audio file is too large. Please use a smaller file.');
      } else {
        throw new Error(`OpenAI Whisper API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Whisper API response data:', data);
    
    const transcribedText = data.text || '';
    console.log('Transcribed text length:', transcribedText.length);
    
    if (!transcribedText.trim()) {
      throw new Error('No speech detected in audio file. Please try with a clearer recording.');
    }
    
    return transcribedText;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  }
};

export const extractItemsFromText = async (text: string, apiKey: string): Promise<ExtractedData> => {
  if (!text || text.trim().length === 0) {
    console.log('Empty text provided, returning empty data');
    return { tasks: [], events: [], ideas: [], contacts: [] };
  }

  const prompt = `You are an expert AI assistant specialized in extracting actionable information from meeting transcripts, voice memos, and conversations. Analyze the following transcript carefully and extract ALL relevant actionable items with high precision.

EXTRACTION GUIDELINES:

**TASKS** - Extract any action items, assignments, deliverables, or work that needs to be done:
- Look for phrases like: "need to", "should do", "will handle", "action item", "TODO", "follow up on", "complete by", "deliver", "implement", "research", "create", "update", "send", "call", "email", "schedule", "review", "prepare", "organize"
- Include both explicit assignments and implied responsibilities
- Determine priority: HIGH (urgent, ASAP, critical), MEDIUM (important, soon), LOW (nice to have, later)
- Extract due dates from phrases like: "by Friday", "next week", "end of month", "before the meeting", "ASAP"
- Note assignees from: "John will...", "Sarah needs to...", "I'll handle...", "team should..."

**EVENTS** - Extract any meetings, appointments, deadlines, or scheduled activities:
- Look for: meeting schedules, appointments, deadlines, presentations, launches, reviews, calls
- Time indicators: "tomorrow", "next Tuesday", "at 3pm", "on the 15th", "next month"
- Include recurring events, project milestones, and important dates
- Extract both date AND time when mentioned

**IDEAS** - Capture brainstorming items, suggestions, improvements, or creative concepts:
- Innovation suggestions, process improvements, new features, creative solutions
- "What if we...", "we could try...", "another approach", "idea:", "suggestion"
- Strategic thinking, future possibilities, optimizations
- Problems identified that need solving

**CONTACTS** - Extract people mentioned with their contact information or roles:
- ONLY include if they have email, phone, or specific role/company information
- Don't include just names - must have actionable contact details
- Look for introductions, referrals, new team members, external contacts

QUALITY STANDARDS:
- Be comprehensive but accurate - extract everything relevant, nothing irrelevant
- Use clear, concise titles (max 60 characters)
- Write meaningful descriptions that provide context
- Standardize date formats to YYYY-MM-DD when converting relative dates
- Use standard time format HH:MM (24-hour)
- Be liberal in extraction - when in doubt, include it

Return ONLY valid JSON in this EXACT format:

{
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "description": "Additional context and details",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD or relative like 'next week'",
      "assignee": "Person responsible"
    }
  ],
  "events": [
    {
      "title": "Meeting or event name",
      "description": "Purpose, agenda, or additional details",
      "date": "YYYY-MM-DD or 'next Tuesday'",
      "time": "HH:MM or '3pm' or '2:30-3:30'"
    }
  ],
  "ideas": [
    {
      "title": "Concise idea summary",
      "description": "Full idea explanation and potential impact"
    }
  ],
  "contacts": [
    {
      "name": "Full Name",
      "role": "Job title or role",
      "company": "Company name",
      "email": "email@domain.com",
      "phone": "+1234567890"
    }
  ]
}

TRANSCRIPT TO ANALYZE:
${text}`;

  try {
    console.log('Sending text to ChatGPT for extraction, text length:', text.length);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert assistant that extracts actionable items from transcripts. Return only valid JSON responses in the specified format. Be thorough and accurate.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ChatGPT API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('ChatGPT response content:', content);
    
    // Parse the JSON response
    const extractedData = JSON.parse(content);
    
    // Ensure all arrays exist with defaults
    const normalizedData: ExtractedData = {
      tasks: Array.isArray(extractedData.tasks) ? extractedData.tasks : [],
      events: Array.isArray(extractedData.events) ? extractedData.events : [],
      ideas: Array.isArray(extractedData.ideas) ? extractedData.ideas : [],
      contacts: Array.isArray(extractedData.contacts) ? extractedData.contacts : []
    };
    
    console.log('Normalized extracted data:', normalizedData);
    return normalizedData;
  } catch (error) {
    console.error('Error extracting items:', error);
    
    // Return empty data structure on error instead of throwing
    return { tasks: [], events: [], ideas: [], contacts: [] };
  }
};
