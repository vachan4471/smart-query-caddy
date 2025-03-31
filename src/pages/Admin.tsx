
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ArrowLeftIcon, 
  BookOpenIcon, 
  CheckCircleIcon, 
  MoonIcon, 
  PlusIcon, 
  RefreshCwIcon,
  SaveIcon, 
  SunIcon, 
  TrashIcon 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { 
  gaTopics, 
  addQAPair, 
  deleteQAPair, 
  resetQADatabase,
  getAllQAPairs
} from '@/utils/preTrainedAnswers';

const Admin = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [topic, setTopic] = useState('GA1');
  const [qaPairs, setQaPairs] = useState(getAllQAPairs());
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [passwordProtected, setPasswordProtected] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Check authentication
    const isAuth = localStorage.getItem('admin_authenticated');
    if (isAuth === 'true') {
      setAuthenticated(true);
      setPasswordProtected(false);
    }
    
    // Load the latest Q&A pairs
    setQaPairs(getAllQAPairs());
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
  
  const handleAuthenticate = () => {
    if (password === '21f3001091') {
      setAuthenticated(true);
      setPasswordProtected(false);
      localStorage.setItem('admin_authenticated', 'true');
      toast.success('Authentication successful');
    } else {
      toast.error('Invalid password');
    }
  };
  
  const handleAddQA = () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    
    addQAPair(question, answer, topic);
    toast.success('New Q&A pair added successfully!');
    
    // Refresh the list from storage
    setQaPairs(getAllQAPairs());
    
    // Clear the form
    setQuestion('');
    setAnswer('');
  };
  
  const handleDeleteQA = (index: number) => {
    if (deleteQAPair(index)) {
      toast.info('Q&A pair removed');
      // Refresh the list from storage
      setQaPairs(getAllQAPairs());
    } else {
      toast.error('Failed to remove Q&A pair');
    }
  };
  
  const handleResetDatabase = () => {
    if (confirm('Are you sure you want to reset the database to its initial state? This cannot be undone.')) {
      resetQADatabase();
      setQaPairs(getAllQAPairs());
      toast.success('Database reset to initial values');
    }
  };
  
  const bgGradient = darkMode 
    ? "bg-gradient-to-b from-slate-900 to-indigo-950" 
    : "bg-gradient-to-b from-blue-50 to-indigo-100";
    
  const cardBg = darkMode 
    ? "bg-slate-800/50 border-slate-700" 
    : "bg-slate-200/90 border-slate-300 shadow-lg transform hover:shadow-xl transition-all duration-300";
  
  if (passwordProtected) {
    return (
      <div className={`min-h-screen ${bgGradient} transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center justify-center`}>
        <Toaster position="top-right" />
        <Card className={`w-full max-w-md ${cardBg}`}>
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>Enter password to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300"}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeftIcon size={16} className="mr-2" />
                Back
              </Button>
            </Link>
            <Button onClick={handleAuthenticate}>
              <CheckCircleIcon size={16} className="mr-2" />
              Authenticate
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
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
          
          <div className="absolute top-0 left-0">
            <Link to="/" className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
              darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'
            } transition-colors`}>
              <ArrowLeftIcon size={14} />
              <span>Back to Solver</span>
            </Link>
          </div>

          <div className="mb-4 flex items-center justify-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">TDS</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold bg-clip-text text-transparent ${
              darkMode ? 'bg-gradient-to-r from-purple-400 to-pink-500' : 'bg-gradient-to-r from-purple-600 to-pink-700'
            }`}>
              Admin Panel
            </h1>
          </div>
          <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-700'} max-w-2xl mx-auto`}>
            Manage pre-trained questions and answers
          </p>
        </header>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className={`lg:col-span-1 ${cardBg}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusIcon size={18} className="mr-2 text-blue-400" />
                Add New Q&A Pair
              </CardTitle>
              <CardDescription>
                Add a new question and answer to the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm mb-1 block">Topic</label>
                <Select defaultValue={topic} onValueChange={setTopic}>
                  <SelectTrigger className={darkMode ? "bg-slate-700/50 border-slate-600 text-white" : ""}>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}>
                    {gaTopics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.id}: {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm mb-1 block">Question</label>
                <Textarea
                  placeholder="Enter the question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={`min-h-28 ${darkMode ? "bg-slate-700/50 border-slate-600 text-white" : ""}`}
                />
              </div>
              
              <div>
                <label className="text-sm mb-1 block">Answer</label>
                <Textarea
                  placeholder="Enter the answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={`min-h-32 ${darkMode ? "bg-slate-700/50 border-slate-600 text-white" : ""}`}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button onClick={handleAddQA} className="w-full">
                <SaveIcon size={16} className="mr-2" />
                Save Q&A Pair
              </Button>
              <Button onClick={handleResetDatabase} variant="outline" className="w-full text-yellow-500 hover:text-yellow-600">
                <RefreshCwIcon size={16} className="mr-2" />
                Reset Database
              </Button>
            </CardFooter>
          </Card>
          
          <Card className={`lg:col-span-2 ${cardBg}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpenIcon size={18} className="mr-2 text-green-400" />
                Existing Q&A Pairs
              </CardTitle>
              <CardDescription>
                Total: {qaPairs.length} pre-trained question-answer pairs
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {qaPairs.map((pair, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg ${
                      darkMode ? 'bg-slate-700/50 hover:bg-slate-700/70' : 'bg-slate-100 hover:bg-slate-200'
                    } transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400">
                        {pair.topic}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteQA(index)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-500 hover:bg-red-600/10"
                      >
                        <TrashIcon size={14} />
                      </Button>
                    </div>
                    <h4 className="font-medium mb-2 text-sm opacity-90">Q: {pair.question}</h4>
                    <p className="text-xs opacity-80 whitespace-pre-wrap">A: {pair.answer}</p>
                  </div>
                ))}
                
                {qaPairs.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    No Q&A pairs available. Add your first one!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
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

export default Admin;
