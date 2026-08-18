"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  address: string;
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-full bg-zinc-800 animate-pulse"></div>;
  }

  // Si no hay coordenadas guardadas (propiedades viejas), cae de gracia a Google Maps embebido
  if (!latitude || !longitude) {
    return (
      <iframe 
        title={`Mapa de ${address}`}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
        width="100%" 
        height="100%" 
        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(80%) contrast(85%) sepia(50%)' }} 
        allowFullScreen={true} 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 grayscale contrast-125 opacity-80 mix-blend-screen"
      ></iframe>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={[latitude, longitude]} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[latitude, longitude]} />
      </MapContainer>
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-xl z-10"></div>
    </div>
  );
}
