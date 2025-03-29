import { config, systemPrompt } from './config';
import { findMatchingAnswer } from './preTrainedAnswers';

/**
 * Service for interacting with LLM APIs and pre-trained answers
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

  // First, check if we have a pre-trained answer
  const { answer, found } = findMatchingAnswer(question);
  if (found) {
    console.log('Found pre-trained answer');
    // Simulate AI thinking time for better UX (300-1500ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1200 + 300));
    return answer;
  }

  console.log('No pre-trained answer found, trying OpenAI API');

  try {
    // Check if we have an API key - first try the dynamic getter, then fallback to static key
    let apiKey = config.openaiApiKey;
    
    // If no dynamic key is found, use the static one
    if (!apiKey && config.staticApiKey) {
      apiKey = config.staticApiKey;
      console.log('Using static API key');
    }
    
    if (!apiKey) {
      console.warn('OpenAI API key not found. Using generic answer.');
      return "I couldn't find a pre-trained answer for this question, and no OpenAI API key is available. Please try a different question or check the API key configuration.";
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
      console.log('Failed with OpenAI API, falling back to generic response');
      return "I couldn't find a pre-trained answer for this question, and the OpenAI API request failed. Please try again later or try a different question.";
    }
  } catch (error) {
    console.error('Error generating answer:', error);
    return `Error: ${error instanceof Error ? error.message : String(error)}. Please try again later or check with a different question.`;
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

// Let's keep the mock function for backward compatibility but we won't be using it much
export function generateMockAnswer(question: string, fileData: any = null): string {
  const { answer, found } = findMatchingAnswer(question);
  if (found) return answer;
  
  return "This question is not in our pre-trained database yet. Please try another question or check back later when more questions have been added.";
}
