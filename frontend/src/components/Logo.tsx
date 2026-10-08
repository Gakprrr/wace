import React from 'react';

export default function Logo({ className = "w-40 h-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <img
        src="/images/logo.png"
        alt="WACE Logo"
        className="max-h-12 w-auto object-contain"
      />
    </div>
  );
}

