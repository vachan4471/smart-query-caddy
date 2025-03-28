
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ResultDisplayProps {
  result: string | null;
  loading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, loading }) => {
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Generating answer...
          </>
        ) : (
          'Generated Answer'
        )}
      </h2>
      
      {loading ? (
        <div className="bg-slate-700/30 rounded-lg p-6 flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-300">Analyzing question and processing files...</p>
            <p className="text-xs text-slate-400">This may take a moment depending on complexity</p>
          </div>
        </div>
      ) : result ? (
        <Card className="bg-slate-700/30 border-slate-600 overflow-hidden">
          <CardContent className="p-6">
            <div className="rounded bg-slate-800 p-4 font-mono text-sm text-slate-200 overflow-x-auto">
              {result}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-800/50 px-6 py-3 flex justify-between items-center">
            <span className="text-xs text-slate-400">Ready to submit</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Copy to clipboard
            </Button>
          </CardFooter>
        </Card>
      ) : null}
      
      {result && (
        <div className="mt-4 text-sm text-slate-400">
          <p>This answer is provided by an AI model and may require review before submission.</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
