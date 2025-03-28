
import React, { useState } from 'react';
import QuestionForm from '@/components/QuestionForm';
import ResultDisplay from '@/components/ResultDisplay';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

export default Index;
