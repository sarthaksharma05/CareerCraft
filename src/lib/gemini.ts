// Gemini API integration for content generation

const GEMINI_API_KEY = 'AIzaSyCVTB1HzIMHwvZ0XMZfuDOnohbC1D5x2Go';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function generateContent(type: string, niche: string, platform: string, additionalContext: string): Promise<string> {
  // Build a prompt based on the user input
  const prompt = `Generate ${type} for the ${niche} niche on ${platform}. ${additionalContext ? 'Additional context: ' + additionalContext : ''}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to generate content from Gemini API');
  }

  const data = await response.json();
  // Gemini returns candidates[0].content.parts[0].text
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.';
} 