
import React, { useState, useEffect } from 'react';
import QuestionForm from '@/components/QuestionForm';
import ResultDisplay from '@/components/ResultDisplay';
import { Toaster } from '@/components/ui/sonner';
import { config } from '@/utils/config';
import { Input } from '@/components/ui/input';
import { InfoIcon } from 'lucide-react';

const Index = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  
  // Check if API key exists in localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      // Set the API key in window for the API to access
      window.VITE_OPENAI_API_KEY = savedApiKey;
    }
  }, []);
  
  // Save API key to localStorage when it changes
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
    // Set the API key in window for the API to access
    window.VITE_OPENAI_API_KEY = newApiKey;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            TDS Solver
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your AI assistant for Tools in Data Science assignments
          </p>
        </header>

        <main className="max-w-4xl mx-auto bg-slate-800/50 p-6 md:p-8 rounded-xl backdrop-blur-sm border border-slate-700 shadow-xl">
          {!config.openaiApiKey && !apiKey && (
            <div className="mb-6 p-4 bg-amber-900/50 border border-amber-700 rounded-lg flex items-start gap-3">
              <InfoIcon className="text-amber-400 mt-1 shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-amber-200">OpenAI API Key Required</h3>
                <p className="text-amber-300/80 text-sm mt-1 mb-3">
                  Please enter your OpenAI API key below. The key will be stored in your browser's local storage and not sent to any server.
                </p>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  className="max-w-lg bg-amber-950/30 border-amber-800/50 text-white"
                />
              </div>
            </div>
          )}
          
          <QuestionForm setResult={setResult} setLoading={setLoading} />
          
          {(result || loading) && (
            <div className="mt-8 pt-8 border-t border-slate-700">
              <ResultDisplay result={result} loading={loading} />
            </div>
          )}
        </main>

        <footer className="mt-16 text-center text-slate-400 text-sm">
          <p>Powered by AI • MIT Licensed • {new Date().getFullYear()}</p>
          <p className="mt-2">
            <a 
              href="https://github.com/yourusername/tds-solver" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

// Add the VITE_OPENAI_API_KEY property to the Window interface
declare global {
  interface Window {
    VITE_OPENAI_API_KEY?: string;
  }
}

export default Index;
