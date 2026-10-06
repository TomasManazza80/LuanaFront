import React from 'react';
import { Header } from '../public/header'; // You might want to update this too if it's red
import { Activity } from 'lucide-react';

export function PublicAuthLayout({ children }) {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#F3ECE7] text-[#3D1A20] font-sans selection:bg-[#3D1A20]/20 selection:text-[#3D1A20]">
            {/* Minimal Background Decor */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E5D8CC] rounded-full blur-3xl opacity-60"></div>
                <div className="absolute top-1/2 -left-20 w-72 h-72 bg-[#E5D8CC] rounded-full blur-3xl opacity-60"></div>
            </div>

            {/* Header/Logo Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                 <div className="flex items-center gap-3">
                     <img src="/images/logoLuan.jpeg" alt="Luan Studio" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md border border-[#3D1A20]/10" />
                     <div className="flex flex-col">
                        <span className="text-lg sm:text-xl font-black text-[#3D1A20] tracking-widest uppercase font-serif">Luan Studio</span>
                     </div>
                 </div>
            </div>

            {/* Content (Card) */}
            <main className="relative z-10 w-full max-w-md px-4 mt-10 md:mt-0">
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-[#3D1A20]/5 border border-[#E5D8CC]">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default PublicAuthLayout;
