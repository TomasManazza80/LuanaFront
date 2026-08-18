"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Star, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { properties } from "@/lib/data"

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [settings, setSettings] = useState<any>({
    heroTitle: "Excelencia y Confianza en el Mercado Inmobiliario Santafesino",
    heroSubtitle: "Asesoramiento personalizado con más de 30 años de experiencia.",
    heroHighlight: "Atendido por sus propios dueños.",
    heroImageUrl: "/images/hero-property.jpg",
    heroRatingText: "Altamente Recomendado - 3.9 / 28 Opiniones",
    heroRatingStars: 4,
    heroSlides: []
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
        const res = await fetch(`${apiUrl}/api/settings/hero`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache"
          }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch hero settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Handle Image Slider
  const heroSlides = settings.heroSlides && settings.heroSlides.length > 0 
    ? settings.heroSlides 
    : [
        {
          id: "default",
          imageUrl: settings.heroImageUrl || "/images/hero-property.jpg",
          title: settings.heroTitle || "Excelencia y Confianza en el Mercado Inmobiliario Santafesino",
          subtitle: settings.heroSubtitle || "Asesoramiento personalizado con más de 30 años de experiencia.",
          highlight: settings.heroHighlight || "Atendido por sus propios dueños."
        }
      ];

  useEffect(() => {
    if (heroSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
      }, 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [heroSlides.length]);

  const currentSlide = heroSlides[currentImageIndex] || heroSlides[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/propiedades?q=${encodeURIComponent(query.trim())}`)
    } else {
      navigate("/propiedades")
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
      className="relative min-h-[100dvh] flex flex-col md:flex-row items-center justify-center z-40 bg-[#0a0a0a]"
    >
      {/* Background Image Slider */}
      <div className="relative w-full h-[40vh] md:h-auto md:absolute md:inset-0 z-0 bg-black flex-shrink-0">
        {heroSlides.map((slide: any, index: number) => (
          <img
            key={slide.id || index}
            src={slide.imageUrl || "/images/hero-property.jpg"}
            alt={`Hero Background ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: (settings.heroOverlayOpacity !== undefined ? settings.heroOverlayOpacity : 50) / 100 }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:from-black md:via-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 md:pt-24 md:pb-16 text-center flex-grow flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Rating Badge */}
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 shadow-xl px-4 py-2 rounded-full mb-8">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < (settings.heroRatingStars || 4) ? "fill-[#C7A15E] text-[#C7A15E]" : "fill-[#C7A15E]/30 text-[#C7A15E]/30"}
                />
              ))}
            </div>
            <span className="text-sm text-white/90 font-medium">
              {settings.heroRatingText?.split(' - ')[0] || "Altamente Recomendado"}
            </span>
            {settings.heroRatingText?.includes(' - ') && (
              <span className="text-sm text-white/60">• {settings.heroRatingText.split(' - ')[1]}</span>
            )}
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-white leading-tight mb-4 md:mb-6 text-balance transition-all duration-500">
            {currentSlide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed transition-all duration-500">
            {currentSlide.subtitle}{" "}
            <span className="text-[#C7A15E]">{currentSlide.highlight}</span>
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6 md:mb-8 z-50">
            <form onSubmit={handleSearch} className="flex items-center bg-[#1a1a1a]/80 md:bg-black/40 backdrop-blur-md rounded-full border border-white/10 md:border-white/20 focus-within:border-[#C7A15E] transition-all shadow-xl">
              <Search className="absolute left-4 md:left-6 text-white/60" size={20} />
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
                      to={`/propiedades/${prop.id}`}
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
                  to={`/propiedades?q=${encodeURIComponent(query.trim())}`}
                  className="py-4 bg-white/5 text-center text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium border-t border-white/20"
                >
                  Ver todos los resultados para &quot;{query}&quot;
                </Link>
              </div>
            )}
          </div>

          {/* Additional Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
            <Link to="/propiedades" className="text-white hover:text-[#C7A15E] transition-colors underline-offset-4 hover:underline text-sm font-medium tracking-wide">
              Explorar Catálogo Completo
            </Link>
            <Link to="/#contacto" className="text-white hover:text-[#C7A15E] transition-colors underline-offset-4 hover:underline text-sm font-medium tracking-wide">
              Contactar un Asesor
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <Link to="#servicios" className="text-white/60 hover:text-white transition-colors">
          <ChevronDown size={32} />
        </Link>
      </div>
    </section>
  )
}
