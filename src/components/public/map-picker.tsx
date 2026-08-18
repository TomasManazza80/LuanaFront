import React from 'react';

export function MapPicker({ onPositionChange }: { onPositionChange?: (lat: number, lng: number) => void }) {
  return (
    <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-md">
      <span>Seleccionador de Mapa (Desactivado)</span>
      <button 
        type="button"
        onClick={() => onPositionChange && onPositionChange(-31.6333, -60.7000)}
        className="mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm text-white"
      >
        Fijar Ubicación de Prueba
      </button>
    </div>
  );
}
