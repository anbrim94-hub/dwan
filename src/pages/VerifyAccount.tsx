import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function VerifyAccount() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/login');
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
            <h1 className="text-3xl font-bold mb-4">Verify your account</h1>
            <p className="text-gray-600 mb-8">
              Start by verifying your account to ensure secure access to our services.
            </p>

            <div className="space-y-6">
              <button
                onClick={handleContinue}
                className="flex items-center justify-center w-full px-4 py-2 text-white rounded-md bg-[#473cc5] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#473cc5]"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Continue
              </button>
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

export default VerifyAccount;