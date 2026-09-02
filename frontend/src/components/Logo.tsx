import React from 'react';

export default function Logo({ className = "w-64 h-auto" }: { className?: string }) {
  return (
    <img 
      src="/logo-simple.png" 
      alt="WACE Logo" 
      className={`${className} transition-all duration-300 object-contain drop-shadow-sm`} 
    />
  );
}
