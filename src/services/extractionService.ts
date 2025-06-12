
import { createExtractionPrompt } from './extractionPrompts';
import { ExtractedData } from './openaiService';

export const extractItemsFromText = async (text: string, apiKey: string): Promise<ExtractedData> => {
  if (!text || text.trim().length === 0) {
    console.log('Empty text provided, returning empty data');
    return { tasks: [], events: [], ideas: [], contacts: [] };
  }

  const prompt = createExtractionPrompt(text);

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
