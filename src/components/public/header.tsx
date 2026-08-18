"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSelector, useDispatch } from "react-redux"
import { useGetUserQuery } from "@/services/api/userApi.js"
import { logout } from "@/services/auth/authSlice.js"
import logoCruce from "../../pages/images/LOGOCRUCE.png"

export function Header({ alwaysSolid = false, topBarText = null, topBarPromo = null }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [fetchedTopBarText, setFetchedTopBarText] = useState("Florece: (1) 293 445-51-23 | Mon - Sun: 00:00 - 22:00")
  const [fetchedTopBarPromo, setFetchedTopBarPromo] = useState("🔥 ¡Oferta del día! Asado especial a solo $2.500 el kilo 🔥")
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!topBarText) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      fetch(`${apiUrl}/api/settings/hero`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data?.homeContent) {
            if (json.data.homeContent.headerTopBarText !== undefined) setFetchedTopBarText(json.data.homeContent.headerTopBarText);
            if (json.data.homeContent.headerPromoText !== undefined) setFetchedTopBarPromo(json.data.homeContent.headerPromoText);
          }
        })
        .catch(console.error);
    }
  }, [topBarText, topBarPromo])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  const authSlice = useSelector((state: any) => state.authSlice)
  const dispatch = useDispatch()
  const { data: userResponse } = useGetUserQuery(undefined, { skip: !authSlice?.accessToken })
  const user = userResponse?.data

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('refreshToken')
  }

  const navLinks = [
    { href: "/", label: "INICIO" },
    { href: "/tienda", label: "LISTA DE PRECIOS" },
    { href: "/#nosotros", label: "CONÓCENOS" },
    { href: "/#contacto", label: "CONTACTO" },
  ]
  const scrollToSmoothly = (element: HTMLElement) => {
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - 80;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200;
    let start: number | null = null;

    const ease = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t * t + b;
      t -= 2;
      return c / 2 * (t * t * t + 2) + b;
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault()
      const id = href.substring(2)
      const element = document.getElementById(id)
      if (element) {
        scrollToSmoothly(element)
      }
      setIsMobileMenuOpen(false)
    } else {
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans flex flex-col ${isScrolled || alwaysSolid ? "bg-[#0a0a0a] shadow-lg border-b border-white/5" : "bg-transparent border-b border-white/10"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-2 flex justify-between items-center w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center relative group shrink-0">
          <div className="absolute inset-0 bg-[#b91c1c] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/20 bg-[#111] shadow-lg overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#b91c1c]/50 group-hover:shadow-[0_0_15px_rgba(185,28,28,0.3)] z-10 p-0.5">
            <img
              src={logoCruce}
              alt="El Cruce Carnes Logo"
              className="h-full w-full object-cover rounded-full"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-widest text-white/90">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`hover:text-[#b91c1c] transition-colors uppercase pb-1 ${isActive ? 'border-b-2 border-white' : ''
                  }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex gap-4 items-center">
          <button onClick={() => navigate('/tienda')} className="bg-black/40 border border-white/10 hover:bg-[#b91c1c] hover:border-[#b91c1c] transition-all duration-300 px-6 py-2 text-[11px] font-bold tracking-widest text-white uppercase rounded-sm backdrop-blur-sm">
            COMPRAR AHORA
          </button>

          {(!authSlice?.accessToken) ? (
            <button
              onClick={() => navigate('/login')}
              className="bg-transparent border border-white/30 hover:bg-white/10 transition-all duration-300 px-6 py-2 text-[11px] font-bold tracking-widest text-white uppercase rounded-sm backdrop-blur-sm"
            >
              INICIAR SESIÓN
            </button>
          ) : null}

          {(authSlice?.accessToken && user && user.role === 'ADMIN') ? (
            <button
              onClick={() => navigate('/admin/mercaderia')}
              className="bg-black/40 border border-white/30 hover:bg-white/10 transition-all duration-300 px-6 py-2 text-[11px] font-bold tracking-widest text-white uppercase rounded-sm backdrop-blur-sm"
            >
              MI PANEL
            </button>
          ) : null}

          {authSlice?.accessToken && (
            <button
              onClick={() => {
                handleLogout();
                navigate('/');
              }}
              className="bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 px-6 py-2 text-[11px] font-bold tracking-widest uppercase rounded-sm backdrop-blur-sm"
            >
              SALIR
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Top Bar (Now at the bottom of the header) */}
      <div className="flex px-6 lg:px-8 py-1.5 text-[11px] text-white/80 font-medium tracking-wider border-t border-white/5 bg-black/20 w-full overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span 
            dangerouslySetInnerHTML={{ __html: topBarText || fetchedTopBarText }}
            className="px-4"
          />
          <span className="mx-8 opacity-50">|</span>
          <span 
            dangerouslySetInnerHTML={{ __html: topBarPromo || fetchedTopBarPromo }}
            className="px-4 text-yellow-400"
          />
        </div>
        {/* Double the content for smooth infinite scrolling */}
        <div className="animate-marquee inline-block" aria-hidden="true">
          <span 
            dangerouslySetInnerHTML={{ __html: topBarText || fetchedTopBarText }}
            className="px-4"
          />
          <span className="mx-8 opacity-50">|</span>
          <span 
            dangerouslySetInnerHTML={{ __html: topBarPromo || fetchedTopBarPromo }}
            className="px-4 text-yellow-400"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[100px] bg-[#0a0a0a] transition-all duration-300 overflow-y-auto pb-20 ${isMobileMenuOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
          }`}
      >
        <nav className="flex flex-col items-center justify-start min-h-full pt-12 pb-24 gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-xl font-medium text-white/80 hover:text-white transition-colors duration-300 tracking-wider uppercase"
            >
              {link.label}
            </Link>
          ))}

          <Button
            onClick={() => {
              navigate('/tienda');
              setIsMobileMenuOpen(false);
            }}
            className="bg-[#b91c1c] hover:bg-[#991b1b] text-white font-medium px-8 py-3 rounded-none transition-all duration-300 mt-4 tracking-widest uppercase text-sm"
          >
            COMPRAR AHORA
          </Button>

          {(!authSlice?.accessToken) ? (
            <Button
              variant="outline"
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="border-white/30 text-white hover:bg-white/10 font-medium px-8 py-3 rounded-none transition-all duration-300 tracking-widest uppercase text-sm bg-transparent"
            >
              INICIAR SESIÓN
            </Button>
          ) : (
            <>
              {user && user.role === 'ADMIN' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/admin/mercaderia');
                    setIsMobileMenuOpen(false);
                  }}
                  className="border-white/30 text-white hover:bg-white/10 font-medium px-8 py-3 rounded-none transition-all duration-300 tracking-widest uppercase text-sm bg-transparent"
                >
                  MI PANEL
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  handleLogout();
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }}
                className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-medium px-8 py-3 rounded-none transition-all duration-300 tracking-widest uppercase text-sm bg-transparent"
              >
                SALIR
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
