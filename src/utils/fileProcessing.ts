
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import AdmZip from 'adm-zip';
import csv from 'csv-parser';

// Convert fs.readFile to promise-based
const readFile = promisify(fs.readFile);

interface FileData {
  content: string | Buffer;
  type: string;
  name: string;
}

/**
 * Process a ZIP file and extract its contents
 */
export async function processZip(zipFilePath: string): Promise<FileData | null> {
  try {
    const zip = new AdmZip(zipFilePath);
    const entries = zip.getEntries();
    
    // Find CSV files in the zip
    const csvEntries = entries.filter(entry => 
      entry.name.toLowerCase().endsWith('.csv')
    );
    
    if (csvEntries.length > 0) {
      // Process the first CSV file found
      const csvEntry = csvEntries[0];
      const csvContent = csvEntry.getData().toString('utf8');
      
      return {
        content: csvContent,
        type: 'text/csv',
        name: csvEntry.name
      };
    }
    
    // If no CSV files, return the first file content
    if (entries.length > 0) {
      const firstEntry = entries[0];
      return {
        content: firstEntry.getData(),
        type: guessContentType(firstEntry.name),
        name: firstEntry.name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error processing ZIP file:', error);
    throw new Error('Failed to process ZIP file');
  }
}

/**
 * Extract files from a directory
 */
export async function extractFiles(dirPath: string): Promise<FileData[]> {
  const files = fs.readdirSync(dirPath);
  const fileDataPromises = files.map(async (file) => {
    const filePath = path.join(dirPath, file);
    const content = await readFile(filePath);
    return {
      content,
      type: guessContentType(file),
      name: file
    };
  });
  
  return Promise.all(fileDataPromises);
}

/**
 * Guess the content type based on file extension
 */
function guessContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Parse CSV data and return as an array of objects
 */
export function parseCSV(csvContent: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvContent);
    
    bufferStream
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: Error) => reject(error));
  });
}
