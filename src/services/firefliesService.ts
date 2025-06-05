
interface FirefliesAuthResponse {
  data: {
    login: {
      user: {
        user_id: string;
        name: string;
        email: string;
      };
      token: string;
    };
  };
}

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

  async login(email: string, password: string): Promise<boolean> {
    const mutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          user {
            user_id
            name
            email
          }
          token
        }
      }
    `;

    try {
      console.log('Attempting to login to Fireflies API...');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: { email, password },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FirefliesAuthResponse = await response.json();
      
      if (data.data?.login?.token) {
        this.token = data.data.login.token;
        localStorage.setItem('fireflies_token', this.token);
        localStorage.setItem('fireflies_user', JSON.stringify(data.data.login.user));
        console.log('Successfully logged into Fireflies');
        return true;
      } else {
        console.error('Login failed - no token received');
        return false;
      }
    } catch (error) {
      console.error('Fireflies login error:', error);
      return false;
    }
  }

  async getRecentTranscripts(limit: number = 10): Promise<FirefliesTranscript[]> {
    if (!this.token) {
      this.token = localStorage.getItem('fireflies_token');
      if (!this.token) {
        throw new Error('Not authenticated with Fireflies');
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
          this.logout();
          throw new Error('Authentication expired. Please login again.');
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

  logout() {
    this.token = null;
    localStorage.removeItem('fireflies_token');
    localStorage.removeItem('fireflies_user');
  }

  isAuthenticated(): boolean {
    return !!this.token || !!localStorage.getItem('fireflies_token');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('fireflies_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const firefliesService = new FirefliesService();
