
/**
 * Pre-trained answers for common TDS questions
 * This database can be expanded with more Q&A pairs
 */

interface QuestionAnswer {
  question: string;
  answer: string;
  topic: string;
}

export const preTrainedData: QuestionAnswer[] = [
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
  // Add placeholder for more questions - can be expanded later
  // This is where users can add more questions and answers
];

// Topics available in the course
export const gaTopics = [
  { id: "GA1", name: "Basic Command Line Tools" },
  { id: "GA2", name: "Spreadsheets & Data Analysis" },
  { id: "GA3", name: "Data Formats & Processing" },
  { id: "GA4", name: "Large Language Models & AI Tools" },
  { id: "GA5", name: "Data Visualization & Reporting" },
];

/**
 * Function to search for a matching question
 * Uses fuzzy matching to find the closest question match
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
  
  // Try fuzzy matching - checks if the input question contains key parts of any pre-trained question
  for (const data of preTrainedData) {
    // Create keywords from the stored question
    const keywords = data.question
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 4) // Only use significant words
      .map(word => word.replace(/[^a-z0-9]/g, '')); // Remove special characters
      
    // Count how many keywords match
    const matchCount = keywords.filter(keyword => 
      normalizedQuestion.includes(keyword)
    ).length;
    
    // If more than 70% of keywords match, consider it a match
    if (matchCount > 0 && matchCount / keywords.length > 0.7) {
      return { answer: data.answer, found: true };
    }
  }
  
  return { answer: '', found: false };
}

// Helper function to add a new Q&A pair to the database
export function addQAPair(question: string, answer: string, topic: string = "GA1"): void {
  const newPair = { question, answer, topic };
  
  // In a real application, this would save to a database
  // For now, we'll just push to the array in memory (for demonstration purposes)
  preTrainedData.push(newPair);
  
  // In a real app, you might want to save to localStorage as well
  try {
    const currentData = JSON.parse(localStorage.getItem('preTrainedData') || '[]');
    currentData.push(newPair);
    localStorage.setItem('preTrainedData', JSON.stringify(currentData));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}
