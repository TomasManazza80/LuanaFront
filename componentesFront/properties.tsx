"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Bath, BedDouble, Maximize, Home, Building2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { properties } from "@/lib/data"

import dynamic from "next/dynamic"

const PropertyMap = dynamic(() => import("./property-map").then(m => m.PropertyMap), { ssr: false })

export function Properties() {
  const [filter, setFilter] = useState<"Todos" | "Venta" | "Alquiler">("Todos")

  const filteredProperties = properties.filter((prop) => {
    if (filter === "Todos") return true
    return prop.type === filter
  })

  return (
    <section id="propiedades" className="py-24 bg-zinc-950 text-white">
      <div className="container mx-auto px-6">
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
                <Image
                  src={property.images && property.images.length > 0 ? property.images[0] : property.image}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
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
                    <Link href={`/propiedades/${property.id}`} className="flex items-center justify-center gap-2 group/btn">
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
