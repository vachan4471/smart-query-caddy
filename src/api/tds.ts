
import { generateAnswer } from '@/utils/llmService';

// This is a client-side fallback "API" for development
export async function handleTdsRequest(formData: FormData) {
  const question = formData.get('question') as string;
  const file = formData.get('file') as File | null;
  
  if (!question) {
    throw new Error('Question is required');
  }
  
  let fileData = null;
  if (file) {
    fileData = {
      name: file.name,
      type: file.type,
      content: file.type.includes('text') || file.type.includes('json') || file.type.includes('csv') 
        ? await file.text() 
        : await file.arrayBuffer()
    };
  }
  
  const answer = await generateAnswer(question, fileData);
  return { answer };
}
