import React, { ReactNode, useEffect, useState } from 'react';
import { hasValidSession, redirectToLogin } from '../../auth/cognito';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (hasValidSession()) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    redirectToLogin();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-600">
        Redirecting to Cognito login...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
