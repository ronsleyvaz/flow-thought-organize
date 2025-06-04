
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
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`OpenAI Whisper API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

export const extractItemsFromText = async (text: string, apiKey: string): Promise<ExtractedData> => {
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

Transcript: ${text}`;

  try {
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
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('OpenAI response content:', content);
    
    // Parse the JSON response
    const extractedData = JSON.parse(content);
    
    // Ensure all arrays exist with defaults
    const normalizedData: ExtractedData = {
      tasks: extractedData.tasks || [],
      events: extractedData.events || [],
      ideas: extractedData.ideas || [],
      contacts: extractedData.contacts || []
    };
    
    console.log('Normalized extracted data:', normalizedData);
    return normalizedData;
  } catch (error) {
    console.error('Error extracting items:', error);
    throw error;
  }
};
