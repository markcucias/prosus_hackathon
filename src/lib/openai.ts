import OpenAI from 'openai';

// Initialize OpenAI client with custom hackathon endpoint
// Using the AI University Games Hackathon 2024 provided API
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY is not set in environment variables');
    }
    
    openaiClient = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://fj7qg3jbr3.execute-api.eu-west-1.amazonaws.com/v1',
      dangerouslyAllowBrowser: true // Only for development/demo
      // For production, move this to Supabase Edge Functions
    });
  }
  
  return openaiClient;
}

// Helper to check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

// Model to use (hackathon-provided model)
export const GPT_MODEL = 'gpt-5-nano';

