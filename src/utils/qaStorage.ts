
/**
 * Enhanced storage utility for Q&A pairs
 * Provides local storage functionality with improved reliability
 */

import { toast } from 'sonner';
import { preTrainedData, QuestionAnswer } from './preTrainedAnswers';

// Storage key for localStorage
const STORAGE_KEY = 'tdsQAPairs';

/**
 * Save Q&A pairs to storage
 */
export async function saveQAPairsToStorage(data: QuestionAnswer[]): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log(`Saved ${data.length} Q&A pairs to local storage`);
    
    // We'll return true to indicate success
    return true;
  } catch (error) {
    console.error('Error saving Q&A pairs:', error);
    toast.error('Failed to save Q&A pairs to storage');
    return false;
  }
}

/**
 * Initialize the Q&A database
 * Uses localStorage with pre-trained data as fallback
 */
export async function initializeQADatabase(): Promise<QuestionAnswer[]> {
  try {
    // Try to get from localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      const parsedData = JSON.parse(storedData) as QuestionAnswer[];
      console.log(`Loaded ${parsedData.length} Q&A pairs from local storage`);
      return parsedData;
    }
  } catch (error) {
    console.error('Error loading stored Q&A pairs:', error);
  }
  
  console.log('Using initial pre-trained data');
  // Return the initial data if nothing is found in storage
  return [...preTrainedData]; 
}

/**
 * Utility function to export Q&A data as JSON
 * This allows users to share Q&A data by downloading and uploading files
 */
export function exportQAData(data: QuestionAnswer[]): void {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `tds_qa_data_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Q&A data exported successfully');
  } catch (error) {
    console.error('Error exporting Q&A data:', error);
    toast.error('Failed to export Q&A data');
  }
}

/**
 * Utility function to import Q&A data from JSON file
 */
export function importQAData(file: File): Promise<QuestionAnswer[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const jsonData = JSON.parse(event.target.result as string) as QuestionAnswer[];
        
        // Validate the data format
        if (!Array.isArray(jsonData) || !jsonData.every(item => 
          typeof item === 'object' && 
          'question' in item && 
          'answer' in item && 
          'topic' in item)) {
          throw new Error('Invalid data format');
        }
        
        resolve(jsonData);
      } catch (error) {
        console.error('Error parsing imported data:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
