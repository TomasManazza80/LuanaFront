"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { MapPin, Bath, BedDouble, Maximize, Home, Building2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { PropertyMap } from "./property-map"

export function Properties() {
  const [filter, setFilter] = useState<"Todos" | "Venta" | "Alquiler">("Todos")
  const [bedsFilter, setBedsFilter] = useState<string>("Cualquiera")
  const [bathsFilter, setBathsFilter] = useState<string>("Cualquiera")
  const [typeFilter, setTypeFilter] = useState<string>("Cualquiera")
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
        const res = await fetch(`${apiUrl}/api/gvamax/inmuebles`);
        const json = await res.json();
        
        const data = json.propiedades || json.inmuebles || json.data || (Array.isArray(json) ? json : []);

        const mapped = data.map((p: any) => {
          const type = p.tipoOperacion || "Venta";
          
          let price = p.precio || "Consultar";

          const beds = p.dormitorios || 0;
          const baths = p.banos || 0;
          const sqft = p.superficies?.metrosCubiertos || p.superficies?.metrosTerreno || 0;

          const propertyType = p.tipoInmueble || "Propiedad";

          const images = [];
          if (p.media?.images) {
            Object.values(p.media.images).forEach(img => images.push(img));
          } else if (p.imagenPortada) {
            images.push(p.imagenPortada);
          }

          const addressParts = [];
          if (p.ubicacion?.calle) addressParts.push(p.ubicacion.calle);
          if (p.ubicacion?.numero) addressParts.push(p.ubicacion.numero);
          if (p.ubicacion?.localidad) addressParts.push(p.ubicacion.localidad);

          // Strip HTML from description if any
          let description = p.descripcion || "";
          if (typeof description === "string") {
            description = description.replace(/<[^>]*>?/gm, '');
          }

          let lat, lng;
          if (p.ubicacion?.coordenadas) {
            const parts = p.ubicacion.coordenadas.split(',');
            if (parts.length === 2) {
              lat = parseFloat(parts[0].trim());
              lng = parseFloat(parts[1].trim());
            }
          }

          return {
            id: p.id,
            type,
            propertyType,
            title: p.tituloComercial || "Propiedad sin título",
            price,
            address: addressParts.join(" ") || "Ubicación a consultar",
            description,
            beds,
            baths,
            sqft,
            images,
            latitude: lat,
            longitude: lng
          }
        });
        console.log("Mapped properties:", mapped);
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
    if (filter !== "Todos" && prop.type !== filter) return false;
    if (bedsFilter !== "Cualquiera" && prop.beds < parseInt(bedsFilter)) return false;
    if (bathsFilter !== "Cualquiera" && prop.baths < parseInt(bathsFilter)) return false;
    if (typeFilter !== "Cualquiera" && !prop.propertyType.includes(typeFilter)) return false;
    return true;
  })

  return (
    <section id="propiedades" className="py-24 bg-zinc-950 text-white">
      <div className="container mx-auto px-6">
        
        {/* FILTROS AVANZADOS */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 md:p-6 mb-12 flex flex-wrap gap-4 items-end justify-between shadow-xl">
          <div className="flex flex-wrap gap-6 w-full md:w-auto">
             {/* Habitaciones */}
             <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Habitaciones</label>
                <select 
                  className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:border-[#C7A15E] transition-colors appearance-none min-w-[150px] cursor-pointer"
                  value={bedsFilter}
                  onChange={(e) => setBedsFilter(e.target.value)}
                >
                  <option value="Cualquiera">Cualquiera</option>
                  <option value="1">1+ Habitaciones</option>
                  <option value="2">2+ Habitaciones</option>
                  <option value="3">3+ Habitaciones</option>
                  <option value="4">4+ Habitaciones</option>
                </select>
             </div>
             {/* Baños */}
             <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Baños</label>
                <select 
                  className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:border-[#C7A15E] transition-colors appearance-none min-w-[150px] cursor-pointer"
                  value={bathsFilter}
                  onChange={(e) => setBathsFilter(e.target.value)}
                >
                  <option value="Cualquiera">Cualquiera</option>
                  <option value="1">1+ Baños</option>
                  <option value="2">2+ Baños</option>
                  <option value="3">3+ Baños</option>
                </select>
             </div>
             {/* Tipo */}
             <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Tipo Inmueble</label>
                <select 
                  className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:border-[#C7A15E] transition-colors appearance-none min-w-[150px] cursor-pointer"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="Cualquiera">Cualquiera</option>
                  <option value="Casa">Casa</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Condominio">Condominio</option>
                  <option value="Local Comercial">Local Comercial</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Terreno">Terreno</option>
                </select>
             </div>
          </div>
          <div className="mt-4 md:mt-0 flex w-full md:w-auto">
             <Button 
                onClick={() => { setBedsFilter("Cualquiera"); setBathsFilter("Cualquiera"); setTypeFilter("Cualquiera"); setFilter("Todos"); }}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 w-full md:w-auto rounded-xl" variant="ghost"
             >
                Limpiar Filtros
             </Button>
          </div>
        </div>

        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
              Propiedades Destacadas
            </h2>
            <p className="text-zinc-400 text-lg">
              Explore nuestra exclusiva selección de propiedades en venta y alquiler, 
              elegidas meticulosamente para satisfacer los más altos estándares de calidad.
            </p>
          </div>
          
          <div className="flex gap-2">
            {(["Todos", "Venta", "Alquiler"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === t 
                    ? "bg-[#C7A15E] text-black" 
                    : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {filteredProperties.map((property: any) => (
            <div 
              key={property.id} 
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#C7A15E]/50 transition-all duration-500 flex flex-col xl:flex-row group"
            >
              <div className="relative h-72 xl:h-auto xl:w-2/5 overflow-hidden">
                <img
                  src={property.images && property.images.length > 0 ? property.images[0] : property.image}
                  alt={property.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-[#C7A15E] text-black hover:bg-[#b8923f] border-none font-semibold px-3 py-1 text-xs">
                    {property.type}
                  </Badge>
                  <Badge className="bg-black/80 text-white border-none backdrop-blur-md px-3 py-1 text-xs">
                    {property.propertyType}
                  </Badge>
                </div>
              </div>
              
              <div className="xl:w-3/5 p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-2xl font-serif text-white group-hover:text-[#C7A15E] transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-2xl text-[#C7A15E] font-medium whitespace-nowrap">
                        {property.price}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-zinc-400 mb-6 group/location">
                      <MapPin size={16} className="mr-2 text-[#C7A15E] group-hover/location:animate-bounce" />
                      <p className="text-sm">{property.address}</p>
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                      {property.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-6">
                    <div className="flex flex-col items-center justify-center p-3 bg-zinc-950 rounded-xl">
                      <BedDouble size={20} className="text-[#C7A15E] mb-2" />
                      <span className="text-sm font-medium">{property.beds} Dorms.</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-zinc-950 rounded-xl">
                      <Bath size={20} className="text-[#C7A15E] mb-2" />
                      <span className="text-sm font-medium">{property.baths} Baños</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-zinc-950 rounded-xl">
                      <Maximize size={20} className="text-[#C7A15E] mb-2" />
                      <span className="text-sm font-medium">{property.sqft} m²</span>
                    </div>
                  </div>
                </div>

                <div className="lg:w-72 flex flex-col gap-4">
                  <div className="w-full h-48 lg:h-full rounded-xl overflow-hidden border border-zinc-800 relative bg-zinc-950/50">
                    <PropertyMap 
                      latitude={property.latitude} 
                      longitude={property.longitude} 
                      address={property.address} 
                    />
                  </div>
                  <Button asChild className="w-full bg-[#C7A15E] hover:bg-[#b8923f] text-black rounded-xl h-12">
                    <Link to={`/propiedades/${property.id}`} className="flex items-center justify-center gap-2 group/btn">
                      Ver Detalles Completos
                      <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
