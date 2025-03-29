// client/src/pages/Auth.jsx
import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import VerifyEmail from '../components/VerifyEmail';
import AuthCallback from '../auth/AuthCallback';
import useStore from '../store/store';

const Auth = () => {
  const navigate = useNavigate();
  const { forms, isAuthenticated, initAuth } = useStore();
  const activeForm = forms.auth.activeForm;
  
  // Initialize auth state
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Render the active form
  const renderForm = () => {
    switch (activeForm) {
      case 'login':
        return <LoginForm />;
      case 'register':
        return <RegisterForm />;
      case 'verify':
        return <VerifyEmail />;
      default:
        return <LoginForm />;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Routes>
        <Route path="/callback" element={<AuthCallback />} />
        <Route 
          path="*" 
          element={
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
              {renderForm()}
            </div>
          } 
        />
      </Routes>
    </div>
  );
};

export default Auth;