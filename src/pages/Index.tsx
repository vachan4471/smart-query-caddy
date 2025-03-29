
import React, { useState, useEffect, useRef } from 'react';
import QuestionForm from '@/components/QuestionForm';
import ResultDisplay from '@/components/ResultDisplay';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { config } from '@/utils/config';
import { MoonIcon, SunIcon, PlusCircleIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';

const Index = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const resultRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Set API key if available in config
    if (config.staticApiKey) {
      window.VITE_OPENAI_API_KEY = config.staticApiKey;
    }

    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    try {
      const savedQAPairs = localStorage.getItem('preTrainedData');
      if (savedQAPairs) {
        const pairs = JSON.parse(savedQAPairs);
        console.log(`Loaded ${pairs.length} Q&A pairs from localStorage`);
      }
    } catch (error) {
      console.error('Error loading Q&A pairs:', error);
    }
  }, []);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme_preference', newDarkMode ? 'dark' : 'light');
  };

  const bgGradient = darkMode 
    ? "bg-gradient-to-b from-slate-900 to-indigo-950" 
    : "bg-gradient-to-b from-blue-100 to-indigo-50";

  const cardBg = darkMode 
    ? "bg-slate-800/50 border-slate-700" 
    : "bg-white/90 border-slate-200";

  return (
    <div className={`min-h-screen ${bgGradient} transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-700'}`}>
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0 flex items-center space-x-2">
            <span className="text-sm mr-2">{darkMode ? 'Dark' : 'Light'}</span>
            <Switch 
              checked={darkMode} 
              onCheckedChange={toggleTheme} 
              className="data-[state=checked]:bg-blue-600" 
            />
            {darkMode ? <MoonIcon size={16} /> : <SunIcon size={16} />}
          </div>

          <div className="mb-4 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">TDS</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold bg-clip-text text-transparent ${
              darkMode ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-blue-600 to-purple-700'
            }`}>
              TDS Solver
            </h1>
          </div>
          <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-600'} max-w-2xl mx-auto`}>
            Your AI assistant for Tools in Data Science assignments
          </p>
          <div className="mt-2 flex justify-center">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
              IIT Madras Online Degree Program
            </span>
          </div>
          
          <div className="absolute top-0 left-0">
            <Link to="/admin" className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
              darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'
            } transition-colors ${darkMode ? 'text-white' : 'text-slate-700'}`}>
              <PlusCircleIcon size={14} />
              <span>Admin</span>
            </Link>
          </div>
        </header>

        <main className={`max-w-4xl mx-auto ${cardBg} p-6 md:p-8 rounded-xl backdrop-blur-sm shadow-xl`}>
          <div className="mb-6">
            {loading && (
              <div className="py-4 flex items-center justify-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-delay-300"></div>
                </div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Processing your question...</span>
              </div>
            )}
          </div>
          
          <QuestionForm setResult={setResult} setLoading={setLoading} resultRef={resultRef} />
          
          <div ref={resultRef} className={`${(result || loading) ? 'mt-8 pt-8 border-t' : ''} ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}>
            {(result || loading) && (
              <ResultDisplay result={result} loading={loading} />
            )}
          </div>
        </main>

        <footer className={`mt-16 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
          <p>IIT Madras Online Degree Program • {new Date().getFullYear()}</p>
          <p className="mt-2">
            <a 
              href="mailto:21f3001091@ds.study.iitm.ac.in"
              className="underline hover:text-blue-500 transition-colors"
            >
              21f3001091@ds.study.iitm.ac.in
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    VITE_OPENAI_API_KEY?: string;
  }
}

export default Index;
