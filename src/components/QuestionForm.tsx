
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { SendIcon, UploadIcon, XIcon, BookOpenIcon, HelpCircleIcon } from 'lucide-react';
import { gaTopics } from '@/utils/preTrainedAnswers';

interface QuestionFormProps {
  setResult: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ setResult, setLoading }) => {
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      toast.success(`File "${e.target.files[0].name}" attached`);
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
      // Use the LLM service
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
      console.error('Error generating answer:', error);
      toast.error('Failed to generate answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('File removed');
  };

  const examples = [
    "What is the output of httpie with my email parameter?",
    "How many Wednesdays are there between 1987-12-27 and 2015-09-11?",
    "Sort this JSON array by age field: [...]",
    "What is the result of the Google Sheets formula =SUM(ARRAY_CONSTRAIN(SEQUENCE(100, 100, 5, 11), 1, 10))?",
  ];

  const useExample = (example: string) => {
    setQuestion(example);
    toast.info('Example question loaded');
  };

  const selectTopic = (topicId: string) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId);
    toast.info(`Filtered to ${topicId} questions`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
          <BookOpenIcon size={16} className="mr-2 text-blue-400" />
          Enter your TDS assignment question
        </label>
        <Textarea
          id="question"
          placeholder="Type or paste your question here..."
          className="min-h-32 bg-slate-700/50 border-slate-600 placeholder-slate-400 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-slate-400 mb-2 flex items-center">
          <HelpCircleIcon size={16} className="mr-2 text-blue-400" />
          Try one of these examples:
        </p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, i) => (
            <button
              key={i}
              type="button"
              onClick={() => useExample(example)}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-2 rounded transition-colors hover:text-white"
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
            <UploadIcon size={18} className="text-blue-400" />
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
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-blue-900/20"
        >
          <SendIcon size={16} className="mr-2" />
          Get Answer
        </Button>
      </div>

      {/* Animated Text Section */}
      <div className="mt-6 py-2 bg-slate-800/40 rounded-md overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-blue-400 mx-4">Welcome to TDS Solver</span>
          <span className="text-purple-400 mx-4">IIT Madras Online Degree</span>
          <span className="text-pink-400 mx-4">21f3001091@ds.study.iitm.ac.in</span>
          <span className="text-green-400 mx-4">TDS Project 2</span>
          <span className="text-yellow-400 mx-4">Tools in Data Science</span>
        </div>
      </div>

      {/* GA Topics */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">GA Topics:</h3>
        <div className="flex flex-wrap gap-2">
          {gaTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => selectTopic(topic.id)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                selectedTopic === topic.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {topic.id}: {topic.name}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};

export default QuestionForm;
