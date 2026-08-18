"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Phone, Mail, Send, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setFormData({ name: "", email: "", phone: "", message: "" })
    alert("¡Gracias por su consulta! Nos pondremos en contacto pronto.")
  }

  return (
    <section
      ref={sectionRef}
      id="contacto"
      className="relative py-24 md:py-32 bg-black"
    >
      {/* Background accent */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#C7A15E]/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="animate-on-scroll opacity-0 inline-block text-[#C7A15E] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Contacto
          </span>
          <h2 className="animate-on-scroll opacity-0 animate-delay-100 font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 text-balance">
            Estamos Para Ayudarte
          </h2>
          <p className="animate-on-scroll opacity-0 animate-delay-200 text-white/60 max-w-2xl mx-auto text-lg">
            ¿Tiene preguntas o desea programar una visita? Contáctenos y
            responderemos a la brevedad.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="animate-on-scroll opacity-0 animate-delay-200">
            <div className="glass-strong rounded-xl p-8 md:p-10 border border-white/10">
              <h3 className="font-serif text-2xl text-white mb-6">
                Envíenos un Mensaje
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm text-white/60 mb-2"
                  >
                    Nombre Completo
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Su nombre"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C7A15E] focus:ring-[#C7A15E]/20 rounded-lg h-12"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm text-white/60 mb-2"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="su@email.com"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C7A15E] focus:ring-[#C7A15E]/20 rounded-lg h-12"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm text-white/60 mb-2"
                    >
                      Teléfono
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+54 342 ..."
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C7A15E] focus:ring-[#C7A15E]/20 rounded-lg h-12"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm text-white/60 mb-2"
                  >
                    Mensaje
                  </label>
                  <Textarea
                    id="message"
                    placeholder="¿En qué podemos ayudarlo?"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C7A15E] focus:ring-[#C7A15E]/20 rounded-lg resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C7A15E] hover:bg-[#b8923f] text-black font-medium h-12 rounded-lg transition-all duration-300 shadow-lg shadow-[#C7A15E]/20 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Enviar Consulta
                      <Send size={18} />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Info & Map */}
          <div className="animate-on-scroll opacity-0 animate-delay-300 space-y-6">
            {/* Contact Info Cards */}
            <div className="glass rounded-xl p-6 border border-white/10 hover:border-[#C7A15E]/20 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#C7A15E]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[#C7A15E]" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Dirección</h4>
                  <p className="text-white/60">
                    Regis Martínez 1475
                    <br />
                    Santa Fe, Argentina
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-white/10 hover:border-[#C7A15E]/20 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#C7A15E]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-[#C7A15E]" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Teléfono</h4>
                  <a
                    href="tel:+543424535453"
                    className="text-white/60 hover:text-[#C7A15E] transition-colors"
                  >
                    0342 453-5453
                  </a>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-white/10 hover:border-[#C7A15E]/20 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#C7A15E]/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-[#C7A15E]" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Horarios</h4>
                  <p className="text-white/60">
                    Lun - Vie: 9:00 - 18:00
                    <br />
                    Sáb: 9:00 - 13:00
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="glass rounded-xl overflow-hidden border border-white/10 aspect-[16/10]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.3959854444445!2d-60.70500492353516!3d-31.631667374154457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b5a9a0b1e5d8c3%3A0x8c0c1f0c0c0c0c0c!2sRegis%20Martinez%201475%2C%20Santa%20Fe!5e0!3m2!1sen!2sar!4v1700000000000!5m2!1sen!2sar"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Jorge A. Pighin Negocios Inmobiliarios"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
