import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Footer } from "./footer";

export default function PublicCatalog() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [operationType, setOperationType] = useState("Todas las operaciones");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
        const res = await fetch(`${apiUrl}/api/public/properties`);
        const json = await res.json();
        
        const mapped = (json.data || []).map((p) => {
          const hasRentalUnit = p.units?.some((u) => u.rentalPrice && u.rentalPrice > 0);
          const type = hasRentalUnit ? "Alquiler" : "Venta";
          
          let price = "Consultar";
          if (type === "Venta" && p.marketPrice) {
            price = `${p.currency || 'USD'} ${p.marketPrice.toLocaleString()}`;
          } else if (type === "Alquiler") {
            const rentalUnit = p.units?.find((u) => u.rentalPrice && u.rentalPrice > 0);
            if (rentalUnit) {
               price = `${rentalUnit.currency || 'USD'} ${rentalUnit.rentalPrice.toLocaleString()} / mes`;
            }
          }

          const beds = p.units?.reduce((acc, u) => acc + (u.numOfBedrooms || 0), 0) || 0;
          const baths = p.units?.reduce((acc, u) => acc + (u.numOfBathrooms || 0), 0) || 0;
          const sqft = p.units?.reduce((acc, u) => acc + (u.unitSize || 0), 0) || p.lotSize || 0;

          return {
            id: p.id,
            type,
            title: p.title || "Propiedad sin título",
            price,
            address: [p.street, p.city].filter(Boolean).join(", ") || "Ubicación a consultar",
            beds,
            baths,
            sqft,
            image: (p.images && p.images.length > 0) ? p.images[0].imageUrl : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
          };
        });
        
        setProperties(mapped);
      } catch (e) {
        console.error("Error fetching properties", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((prop) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchLower) ||
      prop.address.toLowerCase().includes(searchLower);
      
    const matchesOperation = 
      operationType === "Todas las operaciones" || 
      prop.type === operationType;

    return matchesSearch && matchesOperation;
  });

  return (
    <div className="theme-public min-h-screen bg-black text-white font-sans pb-24 pt-28">
      <Header />
      <div className="container mx-auto px-6 max-w-7xl">
        
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-8">
          Catálogo de Propiedades
        </h1>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-2 md:p-4 flex flex-col md:flex-row gap-4 mb-12">
          
          <div className="flex-1 flex items-center bg-[#1a1a1a] rounded-lg px-4 py-3 border border-zinc-800 focus-within:border-[#C7A15E] transition-colors">
            <Search size={20} className="text-zinc-500 mr-3" />
            <input 
              type="text" 
              placeholder="Buscar por ubicación, zona o tipo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-zinc-500"
            />
          </div>

          <div className="md:w-64 bg-[#1a1a1a] rounded-lg border border-zinc-800 focus-within:border-[#C7A15E] transition-colors px-4 relative flex items-center">
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full appearance-none py-3 pr-8 cursor-pointer"
            >
              <option value="Todas las operaciones" className="bg-zinc-900 text-white">Todas las operaciones</option>
              <option value="Venta" className="bg-zinc-900 text-white">Venta</option>
              <option value="Alquiler" className="bg-zinc-900 text-white">Alquiler</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* PROPERTIES GRID */}
        {loading ? (
          <div className="text-center text-[#C7A15E] py-12">Cargando catálogo...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">No se encontraron propiedades que coincidan con la búsqueda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div 
                key={property.id} 
                className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#C7A15E]/50 transition-all duration-500 flex flex-col group h-full"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[#C7A15E] text-black hover:bg-[#b8923f] border-none font-semibold px-3 py-1 text-xs">
                      {property.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif text-white group-hover:text-[#C7A15E] transition-colors mb-2 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-zinc-400 mb-4 group/location">
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <p className="text-sm line-clamp-1">{property.address}</p>
                    </div>
                    <p className="text-2xl text-[#C7A15E] font-medium whitespace-nowrap mb-6">
                      {property.price}
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center gap-2">
                        <BedDouble size={18} />
                        <span className="text-sm">{property.beds}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath size={18} />
                        <span className="text-sm">{property.baths}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize size={18} />
                        <span className="text-sm">{property.sqft} m²</span>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-zinc-800 rounded-lg py-6 transition-colors">
                      <Link to={`/propiedades/${property.id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
