
import React, { useState, useEffect } from 'react';
import QuestionForm from '@/components/QuestionForm';
import ResultDisplay from '@/components/ResultDisplay';
import { Toaster } from '@/components/ui/sonner';
import { config } from '@/utils/config';
import { Input } from '@/components/ui/input';
import { InfoIcon, CheckCircleIcon, AlertTriangleIcon } from 'lucide-react';

const Index = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);
  const [useMockResponses, setUseMockResponses] = useState<boolean>(false);
  
  // Check if API key exists in localStorage or config on component mount
  useEffect(() => {
    // Try to load from localStorage first
    const savedApiKey = localStorage.getItem('openai_api_key');
    
    // If there's a key in localStorage or config has a static key
    if (savedApiKey || config.staticApiKey) {
      // If there's a saved key, use it
      if (savedApiKey) {
        setApiKey(savedApiKey);
        window.VITE_OPENAI_API_KEY = savedApiKey;
      } else {
        // Otherwise use the static key from config
        setApiKey(config.staticApiKey);
        window.VITE_OPENAI_API_KEY = config.staticApiKey;
        // Also save it to localStorage for future use
        localStorage.setItem('openai_api_key', config.staticApiKey);
      }
      setApiKeySet(true);
    }
  }, []);
  
  // Save API key to localStorage when it changes
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
  };
  
  // Save the API key when the user submits it
  const saveApiKey = () => {
    if (apiKey && apiKey.startsWith('sk-')) {
      localStorage.setItem('openai_api_key', apiKey);
      window.VITE_OPENAI_API_KEY = apiKey;
      setApiKeySet(true);
    }
  };

  // Toggle mock responses
  const toggleMockResponses = () => {
    setUseMockResponses(!useMockResponses);
    localStorage.setItem('use_mock_responses', (!useMockResponses).toString());
  };

  // Load mock response preference
  useEffect(() => {
    const savedPref = localStorage.getItem('use_mock_responses');
    if (savedPref) {
      setUseMockResponses(savedPref === 'true');
    }
  }, []);

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
          {!apiKeySet ? (
            <div className="mb-6 p-4 bg-amber-900/50 border border-amber-700 rounded-lg flex items-start gap-3">
              <InfoIcon className="text-amber-400 mt-1 shrink-0" size={20} />
              <div className="w-full">
                <h3 className="font-medium text-amber-200">OpenAI API Key Required</h3>
                <p className="text-amber-300/80 text-sm mt-1 mb-3">
                  Please enter your OpenAI API key below. The key will be stored in your browser's local storage and not sent to any server.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    className="flex-1 bg-amber-950/30 border-amber-800/50 text-white"
                  />
                  <button 
                    onClick={saveApiKey}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircleIcon className="text-green-400 mt-1 shrink-0" size={20} />
                <div>
                  <h3 className="font-medium text-green-200">API Key Configured</h3>
                  <p className="text-green-300/80 text-sm mt-1">
                    Your OpenAI API key is set and ready to use. You can now ask TDS assignment questions.
                  </p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-blue-900/50 border border-blue-700 rounded-lg flex items-start gap-3">
                <AlertTriangleIcon className="text-blue-400 mt-1 shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-200">Free Tier Limitations</h3>
                  <p className="text-blue-300/80 text-sm mt-1 mb-2">
                    Using a free OpenAI account may result in rate limits or quota errors. 
                    We'll automatically fall back to pre-defined mock responses when needed.
                  </p>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={useMockResponses}
                        onChange={toggleMockResponses}
                      />
                      <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-blue-200">Always use mock responses</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <QuestionForm setResult={setResult} setLoading={setLoading} useMockResponses={useMockResponses} />
          
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
