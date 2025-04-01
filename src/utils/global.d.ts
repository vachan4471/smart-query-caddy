
// Global declarations for the TDS app

// For server-side storage in Next.js API routes
declare namespace NodeJS {
  interface Global {
    tdsQAData?: any;
  }
}

// For window object extensions
interface Window {
  addQAPair: (question: string, answer: string, topic?: string) => void;
  deleteQAPair: (index: number) => boolean;
  resetQADatabase: () => void;
  getAllQAPairs: () => any[];
}
