import { Link } from "react-router-dom"
import { Facebook, Instagram, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="El Cruce Carnes Logo"
                  className="w-full h-full object-contain bg-white rounded-full p-1"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium tracking-wide text-white">
                  EL CRUCE CARNES
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
              to="#inicio"
              className="text-sm text-white/50 hover:text-[#C7A15E] transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="#servicios"
              className="text-sm text-white/50 hover:text-[#C7A15E] transition-colors"
            >
              Servicios
            </Link>
            <Link
              to="#nosotros"
              className="text-sm text-white/50 hover:text-[#C7A15E] transition-colors"
            >
              Nosotros
            </Link>
            <Link
              to="#contacto"
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
            © {currentYear} El Cruce Carnes. Todos los
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
