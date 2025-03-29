// client/src/auth/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/store';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const { handleAuthCallback } = useStore();

  useEffect(() => {
    const processCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');
      
      if (!token) {
        setError('No authentication token received');
        return;
      }
      
      try {
        const result = await handleAuthCallback(token);
        
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Authentication failed');
        }
      } catch (err) {
        setError('Authentication failed');
      }
    };
    
    processCallback();
  }, [location, handleAuthCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Processing login...</h2>
        <p className="mt-2">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;