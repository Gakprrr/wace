import React from 'react';

interface LogoProps {
  className?: string;
  imgClassName?: string;
}

export default function Logo({
  className = "",
  imgClassName = "h-12 sm:h-14 w-auto"
}: LogoProps) {
  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/images/logo.png"
        alt="WACE Logo"
        className={`object-contain max-w-full mix-blend-multiply transition-all ${imgClassName}`}
      />
    </div>
  );
}

