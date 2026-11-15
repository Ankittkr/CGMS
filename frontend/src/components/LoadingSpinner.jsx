import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({
  size = 28,
  message = 'Loading data...',
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2
        size={size}
        className="animate-spin text-blue-600"
      />
      {message && <span className="text-xs text-slate-500 font-medium">{message}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
