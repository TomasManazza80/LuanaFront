import React from 'react';

export function PropertyMap({ latitude, longitude, address }: { latitude?: number, longitude?: number, address?: string }) {
  const mapQuery = address ? encodeURIComponent(address) : "Santa Fe, Argentina";
  
  return (
    <iframe 
      title={`Mapa de ${address}`}
      src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
      width="100%" 
      height="100%" 
      style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(80%) contrast(85%) sepia(50%)" }}
      allowFullScreen 
      loading="lazy" 
      referrerPolicy="no-referrer-when-downgrade" 
      className="absolute inset-0 grayscale contrast-125 opacity-80 mix-blend-screen"
    />
  );
}
