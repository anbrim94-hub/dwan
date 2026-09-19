import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VerifyAccount from './pages/VerifyAccount';
import Login from './pages/Login';
import CodeVerification from './pages/CodeVerification';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VerifyAccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-code" element={<CodeVerification />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;