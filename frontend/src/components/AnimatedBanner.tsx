"use client";

import React, { useEffect, useRef, useState } from "react";

export default function AnimatedBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 } // Triggers when 30% of the element is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="mb-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-12 lg:gap-16">
        
        {/* Image en format portrait "debout" (Tombe du haut) */}
        <div 
          className={`w-full md:w-[400px] aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] group shrink-0 transition-all duration-[1200ms] ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-[200px] opacity-0"
          }`}
        >
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" 
            alt="Wear The Energy Banner"
            className="w-full h-full object-cover object-bottom scale-110 group-hover:scale-125 transition-transform duration-700"
          />
        </div>
        
        {/* Texte à droite */}
        <div className="flex flex-col items-center md:items-start justify-center md:pl-16">
          <h2 className="text-6xl md:text-[6rem] lg:text-[8rem] font-normal text-[#1f1e1a] tracking-tight leading-[1] drop-shadow-sm flex flex-col items-start py-4">
            
            {/* Wear arrive de la droite */}
            <span 
              className={`transition-all duration-1000 delay-[200ms] ease-out inline-block ${
                isVisible ? "translate-x-0 opacity-100" : "translate-x-[200px] opacity-0"
              }`}
            >
              Wear
            </span>
            
            {/* The apparait (fade in) */}
            <span 
              className={`ml-8 md:ml-16 transition-opacity duration-1000 delay-[500ms] ease-out inline-block ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              The
            </span>
            
            {/* Energy arrive du bas */}
            <span 
              className={`ml-16 md:ml-32 text-[#d8b652] italic font-light transition-all duration-1000 delay-[800ms] ease-out inline-block ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-[200px] opacity-0"
              }`}
            >
              Energy
            </span>

          </h2>
        </div>
      </div>
    </section>
  );
}
