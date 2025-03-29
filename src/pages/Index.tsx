import React, { useState, useEffect } from 'react';
import QuestionForm from '@/components/QuestionForm';
import ResultDisplay from '@/components/ResultDisplay';
import { Toaster } from '@/components/ui/sonner';
import { config } from '@/utils/config';
import { Input } from '@/components/ui/input';
import { InfoIcon, CheckCircleIcon, MoonIcon, SunIcon, PlusCircleIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { addQAPair } from '@/utils/preTrainedAnswers';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

const Index = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey || config.staticApiKey) {
      if (savedApiKey) {
        setApiKey(savedApiKey);
        window.VITE_OPENAI_API_KEY = savedApiKey;
      } else {
        setApiKey(config.staticApiKey);
        window.VITE_OPENAI_API_KEY = config.staticApiKey;
        localStorage.setItem('openai_api_key', config.staticApiKey);
      }
      setApiKeySet(true);
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
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
  };
  
  const saveApiKey = () => {
    if (apiKey && apiKey.startsWith('sk-')) {
      localStorage.setItem('openai_api_key', apiKey);
      window.VITE_OPENAI_API_KEY = apiKey;
      setApiKeySet(true);
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme_preference', newDarkMode ? 'dark' : 'light');
  };

  const addNewQAPair = (question: string, answer: string, topic: string) => {
    addQAPair(question, answer, topic);
    toast.success('New Q&A pair added successfully!');
  };

  const bgGradient = darkMode 
    ? "bg-gradient-to-b from-slate-900 to-indigo-950" 
    : "bg-gradient-to-b from-blue-50 to-indigo-100";

  const cardBg = darkMode 
    ? "bg-slate-800/50 border-slate-700" 
    : "bg-white/80 border-slate-200";

  return (
    <div className={`min-h-screen ${bgGradient} transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
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
          <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-700'} max-w-2xl mx-auto`}>
            Your AI assistant for Tools in Data Science assignments
          </p>
          <div className="mt-2 flex justify-center">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
              IIT Madras Online Degree Program
            </span>
          </div>
          
          <div className="absolute top-0 left-0">
            <Sheet>
              <SheetTrigger asChild>
                <button className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
                  darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'
                } transition-colors`}>
                  <PlusCircleIcon size={14} />
                  <span>Add Q&A</span>
                </button>
              </SheetTrigger>
              <SheetContent className={darkMode ? "bg-slate-800 text-white border-slate-700" : ""}>
                <SheetHeader>
                  <SheetTitle className={darkMode ? "text-white" : ""}>
                    Add New Question & Answer
                  </SheetTitle>
                  <SheetDescription className={darkMode ? "text-slate-300" : ""}>
                    Add new pre-trained Q&A pairs to the TDS Solver database.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${darkMode ? "text-slate-300" : ""}`}>
                      Topic
                    </label>
                    <Command className={darkMode ? "bg-slate-900 border border-slate-700" : ""}>
                      <CommandInput placeholder="Search topics..." className={darkMode ? "text-white" : ""} />
                      <CommandList>
                        <CommandEmpty>No topics found.</CommandEmpty>
                        <CommandGroup>
                          {gaTopics.map((topic) => (
                            <CommandItem 
                              key={topic.id}
                              className={darkMode ? "text-white hover:bg-slate-700" : ""}
                              onSelect={() => {
                                toast.info(`Selected ${topic.id}`);
                                // Implementation would go here
                              }}
                            >
                              {topic.id}: {topic.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${darkMode ? "text-slate-300" : ""}`}>
                      Question
                    </label>
                    <Textarea 
                      placeholder="Enter the full question text..." 
                      className={`min-h-20 ${darkMode ? "bg-slate-900 border-slate-700 text-white" : ""}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${darkMode ? "text-slate-300" : ""}`}>
                      Answer
                    </label>
                    <Textarea 
                      placeholder="Enter the correct answer..." 
                      className={`min-h-20 ${darkMode ? "bg-slate-900 border-slate-700 text-white" : ""}`}
                    />
                  </div>
                  
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Add to Database
                  </Button>
                  
                  <div className={`p-4 rounded-md text-sm ${darkMode ? "bg-slate-900 text-slate-300" : "bg-slate-100"}`}>
                    <h4 className="font-medium mb-2">Using the Console Method:</h4>
                    <p className="mb-2">You can also add Q&A pairs directly through the browser console:</p>
                    <pre className={`p-3 rounded text-xs overflow-x-auto ${darkMode ? "bg-slate-950" : "bg-white border"}`}>
                      window.addQAPair(
                        "Your question here",
                        "Your answer here",
                        "GA1" // Topic ID
                      );
                    </pre>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className={`max-w-4xl mx-auto ${cardBg} p-6 md:p-8 rounded-xl backdrop-blur-sm shadow-xl`}>
          {!apiKeySet ? (
            <div className={`mb-6 p-4 ${darkMode ? 'bg-amber-900/50 border-amber-700' : 'bg-amber-50 border-amber-200'} rounded-lg flex items-start gap-3`}>
              <InfoIcon className={`${darkMode ? 'text-amber-400' : 'text-amber-600'} mt-1 shrink-0`} size={20} />
              <div className="w-full">
                <h3 className={`font-medium ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>OpenAI API Key Required</h3>
                <p className={`${darkMode ? 'text-amber-300/80' : 'text-amber-700'} text-sm mt-1 mb-3`}>
                  Please enter your OpenAI API key below. The key will be stored in your browser's local storage and not sent to any server.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    className={`flex-1 ${darkMode ? 'bg-amber-950/30 border-amber-800/50 text-white' : 'bg-white border-amber-300 text-slate-800'}`}
                  />
                  <button 
                    onClick={saveApiKey}
                    className={`px-4 py-2 ${darkMode ? 'bg-amber-600 hover:bg-amber-500' : 'bg-amber-500 hover:bg-amber-400'} text-white rounded transition-colors`}
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`mb-6 p-4 ${darkMode ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-200'} rounded-lg flex items-start gap-3`}>
              <CheckCircleIcon className={`${darkMode ? 'text-green-400' : 'text-green-600'} mt-1 shrink-0`} size={20} />
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-green-200' : 'text-green-800'}`}>API Key Configured</h3>
                <p className={`${darkMode ? 'text-green-300/80' : 'text-green-700'} text-sm mt-1`}>
                  Your OpenAI API key is set. The system will first try to use pre-trained answers before making API calls.
                </p>
              </div>
            </div>
          )}
          
          <QuestionForm setResult={setResult} setLoading={setLoading} />
          
          {(result || loading) && (
            <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <ResultDisplay result={result} loading={loading} />
            </div>
          )}
        </main>

        <footer className={`mt-16 text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
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
