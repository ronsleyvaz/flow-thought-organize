
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
