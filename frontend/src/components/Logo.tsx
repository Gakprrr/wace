import React from 'react';

export default function Logo({ className = "w-40 h-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-display select-none ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#705C3B] to-[#C8A96E] flex items-center justify-center text-white font-black text-xl shadow-md border border-[#C8A96E]/30">
        W
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold tracking-widest text-lg text-encre dark:text-ivoire leading-none">
          WACE
        </span>
        <span className="text-[9px] tracking-wider text-[#705C3B] dark:text-[#C8A96E] uppercase font-bold">
          Wear The Energy
        </span>
      </div>
    </div>
  );
}
