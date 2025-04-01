
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { extractFiles, processZip } from '@/utils/fileProcessing';
import { generateAnswer } from '@/utils/llmService';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Check if this is a QA data sync request
    const action = Array.isArray(fields.action) ? fields.action[0] : fields.action || '';
    
    if (action === 'syncQA') {
      const qaDataStr = Array.isArray(fields.qaData) ? fields.qaData[0] : fields.qaData || '';
      
      // Store QA data in a special global variable for server-side persistence
      if (typeof global.tdsQAData === 'undefined') {
        global.tdsQAData = {};
      }
      
      try {
        const qaData = JSON.parse(qaDataStr);
        global.tdsQAData = qaData;
        
        return res.status(200).json({ 
          success: true, 
          message: `Successfully synced ${qaData.length} Q&A pairs to server` 
        });
      } catch (error) {
        console.error('Error syncing QA data:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to sync Q&A data to server' 
        });
      }
    }
    
    if (action === 'getQA') {
      if (typeof global.tdsQAData !== 'undefined' && Object.keys(global.tdsQAData).length > 0) {
        return res.status(200).json({ 
          success: true,
          data: global.tdsQAData,
          message: `Successfully retrieved Q&A pairs from server` 
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          message: 'No Q&A data found on server' 
        });
      }
    }

    // Get question from form fields
    const question = Array.isArray(fields.question) 
      ? fields.question[0] 
      : fields.question || '';

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Process file if provided
    let fileData = null;
    const fileField = files.file;
    const uploadedFile = Array.isArray(fileField) ? fileField[0] : fileField;

    if (uploadedFile) {
      const filePath = uploadedFile.filepath;
      const fileExtension = path.extname(uploadedFile.originalFilename || '').toLowerCase();
      
      if (fileExtension === '.zip') {
        fileData = await processZip(filePath);
      } else {
        // Read other file types directly
        fileData = {
          content: fs.readFileSync(filePath, 'utf8'),
          type: uploadedFile.mimetype || 'text/plain',
          name: uploadedFile.originalFilename || 'file'
        };
      }

      // Clean up the temp file after processing
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting temp file:', error);
      }
    }

    // Get the API key from headers if available
    const apiKey = req.headers['x-openai-api-key'] as string;
    if (apiKey) {
      process.env.VITE_OPENAI_API_KEY = apiKey;
    }

    // Generate answer using LLM
    const answer = await generateAnswer(question, fileData);

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Add this for global server-side data storage
declare global {
  namespace NodeJS {
    interface Global {
      tdsQAData?: any;
    }
  }
}
