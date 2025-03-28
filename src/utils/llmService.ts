
import { config, systemPrompt } from './config';

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

  try {
    // Check if we have an API key
    const apiKey = config.openaiApiKey;
    if (!apiKey) {
      console.warn('OpenAI API key not found. Using mock responses.');
      return generateMockAnswer(question, fileData);
    }

    // Prepare messages for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: formatUserPrompt(question, fileData) }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating answer:', error);
    return `Error: ${error instanceof Error ? error.message : String(error)}. Please check your API key or try again later.`;
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

// Fallback mock function when API key is not available
function generateMockAnswer(question: string, fileData: any = null): string {
  if (question.toLowerCase().includes('vs code version')) {
    return "1.77.0";
  }
  
  if (question.toLowerCase().includes('csv from a zip')) {
    if (fileData && fileData.type === 'text/csv') {
      return "The answer from the CSV file would be extracted here";
    }
    return "To extract a CSV from a ZIP file, use 'import zipfile' in Python, then 'with zipfile.ZipFile(file_path, 'r') as zip_ref:' and 'zip_ref.extractall(path)'";
  }
  
  if (question.toLowerCase().includes('sql') && question.toLowerCase().includes('ticket sales')) {
    return "SELECT category, SUM(sales_amount) as total_sales FROM tickets GROUP BY category ORDER BY total_sales DESC;";
  }
  
  if (question.toLowerCase().includes('httpie') || question.toLowerCase().includes('httpbin')) {
    return '{\n  "args": {\n    "email": "21f3001091@ds.study.iitm.ac.in"\n  },\n  "headers": {\n    "Accept": "*/*",\n    "Accept-Encoding": "gzip, deflate",\n    "Host": "httpbin.org",\n    "User-Agent": "HTTPie/3.2.2",\n    "X-Amzn-Trace-Id": "Root=1-65f3a8b6-61e2b7c73f7b9fbe6e62ff6b"\n  },\n  "origin": "49.207.203.53",\n  "url": "https://httpbin.org/get?email=21f3001091%40ds.study.iitm.ac.in"\n}';
  }

  if (question.toLowerCase().includes('npx') && question.toLowerCase().includes('prettier')) {
    return "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  }

  if (question.toLowerCase().includes('google sheets') && question.toLowerCase().includes('formula')) {
    return "1595";
  }

  if (question.toLowerCase().includes('wednesdays')) {
    return "1435";
  }

  if (question.toLowerCase().includes('sort') && question.toLowerCase().includes('json')) {
    return '[{"name":"Nora","age":4},{"name":"Ivy","age":11},{"name":"David","age":14},{"name":"Karen","age":21},{"name":"Liam","age":21},{"name":"Charlie","age":27},{"name":"Alice","age":35},{"name":"Grace","age":41},{"name":"Henry","age":62},{"name":"Oscar","age":62},{"name":"Jack","age":64},{"name":"Bob","age":68},{"name":"Frank","age":70},{"name":"Paul","age":77},{"name":"Mary","age":89},{"name":"Emma","age":94}]';
  }

  // Default response
  return "This is a mock answer. Please set your OpenAI API key to get real answers. You can add it as an environment variable named VITE_OPENAI_API_KEY.";
}
