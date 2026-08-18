import React from 'react';
import { Header } from '../public/header'; // You might want to update this too if it's red
import { Activity } from 'lucide-react';

export function PublicAuthLayout({ children }) {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#f7f9fc] text-gray-800 font-sans selection:bg-[#0a47d4]/30 selection:text-white">
            {/* Minimal Background Decor */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-50 rounded-full blur-3xl"></div>
            </div>

            {/* Header/Logo Overlay (Optional, or just use a simple logo) */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                 <div className="text-2xl font-bold text-[#0a47d4] tracking-tight flex items-center gap-2">
                     <Activity size={28} /> LUAN STUDIO
                 </div>
            </div>

            {/* Content (Card) */}
            <main className="relative z-10 w-full max-w-md px-4 mt-10 md:mt-0">
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-900/5 border border-gray-100">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default PublicAuthLayout;
