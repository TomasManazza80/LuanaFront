import Link from "next/link"
import { Facebook, Instagram, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M20 4L4 16V36H16V24H24V36H36V16L20 4Z"
                    stroke="url(#footer-silver)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <defs>
                    <linearGradient
                      id="footer-silver"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#a8a8a8" />
                      <stop offset="50%" stopColor="#e0e0e0" />
                      <stop offset="100%" stopColor="#a8a8a8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium tracking-wide text-white">
                  JORGE A. PIGHIN
                </span>
                <span className="h-[1.5px] w-full bg-[#C7A15E] mt-0.5" />
              </div>
            </Link>
            <p className="text-white/40 text-sm mt-3">
              Negocios Inmobiliarios en Santa Fe
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center gap-8">
            <Link
              href="#inicio"
              className="text-sm text-white/50 hover:text-[#C7A15E] transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="#servicios"
              className="text-sm text-white/50 hover:text-[#C7A15E] transition-colors"
            >
              Servicios
            </Link>
            <Link
              href="#nosotros"
              className="text-sm text-white/50 hover:text-[#C7A15E] transition-colors"
            >
              Nosotros
            </Link>
            <Link
              href="#contacto"
              className="text-sm text-white/50 hover:text-[#C7A15E] transition-colors"
            >
              Contacto
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex justify-center md:justify-end gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-[#C7A15E] hover:border-[#C7A15E]/30 transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-[#C7A15E] hover:border-[#C7A15E]/30 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="mailto:contacto@pighin.com.ar"
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-[#C7A15E] hover:border-[#C7A15E]/30 transition-all duration-300"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {currentYear} Jorge A. Pighin Negocios Inmobiliarios. Todos los
            derechos reservados.
          </p>
          <p className="text-white/30 text-xs">
            Regis Martínez 1475, Santa Fe, Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}
