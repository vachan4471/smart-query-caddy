
/**
 * GitHub Gist-based storage utility for Q&A pairs
 * This provides a simple cloud storage solution without requiring a backend
 */

import { toast } from 'sonner';
import { preTrainedData, QuestionAnswer } from './preTrainedAnswers';

// This is a public gist ID that stores our Q&A data
// We'll create it if it doesn't exist
const GIST_ID = 'b5a5eb7baac5e982c10d99e57abcc8dd';
const GIST_FILENAME = 'tds_qa_data.json';

// Use a GitHub personal access token with gist scope
// This token is for demonstration purposes and has limited permissions for this specific app
const GITHUB_TOKEN = 'ghp_8AXNR8nRjpK1bKc6nT0vr1LpGlU6Np3JtTt8';

/**
 * Fetch Q&A pairs from GitHub Gist
 */
export async function fetchQAPairsFromGist(): Promise<QuestionAnswer[] | null> {
  try {
    console.log('Fetching Q&A pairs from Gist...');
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error: ${response.status}`, errorText);
      
      if (response.status === 404) {
        console.log('Gist not found, attempting to create it...');
        const created = await createInitialGist();
        if (created) {
          toast.success('Created new Q&A database in cloud storage');
          return preTrainedData;
        } else {
          toast.error('Failed to create Q&A database. Using local data only.');
        }
      } else {
        toast.error(`Error fetching Q&A database: ${response.status}`);
      }
      
      return null;
    }

    const gistData = await response.json();
    
    if (gistData.files && gistData.files[GIST_FILENAME]) {
      const content = gistData.files[GIST_FILENAME].content;
      const parsedData = JSON.parse(content) as QuestionAnswer[];
      console.log(`Successfully fetched ${parsedData.length} Q&A pairs from cloud`);
      return parsedData;
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

    // First check if the gist exists
    const checkResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      }
    });
    
    // If gist doesn't exist, create it first
    if (checkResponse.status === 404) {
      console.log('Gist not found, creating it first...');
      const created = await createInitialGist();
      if (!created) {
        toast.error('Could not create cloud storage. Using local storage only.');
        return false;
      }
    }
    
    // Now update the gist with our data
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
 * This will be automatically called if the gist is not found
 */
export async function createInitialGist(): Promise<boolean> {
  try {
    console.log('Creating initial Gist...');
    
    const requestBody = {
      description: "TDS Solver Q&A Database",
      public: false, // Make it private for better security
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
      const errorData = await response.text();
      console.error(`GitHub API error: ${response.status}`, errorData);
      return false;
    }

    const data = await response.json();
    console.log('Created new Gist with ID:', data.id);
    // Update our GIST_ID constant if different
    if (data.id !== GIST_ID) {
      console.log(`Note: Created Gist ID ${data.id} differs from configured ID ${GIST_ID}`);
      toast.info(`New Gist created with ID: ${data.id}. You may need to update your configuration.`);
    }
    return true;
  } catch (error) {
    console.error('Error creating Gist:', error);
    return false;
  }
}
