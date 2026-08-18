"use client"

import { useEffect, useRef } from "react"
import { Award, Clock, Users, ThumbsUp } from "lucide-react"

const stats = [
  { icon: Clock, value: "4+", label: "Años de Experiencia" },
  { icon: Users, value: "500+", label: "Clientes Satisfechos" },
  { icon: Award, value: "300+", label: "Operaciones Exitosas" },
  { icon: ThumbsUp, value: "100%", label: "Compromiso" },
]

const teamMembers = [
  {
    name: "Jorge",
    role: "Director",
    description: "Fundador y líder con visión estratégica del mercado.",
  },
  {
    name: "Vero",
    role: "Gestión Comercial",
    description: "Experta en atención al cliente y negociación.",
  },
  {
    name: "Rodri",
    role: "Asesor Inmobiliario",
    description: "Especialista en captación y evaluación de propiedades.",
  },
]

export function About() {
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
      id="nosotros"
      className="relative py-24 md:py-32 bg-black"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="animate-on-scroll opacity-0 inline-block text-[#C7A15E] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Sobre Nosotros
          </span>
          <h2 className="animate-on-scroll opacity-0 animate-delay-100 font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 text-balance">
            Nuestro Equipo
          </h2>
          <p className="animate-on-scroll opacity-0 animate-delay-200 text-white/60 max-w-2xl mx-auto text-lg">
            Jorge, Vero y Rodri. Un equipo dedicado y resolutivo, comprometido
            con brindarle la mejor experiencia inmobiliaria en Santa Fe.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-20">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`animate-on-scroll opacity-0 animate-delay-${(index + 1) * 100}`}
            >
              <div className="glass rounded-lg p-6 text-center group hover:bg-white/[0.06] transition-all duration-500 border border-white/10 hover:border-[#C7A15E]/20">
                <stat.icon className="w-8 h-8 text-[#C7A15E] mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="font-serif text-3xl md:text-4xl text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={member.name}
                  className={`animate-on-scroll opacity-0 animate-delay-${(index + 1) * 100} text-center`}
                >
                  {/* Avatar */}
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C7A15E]/30 to-[#C7A15E]/10 flex items-center justify-center border border-[#C7A15E]/30">
                    <span className="font-serif text-2xl text-[#C7A15E]">
                      {member.name.charAt(0)}
                    </span>
                  </div>

                  {/* Name & Role */}
                  <h3 className="font-serif text-xl text-white mb-1">
                    {member.name}
                  </h3>
                  <span className="text-[#C7A15E] text-sm font-medium tracking-wide">
                    {member.role}
                  </span>

                  {/* Description */}
                  <p className="text-white/50 text-sm mt-3 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Mission Statement */}
            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
                Con años de trayectoria en el mercado inmobiliario santafesino,
                nos distinguimos por nuestra{" "}
                <span className="text-[#C7A15E]">atención personalizada</span>,
                eficiencia y compromiso con cada cliente. Atendido por sus
                propios dueños.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
