
import React from 'react';
import { Link } from 'react-router-dom';

const SignUpFooter = () => {
  return (
    <div className="text-center">
      <Link
        to="/login"
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Already have an account? Sign in
      </Link>
    </div>
  );
};

export default SignUpFooter;
