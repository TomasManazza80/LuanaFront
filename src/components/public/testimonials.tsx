"use client"

import { useEffect, useRef } from "react"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Excelente atención, responsabilidad y eficiencia. ¡Super recomendable!",
    author: "Lucas Zein",
    rating: 5,
  },
  {
    quote:
      "Excelente atención, siempre del lado del inquilino y resolutivos.",
    author: "Cliente Verificado",
    rating: 5,
  },
  {
    quote:
      "Muy profesionales y dedicados. Te acompañan en todo el proceso de compra con total transparencia.",
    author: "María G.",
    rating: 5,
  },
  {
    quote:
      "Encontré mi departamento ideal gracias a su asesoramiento personalizado. Los recomiendo totalmente.",
    author: "Roberto S.",
    rating: 4,
  },
]

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)

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

    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-black overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#C7A15E]/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="animate-on-scroll opacity-0 inline-block text-[#C7A15E] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Testimonios
          </span>
          <h2 className="animate-on-scroll opacity-0 animate-delay-100 font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 text-balance">
            Lo Que Dicen Nuestros Clientes
          </h2>
          {/* Google Badge */}
          <div className="animate-on-scroll opacity-0 animate-delay-200 inline-flex items-center gap-3 glass px-5 py-3 rounded-full">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-white text-sm font-medium">
              Opiniones de Google
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className="fill-[#C7A15E] text-[#C7A15E]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`animate-on-scroll opacity-0 animate-delay-${(index + 1) * 100}`}
            >
              <div className="h-full glass-strong rounded-lg p-8 relative group hover:bg-white/[0.06] transition-all duration-500 border border-white/10 hover:border-[#C7A15E]/20">
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-10 h-10 text-[#C7A15E]/20 group-hover:text-[#C7A15E]/30 transition-colors duration-300" />

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < testimonial.rating
                          ? "fill-[#C7A15E] text-[#C7A15E]"
                          : "fill-white/20 text-white/20"
                      }
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="font-serif text-lg md:text-xl text-white/90 mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C7A15E]/30 to-[#C7A15E]/10 flex items-center justify-center">
                    <span className="text-[#C7A15E] font-medium text-sm">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <span className="text-white/70 font-medium">
                    {testimonial.author}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
