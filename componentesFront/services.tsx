"use client"

import { useEffect, useRef } from "react"
import { Home, Key, FileText, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Home,
    title: "Venta de Propiedades Exclusivas",
    description:
      "Comercializamos las mejores propiedades de Santa Fe con un enfoque en la calidad y exclusividad. Cada propiedad es cuidadosamente seleccionada.",
    features: ["Tasación profesional", "Marketing premium", "Negociación experta"],
  },
  {
    icon: Key,
    title: "Alquileres Eficientes",
    description:
      "Gestión integral de alquileres con atención personalizada tanto para propietarios como inquilinos. Procesos ágiles y transparentes.",
    features: ["Selección de inquilinos", "Contratos claros", "Seguimiento continuo"],
  },
  {
    icon: FileText,
    title: "Tasaciones y Asesoramiento Legal",
    description:
      "Valuaciones precisas respaldadas por años de experiencia en el mercado local. Asesoramiento legal integral para cada operación.",
    features: ["Informes detallados", "Análisis de mercado", "Documentación legal"],
  },
]

export function Services() {
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
      id="servicios"
      className="relative py-24 md:py-32 bg-black"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="animate-on-scroll opacity-0 inline-block text-[#C7A15E] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Nuestros Servicios
          </span>
          <h2 className="animate-on-scroll opacity-0 animate-delay-100 font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 text-balance">
            Soluciones Inmobiliarias Integrales
          </h2>
          <p className="animate-on-scroll opacity-0 animate-delay-200 text-white/60 max-w-2xl mx-auto text-lg">
            Ofrecemos un servicio completo para todas sus necesidades inmobiliarias,
            con la eficiencia y dedicación que nos caracteriza.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`animate-on-scroll opacity-0 animate-delay-${(index + 1) * 100} group`}
            >
              <div className="h-full glass rounded-lg p-8 transition-all duration-500 hover:bg-white/[0.08] border border-white/10 hover:border-[#C7A15E]/30">
                {/* Icon */}
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6 group-hover:from-[#C7A15E]/20 group-hover:to-[#C7A15E]/5 transition-all duration-500">
                  <service.icon className="w-7 h-7 text-[#C7A15E]" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl text-white mb-4 group-hover:text-[#C7A15E] transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-white/60 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-white/50"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C7A15E]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Link */}
                <button className="inline-flex items-center gap-2 text-sm text-[#C7A15E] hover:gap-3 transition-all duration-300">
                  Más información
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
