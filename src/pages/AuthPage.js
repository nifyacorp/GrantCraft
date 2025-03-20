import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import authService from '../lib/auth';

function AuthPage({ onAuthChange }) {
  const [showLogin, setShowLogin] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      if (onAuthChange) {
        onAuthChange(authService.getCurrentUser());
      }
    }
  }, [onAuthChange]);
  
  const handleLoginSuccess = (user) => {
    if (onAuthChange) {
      onAuthChange(user);
    }
  };
  
  const handleRegisterSuccess = (user) => {
    if (onAuthChange) {
      onAuthChange(user);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-muted/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">GrantCraft</h1>
        <p className="text-muted-foreground">
          Your AI-powered grant proposal assistant
        </p>
      </div>
      
      {showLogin ? (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess} 
          onRegisterClick={() => setShowLogin(false)} 
        />
      ) : (
        <RegisterForm 
          onRegisterSuccess={handleRegisterSuccess} 
          onLoginClick={() => setShowLogin(true)} 
        />
      )}
    </div>
  );
}

export default AuthPage;