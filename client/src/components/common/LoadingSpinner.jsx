import React from 'react';

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-[2.5px]'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin`}
      />
      {label && <p className="mt-3 text-xs font-medium text-[#737373] tracking-tight">{label}</p>}
    </div>
  );
};
