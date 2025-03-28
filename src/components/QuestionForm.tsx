import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { SendIcon, UploadIcon, Loader2Icon, XIcon } from 'lucide-react';

interface QuestionFormProps {
  setResult: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  useMockResponses?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ setResult, setLoading, useMockResponses = false }) => {
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // If using mock responses, bypass API call
      if (useMockResponses) {
        const { generateMockAnswer } = await import('@/utils/llmService');
        
        // Read the file content if there's a file
        let fileData = null;
        if (file) {
          const reader = new FileReader();
          fileData = await new Promise((resolve) => {
            reader.onload = (e) => {
              resolve({
                content: e.target?.result,
                type: file.type,
                name: file.name
              });
            };
            
            if (file.type.includes('text') || file.type.includes('json') || file.type.includes('csv')) {
              reader.readAsText(file);
            } else {
              reader.readAsArrayBuffer(file);
            }
          });
        }
        
        // @ts-ignore - TypeScript might complain about the generateMockAnswer import
        const answer = await generateMockAnswer(question, fileData);
        setResult(answer);
        toast.success('Mock answer generated');
        setLoading(false);
        return;
      }

      // Otherwise use the LLM service directly
      const { generateAnswer } = await import('@/utils/llmService');
      
      // Read the file content if there's a file
      let fileData = null;
      if (file) {
        const reader = new FileReader();
        fileData = await new Promise((resolve) => {
          reader.onload = (e) => {
            resolve({
              content: e.target?.result,
              type: file.type,
              name: file.name
            });
          };
          
          if (file.type.includes('text') || file.type.includes('json') || file.type.includes('csv')) {
            reader.readAsText(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        });
      }
      
      const answer = await generateAnswer(question, fileData);
      setResult(answer);
      toast.success('Answer generated successfully!');
    } catch (error) {
      console.error('Fallback error:', error);
      toast.error('Failed to generate answer. Please try the mock response option.');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const examples = [
    "What is the version of VS Code used in the course?",
    "How do I extract a CSV from a ZIP file?",
    "Write a SQL query to find the total ticket sales by category",
  ];

  const useExample = (example: string) => {
    setQuestion(example);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-slate-300 mb-2">
          Enter your assignment question
        </label>
        <Textarea
          id="question"
          placeholder="Type or paste your question here..."
          className="min-h-32 bg-slate-700/50 border-slate-600 placeholder-slate-400 text-white"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-slate-400 mb-2">Try one of these examples:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, i) => (
            <button
              key={i}
              type="button"
              onClick={() => useExample(example)}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-2 rounded transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-4">
        <div className="relative group flex-1">
          <input
            ref={fileInputRef}
            type="file"
            id="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="bg-slate-700/50 border border-dashed border-slate-600 text-slate-300 rounded-md px-4 py-3 flex items-center gap-2 hover:bg-slate-700/70 transition-colors">
            <UploadIcon size={18} />
            <span className="text-sm">{file ? file.name : 'Attach file (optional)'}</span>
          </div>
          {file && (
            <button
              type="button"
              onClick={clearFile}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white z-20"
              aria-label="Remove file"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        <Button 
          type="submit" 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <SendIcon size={16} className="mr-2" />
          Get Answer
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
