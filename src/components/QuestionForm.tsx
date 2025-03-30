
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { SendIcon, UploadIcon, XIcon, BookOpenIcon } from 'lucide-react';
import { gaTopics } from '@/utils/preTrainedAnswers';

interface QuestionFormProps {
  setResult: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resultRef: React.RefObject<HTMLDivElement>;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ setResult, setLoading, resultRef }) => {
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDarkMode = document.documentElement.classList.contains('dark');

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

    // Scroll to result section
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

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

  const selectTopic = (topicId: string) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId);
    toast.info(`Filtered to ${topicId} questions`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Animated Text Section - Above the question input */}
      <div className={`py-3 ${isDarkMode ? 'bg-slate-900/80' : 'bg-blue-100'} rounded-md overflow-hidden mb-6`}>
        <div className="animate-marquee whitespace-nowrap">
          <span className={isDarkMode ? "text-blue-400 mx-4" : "text-blue-700 mx-4 font-medium"}>Welcome to TDS Solver</span>
          <span className={isDarkMode ? "text-purple-400 mx-4" : "text-purple-700 mx-4 font-medium"}>IIT Madras Online Degree</span>
          <span className={isDarkMode ? "text-pink-400 mx-4" : "text-pink-700 mx-4 font-medium"}>21f3001091@ds.study.iitm.ac.in</span>
          <span className={isDarkMode ? "text-green-400 mx-4" : "text-green-700 mx-4 font-medium"}>TDS Project 2</span>
          <span className={isDarkMode ? "text-yellow-400 mx-4" : "text-yellow-700 mx-4 font-medium"}>Tools in Data Science</span>
        </div>
      </div>
      
      <div>
        <label htmlFor="question" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'} mb-2 flex items-center`}>
          <BookOpenIcon size={16} className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          Enter your TDS assignment question
        </label>
        <Textarea
          id="question"
          placeholder="Type or paste your question here..."
          className={`min-h-60 ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 placeholder-slate-400 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
              : 'bg-white border-slate-300 placeholder-slate-500 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          } transition-all`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
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
          <div className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
              : 'bg-white border-blue-200 text-slate-700 hover:bg-slate-50'
          } border border-dashed rounded-md px-4 py-3 flex items-center gap-2 transition-colors`}>
            <UploadIcon size={18} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
            <span className="text-sm">{file ? file.name : 'Attach file (optional)'}</span>
          </div>
          {file && (
            <button
              type="button"
              onClick={clearFile}
              className={`absolute right-2 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} z-20`}
              aria-label="Remove file"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        <Button 
          type="submit" 
          className={`${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          } text-white transition-all shadow-lg hover:shadow-blue-900/20`}
        >
          <SendIcon size={16} className="mr-2" />
          Get Answer
        </Button>
      </div>

      {/* GA Topics Grid */}
      <div className="mt-8">
        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'} mb-4`}>Graded Assignment Topics:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gaTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => selectTopic(topic.id)}
              className={`p-4 rounded-lg transition-all text-left ${
                selectedTopic === topic.id 
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : isDarkMode 
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <h4 className={`text-lg font-medium ${
                isDarkMode 
                  ? selectedTopic === topic.id ? 'text-white' : 'text-blue-400'
                  : selectedTopic === topic.id ? 'text-white' : 'text-blue-600'
              } mb-2`}>
                {topic.id}: {topic.name}
              </h4>
              <p className={`text-sm ${
                selectedTopic === topic.id ? 'opacity-90' : isDarkMode ? 'opacity-80' : 'text-slate-600'
              }`}>{topic.description}</p>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};

export default QuestionForm;
