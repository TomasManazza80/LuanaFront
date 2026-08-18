import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Bath, BedDouble, Maximize, Check, ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyMap } from "./property-map";
import { Header } from "./header";
import { Footer } from "./footer";
import { VirtualTourViewer } from "./VirtualTourViewer";

export default function PropertyDetailPublic() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
        const res = await fetch(`${apiUrl}/api/gvamax/inmuebles`);
        const json = await res.json();
        
        const data = json.propiedades || json.inmuebles || json.data || (Array.isArray(json) ? json : []);
        const p = data.find((prop) => String(prop.id) === String(id));

        if (p) {
          const type = p.tipoOperacion || "Venta";
          let price = p.precio || "Consultar";
          const beds = p.dormitorios || 0;
          const baths = p.banos || 0;
          const sqft = p.superficies?.metrosCubiertos || p.superficies?.metrosTerreno || 0;
          const propertyType = p.tipoInmueble || "Propiedad";

          let tour_3d_url = null;
          try {
            // 1. Try to see if there is an external URL text file (for Luma AI or other links)
            const urlTxtRes = await fetch(`${apiUrl}/uploads/3d-models/${id}.url.txt`);
            if (urlTxtRes.ok) {
              const urlText = await urlTxtRes.text();
              tour_3d_url = urlText.trim();
            } else {
              // 2. Try to see if the file exists directly (e.g. from GVAmax uploads)
              const directUrl = `${apiUrl}/uploads/3d-models/${id}.glb`;
              const headRes = await fetch(directUrl, { method: 'HEAD' });
              if (headRes.ok) {
                tour_3d_url = directUrl;
              } else {
                // 3. Fallback to DB check
                const localRes = await fetch(`${apiUrl}/api/public/properties/${id}`);
                if (localRes.ok) {
                  const localData = await localRes.json();
                  if (localData.data) {
                    const dbUrl = localData.data.tour_3d_url || localData.data.metareal_url;
                    if (dbUrl) {
                      if (dbUrl.trim().startsWith('<iframe')) {
                        tour_3d_url = dbUrl;
                      } else {
                        tour_3d_url = dbUrl.startsWith('http') ? dbUrl : `${apiUrl}${dbUrl}`;
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error("Error fetching 3D tour", err);
          }

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

          setProperty({
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
            amenities: [],
            latitude: lat,
            longitude: lng,
            tour_3d_url,
          });
        }
      } catch (e) {
        console.error("Error fetching property", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const openGallery = (index) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-[#C7A15E]">
          Cargando detalles...
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
          <h2 className="text-2xl">Propiedad no encontrada</h2>
          <Button asChild className="bg-[#C7A15E] hover:bg-[#b8923f] text-black">
            <Link to="/">Volver al catálogo</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-public min-h-screen bg-black text-zinc-300 font-sans pb-24 pt-28 relative">
      <Header />
      
      {/* HEADER SECTION */}
      <div className="container mx-auto px-6 pt-12 pb-8 max-w-6xl">
        <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-8 text-sm">
          <ChevronLeft size={16} className="mr-1" />
          Volver al catálogo
        </Link>
        
        <div className="flex gap-2 mb-6">
          <Badge className="bg-[#C7A15E] text-black hover:bg-[#b8923f] border-none font-semibold px-3 py-1 text-xs rounded-sm">
            {property.type}
          </Badge>
          <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-none px-3 py-1 text-xs rounded-sm">
            {property.propertyType}
          </Badge>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
              {property.title}
            </h1>
            <div className="flex items-center text-zinc-400">
              <MapPin size={18} className="mr-2 text-[#C7A15E]" />
              <p>{property.address}</p>
            </div>
          </div>
          <div className="text-3xl md:text-4xl text-[#C7A15E] font-medium whitespace-nowrap">
            {property.price}
          </div>
        </div>

        {/* ELEGANT PHOTO GRID */}
        <div className="w-full h-[350px] md:h-[500px] flex gap-2 mb-12 relative rounded-2xl overflow-hidden group/grid">
          {/* Main Large Image */}
          <div 
            className="w-full md:w-1/2 h-full relative cursor-pointer overflow-hidden group/main"
            onClick={() => openGallery(0)}
          >
            <img 
              src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"} 
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/main:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover/main:bg-transparent transition-colors duration-300"></div>
          </div>

          {/* 4 Small Images Grid (Only visible on md+ if there are enough images) */}
          {property.images.length > 1 && (
            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 w-1/2 h-full">
              {property.images.slice(1, 5).map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative w-full h-full cursor-pointer overflow-hidden group/sub"
                  onClick={() => openGallery(idx + 1)}
                >
                  <img 
                    src={img} 
                    alt={`${property.title} - foto ${idx + 2}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/sub:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover/sub:bg-transparent transition-colors duration-300"></div>
                  
                  {/* Overlay for the 5th image if more exist */}
                  {idx === 3 && property.images.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 hover:bg-black/40 transition-colors flex items-center justify-center">
                      <span className="text-white font-medium text-lg">+{property.images.length - 5} Fotos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* View All Photos Button */}
          <Button 
            onClick={() => openGallery(0)} 
            variant="secondary"
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-black font-medium gap-2 shadow-lg backdrop-blur-sm border-none z-10"
          >
            <ImageIcon size={16} />
            Ver todas las fotos
          </Button>
        </div>

        {/* RECORRIDO VIRTUAL / 3D TOUR */}
        {(property.tour_3d_url || property.metareal_url) && (
          <div className="w-full mb-12">
            <h2 className="text-2xl font-serif text-[#C7A15E] mb-6">Recorrido Virtual</h2>
            <div className="rounded-2xl overflow-hidden border border-zinc-800/50">
              {property.tour_3d_url && property.tour_3d_url.includes('<iframe') ? (
                <div 
                  className="w-full [&>iframe]:w-full [&>iframe]:h-[600px] [&>iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: property.tour_3d_url }} 
                />
              ) : property.tour_3d_url ? (
                <iframe
                  src={property.tour_3d_url}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : (
                <VirtualTourViewer url={property.metareal_url} />
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* DESCRIPTION */}
            <section>
              <h2 className="text-2xl font-serif text-[#C7A15E] mb-6">Descripción de la Propiedad</h2>
              <div className="text-zinc-300 leading-relaxed space-y-4 whitespace-pre-wrap">
                {property.description}
              </div>
            </section>

            {/* FEATURES */}
            <section>
              <h2 className="text-2xl font-serif text-[#C7A15E] mb-6">Características Principales</h2>
              <div className="grid grid-cols-3 gap-4 p-8 bg-zinc-900/80 rounded-2xl border border-zinc-800/50">
                <div className="flex flex-col items-center text-center">
                  <BedDouble size={28} className="text-[#C7A15E] mb-3" />
                  <span className="text-2xl text-white font-medium mb-1">{property.beds}</span>
                  <span className="text-sm text-zinc-400">Dormitorios</span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-zinc-800">
                  <Bath size={28} className="text-[#C7A15E] mb-3" />
                  <span className="text-2xl text-white font-medium mb-1">{property.baths}</span>
                  <span className="text-sm text-zinc-400">Baños</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Maximize size={28} className="text-[#C7A15E] mb-3" />
                  <span className="text-2xl text-white font-medium mb-1">{property.sqft}</span>
                  <span className="text-sm text-zinc-400">Metros Cuadrados</span>
                </div>
              </div>
            </section>



            {/* AMENITIES */}
            {property.amenities.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif text-[#C7A15E] mb-6">Comodidades y Servicios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-zinc-300">
                      <Check size={18} className="text-[#C7A15E] mr-3" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-8">
            {/* CONTACT FORM */}
            <div className="bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800/50">
              <h3 className="text-xl font-serif text-white mb-4">¿Estás interesado?</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Dejanos tus datos y un asesor especializado se pondrá en contacto a la brevedad para brindarte más detalles o programar una visita guiada.
              </p>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <input 
                    type="text" 
                    placeholder="Tu nombre completo" 
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7A15E] transition-colors"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7A15E] transition-colors"
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    placeholder="Teléfono" 
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7A15E] transition-colors"
                  />
                </div>
                <div>
                  <textarea 
                    placeholder="Mensaje o consulta..." 
                    rows={4}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7A15E] transition-colors resize-none"
                  ></textarea>
                </div>
                <Button className="w-full bg-[#C7A15E] hover:bg-[#b8923f] text-black font-semibold py-6 text-base rounded-lg mt-2">
                  Solicitar Información
                </Button>
              </form>
            </div>

            {/* MAP */}
            <div className="w-full h-64 rounded-2xl overflow-hidden border border-zinc-800/50 relative bg-zinc-900/50">
              <PropertyMap 
                latitude={property.latitude} 
                longitude={property.longitude} 
                address={property.address} 
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* FULLSCREEN GALLERY MODAL */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-md transition-opacity duration-300">
          <div className="flex justify-between items-center p-6 text-white absolute top-0 left-0 right-0 z-10">
            <span className="text-zinc-400 font-medium tracking-widest text-sm">
              {selectedImageIndex + 1} / {property.images.length}
            </span>
            <button 
              onClick={closeGallery} 
              className="p-3 bg-zinc-900/50 hover:bg-[#C7A15E] hover:text-black rounded-full transition-colors backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative w-full h-full" onClick={closeGallery}>
            <button 
              onClick={prevImage} 
              className="absolute left-4 md:left-8 p-3 md:p-4 bg-zinc-900/50 hover:bg-[#C7A15E] hover:text-black rounded-full text-white transition-all z-10 backdrop-blur-sm"
            >
              <ChevronLeft size={28} />
            </button>
            
            <img 
              key={selectedImageIndex}
              src={property.images[selectedImageIndex]} 
              className="max-h-[85vh] max-w-[85vw] object-contain select-none transition-opacity duration-300" 
              alt={`Vista ampliada ${selectedImageIndex + 1}`} 
              onClick={(e) => e.stopPropagation()}
            />
            
            <button 
              onClick={nextImage} 
              className="absolute right-4 md:right-8 p-3 md:p-4 bg-zinc-900/50 hover:bg-[#C7A15E] hover:text-black rounded-full text-white transition-all z-10 backdrop-blur-sm"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center gap-3 overflow-x-auto bg-gradient-to-t from-black/80 to-transparent">
            {property.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`h-16 w-24 flex-shrink-0 rounded-md overflow-hidden transition-all duration-300 ${
                  idx === selectedImageIndex ? 'ring-2 ring-[#C7A15E] scale-110 opacity-100' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Miniatura ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
