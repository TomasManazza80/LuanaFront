import React, { useState, useEffect } from 'react';

export default function Loader({ fullScreen = false, isLoading = true }) {
  const [render, setRender] = useState(isLoading || fullScreen);

  useEffect(() => {
    if (isLoading) {
      setRender(true);
    } else {
      const timer = setTimeout(() => setRender(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!render && !isLoading) return null;

  const isExiting = !isLoading && fullScreen;

  const containerClasses = fullScreen
    ? `fixed inset-0 z-[9999] bg-[#3D1A20] flex flex-col items-center justify-center min-h-screen pointer-events-none transition-transform duration-700 ease-in-out ${isExiting ? '-translate-y-full' : 'translate-y-0'}`
    : "flex flex-col items-center justify-center p-10 w-full h-full min-h-[300px] bg-[#3D1A20] rounded-3xl transition-all duration-300";

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center justify-center">
        {/* Pulsing glow effect behind logo */}
        <div className="absolute inset-0 bg-[#E8DDD3] rounded-full blur-[60px] opacity-20 animate-pulse"></div>
        
        {/* Logo Image with rounded borders */}
        <div className="relative z-10 flex flex-col items-center gap-4 animate-pulse">
          <img 
            src="/images/logoLuan.jpeg" 
            alt="Luan Studio" 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-2xl border-2 border-[#E8DDD3]/40"
          />
          <span className="text-xl md:text-2xl font-serif tracking-widest uppercase text-[#E8DDD3]">
            LUAN STUDIO
          </span>
        </div>
      </div>
    </div>
  );
}
