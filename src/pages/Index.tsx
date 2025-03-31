
import React, { useState, useEffect, useRef } from 'react';
import QuestionForm from '@/components/QuestionForm';
import ResultDisplay from '@/components/ResultDisplay';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { config } from '@/utils/config';
import { MoonIcon, SunIcon, PlusIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { getAllQAPairs, updatePreTrainedData } from '@/utils/preTrainedAnswers';
import { initializeQADatabase } from '@/utils/gistStorage';

const Index = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const resultRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [dataInitialized, setDataInitialized] = useState<boolean>(false);
  
  useEffect(() => {
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
    
    // Check if user is admin
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    setIsAdmin(isAuthenticated === 'true');
    
    // Initialize Q&A database from cloud storage
    if (!dataInitialized) {
      const loadData = async () => {
        try {
          const cloudData = await initializeQADatabase();
          updatePreTrainedData(cloudData);
          console.log(`Loaded ${cloudData.length} Q&A pairs from storage`);
          setDataInitialized(true);
        } catch (error) {
          console.error('Error initializing Q&A database:', error);
          toast.error('Failed to load Q&A database');
        }
      };
      
      loadData();
    }
  }, [darkMode, dataInitialized]);
  
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
    : "bg-gradient-to-b from-blue-50 to-indigo-100";

  const cardBg = darkMode 
    ? "bg-slate-800/50 border-slate-700" 
    : "bg-slate-200/90 border-slate-300 shadow-xl rounded-xl transform hover:scale-[1.01] hover:shadow-2xl transition-all duration-300";

  return (
    <div className={`min-h-screen ${bgGradient} transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-700'}`}>
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0 flex items-center space-x-2">
            <span className={`text-sm mr-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {darkMode ? 'Dark' : 'Light'}
            </span>
            <Switch 
              checked={darkMode} 
              onCheckedChange={toggleTheme} 
              className={darkMode ? "data-[state=checked]:bg-blue-600" : "data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-slate-300"} 
            />
            {darkMode ? 
              <MoonIcon size={16} className="text-slate-300" /> : 
              <SunIcon size={16} className="text-slate-600" />
            }
          </div>

          <div className="mb-4 flex items-center justify-center">
            <div className={`w-16 h-16 ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} rounded-full flex items-center justify-center mr-4`}>
              <span className="text-2xl font-bold text-white">TDS</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold bg-clip-text text-transparent ${
              darkMode ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-blue-600 to-purple-700'
            }`}>
              TDS Solver
            </h1>
          </div>
          <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-700'} max-w-2xl mx-auto`}>
            Your AI assistant for Tools in Data Science assignments
          </p>
          <div className="mt-2 flex justify-center">
            <span className={`px-3 py-1 ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} text-white text-xs rounded-full`}>
              IIT Madras Online Degree Program
            </span>
          </div>
        </header>

        <main className={`max-w-4xl mx-auto ${cardBg} p-6 md:p-8 backdrop-blur-sm`}>
          <div className="mb-6">
            {loading && (
              <div className="py-4 flex items-center justify-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className={`h-2 w-2 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-blue-600'}`}></div>
                  <div className={`h-2 w-2 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} animate-delay-150`}></div>
                  <div className={`h-2 w-2 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} animate-delay-300`}></div>
                </div>
                <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Processing your question...</span>
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

        <footer className={`mt-16 text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
          <p>IIT Madras Online Degree Program • {new Date().getFullYear()}</p>
          <p className="mt-2">
            <a 
              href="mailto:21f3001091@ds.study.iitm.ac.in"
              className={`underline hover:text-blue-500 transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
            >
              21f3001091@ds.study.iitm.ac.in
            </a>
          </p>
        </footer>
      </div>
      
      <Link 
        to="/admin" 
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50 ${
          darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label="Admin access"
      >
        <PlusIcon className="text-white" size={24} />
      </Link>
    </div>
  );
};

declare global {
  interface Window {
    VITE_OPENAI_API_KEY?: string;
  }
}

export default Index;
