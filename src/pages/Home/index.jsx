import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, X, Filter } from "lucide-react";
import PublicNavbar from "../../components/nav/PublicNavbar.jsx";
import videoHero from "../../media/video1.mp4";
import heroBgPhoto from "../../media/foto1.jpg";

const HOME = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

  const [homeContent, setHomeContent] = useState(() => {
    try {
      const saved = localStorage.getItem('luan_home_content');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-content`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            setHomeContent(data.content);
            localStorage.setItem('luan_home_content', JSON.stringify(data.content));
          }
        }
      } catch (err) {
        console.warn("No se pudo cargar el contenido del Home desde el servidor:", err);
      }
    };
    fetchHomeContent();

    const syncContent = () => {
      try {
        const saved = localStorage.getItem('luan_home_content');
        if (saved) setHomeContent(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('home_content_updated', syncContent);
    window.addEventListener('storage', syncContent);
    return () => {
      window.removeEventListener('home_content_updated', syncContent);
      window.removeEventListener('storage', syncContent);
    };
  }, [API_URL]);

  const manicureItems = homeContent?.manicureSection?.items || [
    {
      id: 1,
      title: "MANICURA CLÁSICA",
      subtitle: "RESERVAR AHORA",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "ESMALTADO SEMIPERMANENTE",
      subtitle: "VER CATÁLOGO",
      image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "UÑAS ESCULPIDAS & GEL",
      subtitle: "RESERVAR AHORA",
      image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "NAIL ART & DECORACIÓN",
      subtitle: "VER VERSIÓN ART",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "CUIDADO & NUTRICIÓN",
      subtitle: "PRODUCTOS SPA",
      image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const pedicureSlides = homeContent?.pedicureSection?.slides || [
    {
      id: 1,
      title: "PEDICURA COMPLETA PREMIUM",
      subtitle: "TRATAMIENTO RUSA & CUIDADO INTENSIVO",
      image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "SPA DE PIES & NAIL CARE",
      subtitle: "HIDRATACIÓN PROFUNDA & ESMALTADO",
      image: "https://images.unsplash.com/photo-1508672019048-8054797e751d?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "EXFOLIACIÓN & TRATAMIENTO DE RUSA",
      subtitle: "RENOVACIÓN CUTÁNEA & SUAVIDAD",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "DISENO ELEGANTE & ESMALTADO PERMANENTE",
      subtitle: "BRILLO DURADERO & ESTÉTICA DE PIES",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  // Auto carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % pedicureSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [pedicureSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pedicureSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + pedicureSlides.length) % pedicureSlides.length);
  };

  const heroBgSlides = [
    heroBgPhoto,
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=1600&auto=format&fit=crop"
  ];
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Auto carousel effect for Hero background photos (every 4s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroBgSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroBgSlides.length]);

  const [adminProducts, setAdminProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch Admin Products for Section Showcase
  useEffect(() => {
    const fetchAdminProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/products?limit=50`);
        const data = await res.json();
        const items = data.products || data || [];
        setAdminProducts(items);
      } catch (err) {
        console.error("Error loading products on Home:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchAdminProducts();
  }, []);

  const [adminCursos, setAdminCursos] = useState([]);
  const [isLoadingCursos, setIsLoadingCursos] = useState(true);

  // Fetch Admin Courses for Section Showcase
  useEffect(() => {
    const fetchAdminCursos = async () => {
      try {
        const savedLocal = JSON.parse(localStorage.getItem('admin_cursos_luan')) || [];
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/products?search=curso`).catch(() => null);
        let fetchedApi = [];
        if (res && res.ok) {
          const data = await res.json();
          fetchedApi = Array.isArray(data) ? data : (data.products || []);
        }

        const merged = [...savedLocal, ...fetchedApi];
        const unique = Array.from(new Map(merged.map(item => [item.id || item._id || item.nombre, item])).values());

        setAdminCursos(unique.length > 0 ? unique : [
          {
            id: 101,
            nombre: "MASTERCLASS DE NAIL ART & ESCULPIDAS",
            categoria: "Manicuría Profesional",
            modalidad: "Presencial (En Estudio)",
            precio: 25000,
            duracion: "4 Clases de 3hs",
            imagen: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
            descripcion: "Aprende las técnicas más avanzadas de esculpido en gel, preparación de uña natural y diseños tendencia."
          },
          {
            id: 102,
            nombre: "CURSO INTENSIVO DE MANICURÍA RUSA",
            categoria: "Técnicas Rusas",
            modalidad: "Online en Vivo",
            precio: 28000,
            duracion: "3 Clases de 4hs",
            imagen: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop",
            descripcion: "Perfeccionamiento en torno, limpieza profunda de cutícula y esmaltado impecable bajo cutícula."
          },
          {
            id: 103,
            nombre: "TALLER SPA DE PIES & PEDICURÍA CLÁSICA",
            categoria: "Pedicuría",
            modalidad: "Presencial (En Estudio)",
            precio: 22000,
            duracion: "2 Jornadas Intensivas",
            imagen: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop",
            descripcion: "Especialización en spa de pies, exfoliación, nutrición y tratamiento de afecciones estéticas básicas."
          }
        ]);
      } catch (err) {
        console.error("Error loading courses on Home:", err);
      } finally {
        setIsLoadingCursos(false);
      }
    };
    fetchAdminCursos();
  }, []);

  // Search & Filter state for Products section
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("TODOS");

  // Search & Filter state for Courses section
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [selectedCourseCategory, setSelectedCourseCategory] = useState("TODAS");

  // Dynamic categories for Products
  const productCategories = useMemo(() => {
    const cats = new Set();
    adminProducts.forEach((p) => {
      const cat = p.categoria || p.category;
      if (cat && cat.trim()) cats.add(cat.trim());
    });
    return ["TODOS", ...Array.from(cats)];
  }, [adminProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return adminProducts.filter((prod) => {
      const name = (prod.nombre || prod.title || "").toLowerCase();
      const cat = (prod.categoria || prod.category || "").toLowerCase();
      const desc = (prod.descripcion || prod.description || "").toLowerCase();
      const search = productSearchQuery.toLowerCase().trim();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        desc.includes(search) ||
        cat.includes(search);

      const matchesCat =
        selectedProductCategory === "TODOS" ||
        cat === selectedProductCategory.toLowerCase().trim();

      return matchesSearch && matchesCat;
    });
  }, [adminProducts, productSearchQuery, selectedProductCategory]);

  const displayedProducts = useMemo(() => {
    if (!productSearchQuery && selectedProductCategory === "TODOS") {
      return filteredProducts.slice(0, 8);
    }
    return filteredProducts;
  }, [filteredProducts, productSearchQuery, selectedProductCategory]);

  // Dynamic categories for Courses
  const courseCategories = useMemo(() => {
    const cats = new Set();
    adminCursos.forEach((c) => {
      const cat = c.categoria || c.category;
      if (cat && cat.trim()) cats.add(cat.trim());
    });
    return ["TODAS", ...Array.from(cats)];
  }, [adminCursos]);

  // Filtered Courses
  const filteredCursos = useMemo(() => {
    return adminCursos.filter((curso) => {
      const name = (curso.nombre || curso.title || curso.titulo || "").toLowerCase();
      const cat = (curso.categoria || curso.category || "").toLowerCase();
      const desc = (curso.descripcion || "").toLowerCase();
      const search = courseSearchQuery.toLowerCase().trim();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        desc.includes(search) ||
        cat.includes(search);

      const matchesCat =
        selectedCourseCategory === "TODAS" ||
        selectedCourseCategory === "TODOS" ||
        cat === selectedCourseCategory.toLowerCase().trim();

      return matchesSearch && matchesCat;
    });
  }, [adminCursos, courseSearchQuery, selectedCourseCategory]);

  const displayedCursos = useMemo(() => {
    if (!courseSearchQuery && (selectedCourseCategory === "TODAS" || selectedCourseCategory === "TODOS")) {
      return filteredCursos.slice(0, 6);
    }
    return filteredCursos;
  }, [filteredCursos, courseSearchQuery, selectedCourseCategory]);

  return (
    <div className="min-h-screen bg-[#E5D8CC] text-[#3D1A20] font-sans selection:bg-[#3D1A20] selection:text-[#E5D8CC] overflow-x-hidden pt-16 sm:pt-20">

      {/* 1. TOP NAVBAR */}
      <PublicNavbar />

      {/* 2. HERO MONOGRAM & PHONE MOCKUP WITH AUTOMATIC PHOTO SLIDESHOW */}
      <section className="py-8 md:py-14 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden min-h-[50vh] md:min-h-[55vh]">

        {/* Background Video (if configured) or Automatic Photo Slider */}
        {homeContent?.hero?.bgVideo ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <video
              key={homeContent.hero.bgVideo}
              src={homeContent.hero.bgVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        ) : (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentHeroSlide}
                initial={{ opacity: 0, x: "100%", scale: 1.04 }}
                animate={{ opacity: 1, x: "0%", scale: 1 }}
                exit={{ opacity: 0, x: "-100%", scale: 0.96 }}
                transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroBgSlides[currentHeroSlide]})` }}
              />
            </AnimatePresence>
          </div>
        )}

        {/* Dark Luxury Vignette & Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E1318]/90 via-[#3D1A20]/80 to-[#2E1318]/90 backdrop-blur-[2px] pointer-events-none z-0" />

        <div className="max-w-6xl mx-auto w-full flex flex-row items-center justify-center gap-3 sm:gap-8 md:gap-14 lg:gap-20 relative z-10 px-2 sm:px-4">

          {/* CENTERED LOGO MONOGRAM */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center z-10 shrink max-w-[58%] sm:max-w-none"
          >
            {homeContent?.hero?.badge && (
              <div className="mb-2 sm:mb-4 bg-[#F3ECE7] text-[#3D1A20] font-bold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-xs uppercase tracking-widest shadow-md truncate max-w-full">
                {homeContent.hero.badge}
              </div>
            )}

            {/* Logo Luan image with heart */}
            <div className="relative mb-2 sm:mb-4 select-none group">
              <div className="absolute -top-2 -right-1 sm:-top-2.5 sm:-right-1.5 text-[#F3ECE7] animate-bounce z-10">
                <svg className="w-4 h-4 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current drop-shadow-md" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <img
                src="/images/logoLuan.jpeg"
                alt="Luan Studio"
                className="w-20 h-20 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 sm:border-4 border-[#F3ECE7] transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <p className="text-xs sm:text-base md:text-lg tracking-[0.2em] sm:tracking-[0.35em] uppercase font-light text-[#F3ECE7] font-semibold drop-shadow">
              {homeContent?.hero?.monogramText || '· Luan studio ·'}
            </p>
            <span className="mt-1 sm:mt-2 text-[8px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] text-[#F3ECE7] uppercase font-medium bg-[#F3ECE7]/20 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-[#F3ECE7]/30 shadow-md">
              {homeContent?.hero?.monogramSub || 'Nail & Beauty Experience'}
            </span>

            <div className="mt-3 sm:mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-3">
              <button
                onClick={() => navigate('/reservar')}
                className="bg-[#F3ECE7] text-[#3D1A20] hover:bg-white font-bold px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
              >
                {homeContent?.hero?.btn1Text || "RESERVAR MI TURNO"}
              </button>
              <button
                onClick={() => navigate('/productos')}
                className="border border-[#F3ECE7] text-[#F3ECE7] hover:bg-[#F3ECE7]/10 font-bold px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-xs uppercase tracking-wider transition-all"
              >
                {homeContent?.hero?.btn2Text || "EXPLORAR PRODUCTOS & TIENDA"}
              </button>
            </div>
          </motion.div>

          {/* SMARTPHONE MOCKUP (HORIZONTALLY POSITIONED NEXT TO LOGO ALWAYS) */}
          <motion.div
            initial={{ opacity: 0, x: 100, rotate: 6, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="relative flex justify-center items-center z-10 shrink-0"
          >
            {/* Soft background ambient glow */}
            <div className="absolute inset-0 bg-white/10 blur-2xl sm:blur-3xl rounded-full scale-110 pointer-events-none" />

            {/* Floating animation wrapper */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="relative w-[115px] xs:w-[145px] sm:w-[190px] md:w-[220px] lg:w-[235px]"
            >
              {/* Phone Outer Shell - Ultra thin border & sleek padding */}
              <div className="relative bg-[#1a1315] p-1 sm:p-1.5 rounded-[22px] sm:rounded-[36px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] border border-[#3D1A20]/70 ring-1 ring-white/20 overflow-hidden select-none">

                {/* Dynamic Island Notch */}
                <div className="w-10 sm:w-16 h-1.5 sm:h-2.5 bg-black rounded-full mx-auto absolute top-1.5 sm:top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between px-1 sm:px-1.5">
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#111]" />
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#0d0d18] border border-blue-900/40" />
                </div>

                {/* Phone Screen Container */}
                <div className="relative overflow-hidden rounded-[18px] sm:rounded-[30px] aspect-[9/19.5] bg-black border border-black/40 shadow-inner">

                  {/* Video Player */}
                  <video
                    key={homeContent?.hero?.phoneVideo || 'default'}
                    src={homeContent?.hero?.phoneVideo || videoHero}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Glass Reflection Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20" />

                  {/* Tag Overlay */}
                  <div className="absolute bottom-2 sm:bottom-3 left-1 sm:left-2 right-1 sm:right-2 z-20 pointer-events-none">
                    <div className="bg-[#3D1A20]/85 backdrop-blur-md border border-white/20 text-[#F3ECE7] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-center shadow-lg">
                      <p className="text-[7px] sm:text-[9px] font-bold tracking-wider uppercase truncate">
                        {homeContent?.hero?.phoneBadge || 'RESERVAR TURNO ONLINE'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Home Bar */}
                <div className="w-12 sm:w-20 h-0.5 sm:h-1 bg-white/40 rounded-full mx-auto mt-1 sm:mt-1.5 mb-0.5" />
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 3. GIANT BANNER - NAIL STUDIO */}
      <section className="w-full bg-[#3D1A20] py-6 md:py-10 text-center overflow-hidden">
        <h2
          className="text-5xl sm:text-7xl md:text-9xl lg:text-[140px] font-black uppercase text-[#F3ECE7] tracking-tight leading-none px-4 select-none"
          style={{ fontFamily: 'Impact, sans-serif, system-ui' }}
        >
          Nuestros Servicios
        </h2>
      </section>

      {/* 4. MANICURE [01] SECTION - CALESITA / INFINITE MARQUEE CAROUSEL */}
      <section id="manicure" className="py-16 md:py-24 overflow-hidden">
        <div className="text-center mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#3D1A20] inline-flex items-center gap-1">
            {homeContent?.manicureSection?.mainTitle || 'MANICURE'} <span className="text-sm font-normal align-top">⁽⁰¹⁾</span>
          </h2>
          {homeContent?.manicureSection?.subtitle && (
            <p className="text-xs md:text-sm text-[#3D1A20]/80 font-medium mt-1 uppercase tracking-wide">
              {homeContent.manicureSection.subtitle}
            </p>
          )}
        </div>

        {/* Infinite Moving Track ("Calesita" Right to Left) */}
        <div className="w-full overflow-hidden relative group">
          <motion.div
            className="flex gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 22,
                ease: "linear"
              }
            }}
          >
            {[...manicureItems, ...manicureItems, ...manicureItems].map((item, idx) => (
              <motion.div
                key={`${item.id}-${idx}`}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="w-[220px] sm:w-[260px] md:w-[290px] shrink-0 flex flex-col group/card cursor-pointer select-none"
                onClick={() => navigate('/reservar')}
              >
                <div className="w-full aspect-[4/5] bg-[#D8C7B8] overflow-hidden rounded-2xl mb-3.5 relative shadow-md border border-[#3D1A20]/10">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest bg-[#3D1A20] px-3 py-1 rounded-full">
                      VER DETALLES ✨
                    </span>
                  </div>
                </div>
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-tight text-[#3D1A20] line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] md:text-xs tracking-wider uppercase text-[#3D1A20]/70 font-semibold underline decoration-transparent group-hover/card:decoration-[#3D1A20] transition-colors mt-0.5">
                  {item.subtitle}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. PEDICURE [02] SECTION - FULL BLEED AUTOMATIC SLIDER WITH COMPACT OVERLAYS */}
      <section id="pedicure" className="w-full relative min-h-[55vh] md:min-h-[65vh] flex flex-col justify-between py-8 md:py-12 px-6 sm:px-12 overflow-hidden bg-[#2E1318] text-[#F3ECE7]">

        {/* Full-bleed background slideshow image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={() => navigate('/reservar')}
          >
            <img
              src={pedicureSlides[currentSlide].image}
              alt={pedicureSlides[currentSlide].title}
              className="w-full h-full object-cover brightness-95"
            />
            {/* Soft, subtle gradient overlay so photo remains the highlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E1318]/85 via-black/20 to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Top Section Header - Compact */}
        <div className="relative z-20 text-center">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#F3ECE7] inline-flex items-center gap-1 drop-shadow">
            {homeContent?.pedicureSection?.mainTitle || 'PEDICURE'} <span className="text-xs font-light align-top">⁽⁰²⁾</span>
          </h2>
          {homeContent?.pedicureSection?.subtitle && (
            <p className="text-xs text-[#F3ECE7]/80 font-light mt-1 uppercase tracking-wider">
              {homeContent.pedicureSection.subtitle}
            </p>
          )}
        </div>

        {/* Center/Bottom Content & Controls - Compact Sizing */}
        <div className="max-w-5xl mx-auto w-full relative z-20 mt-auto pt-6 flex flex-col items-center">
          <div className="w-full flex flex-col md:flex-row items-end justify-between gap-4 mb-4">
            <div className="max-w-xl text-left">
              <span className="text-[10px] md:text-xs tracking-[0.2em] text-[#E8DDD3] uppercase font-bold bg-[#3D1A20]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#E8DDD3]/30 inline-block mb-2 shadow">
                {pedicureSlides[currentSlide].subtitle}
              </span>
              <h3
                className="text-base sm:text-xl md:text-2xl font-bold text-[#F3ECE7] tracking-tight uppercase leading-snug drop-shadow"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                {pedicureSlides[currentSlide].title}
              </h3>
            </div>

            {/* Pagination Dots & Navigation Arrows */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handlePrevSlide}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#3D1A20]/80 text-[#E8DDD3] backdrop-blur-md flex items-center justify-center hover:bg-[#3D1A20] hover:scale-105 transition-all border border-[#E8DDD3]/40 shadow-lg"
                aria-label="Anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                {pedicureSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${currentSlide === idx ? "w-5 bg-[#E8DDD3]" : "w-2 bg-[#E8DDD3]/40 hover:bg-[#E8DDD3]/70"
                      }`}
                    aria-label={`Ir a diapositiva ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#3D1A20]/80 text-[#E8DDD3] backdrop-blur-md flex items-center justify-center hover:bg-[#3D1A20] hover:scale-105 transition-all border border-[#E8DDD3]/40 shadow-lg"
                aria-label="Siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Action Button - Compact */}
          <div className="w-full text-center border-t border-white/15 pt-4">
            <button
              onClick={() => navigate('/reservar')}
              className="bg-[#F3ECE7] text-[#3D1A20] hover:bg-white px-7 py-2.5 font-bold text-[11px] md:text-xs tracking-widest uppercase transition-all rounded-full shadow-lg hover:scale-105"
            >
              AGENDAR TURNO DE PEDICURA
            </button>
          </div>
        </div>
      </section>

      {/* 6. PRODUCTOS CARGADOS POR EL ADMIN [03] SECTION */}
      <section id="productos-admin" className="w-full py-14 md:py-20 px-6 sm:px-12 bg-[#E5D8CC] text-[#3D1A20]">
        <div className="max-w-7xl mx-auto">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#3D1A20]/15 pb-6">
            <div>
              <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-[#3D1A20]/70 mb-1 block">
                {homeContent?.productsSection?.subtitle || 'CATÁLOGOS EXCLUSIVOS DEL ESTUDIO'}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wider text-[#3D1A20] inline-flex items-center gap-1">
                {homeContent?.productsSection?.title || 'TIENDA DE PRODUCTOS LUANA'} <span className="text-sm font-normal align-top">⁽⁰³⁾</span>
              </h2>
            </div>

            <button
              onClick={() => navigate('/productos')}
              className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-[#3D1A20] hover:opacity-75 transition-opacity underline decoration-[#3D1A20]/40 underline-offset-4"
            >
              {homeContent?.productsSection?.btnText || 'VER TIENDA COMPLETA →'}
            </button>

          </div>

          {/* Search & Category Filter Toolbar for Products */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Buscador */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D1A20]/50" size={18} />
                <input
                  type="text"
                  placeholder="Buscar productos por nombre o tipo..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-[#F3ECE7] border border-[#3D1A20]/20 rounded-full text-xs font-semibold text-[#3D1A20] placeholder-[#3D1A20]/50 focus:outline-none focus:border-[#3D1A20] focus:ring-2 focus:ring-[#3D1A20]/10 shadow-sm transition-all"
                />
                {productSearchQuery && (
                  <button
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D1A20]/40 hover:text-[#3D1A20] p-1 rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Categorías Pills */}
              {productCategories.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
                  <Filter size={14} className="text-[#3D1A20]/60 shrink-0 hidden sm:inline-block" />
                  <span className="text-xs font-bold text-[#3D1A20]/60 shrink-0 hidden sm:inline-block uppercase tracking-wider">Filtro:</span>
                  <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                    {productCategories.map((cat) => {
                      const active = (selectedProductCategory.toLowerCase() === cat.toLowerCase());
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedProductCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border shrink-0 ${active
                            ? "bg-[#3D1A20] text-[#F3ECE7] border-[#3D1A20] shadow-md"
                            : "bg-[#F3ECE7]/80 text-[#3D1A20] border-[#3D1A20]/20 hover:bg-[#F3ECE7] hover:border-[#3D1A20]/50"
                            }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Products Showcase Grid */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 bg-[#D8C7B8]/50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayedProducts.map((prod) => (
                <motion.div
                  key={prod.id || prod._id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#F3ECE7] rounded-2xl overflow-hidden border border-[#3D1A20]/10 shadow-sm flex flex-col group cursor-pointer"
                  onClick={() => navigate('/productos')}
                >
                  <div className="w-full aspect-square bg-[#D8C7B8] overflow-hidden relative">
                    <img
                      src={prod.imagen || prod.image || "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop"}
                      alt={prod.nombre || prod.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {prod.precio ? (
                      <span className="absolute top-3 right-3 bg-[#3D1A20] text-[#F3ECE7] text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        ${Number(prod.precio).toLocaleString('es-AR')}
                      </span>
                    ) : null}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      {prod.categoria ? (
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#3D1A20]/60 block mb-1">
                          {prod.categoria}
                        </span>
                      ) : null}
                      <h3 className="text-xs md:text-sm font-bold uppercase tracking-tight text-[#3D1A20] line-clamp-2">
                        {prod.nombre || prod.title || "Producto de Belleza"}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/productos'); }}
                      className="mt-4 w-full py-2 bg-[#3D1A20] text-[#F3ECE7] text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#2E1318] transition-colors"
                    >
                      VER EN TIENDA
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#F3ECE7] rounded-2xl border border-[#3D1A20]/10 space-y-4">
              <p className="text-xs md:text-sm font-semibold text-[#3D1A20]/70 uppercase tracking-wider">
                No se encontraron productos que coincidan con la búsqueda o filtro seleccionado.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {(productSearchQuery || selectedProductCategory !== 'TODOS') && (
                  <button
                    onClick={() => { setProductSearchQuery(''); setSelectedProductCategory('TODOS'); }}
                    className="bg-[#3D1A20] text-[#F3ECE7] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#2E1318] transition-colors shadow-md"
                  >
                    LIMPIAR FILTROS
                  </button>
                )}
                <button
                  onClick={() => navigate('/productos')}
                  className="border border-[#3D1A20] text-[#3D1A20] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#3D1A20]/10 transition-colors shadow-sm"
                >
                  EXPLORAR TIENDA COMPLETA
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. CURSOS Y CAPACITACIONES CARGADOS POR EL ADMIN [04] SECTION */}
      <section id="cursos-admin" className="w-full py-14 md:py-20 px-6 sm:px-12 bg-[#2E1318] text-[#F3ECE7]">
        <div className="max-w-7xl mx-auto">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#F3ECE7]/15 pb-6">
            <div>
              <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-[#E8DDD3] mb-1 block">
                {homeContent?.cursosSection?.subtitle || 'ACADEMIA & CAPACITACIÓN PROFESIONAL'}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wider text-[#F3ECE7] inline-flex items-center gap-1">
                {homeContent?.cursosSection?.title || 'CURSOS DISPONIBLES & CAPACITACIONES'} <span className="text-sm font-normal align-top">⁽⁰⁴⁾</span>
              </h2>
            </div>

            <button
              onClick={() => navigate('/reservar')}
              className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-[#E8DDD3] hover:text-white transition-colors underline decoration-[#E8DDD3]/40 underline-offset-4"
            >
              {homeContent?.cursosSection?.btnText || 'INSCRIPCIÓN DE CURSOS →'}
            </button>
          </div>

          {/* Search & Category Filter Toolbar for Courses */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Buscador */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E8DDD3]/50" size={18} />
                <input
                  type="text"
                  placeholder="Buscar cursos o capacitaciones..."
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-[#3D1A20] border border-[#E8DDD3]/25 rounded-full text-xs font-semibold text-[#F3ECE7] placeholder-[#E8DDD3]/50 focus:outline-none focus:border-[#E8DDD3] focus:ring-2 focus:ring-[#E8DDD3]/20 shadow-sm transition-all"
                />
                {courseSearchQuery && (
                  <button
                    onClick={() => setCourseSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8DDD3]/40 hover:text-[#F3ECE7] p-1 rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Categorías Pills */}
              {courseCategories.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
                  <Filter size={14} className="text-[#E8DDD3]/60 shrink-0 hidden sm:inline-block" />
                  <span className="text-xs font-bold text-[#E8DDD3]/60 shrink-0 hidden sm:inline-block uppercase tracking-wider">Filtro:</span>
                  <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                    {courseCategories.map((cat) => {
                      const active = (selectedCourseCategory.toLowerCase() === cat.toLowerCase());
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCourseCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border shrink-0 ${active
                            ? "bg-[#F3ECE7] text-[#3D1A20] border-[#F3ECE7] shadow-md"
                            : "bg-[#3D1A20]/80 text-[#E8DDD3] border-[#E8DDD3]/20 hover:bg-[#3D1A20] hover:border-[#E8DDD3]/60"
                            }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Courses Showcase Grid */}
          {isLoadingCursos ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-[#3D1A20]/60 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : displayedCursos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedCursos.map((curso) => (
                <motion.div
                  key={curso.id || curso._id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#3D1A20] rounded-2xl overflow-hidden border border-[#E8DDD3]/20 shadow-xl flex flex-col justify-between group cursor-pointer"
                  onClick={() => navigate('/reservar')}
                >
                  <div>
                    {/* Course Banner Image */}
                    <div className="w-full h-48 bg-[#2E1318] overflow-hidden relative">
                      <img
                        src={curso.imagen || curso.image || curso.imagenes?.[0] || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop"}
                        alt={curso.nombre || curso.title || curso.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute top-3 right-3 bg-[#F3ECE7] text-[#3D1A20] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        {curso.modalidad || 'Presencial'}
                      </span>
                      {curso.precio ? (
                        <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                          ${Number(curso.precio || curso.variantes?.[0]?.precioAlPublico || 0).toLocaleString('es-AR')}
                        </span>
                      ) : null}
                    </div>

                    {/* Course Info */}
                    <div className="p-6 space-y-3">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8DDD3] block">
                        {curso.categoria || 'Manicuría'}
                      </span>
                      <h3
                        className="text-lg md:text-xl font-bold uppercase tracking-tight text-[#F3ECE7] line-clamp-2"
                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                      >
                        {curso.nombre || curso.title || curso.titulo}
                      </h3>
                      <p className="text-xs text-[#E8DDD3]/80 line-clamp-2 font-light leading-relaxed">
                        {curso.descripcion || "Capacitación profesional con certificado oficial de Luan Studio."}
                      </p>

                      {curso.duracion ? (
                        <div className="pt-2 flex items-center gap-2 text-[11px] text-[#E8DDD3] font-semibold border-t border-[#E8DDD3]/15">
                          <span>⏱️ {curso.duracion}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Course Action Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/reservar'); }}
                      className="w-full py-3 bg-[#F3ECE7] text-[#3D1A20] hover:bg-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md group-hover:scale-[1.02]"
                    >
                      INSCRIBIRSE AHORA ✨
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#3D1A20] rounded-2xl border border-[#E8DDD3]/15 space-y-4">
              <p className="text-xs md:text-sm font-semibold text-[#E8DDD3]/70 uppercase tracking-wider">
                No se encontraron cursos que coincidan con la búsqueda o filtro seleccionado.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {(courseSearchQuery || (selectedCourseCategory !== 'TODAS' && selectedCourseCategory !== 'TODOS')) && (
                  <button
                    onClick={() => { setCourseSearchQuery(''); setSelectedCourseCategory('TODAS'); }}
                    className="bg-[#F3ECE7] text-[#3D1A20] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-md"
                  >
                    LIMPIAR FILTROS
                  </button>
                )}
                <button
                  onClick={() => navigate('/reservar')}
                  className="border border-[#E8DDD3] text-[#E8DDD3] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors shadow-sm"
                >
                  VER TODAS LAS INSCRIPCIONES
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* FOOTER BANNER CTA SECTION */}
      {homeContent?.footerBanner && (
        <section className="w-full bg-[#3D1A20] text-[#F3ECE7] py-14 px-6 text-center border-t border-[#F3ECE7]/10 relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black uppercase tracking-tight text-[#F3ECE7] leading-tight">
              {homeContent.footerBanner.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#E8DDD3]/90 max-w-xl mx-auto font-light leading-relaxed">
              {homeContent.footerBanner.subtitle}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/reservar')}
                className="bg-[#F3ECE7] text-[#3D1A20] hover:bg-white px-8 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl hover:scale-105"
              >
                {homeContent.footerBanner.btnText || "RESERVAR MI TURNO AHORA"}
              </button>
              {homeContent.footerBanner.whatsappText && (
                <a
                  href="https://wa.me/5493425547811"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#E8DDD3] underline hover:text-white font-semibold tracking-wider"
                >
                  {homeContent.footerBanner.whatsappText}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. FOOTER SECTION */}
      <footer className="w-full bg-[#E5D8CC] text-[#3D1A20] py-12 px-6 border-t border-[#3D1A20]/10 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <img
            src="/images/logoLuan.jpeg"
            alt="Luan Studio"
            className="w-12 h-12 rounded-full object-cover border border-[#3D1A20]"
          />
          <p className="text-xs uppercase tracking-widest font-semibold text-[#3D1A20]/80">
            · Luan Studio · Todos los derechos reservados ·
          </p>
          <div className="flex gap-6 text-xs uppercase tracking-wider font-bold">
            <button onClick={() => navigate('/reservar')} className="hover:underline">Turnos</button>
            <button onClick={() => navigate('/productos')} className="hover:underline">Tienda</button>
            <button onClick={() => navigate('/mis-turnos')} className="hover:underline">Mis Turnos</button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HOME;