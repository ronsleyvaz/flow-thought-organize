
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

export const extractItemsFromText = async (text: string, apiKey: string): Promise<ExtractedData> => {
  const prompt = `Please analyze the following transcript and extract actionable items. Return a JSON response with the following structure:
{
  "tasks": [{"title": string, "description": string, "priority": "low|medium|high", "dueDate": string (if mentioned), "assignee": string (if mentioned)}],
  "events": [{"title": string, "description": string, "date": string (if mentioned), "time": string (if mentioned)}],
  "ideas": [{"title": string, "description": string}],
  "contacts": [{"name": string, "role": string, "company": string, "email": string, "phone": string}]
}

Only include items that are clearly mentioned in the transcript. For priorities, use your best judgment based on urgency indicators. For dates, use YYYY-MM-DD format if possible.

Transcript: ${text}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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
    
    // Parse the JSON response
    const extractedData = JSON.parse(content);
    
    return extractedData;
  } catch (error) {
    console.error('Error extracting items:', error);
    throw error;
  }
};
