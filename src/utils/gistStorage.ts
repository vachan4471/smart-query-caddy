
/**
 * GitHub Gist-based storage utility for Q&A pairs
 * This provides a simple cloud storage solution without requiring a backend
 */

import { toast } from 'sonner';
import { preTrainedData, QuestionAnswer } from './preTrainedAnswers';

// This is a public gist ID that stores our Q&A data
// Created specifically for this project
const GIST_ID = 'b5a5eb7baac5e982c10d99e57abcc8dd';
const GIST_FILENAME = 'tds_qa_data.json';

// GitHub token is now using a personal access token with gist scope
// This token has been regenerated with proper permissions
const GITHUB_TOKEN = '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';

/**
 * Fetch Q&A pairs from GitHub Gist
 */
export async function fetchQAPairsFromGist(): Promise<QuestionAnswer[] | null> {
  try {
    console.log('Fetching Q&A pairs from Gist...');
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      
      if (response.status === 404) {
        toast.error('Q&A database not found. Please check the Gist ID.');
      } else {
        toast.error(`Error fetching Q&A database: ${response.status}`);
      }
      
      return null;
    }

    const gistData = await response.json();
    
    if (gistData.files && gistData.files[GIST_FILENAME]) {
      const content = gistData.files[GIST_FILENAME].content;
      return JSON.parse(content) as QuestionAnswer[];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from Gist:', error);
    toast.error('Network error while accessing cloud storage');
    return null;
  }
}

/**
 * Save Q&A pairs to GitHub Gist
 */
export async function saveQAPairsToGist(data: QuestionAnswer[]): Promise<boolean> {
  try {
    console.log('Saving Q&A pairs to Gist...');
    
    const requestBody = {
      description: "TDS Solver Q&A Database",
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(data, null, 2)
        }
      }
    };

    console.log('Using GitHub token for authentication'); // Logging without exposing the token
    
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorData);
      
      // More specific error messaging based on status code
      if (response.status === 401) {
        toast.error('Authentication failed - please contact the administrator');
      } else if (response.status === 403) {
        toast.error('Permission denied - GitHub token lacks sufficient permissions');
      } else if (response.status === 404) {
        toast.error('Q&A database not found - please check the Gist ID');
      } else {
        toast.error(`Failed to save Q&A pairs: ${response.status}`);
      }
      
      return false;
    }

    toast.success('Q&A pairs saved to cloud storage successfully');
    return true;
  } catch (error) {
    console.error('Error saving to Gist:', error);
    toast.error('Network error while saving to cloud storage');
    return false;
  }
}

/**
 * Initialize the Q&A database from GitHub Gist
 * Falls back to localStorage if Gist is not available
 */
export async function initializeQADatabase(): Promise<QuestionAnswer[]> {
  // First try to get from Gist (cloud storage)
  try {
    const gistData = await fetchQAPairsFromGist();
    
    if (gistData && gistData.length > 0) {
      console.log(`Loaded ${gistData.length} Q&A pairs from cloud storage`);
      // Update localStorage with the cloud data for faster local access
      localStorage.setItem('tdsQAPairs', JSON.stringify(gistData));
      return gistData;
    }
  } catch (error) {
    console.error('Error initializing from cloud storage:', error);
  }
  
  // If Gist is empty or unavailable, try localStorage
  try {
    const storedData = localStorage.getItem('tdsQAPairs');
    if (storedData) {
      const parsedData = JSON.parse(storedData) as QuestionAnswer[];
      console.log(`Loaded ${parsedData.length} Q&A pairs from local storage`);
      
      // If we have local data, try to sync to Gist
      if (parsedData.length > 0) {
        console.log('Attempting to sync local data to cloud storage...');
        saveQAPairsToGist(parsedData).then(success => {
          if (success) {
            console.log('Successfully synced local data to cloud storage');
          }
        });
      }
      
      return parsedData;
    }
  } catch (error) {
    console.error('Error loading stored Q&A pairs:', error);
  }
  
  console.log('Using initial pre-trained data');
  // If all else fails, return the initial data
  return [...preTrainedData]; 
}

/**
 * Fallback method to create the gist if it doesn't exist
 * This would typically be run once by an administrator
 */
export async function createInitialGist(): Promise<boolean> {
  try {
    console.log('Creating initial Gist...');
    
    const requestBody = {
      description: "TDS Solver Q&A Database",
      public: true,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(preTrainedData, null, 2)
        }
      }
    };

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('Created new Gist with ID:', data.id);
    toast.success('Created new cloud database. Please update the GIST_ID constant.');
    return true;
  } catch (error) {
    console.error('Error creating Gist:', error);
    return false;
  }
}
