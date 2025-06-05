
interface FirefliesTranscript {
  id: string;
  title: string;
  transcript: string;
  summary: string;
  date: string;
  duration: number;
}

interface FirefliesTranscriptsResponse {
  data: {
    transcripts: FirefliesTranscript[];
  };
}

export class FirefliesService {
  private apiUrl = 'https://api.fireflies.ai/graphql';
  private token: string | null = null;

  setApiToken(token: string) {
    this.token = token;
    localStorage.setItem('fireflies_api_token', token);
  }

  async getRecentTranscripts(limit: number = 10): Promise<FirefliesTranscript[]> {
    if (!this.token) {
      this.token = localStorage.getItem('fireflies_api_token');
      if (!this.token) {
        throw new Error('Fireflies API token not configured');
      }
    }

    const query = `
      query GetTranscripts($limit: Int!) {
        transcripts(limit: $limit) {
          id
          title
          transcript
          summary
          date
          duration
        }
      }
    `;

    try {
      console.log('Fetching recent transcripts from Fireflies...');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          query,
          variables: { limit },
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Invalid API token. Please check your Fireflies API token.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FirefliesTranscriptsResponse = await response.json();
      
      if (data.data?.transcripts) {
        console.log(`Retrieved ${data.data.transcripts.length} transcripts`);
        return data.data.transcripts;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      throw error;
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('fireflies_api_token');
  }

  isAuthenticated(): boolean {
    return !!this.token || !!localStorage.getItem('fireflies_api_token');
  }

  getStoredToken(): string | null {
    return localStorage.getItem('fireflies_api_token');
  }
}

export const firefliesService = new FirefliesService();
