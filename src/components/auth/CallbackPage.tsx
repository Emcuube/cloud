import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  hasValidSession,
  parseTokensFromHash,
  persistSession,
  redirectToLogin,
} from '../../auth/cognito';

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fragment = parseTokensFromHash(window.location.hash);

    if (!fragment) {
      if (hasValidSession()) {
        navigate('/', { replace: true });
      } else {
        redirectToLogin();
      }
      return;
    }

    persistSession(fragment);
    window.history.replaceState({}, document.title, '/');
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-700">
      <p className="text-lg font-semibold">Processing Cognito login...</p>
      <p className="text-sm text-gray-500">You will be redirected shortly.</p>
    </div>
  );
};

export default CallbackPage;
