// ElevenLabs API integration for voice generation
export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private supabaseUrl: string;

  constructor() {
    // Updated API key
    this.apiKey = 'sk_b80ad13c253ec53bab8b3b12e8a72eebaa8d9f08167043a7';
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    
    console.log('✅ ElevenLabs API key configured');
  }

  getConfigStatus() {
    return {
      configured: !!this.apiKey,
      hasApiKey: !!this.apiKey,
      connected: !!this.apiKey
    };
  }

  // Test API connection and update user's connection status
  async testConnection(userId?: string) {
    try {
      console.log('🔍 Testing ElevenLabs API connection...');
      
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey
        }
      });

      const isConnected = response.ok;
      
      if (isConnected) {
        console.log('✅ ElevenLabs API connection successful');
      } else {
        console.warn('⚠️ ElevenLabs API connection failed:', response.status, response.statusText);
      }

      // Update user's API connection status if userId is provided
      if (userId && this.supabaseUrl) {
        await this.updateConnectionStatus(userId, isConnected);
      }

      return {
        connected: isConnected,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      console.error('❌ ElevenLabs API connection test failed:', error);
      
      // Update user's API connection status if userId is provided
      if (userId && this.supabaseUrl) {
        await this.updateConnectionStatus(userId, false);
      }

      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user's API connection status in the database
  private async updateConnectionStatus(userId: string, connected: boolean) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.warn('No auth token available for updating API status');
        return;
      }

      const response = await fetch(`${this.supabaseUrl}/functions/v1/update-api-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          service: 'elevenlabs',
          connected,
          lastChecked: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.warn('Failed to update API connection status in database:', await response.text());
      }
    } catch (error) {
      console.warn('Error updating API connection status:', error);
    }
  }

  async getVoices() {
    try {
      // Test connection first
      const connectionTest = await this.testConnection();
      
      if (!connectionTest.connected) {
        console.warn('ElevenLabs API not connected, using mock voices');
        return this.getMockVoices();
      }

      // Direct API call instead of using edge function
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || this.getMockVoices();
    } catch (error) {
      console.warn('ElevenLabs API error:', error, 'Falling back to mock voices.');
      return this.getMockVoices();
    }
  }

  async generateVoice(text: string, voiceId: string): Promise<string> {
    try {
      // Get the auth token from localStorage
      const token = this.getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found');
        throw new Error('Please sign in to generate voiceovers. Authentication is required for voice generation.');
      }

      // Test connection first
      const connectionTest = await this.testConnection();
      
      if (!connectionTest.connected) {
        throw new Error('ElevenLabs API is not connected. Please check your API key configuration.');
      }

      console.log(`Generating voice with ElevenLabs API for voice ID: ${voiceId}`);
      
      // Direct API call to ElevenLabs
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          },
          output_format: 'mp3_44100_128'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error: ${response.status} ${response.statusText}`, errorText);
        
        // Update connection status to false
        if (token) {
          const userId = this.getUserIdFromToken(token);
          if (userId) {
            await this.updateConnectionStatus(userId, false);
          }
        }
        
        throw new Error(`Failed to generate voice: ${response.statusText}`);
      }

      // Get audio data and create blob URL
      const audioBlob = await response.blob();
      
      // Create a proper audio blob with correct MIME type
      const properAudioBlob = new Blob([audioBlob], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(properAudioBlob);
      
      console.log('Voice generation successful, created blob URL:', audioUrl);
      
      // Update connection status to true
      if (token) {
        const userId = this.getUserIdFromToken(token);
        if (userId) {
          await this.updateConnectionStatus(userId, true);
        }
      }
      
      return audioUrl;
    } catch (error) {
      console.error('Voice generation error:', error);
      throw error;
    }
  }

  private getMockVoices() {
    return [
      { voice_id: 'rachel', name: 'Rachel', category: 'Female' },
      { voice_id: 'domi', name: 'Domi', category: 'Female' },
      { voice_id: 'bella', name: 'Bella', category: 'Female' },
      { voice_id: 'antoni', name: 'Antoni', category: 'Male' },
      { voice_id: 'elli', name: 'Elli', category: 'Female' },
      { voice_id: 'josh', name: 'Josh', category: 'Male' },
      { voice_id: 'arnold', name: 'Arnold', category: 'Male' },
      { voice_id: 'adam', name: 'Adam', category: 'Male' },
      { voice_id: 'sam', name: 'Sam', category: 'Male' },
    ];
  }

  private getAuthToken(): string | null {
    // Try to get the token from localStorage
    // First try the standard format
    const authToken = localStorage.getItem('sb-' + this.supabaseUrl.split('//')[1].split('.')[0] + '-auth-token');
    
    if (authToken) {
      try {
        const authData = JSON.parse(authToken);
        return authData.access_token;
      } catch (e) {
        console.warn('Failed to parse auth token');
      }
    }
    
    // Try alternative formats
    const keys = Object.keys(localStorage);
    const authKey = keys.find(key => key.includes('supabase.auth.token') || key.includes('-auth-token'));
    
    if (authKey) {
      try {
        const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
        return authData.access_token || authData.token;
      } catch (e) {
        console.warn('Failed to parse alternative auth token');
      }
    }
    
    return null;
  }

  private getUserIdFromToken(token: string): string | null {
    try {
      // Decode JWT payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      return payload.sub || null;
    } catch (e) {
      console.warn('Failed to decode JWT token:', e);
      return null;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();