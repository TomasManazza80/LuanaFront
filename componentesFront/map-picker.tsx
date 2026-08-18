"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapPickerProps {
  initialPosition?: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816];

function LocationMarker({ position, setPosition, onPositionChange }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

// Componente para actualizar la vista del mapa programáticamente
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}

export function MapPicker({ initialPosition, onPositionChange }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  
  // Estados para los inputs separados
  const [streetName, setStreetName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = async () => {
    if (!streetName.trim()) {
      alert("Por favor, ingrese al menos el nombre de la calle.");
      return;
    }

    // Combinar calle y número (Photon entiende mejor si el número va primero o después dependiendo de la región, pero la concatenación simple suele bastar)
    const combinedQuery = `${streetName.trim()} ${streetNumber.trim()}`.trim();

    setIsSearching(true);
    setSearchResults([]); // Reset results
    try {
      // Usamos la API de Photon (basada en OpenStreetMap)
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(combinedQuery)}&limit=5`);
      const data = await response.json();
      
      if (data && data.features && data.features.length > 0) {
        // Formatear los resultados de GeoJSON a nuestro estado
        const formattedResults = data.features.map((feature: any) => {
          const { properties, geometry } = feature;
          const [lon, lat] = geometry.coordinates;
          
          // Construir un nombre legible
          const nameParts = [];
          if (properties.name) nameParts.push(properties.name);
          if (properties.street) nameParts.push(properties.street);
          if (properties.housenumber) nameParts.push(properties.housenumber);
          if (properties.city) nameParts.push(properties.city);
          if (properties.state) nameParts.push(properties.state);
          
          return {
            place_id: properties.osm_id || Math.random().toString(),
            display_name: nameParts.filter(Boolean).join(", "),
            lat: lat,
            lon: lon
          };
        });
        
        setSearchResults(formattedResults); // Muestra lista de resultados
        
      } else {
        alert("Dirección no encontrada. Intente con otra calle.");
      }
    } catch (error) {
      console.error("Error buscando dirección:", error);
      alert("Hubo un error al conectar con el servidor de mapas.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evitar envío del form padre
      handleSearch();
    }
  };

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setMapCenter([lat, lon]);
    setPosition([lat, lon]);
    onPositionChange(lat, lon);
    setSearchResults([]); // Ocultar lista
    
    // Al seleccionar, podríamos actualizar los inputs, pero como están divididos los dejamos tal cual 
    // o podríamos vaciar los resultados simplemente.
  };

  if (!isMounted) {
    return <div className="h-[350px] w-full bg-zinc-800 animate-pulse rounded-md"></div>;
  }

  return (
    <div className="flex flex-col gap-3 relative">
      {/* Buscadores divididos */}
      <div className="flex gap-2 relative z-20">
        <input 
          type="text" 
          value={streetName}
          onChange={(e) => setStreetName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre de la calle (Ej: Av. San Martín)" 
          className="flex-[2] bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#C7A15E]"
        />
        <input 
          type="text" 
          value={streetNumber}
          onChange={(e) => setStreetNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Número (Ej: 1234)" 
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#C7A15E]"
        />
        <button 
          type="button" 
          onClick={(e) => { e.preventDefault(); handleSearch(); }}
          disabled={isSearching}
          className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isSearching ? "..." : "Buscar"}
        </button>
      </div>

      {/* Lista de resultados desplegable */}
      {searchResults.length > 0 && (
        <ul className="absolute top-12 left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-md shadow-2xl z-30 max-h-60 overflow-y-auto">
          {searchResults.map((result) => (
            <li 
              key={result.place_id} 
              className="p-3 hover:bg-zinc-700 cursor-pointer text-sm text-zinc-300 transition-colors border-b border-zinc-700/50 last:border-0"
              onClick={() => handleSelectResult(result)}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* Mapa */}
      <div className="h-[300px] w-full rounded-md overflow-hidden border border-zinc-700 relative z-0 mt-2">
        <MapContainer 
          center={initialPosition || DEFAULT_CENTER} 
          zoom={12} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onPositionChange={onPositionChange} />
          <MapUpdater center={mapCenter} />
        </MapContainer>
      </div>
    </div>
  );
}
