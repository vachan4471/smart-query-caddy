
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LockIcon, KeyIcon } from 'lucide-react';
import { initializeQADatabase, saveQAPairsToGist } from '@/utils/gistStorage';
import { updatePreTrainedData, getAllQAPairs } from '@/utils/preTrainedAnswers';

const AdminAuth = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isDarkMode = document.documentElement.classList.contains('dark');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check password (hardcoded as per requirement)
    if (password === '21f3001091') {
      localStorage.setItem('admin_authenticated', 'true');
      
      // Sync with cloud database to ensure admin has the latest data
      try {
        toast.info('Syncing with cloud database...');
        const cloudData = await initializeQADatabase();
        updatePreTrainedData(cloudData);
        console.log(`Admin: Synced ${cloudData.length} Q&A pairs from cloud storage`);
        
        // Test write access to cloud storage
        const currentData = getAllQAPairs();
        const testResult = await saveQAPairsToGist(currentData);
        
        if (testResult) {
          toast.success('Admin access granted with cloud storage write access');
        } else {
          toast.warning('Admin access granted, but cloud storage write access might be limited');
        }
      } catch (error) {
        console.error('Error syncing with cloud storage:', error);
        toast.warning('Admin access granted, but cloud sync failed. Some features may be limited.');
      }
      
      navigate('/admin');
    } else {
      toast.error('Incorrect password');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  const bgGradient = isDarkMode 
    ? "bg-gradient-to-b from-slate-900 to-indigo-950" 
    : "bg-gradient-to-b from-blue-50 to-indigo-100";

  const cardBg = isDarkMode 
    ? "bg-slate-800/50 border-slate-700" 
    : "bg-slate-200/90 border-slate-300 shadow-xl rounded-xl";

  return (
    <div className={`min-h-screen ${bgGradient} flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
      <div className={`max-w-md w-full ${cardBg} p-8 backdrop-blur-sm rounded-lg`}>
        <div className="flex flex-col items-center mb-6">
          <div className={`w-16 h-16 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-600'} rounded-full flex items-center justify-center mb-4`}>
            <LockIcon size={24} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold bg-clip-text text-transparent ${
            isDarkMode ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-blue-600 to-purple-700'
          }`}>
            Admin Authentication
          </h1>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Enter password to access admin controls
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyIcon size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pl-10 ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-300'
              }`}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className={`w-full ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            } text-white transition-all`}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Access Admin Panel'}
          </Button>
          
          <div className="mt-4 text-center">
            <a href="/" className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}>
              Return to Home
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
