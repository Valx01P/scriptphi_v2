// client/src/components/VerifyEmail.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { 
    forms, 
    updateFormField, 
    setActiveAuthForm,
    verifyEmail 
  } = useStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  
  const { code, pendingUserId } = forms.auth.verify;
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    
    if (!code) {
      setServerError('Please enter the verification code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await verifyEmail({ pendingUserId, code });
      
      if (result.success) {
        // Redirect to home after successful verification
        navigate('/');
      } else {
        setServerError(result.error);
      }
    } catch (error) {
      setServerError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
      
      <p className="mb-4 text-gray-600 text-center">
        We've sent a verification code to your email. Please enter it below to verify your account.
      </p>
      
      <p className="mb-6 text-center text-sm text-gray-500">
        Time remaining: <span className={timeLeft < 60 ? 'text-red-500' : ''}>{formatTime(timeLeft)}</span>
      </p>
      
      {serverError && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {serverError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">// client/src/components/VerifyEmail.jsx (continued)
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => updateFormField('auth', 'verify', 'code', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || timeLeft <= 0}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Didn't receive a code?{' '}
          <button
            type="button"
            onClick={() => setActiveAuthForm('login')}
            className="text-blue-500 hover:text-blue-700"
          >
            Return to login
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;