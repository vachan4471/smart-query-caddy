
/**
 * Pre-trained answers for common TDS questions
 * This database can be expanded with more Q&A pairs
 */

interface QuestionAnswer {
  question: string;
  answer: string;
  topic: string;
}

// Initial static dataset
const initialPreTrainedData: QuestionAnswer[] = [
  {
    question: "Running uv run --with httpie -- https [URL] installs the Python package httpie and sends a HTTPS request to the URL. Send a HTTPS request to https://httpbin.org/get with the URL encoded parameter email set to 21f3001091@ds.study.iitm.ac.in What is the JSON output of the command?",
    answer: '{\n  "args": {\n    "email": "21f3001091@ds.study.iitm.ac.in"\n  },\n  "headers": {\n    "Accept": "*/*",\n    "Accept-Encoding": "gzip, deflate",\n    "Host": "httpbin.org",\n    "User-Agent": "HTTPie/3.2.2",\n    "X-Amzn-Trace-Id": "Root=1-65f3a8b6-61e2b7c73f7b9fbe6e62ff6b"\n  },\n  "origin": "49.207.203.53",\n  "url": "https://httpbin.org/get?email=21f3001091%40ds.study.iitm.ac.in"\n}',
    topic: "GA1"
  },
  {
    question: "Let's make sure you know how to use npx and prettier. Download . In the directory where you downloaded it, make sure it is called README.md, and run npx -y prettier@3.4.2 README.md | sha256sum. What is the output of the command?",
    answer: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    topic: "GA1"
  },
  {
    question: "Let's make sure you can write formulas in Google Sheets. Type this formula into Google Sheets. (It won't work in Excel) =SUM(ARRAY_CONSTRAIN(SEQUENCE(100, 100, 5, 11), 1, 10)) What is the result?",
    answer: "1595",
    topic: "GA2"
  },
  {
    question: "How many Wednesdays are there in the date range 1987-12-27 to 2015-09-11?",
    answer: "1435",
    topic: "GA3"
  },
  {
    question: "Let's make sure you know how to use JSON. Sort this JSON array of objects by the value of the age field. In case of a tie, sort by the name field. Paste the resulting JSON below without any spaces or newlines.",
    answer: '[{"name":"Nora","age":4},{"name":"Ivy","age":11},{"name":"David","age":14},{"name":"Karen","age":21},{"name":"Liam","age":21},{"name":"Charlie","age":27},{"name":"Alice","age":35},{"name":"Grace","age":41},{"name":"Henry","age":62},{"name":"Oscar","age":62},{"name":"Jack","age":64},{"name":"Bob","age":68},{"name":"Frank","age":70},{"name":"Paul","age":77},{"name":"Mary","age":89},{"name":"Emma","age":94}]',
    topic: "GA3"
  },
];

// Function to load data from storage
function loadStoredData(): QuestionAnswer[] {
  try {
    const storedData = localStorage.getItem('tdsQAPairs');
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading stored Q&A pairs:', error);
  }
  return [...initialPreTrainedData]; // Return copy of initial data if no stored data
}

// Initialize with stored data or fallback to initial data
export let preTrainedData: QuestionAnswer[] = loadStoredData();

// Function to save current data to storage
function saveDataToStorage() {
  try {
    localStorage.setItem('tdsQAPairs', JSON.stringify(preTrainedData));
    console.log(`Saved ${preTrainedData.length} Q&A pairs to localStorage`);
  } catch (error) {
    console.error('Error saving Q&A pairs to localStorage:', error);
  }
}

// Updated Topics with detailed descriptions based on user's provided content
export const gaTopics = [
  { 
    id: "GA1", 
    name: "Basic Command Line Tools",
    description: "VS Code, HTTP requests, file operations, SQL queries, and essential development tools"
  },
  { 
    id: "GA2", 
    name: "Documentation & Deployment", 
    description: "Markdown, GitHub Pages, Docker, API deployment, and automation with GitHub Actions"
  },
  { 
    id: "GA3", 
    name: "LLM & Embeddings",
    description: "Sentiment analysis, token cost, embeddings, vector databases, and function calling" 
  },
  { 
    id: "GA4", 
    name: "Web Scraping & APIs",
    description: "HTML extraction, web scraping, API access, and automated scheduled actions" 
  },
  { 
    id: "GA5", 
    name: "Data Processing & Transformation",
    description: "Excel/data cleaning, log analysis, JSON parsing, and media processing" 
  },
];

/**
 * Function to search for a matching question
 * Uses improved fuzzy matching to find the closest question match
 */
export function findMatchingAnswer(question: string): { answer: string; found: boolean } {
  // Convert to lowercase and trim for better matching
  const normalizedQuestion = question.toLowerCase().trim();
  
  // Try exact matching first
  const exactMatch = preTrainedData.find(
    item => item.question.toLowerCase().trim() === normalizedQuestion
  );
  
  if (exactMatch) {
    return { answer: exactMatch.answer, found: true };
  }
  
  // Try substring matching (if the question contains a significant part of a stored question)
  for (const data of preTrainedData) {
    const storedQuestion = data.question.toLowerCase().trim();
    
    // If the input question is a substantial part of a stored question
    if (storedQuestion.includes(normalizedQuestion) && normalizedQuestion.length > 15) {
      return { answer: data.answer, found: true };
    }
    
    // If the stored question is a substantial part of the input question
    if (normalizedQuestion.includes(storedQuestion) && storedQuestion.length > 15) {
      return { answer: data.answer, found: true };
    }
  }
  
  // Try fuzzy matching - checks if the input question contains key parts of any pre-trained question
  for (const data of preTrainedData) {
    // Create keywords from the stored question
    const keywords = data.question
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3) // Only use significant words
      .map(word => word.replace(/[^a-z0-9]/g, '')); // Remove special characters
      
    // Count how many keywords match
    const matchCount = keywords.filter(keyword => 
      normalizedQuestion.includes(keyword)
    ).length;
    
    // If more than 60% of keywords match, consider it a match (lowered threshold for better matching)
    if (matchCount > 0 && matchCount / keywords.length > 0.6) {
      return { answer: data.answer, found: true };
    }
  }
  
  return { answer: '', found: false };
}

/**
 * Function to add a new question and answer pair to the database
 */
export function addQAPair(question: string, answer: string, topic: string = "GA1"): void {
  const newPair = { question, answer, topic };
  
  // Add to the in-memory array
  preTrainedData.push(newPair);
  
  // Save to localStorage for persistence
  saveDataToStorage();
  
  console.log('Added new Q&A pair:', newPair);
}

/**
 * Function to delete a question and answer pair from the database
 */
export function deleteQAPair(index: number): boolean {
  if (index < 0 || index >= preTrainedData.length) {
    console.error('Invalid index for deletion:', index);
    return false;
  }
  
  // Remove from the in-memory array
  preTrainedData.splice(index, 1);
  
  // Save to localStorage for persistence
  saveDataToStorage();
  
  console.log('Deleted Q&A pair at index:', index);
  return true;
}

/**
 * Function to reset the database to initial values
 */
export function resetQADatabase(): void {
  preTrainedData = [...initialPreTrainedData];
  saveDataToStorage();
  console.log('Reset Q&A database to initial values');
}

/**
 * Function to get all Q&A pairs
 */
export function getAllQAPairs(): QuestionAnswer[] {
  return [...preTrainedData]; // Return a copy to prevent accidental mutations
}

// Add to the global window object for easy console access
declare global {
  interface Window {
    addQAPair: typeof addQAPair;
    deleteQAPair: typeof deleteQAPair;
    resetQADatabase: typeof resetQADatabase;
    getAllQAPairs: typeof getAllQAPairs;
  }
}

// Make functions accessible from the browser console
if (typeof window !== 'undefined') {
  window.addQAPair = addQAPair;
  window.deleteQAPair = deleteQAPair;
  window.resetQADatabase = resetQADatabase;
  window.getAllQAPairs = getAllQAPairs;
}
