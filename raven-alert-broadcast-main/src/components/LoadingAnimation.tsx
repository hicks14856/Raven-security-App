import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-pulse"></div>
        
        {/* Spinning ring */}
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
        
        {/* Loading text */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-primary font-medium animate-pulse">
          <span className="inline-block animate-bounce">L</span>
          <span className="inline-block animate-bounce delay-100">o</span>
          <span className="inline-block animate-bounce delay-200">a</span>
          <span className="inline-block animate-bounce delay-300">d</span>
          <span className="inline-block animate-bounce delay-400">i</span>
          <span className="inline-block animate-bounce delay-500">n</span>
          <span className="inline-block animate-bounce delay-600">g</span>
          <span className="inline-block animate-bounce delay-700">.</span>
          <span className="inline-block animate-bounce delay-800">.</span>
          <span className="inline-block animate-bounce delay-900">.</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation; 