"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { properties } from "@/lib/data"

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/propiedades?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push("/propiedades")
    }
  }

  const filteredProperties = properties.filter((prop) =>
    prop.title.toLowerCase().includes(query.toLowerCase()) ||
    prop.address.toLowerCase().includes(query.toLowerCase()) ||
    prop.propertyType.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = heroRef.current?.querySelectorAll(".animate-on-scroll")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative min-h-screen flex items-center justify-center z-40"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-property.jpg"
          alt="Propiedad de lujo en Santa Fe"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-24 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Rating Badge */}
          <div className="animate-on-scroll opacity-0 inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < 4 ? "fill-[#C7A15E] text-[#C7A15E]" : "fill-[#C7A15E]/30 text-[#C7A15E]/30"}
                />
              ))}
            </div>
            <span className="text-sm text-white/90 font-medium">
              Altamente Recomendado
            </span>
            <span className="text-sm text-white/60">• 3.9 / 28 Opiniones</span>
          </div>

          {/* Main Heading */}
          <h1 className="animate-on-scroll opacity-0 animate-delay-100 font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-white leading-tight mb-6 text-balance">
            Excelencia y Confianza en el Mercado Inmobiliario Santafesino
          </h1>

          {/* Subtitle */}
          <p className="animate-on-scroll opacity-0 animate-delay-200 text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Asesoramiento personalizado con más de 30 años de experiencia.{" "}
            <span className="text-[#C7A15E]">Atendido por sus propios dueños.</span>
          </p>

          {/* Search Bar */}
          <div className="animate-on-scroll opacity-0 animate-[delay-300ms] relative max-w-2xl mx-auto mb-8 z-50">
            <form onSubmit={handleSearch} className="flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/20 focus-within:border-[#C7A15E] transition-all shadow-xl">
              <Search className="absolute left-6 text-white/60" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Buscar por ubicación, operaciones o inmuebles..."
                className="w-full bg-transparent text-white px-14 py-4 md:py-5 outline-none placeholder:text-white/60 text-base md:text-lg rounded-full"
              />
              <Button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-[#C7A15E] hover:bg-[#b8923f] text-black font-semibold rounded-full px-6 md:px-8"
              >
                Buscar
              </Button>
            </form>

            {/* Real-time suggestions */}
            {showSuggestions && query.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/20 rounded-3xl overflow-hidden shadow-2xl z-50 flex flex-col items-stretch text-left">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((prop) => (
                    <Link
                      key={prop.id}
                      href={`/propiedades/${prop.id}`}
                      className="pl-14 pr-8 py-4 hover:bg-white/10 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="text-white font-medium group-hover:text-[#C7A15E] transition-colors">{prop.title}</h4>
                        <p className="text-sm text-white/60 mt-0.5">{prop.address} • {prop.propertyType}</p>
                      </div>
                      <span className="text-[#C7A15E] font-medium whitespace-nowrap ml-4">{prop.price}</span>
                    </Link>
                  ))
                ) : (
                  <div className="pl-14 pr-8 py-6 text-white/60">
                    No se encontraron resultados
                  </div>
                )}
                <Link
                  href={`/propiedades?q=${encodeURIComponent(query.trim())}`}
                  className="py-4 bg-white/5 text-center text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium border-t border-white/20"
                >
                  Ver todos los resultados para &quot;{query}&quot;
                </Link>
              </div>
            )}
          </div>

          {/* Additional Links */}
          <div className="animate-on-scroll opacity-0 animate-[delay-400ms] flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
            <Link href="/propiedades" className="text-white hover:text-[#C7A15E] transition-colors underline-offset-4 hover:underline text-sm font-medium tracking-wide">
              Explorar Catálogo Completo
            </Link>
            <Link href="/#contacto" className="text-white hover:text-[#C7A15E] transition-colors underline-offset-4 hover:underline text-sm font-medium tracking-wide">
              Contactar un Asesor
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <Link href="#servicios" className="text-white/60 hover:text-white transition-colors">
          <ChevronDown size={32} />
        </Link>
      </div>
    </section>
  )
}
