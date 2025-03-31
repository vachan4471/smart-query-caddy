
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

// GitHub token with gist scope (read/write)
// This is a public token for this specific demo - in production you would use a backend API
const GITHUB_TOKEN = 'ghp_ZwHyeHVMCYUqUgjplpCHMrUYpuqGxw2LXgKR';

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
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const gistData = await response.json();
    
    if (gistData.files && gistData.files[GIST_FILENAME]) {
      const content = gistData.files[GIST_FILENAME].content;
      return JSON.parse(content) as QuestionAnswer[];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from Gist:', error);
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

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving to Gist:', error);
    toast.error('Failed to save Q&A pairs to cloud storage');
    return false;
  }
}

/**
 * Initialize the Q&A database from GitHub Gist
 * Falls back to localStorage if Gist is not available
 */
export async function initializeQADatabase(): Promise<QuestionAnswer[]> {
  // First try to get from Gist (cloud storage)
  const gistData = await fetchQAPairsFromGist();
  
  if (gistData && gistData.length > 0) {
    console.log(`Loaded ${gistData.length} Q&A pairs from cloud storage`);
    // Update localStorage with the cloud data for faster local access
    localStorage.setItem('tdsQAPairs', JSON.stringify(gistData));
    return gistData;
  }
  
  // If Gist is empty or unavailable, try localStorage
  try {
    const storedData = localStorage.getItem('tdsQAPairs');
    if (storedData) {
      const parsedData = JSON.parse(storedData) as QuestionAnswer[];
      
      // If we have local data but couldn't access Gist, try to sync to Gist
      if (parsedData.length > 0 && !gistData) {
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
  
  // If all else fails, return the initial data
  return [...preTrainedData]; 
}

