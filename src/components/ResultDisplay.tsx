
import React, { useEffect, useState } from 'react';
import { ClipboardCopyIcon, BrainCircuitIcon, CheckCircleIcon, CpuIcon } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ResultDisplayProps {
  result: string | null;
  loading: boolean;
}

// Animation phrases for the "thinking" state
const thinkingPhrases = [
  "Analyzing question...",
  "Processing data...",
  "Searching knowledge base...",
  "Applying TDS concepts...",
  "Formulating response...",
  "Verifying answer...",
];

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, loading }) => {
  const [currentPhrase, setCurrentPhrase] = useState(thinkingPhrases[0]);
  const [typedResult, setTypedResult] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    // Check if dark mode is active
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Set up listener for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  // Rotate through thinking phrases
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentPhrase((prev) => {
          const currentIndex = thinkingPhrases.indexOf(prev);
          return thinkingPhrases[(currentIndex + 1) % thinkingPhrases.length];
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [loading]);
  
  // Typing effect when result is received
  useEffect(() => {
    if (result && !loading) {
      setIsTyping(true);
      setTypedResult("");
      
      let i = 0;
      const typeSpeed = 10; // ms per character
      
      const typeInterval = setInterval(() => {
        if (i < result.length) {
          setTypedResult((prev) => prev + result.charAt(i));
          i++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, typeSpeed);
      
      return () => clearInterval(typeInterval);
    }
  }, [result, loading]);
  
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success("Copied to clipboard!");
    }
  };
  
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        {loading ? (
          <>
            <BrainCircuitIcon className={`animate-pulse mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
            TDS AI Assistant
          </>
        ) : result ? (
          <>
            <CheckCircleIcon className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} mr-2`} size={20} />
            Generated Answer
          </>
        ) : null}
      </h2>
      
      {loading ? (
        <div className={`${isDarkMode ? 'bg-slate-700/30' : 'bg-blue-50'} rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]`}>
          <div className="text-center space-y-3">
            <div className="relative w-16 h-16 mb-4">
              <div className={`absolute inset-0 rounded-full border-t-2 border-b-2 ${isDarkMode ? 'border-blue-500' : 'border-blue-500'} animate-spin`}></div>
              <div className={`absolute inset-2 rounded-full border-t-2 border-b-2 ${isDarkMode ? 'border-purple-500' : 'border-purple-500'} animate-spin animate-delay-150`}></div>
              <div className={`absolute inset-4 rounded-full border-t-2 border-b-2 ${isDarkMode ? 'border-pink-500' : 'border-pink-500'} animate-spin animate-delay-300`}></div>
              <CpuIcon className={`absolute inset-0 m-auto ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} animate-pulse`} size={24} />
            </div>
            <p className={`${isDarkMode ? 'text-slate-200' : 'text-slate-700'} font-medium`}>{currentPhrase}</p>
            <div className="flex justify-center gap-1 mt-2">
              <div className={`w-2 h-2 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-bounce`}></div>
              <div className={`w-2 h-2 ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'} rounded-full animate-bounce delay-100`}></div>
              <div className={`w-2 h-2 ${isDarkMode ? 'bg-pink-400' : 'bg-pink-600'} rounded-full animate-bounce delay-200`}></div>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-4`}>Using advanced algorithms to solve your TDS question</p>
          </div>
        </div>
      ) : result ? (
        <Card className={`${
          isDarkMode 
            ? 'bg-slate-700/30 border-slate-600' 
            : 'bg-white border-slate-300'
        } overflow-hidden shadow-lg relative`}>
          <CardContent className="p-6">
            <div className={`rounded ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-200' 
                : 'bg-blue-50 text-slate-800'
            } p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap relative`}>
              {isTyping ? typedResult : result}
              {isTyping && (
                <span className={`inline-block w-2 h-4 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} ml-1 animate-pulse absolute`}></span>
              )}
            </div>
          </CardContent>
          <CardFooter className={`${
            isDarkMode 
              ? 'bg-slate-800/50 border-t border-slate-700' 
              : 'bg-slate-50 border-t border-slate-300'
          } px-6 py-3 flex justify-between items-center`}>
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Answer ready for submission</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className={`${
                isDarkMode 
                  ? 'bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' 
                  : 'bg-transparent border-blue-300 text-slate-700 hover:bg-blue-50 hover:text-slate-900'
              }`}
            >
              <ClipboardCopyIcon size={14} className="mr-1" />
              Copy to clipboard
            </Button>
          </CardFooter>
        </Card>
      ) : null}
      
      {result && (
        <div className={`mt-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <p>This answer is provided for educational purposes. Verify before submission.</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
