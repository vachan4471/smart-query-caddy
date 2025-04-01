
import { generateAnswer } from '@/utils/llmService';
import { QuestionAnswer } from '@/utils/preTrainedAnswers';

// This is a client-side fallback "API" for development
export async function handleTdsRequest(formData: FormData) {
  const question = formData.get('question') as string;
  const file = formData.get('file') as File | null;
  const action = formData.get('action') as string | null;
  
  // Handle different API actions
  if (action === 'syncQA') {
    const qaDataStr = formData.get('qaData') as string;
    return await handleSyncQAData(qaDataStr);
  }

  if (action === 'getQA') {
    return await handleGetQAData();
  }
  
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
  
  try {
    const answer = await generateAnswer(question, fileData);
    return { answer };
  } catch (error) {
    console.error('Error in TDS API request:', error);
    return { 
      answer: "Sorry, there was an error processing your request. Please try again or check if the database has been loaded correctly." 
    };
  }
}

// Handle syncing QA data to server-side storage (in this case localStorage)
async function handleSyncQAData(qaDataStr: string): Promise<{success: boolean, message: string}> {
  try {
    const qaData = JSON.parse(qaDataStr) as QuestionAnswer[];
    
    // Store in a special localStorage key that serves as server-side storage
    localStorage.setItem('tds_server_qa_data', JSON.stringify(qaData));
    
    return { 
      success: true, 
      message: `Successfully synced ${qaData.length} Q&A pairs to server` 
    };
  } catch (error) {
    console.error('Error syncing QA data:', error);
    return { 
      success: false, 
      message: 'Failed to sync Q&A data to server' 
    };
  }
}

// Handle retrieving QA data from server-side storage
async function handleGetQAData(): Promise<{success: boolean, data?: QuestionAnswer[], message: string}> {
  try {
    const qaDataStr = localStorage.getItem('tds_server_qa_data');
    
    if (!qaDataStr) {
      return { 
        success: false, 
        message: 'No Q&A data found on server' 
      };
    }
    
    const qaData = JSON.parse(qaDataStr) as QuestionAnswer[];
    
    return { 
      success: true,
      data: qaData,
      message: `Successfully retrieved ${qaData.length} Q&A pairs from server` 
    };
  } catch (error) {
    console.error('Error retrieving QA data:', error);
    return { 
      success: false, 
      message: 'Failed to retrieve Q&A data from server' 
    };
  }
}
