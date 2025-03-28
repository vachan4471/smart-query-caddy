
import { config, systemPrompt } from './config';
import { generateMockAnswer } from './mockAnswers';

/**
 * Service for interacting with LLM APIs
 */

export async function generateAnswer(question: string, fileData: any = null): Promise<string> {
  console.log('Question received:', question);
  
  if (fileData) {
    console.log('File data received:', {
      name: fileData.name,
      type: fileData.type,
      contentPreview: typeof fileData.content === 'string' 
        ? fileData.content.substring(0, 100) + '...' 
        : 'Binary data'
    });
  }

  // Check if always use mock responses is enabled
  if (typeof window !== 'undefined' && localStorage.getItem('use_mock_responses') === 'true') {
    console.log('Using mock responses by user preference');
    return generateMockAnswer(question, fileData);
  }

  try {
    // Check if we have an API key - first try the dynamic getter, then fallback to static key
    let apiKey = config.openaiApiKey;
    
    // If no dynamic key is found, use the static one
    if (!apiKey && config.staticApiKey) {
      apiKey = config.staticApiKey;
      console.log('Using static API key');
    }
    
    if (!apiKey) {
      console.warn('OpenAI API key not found. Using mock responses.');
      return generateMockAnswer(question, fileData);
    }

    console.log('Using OpenAI API with valid key');
    
    // Prepare messages for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: formatUserPrompt(question, fileData) }
    ];

    // First try with a more affordable model compatible with free tier
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Using a model that works with free tier
          messages: messages,
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error with gpt-3.5-turbo:', errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.log('Failed with gpt-3.5-turbo, falling back to mock response');
      return generateMockAnswer(question, fileData);
    }
  } catch (error) {
    console.error('Error generating answer:', error);
    return `Error: ${error instanceof Error ? error.message : String(error)}. Please try again later or check our mock responses.`;
  }
}

function formatUserPrompt(question: string, fileData: any = null): string {
  let prompt = `Question: ${question}\n\n`;
  
  if (fileData) {
    prompt += `I've also uploaded a file: ${fileData.name} (${fileData.type}).\n`;
    
    if (typeof fileData.content === 'string') {
      prompt += `File content: ${fileData.content.substring(0, 1000)}`;
      if (fileData.content.length > 1000) {
        prompt += `... [truncated, total length: ${fileData.content.length} characters]`;
      }
    } else {
      prompt += `The file is binary and can't be displayed as text.`;
    }
  }
  
  prompt += `\n\nPlease provide a concise, accurate answer for this Tools in Data Science assignment question.`;
  return prompt;
}

// Re-export the mock answer function for direct use
export { generateMockAnswer };
