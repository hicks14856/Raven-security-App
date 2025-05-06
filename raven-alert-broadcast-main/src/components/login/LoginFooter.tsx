
import React from 'react';
import { Link } from 'react-router-dom';

const LoginFooter = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Forgot password?
        </Link>
        <Link
          to="/signup"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default LoginFooter;
