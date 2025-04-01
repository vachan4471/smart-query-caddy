
/**
 * Enhanced storage utility for Q&A pairs
 * Provides local storage functionality with improved reliability and cross-device sharing
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
  // First try to get data from server (for sharing between devices)
  try {
    console.log('Attempting to fetch Q&A data from server...');
    const serverData = await fetchQAPairsFromServer();
    
    if (serverData && serverData.length > 0) {
      console.log(`Loaded ${serverData.length} Q&A pairs from server`);
      // Update localStorage with the server data for faster local access
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
      return serverData;
    }
  } catch (error) {
    console.error('Error loading from server, falling back to local storage:', error);
  }
  
  // Try to get from localStorage if server fails
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      const parsedData = JSON.parse(storedData) as QuestionAnswer[];
      console.log(`Loaded ${parsedData.length} Q&A pairs from local storage`);
      return parsedData;
    }
  } catch (error) {
    console.error('Error loading stored Q&A pairs:', error);
    toast.error('Error accessing local storage. Using initial data.');
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

        // Save imported data to localStorage for immediate use
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonData));
        toast.success(`Imported and saved ${jsonData.length} Q&A pairs`);
        
        resolve(jsonData);
      } catch (error) {
        console.error('Error parsing imported data:', error);
        toast.error('Invalid file format. Please upload a valid JSON file.');
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
      toast.error('Failed to read file');
    };
    
    reader.readAsText(file);
  });
}

/**
 * Clear database function for testing and troubleshooting
 */
export function clearQADatabase(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Database cleared. Using initial data on next load.');
    return true;
  } catch (error) {
    console.error('Error clearing database:', error);
    toast.error('Failed to clear database');
    return false;
  }
}

/**
 * Sync the Q&A pairs to the server for cross-device sharing
 */
export async function syncQAPairsToServer(data: QuestionAnswer[]): Promise<boolean> {
  try {
    console.log('Syncing Q&A pairs to server...');
    const formData = new FormData();
    formData.append('action', 'syncQA');
    formData.append('qaData', JSON.stringify(data));
    
    const response = await fetch('/api/tds', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Q&A pairs synced to server successfully');
      return true;
    } else {
      toast.error(result.message || 'Failed to sync to server');
      return false;
    }
  } catch (error) {
    console.error('Error syncing to server:', error);
    toast.error('Network error while syncing to server');
    return false;
  }
}

/**
 * Fetch Q&A pairs from the server for cross-device sharing
 */
export async function fetchQAPairsFromServer(): Promise<QuestionAnswer[] | null> {
  try {
    console.log('Fetching Q&A pairs from server...');
    const formData = new FormData();
    formData.append('action', 'getQA');
    
    const response = await fetch('/api/tds', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`Successfully fetched ${result.data.length} Q&A pairs from server`);
      return result.data;
    } else {
      console.warn(result.message || 'No data found on server');
      return null;
    }
  } catch (error) {
    console.error('Error fetching from server:', error);
    return null;
  }
}
