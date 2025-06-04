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

  const prompt = `Analyze the following transcript and extract actionable items. Return ONLY a valid JSON response with this exact structure:

{
  "tasks": [{"title": "string", "description": "string", "priority": "low|medium|high", "dueDate": "YYYY-MM-DD", "assignee": "string"}],
  "events": [{"title": "string", "description": "string", "date": "YYYY-MM-DD", "time": "HH:MM"}],
  "ideas": [{"title": "string", "description": "string"}],
  "contacts": [{"name": "string", "role": "string", "company": "string", "email": "string", "phone": "string"}]
}

Rules:
- Only include items clearly mentioned in the transcript
- For tasks: determine priority based on urgency/importance keywords
- For events: extract dates and times if mentioned
- For contacts: include any people mentioned with their details
- For ideas: capture brainstorming items, suggestions, or new concepts
- Use YYYY-MM-DD format for dates
- Return empty arrays if no items of that type are found
- Do not include any text outside the JSON
- Be liberal in extracting items - capture anything that could be actionable

Transcript: ${text}`;

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
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
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
