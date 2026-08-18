import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IKContext, IKUpload } from 'imagekitio-react';
import {
  FiEdit3, FiSave, FiRefreshCw, FiEye, FiSmartphone, FiMonitor, FiTablet,
  FiCheck, FiSliders, FiImage, FiType, FiLayers, FiHelpCircle, FiArrowRight,
  FiUploadCloud, FiTrash2, FiLink, FiLoader, FiNavigation
} from 'react-icons/fi';
import videoHero from '../../../media/video1.mp4';

// Configuración de contenido por defecto para el Home
export const DEFAULT_HOME_CONTENT = {
  hero: {
    badge: "LUANA STUDIO · SANTA FE",
    monogramText: "LUAN STUDIO",
    monogramSub: "ESTUDIO DE BELLEZA & NAIL ART",
    phoneBadge: "RESERVAR TURNO ONLINE",
    phoneSubBadge: "SISTEMA DE TURNOS 24/7",
    btn1Text: "RESERVAR MI TURNO",
    btn2Text: "EXPLORAR PRODUCTOS & TIENDA",
    bgVideo: "",
    phoneVideo: ""
  },
  manicureSection: {
    badgeNumber: "01",
    badgeTitle: "SERVICIOS DESTACADOS",
    mainTitle: "MANICURÍA PROFESIONAL",
    subtitle: "Elegancia, precisión y cuidado en cada detalle.",
    items: [
      { id: 1, title: "MANICURA CLÁSICA", subtitle: "RESERVAR AHORA", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop" },
      { id: 2, title: "ESMALTADO SEMIPERMANENTE", subtitle: "VER CATÁLOGO", image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=800&auto=format&fit=crop" },
      { id: 3, title: "UÑAS ESCULPIDAS & GEL", subtitle: "RESERVAR AHORA", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop" },
      { id: 4, title: "NAIL ART & DECORACIÓN", subtitle: "VER VERSIÓN ART", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop" },
      { id: 5, title: "CUIDADO & NUTRICIÓN", subtitle: "PRODUCTOS SPA", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop" },
    ]
  },
  pedicureSection: {
    badgeNumber: "02",
    badgeTitle: "PEDICURÍA & SPA DE PIES",
    mainTitle: "PEDICURA PREMIUM & CUIDADO INTENSIVO",
    subtitle: "Tratamientos intensivos y cuidado profundo para tus pies.",
    slides: [
      { id: 1, title: "PEDICURA COMPLETA PREMIUM", subtitle: "TRATAMIENTO RUSA & CUIDADO INTENSIVO", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1200&auto=format&fit=crop" },
      { id: 2, title: "SPA DE PIES & NAIL CARE", subtitle: "HIDRATACIÓN PROFUNDA & ESMALTADO", image: "https://images.unsplash.com/photo-1508672019048-8054797e751d?q=80&w=1200&auto=format&fit=crop" },
      { id: 3, title: "EXFOLIACIÓN & TRATAMIENTO DE RUSA", subtitle: "RENOVACIÓN CUTÁNEA & SUAVIDAD", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop" },
      { id: 4, title: "DISEÑO ELEGANTE & ESMALTADO PERMANENTE", subtitle: "BRILLO DURADERO & ESTÉTICA DE PIES", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop" },
    ]
  },
  productsSection: {
    badgeNumber: "03",
    title: "TIENDA DE PRODUCTOS LUANA",
    subtitle: "Nuestra selección de productos profesionales para el cuidado de uñas y piel.",
    btnText: "VER CATÁLOGO COMPLETO DE PRODUCTOS →"
  },
  cursosSection: {
    badgeNumber: "04",
    title: "CURSOS DISPONIBLES & CAPACITACIONES",
    subtitle: "Aprende las mejores técnicas de manicuría, pedicuría y nail art con nuestras masterclasses.",
    btnText: "INSCRIPCIÓN DE CURSOS →"
  },
  footerBanner: {
    title: "¿LISTA PARA RENOVAR TUS UÑAS Y SENTIRTE ÚNICA?",
    subtitle: "Reserva tu turno ahora de forma rápida y sencilla a través de nuestra web.",
    btnText: "RESERVAR MI TURNO AHORA",
    whatsappText: "O contáctanos por WhatsApp al +54 9 342 5547811"
  }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const IK_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
const IK_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

const authenticator = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/imagekit`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

const InlineEdit = ({ value, onChange, className, as = "span", multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (!multiline) {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTempValue(value);
    }
  };

  const Element = as;

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${className} bg-slate-900 text-amber-300 border-2 border-amber-400 rounded-lg p-2.5 outline-none w-full min-h-[80px] shadow-xl text-xs focus:ring-2 focus:ring-amber-400/20 transition-all font-sans leading-relaxed`}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} bg-slate-900 text-amber-300 border-2 border-amber-400 rounded-md px-2.5 py-1 outline-none w-full shadow-xl text-xs focus:ring-2 focus:ring-amber-400/20 transition-all font-sans`}
      />
    );
  }

  return (
    <Element 
      className={`${className} cursor-pointer hover:bg-amber-400/15 hover:ring-1 hover:ring-amber-400/70 rounded-md px-1.5 py-0.5 transition-all duration-200 relative group inline-flex items-center gap-1.5 max-w-full select-text`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsEditing(true);
      }}
      title="Haz clic para editar este contenido"
    >
      <span className="truncate">{value || "Texto vacío"}</span>
      <span className="opacity-0 group-hover:opacity-100 bg-amber-400 text-slate-950 rounded p-0.5 shadow-md transition-all duration-200 shrink-0 transform group-hover:scale-110">
        <FiEdit3 size={11} />
      </span>
    </Element>
  );
};

const InlineMediaUploader = ({ currentMedia, onMediaChange, isVideo = false, className, children }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState(currentMedia || '');

  useEffect(() => {
    setTempUrl(currentMedia || '');
  }, [currentMedia]);

  const handleUploadStart = () => setIsUploading(true);
  const handleUploadSuccess = (res) => {
    setIsUploading(false);
    if (res && res.url) onMediaChange(res.url);
  };
  const handleUploadError = (err) => {
    setIsUploading(false);
    console.error("Error al subir a ImageKit:", err);
    alert("Ocurrió un error al subir el archivo con ImageKit. Puedes ingresar la URL del video directamente usando el botón 'Pegar URL'.");
  };

  const handleApplyUrl = () => {
    onMediaChange(tempUrl.trim());
    setShowUrlInput(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onMediaChange('');
    setTempUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className={`relative group inline-block max-w-full ${className}`}>
      {children}
      
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center z-50 rounded-[inherit] p-2 text-white">
        {showUrlInput ? (
          <div className="flex flex-col gap-2 w-full max-w-xs px-2" onClick={(e) => e.stopPropagation()}>
            <label className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              Ingresar URL de {isVideo ? 'Video' : 'Imagen'}:
            </label>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder={isVideo ? "https://.../video.mp4" : "https://.../imagen.jpg"}
              className="bg-slate-900 text-white border border-slate-700 text-[11px] rounded px-2 py-1 outline-none focus:border-amber-400 font-mono w-full"
            />
            <div className="flex items-center gap-1.5 justify-end">
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-2.5 py-0.5 rounded text-[10px] bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {IK_PUBLIC_KEY && IK_URL_ENDPOINT ? (
              <IKContext
                publicKey={IK_PUBLIC_KEY}
                urlEndpoint={IK_URL_ENDPOINT}
                authenticator={authenticator}
              >
                <label className={`cursor-pointer px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-lg border border-white/20 ${isUploading ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-[#0A58CA] hover:bg-blue-600 text-white hover:scale-105 active:scale-95'}`}>
                  {isUploading ? (
                    <>
                      <FiLoader size={12} className="animate-spin text-white" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <FiUploadCloud size={12} />
                      <span>Subir {isVideo ? 'Video' : 'Imagen'}</span>
                    </>
                  )}
                  <IKUpload
                    fileName={`media_${Date.now()}`}
                    useUniqueFileName={true}
                    folder="/home_gestor"
                    onError={handleUploadError}
                    onSuccess={handleUploadSuccess}
                    onUploadStart={handleUploadStart}
                    className="hidden"
                    disabled={isUploading}
                    accept={isVideo ? "video/*" : "image/*"}
                  />
                </label>
              </IKContext>
            ) : null}

            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Pegar enlace de URL directamente"
            >
              <FiLink size={12} />
              <span>Pegar URL</span>
            </button>

            {currentMedia ? (
              <button
                type="button"
                onClick={handleRemove}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Quitar medio"
              >
                <FiTrash2 size={12} />
                <span>Quitar</span>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default function GestorHomeLive() {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem('luan_home_content');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_HOME_CONTENT,
          ...parsed,
          hero: { ...DEFAULT_HOME_CONTENT.hero, ...(parsed.hero || {}) }
        };
      }
      return DEFAULT_HOME_CONTENT;
    } catch {
      return DEFAULT_HOME_CONTENT;
    }
  });

  const [viewport, setViewport] = useState('desktop'); // desktop | tablet | mobile
  const [saveStatus, setSaveStatus] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(75); // Default 75% zoom

  // Fetch initial content from server on mount
  useEffect(() => {
    const fetchServerContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-content`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            setContent(prev => ({
              ...DEFAULT_HOME_CONTENT,
              ...data.content,
              hero: { ...DEFAULT_HOME_CONTENT.hero, ...(data.content.hero || {}) },
              manicureSection: { ...DEFAULT_HOME_CONTENT.manicureSection, ...(data.content.manicureSection || {}) },
              pedicureSection: { ...DEFAULT_HOME_CONTENT.pedicureSection, ...(data.content.pedicureSection || {}) },
              productsSection: { ...DEFAULT_HOME_CONTENT.productsSection, ...(data.content.productsSection || {}) },
              cursosSection: { ...DEFAULT_HOME_CONTENT.cursosSection, ...(data.content.cursosSection || {}) },
              footerBanner: { ...DEFAULT_HOME_CONTENT.footerBanner, ...(data.content.footerBanner || {}) }
            }));
            localStorage.setItem('luan_home_content', JSON.stringify(data.content));
            window.dispatchEvent(new Event('home_content_updated'));
          }
        }
      } catch (e) {
        console.warn("No se pudo cargar contenido del servidor, usando local:", e);
      }
    };
    fetchServerContent();
  }, []);

  // Auto-sync changes to localStorage, notify App and save to Backend database
  const handleSave = async () => {
    localStorage.setItem('luan_home_content', JSON.stringify(content));
    window.dispatchEvent(new Event('home_content_updated'));
    setSaveStatus(true);

    try {
      await fetch(`${API_URL}/api/home-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    } catch (e) {
      console.error("Error al guardar en el servidor:", e);
    }

    setTimeout(() => setSaveStatus(false), 3000);
  };

  const handleReset = async () => {
    if (window.confirm("¿Seguro que deseas restablecer todos los textos e información del Home a sus valores por defecto?")) {
      setContent(DEFAULT_HOME_CONTENT);
      localStorage.setItem('luan_home_content', JSON.stringify(DEFAULT_HOME_CONTENT));
      window.dispatchEvent(new Event('home_content_updated'));
      setSaveStatus(true);

      try {
        await fetch(`${API_URL}/api/home-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: DEFAULT_HOME_CONTENT })
        });
      } catch (e) {
        console.error("Error al restablecer en el servidor:", e);
      }

      setTimeout(() => setSaveStatus(false), 3000);
    }
  };

  const updateField = (path, value) => {
    const keys = path.split('.');
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!ref[keys[i]]) ref[keys[i]] = {};
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      localStorage.setItem('luan_home_content', JSON.stringify(next));
      window.dispatchEvent(new Event('home_content_updated'));
      return next;
    });
  };

  const updateItemField = (sectionKey, index, field, value) => {
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (next[sectionKey] && next[sectionKey].items && next[sectionKey].items[index]) {
        next[sectionKey].items[index][field] = value;
      } else if (next[sectionKey] && next[sectionKey].slides && next[sectionKey].slides[index]) {
        next[sectionKey].slides[index][field] = value;
      }
      return next;
    });
  };

  const viewportWidths = {
    desktop: 'w-full max-w-5xl mx-auto',
    tablet: 'w-full max-w-2xl mx-auto',
    mobile: 'w-full max-w-xs mx-auto'
  };

  return (
    <div className="flex flex-col bg-slate-950 text-slate-100 font-sans w-full max-w-full h-full min-h-screen selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden">

      {/* 1. TOP HEADER CONTROL BAR (SaaS 2-Tier Modern Toolbar - High Density) */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 shadow-lg w-full max-w-full overflow-x-hidden">
        
        {/* Tier 1: Brand Title & Primary Action Buttons */}
        <div className="px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/60 w-full max-w-full">
          {/* Brand & Section Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0A58CA] via-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shrink-0 border border-white/20">
              <FiSliders size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xs tracking-wide text-white uppercase font-sans">
                  Gestor de Inicio
                </h1>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Editor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Edición visual directa en tiempo real · Presiona cualquier elemento para modificar
              </p>
            </div>
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
              title="Restablecer textos predeterminados"
            >
              <FiRefreshCw size={12} />
              <span className="hidden sm:inline">Restablecer</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm hover:border-slate-700 active:scale-95"
            >
              <FiEye size={12} />
              <span className="hidden sm:inline">Ver Web</span>
            </a>

            <button
              onClick={handleSave}
              className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all shadow-md flex items-center gap-1 border border-emerald-400/20 active:scale-95 cursor-pointer"
            >
              {saveStatus ? <FiCheck size={14} className="animate-bounce" /> : <FiSave size={14} />}
              <span>{saveStatus ? '¡Guardado!' : 'Guardar'}</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Controls Toolbar Strip (Zoom, Viewport & Jumper) */}
        <div className="px-3 sm:px-5 py-1.5 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2.5 text-xs w-full max-w-full">
          {/* Zoom & Viewport Group */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom Selector */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 gap-0.5 shadow-inner">
              <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase tracking-wider">Zoom</span>
              {[75, 80, 90, 100].map(z => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${zoomLevel === z
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  title={`Establecer zoom al ${z}%`}
                >
                  {z}%
                </button>
              ))}
            </div>

            {/* Viewport Switcher */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 gap-0.5 shadow-inner">
              <button
                onClick={() => setViewport('desktop')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${viewport === 'desktop' ? 'bg-[#0A58CA] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Vista Escritorio"
              >
                <FiMonitor size={13} />
                <span>Escritorio</span>
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${viewport === 'tablet' ? 'bg-[#0A58CA] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Vista Tablet"
              >
                <FiTablet size={13} />
                <span>Tablet</span>
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${viewport === 'mobile' ? 'bg-[#0A58CA] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Vista Celular"
              >
                <FiSmartphone size={13} />
                <span>Móvil</span>
              </button>
            </div>
          </div>

          {/* Section Jumper Dropdown */}
          <div className="relative">
            <select 
              defaultValue=""
              onChange={(e) => {
                const el = document.getElementById(e.target.value);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                e.target.value = '';
              }}
              className="appearance-none bg-slate-900 text-slate-300 border border-slate-800 rounded-lg pl-2.5 pr-7 py-1 text-[11px] font-bold transition-all outline-none focus:border-[#0A58CA] cursor-pointer hover:bg-slate-800/60 shadow-inner"
            >
              <option value="" disabled>Navegar a sección...</option>
              <option value="section-hero">1. Inicio & Héroe</option>
              <option value="section-manicure">2. Manicuría</option>
              <option value="section-pedicure">3. Pedicuría</option>
              <option value="section-products">4. Tienda de Productos</option>
              <option value="section-cursos">5. Cursos & Capacitaciones</option>
              <option value="section-footer">6. Banner Contacto</option>
            </select>
            <FiNavigation size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </header>


      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 w-full max-w-full overflow-x-hidden">

        {/* INTERACTIVE PREVIEW CANVAS CONTAINER */}
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden flex justify-center items-start scroll-smooth w-full max-w-full">
          <div 
            className={`transition-all duration-300 ${viewportWidths[viewport]} w-full max-w-full overflow-x-hidden bg-[#E5D8CC] text-[#3D1A20] rounded-2xl shadow-xl border border-slate-800 flex flex-col font-sans select-none relative origin-top my-2 shadow-black/80 ring-1 ring-white/10`}
          >

            {/* Canvas Header Bar / Device Frame Header */}
            <div className="bg-[#2E1318] text-[#E5D8CC] px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between border-b border-[#E5D8CC]/15 shrink-0 select-none w-full max-w-full overflow-x-hidden">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                VISTA PREVIA INTERACTIVA EN VIVO
              </span>
              <div className="flex items-center gap-2">
                <span className="opacity-70 font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded-full uppercase border border-white/10">
                  {viewport} • {zoomLevel}%
                </span>
                <span className="opacity-80 font-mono text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 hidden sm:inline-block">
                  LUANA STUDIO
                </span>
              </div>
            </div>

            {/* LIVE PREVIEW CANVAS BODY */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-0 w-full max-w-full">

              {/* 1. HERO PREVIEW SECTION */}
              <section
                id="section-hero"
                className="py-8 md:py-14 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden min-h-[50vh] md:min-h-[55vh] text-center bg-[#E5D8CC] border-b border-[#3D1A20]/10 transition-all w-full max-w-full"
              >
                {/* Background Video Preview (if set) */}
                {content.hero?.bgVideo ? (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <video
                      key={content.hero.bgVideo}
                      src={content.hero.bgVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                ) : null}

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#2E1318]/90 via-[#3D1A20]/80 to-[#2E1318]/90 backdrop-blur-[2px] pointer-events-none z-0" />

                <div className="max-w-6xl mx-auto w-full flex flex-row items-center justify-center gap-3 sm:gap-8 md:gap-14 relative z-10 px-2 sm:px-4">

                  {/* CENTERED LOGO MONOGRAM & TEXTS */}
                  <div className="flex flex-col items-center text-center z-10 shrink max-w-[58%] sm:max-w-none">
                    <div className="mb-2 sm:mb-4 bg-[#F3ECE7] text-[#3D1A20] font-bold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-xs uppercase tracking-widest shadow-md truncate max-w-full">
                      <InlineEdit 
                        value={content.hero?.badge} 
                        onChange={(val) => updateField('hero.badge', val)} 
                      />
                    </div>

                    <div className="relative mb-2 sm:mb-4 select-none">
                      <img
                        src="/images/logoLuan.jpeg"
                        alt="Luan Studio"
                        className="w-20 h-20 sm:w-36 sm:h-36 rounded-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 sm:border-4 border-[#F3ECE7]"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2 py-1">
                      <p className="text-xs sm:text-base md:text-lg tracking-[0.2em] sm:tracking-[0.35em] uppercase font-light text-[#F3ECE7] font-semibold drop-shadow">
                        <InlineEdit 
                          value={content.hero?.monogramText} 
                          onChange={(val) => updateField('hero.monogramText', val)} 
                        />
                      </p>
                      <span className="mt-1 sm:mt-2 text-[8px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] text-[#F3ECE7] uppercase font-medium bg-[#F3ECE7]/20 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-[#F3ECE7]/30 shadow-md inline-block">
                        <InlineEdit 
                          value={content.hero?.monogramSub} 
                          onChange={(val) => updateField('hero.monogramSub', val)} 
                        />
                      </span>
                    </div>

                    <div className="mt-3 sm:mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-3">
                      <div className="bg-[#F3ECE7] text-[#3D1A20] font-bold px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-xs uppercase tracking-wider shadow-md">
                        <InlineEdit 
                          value={content.hero?.btn1Text} 
                          onChange={(val) => updateField('hero.btn1Text', val)} 
                        />
                      </div>
                      <div className="border border-[#F3ECE7] text-[#F3ECE7] font-bold px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-xs uppercase tracking-wider">
                        <InlineEdit 
                          value={content.hero?.btn2Text} 
                          onChange={(val) => updateField('hero.btn2Text', val)} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* SMARTPHONE MOCKUP PREVIEW WITH PHONE VIDEO */}
                  <div className="relative flex flex-col justify-center items-center z-10 shrink-0">
                    <div className="relative w-[115px] xs:w-[145px] sm:w-[190px] md:w-[210px]">
                      <div className="relative bg-[#1a1315] p-1 sm:p-1.5 rounded-[22px] sm:rounded-[36px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] border border-[#3D1A20]/70 ring-1 ring-white/20 overflow-hidden select-none">
                        
                        {/* Dynamic Island Notch */}
                        <div className="w-10 sm:w-16 h-1.5 sm:h-2.5 bg-black rounded-full mx-auto absolute top-1.5 sm:top-2.5 left-1/2 -translate-x-1/2 z-30" />

                        {/* Phone Screen Container */}
                        <div className="relative overflow-hidden rounded-[18px] sm:rounded-[30px] aspect-[9/19.5] bg-black border border-black/40 shadow-inner">
                          <video
                            key={content.hero?.phoneVideo || 'default'}
                            src={content.hero?.phoneVideo || videoHero}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20" />
                          <div className="absolute bottom-2 sm:bottom-3 left-1 sm:left-2 right-1 sm:right-2 z-20 pointer-events-none">
                            <div className="bg-[#3D1A20]/85 backdrop-blur-md border border-white/20 text-[#F3ECE7] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-center shadow">
                              <p className="text-[7px] sm:text-[9px] font-bold tracking-wider uppercase truncate">
                                {content.hero?.phoneBadge || 'RESERVAR TURNO ONLINE'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="w-12 sm:w-20 h-0.5 sm:h-1 bg-white/40 rounded-full mx-auto mt-1 sm:mt-1.5 mb-0.5" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Media Uploaders Control Strip */}
                <div className="mt-8 relative z-20 flex flex-wrap justify-center gap-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Video de Fondo:</span>
                    <InlineMediaUploader
                      isVideo={true}
                      currentMedia={content.hero?.bgVideo}
                      onMediaChange={(val) => updateField('hero.bgVideo', val)}
                    >
                      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${content.hero?.bgVideo ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>
                        <FiMonitor size={14} />
                        <span>{content.hero?.bgVideo ? '✓ Video de Fondo Configurado' : '+ Añadir Video de Fondo'}</span>
                      </span>
                    </InlineMediaUploader>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Video Celular:</span>
                    <InlineMediaUploader
                      isVideo={true}
                      currentMedia={content.hero?.phoneVideo}
                      onMediaChange={(val) => updateField('hero.phoneVideo', val)}
                    >
                      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${content.hero?.phoneVideo ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>
                        <FiSmartphone size={14} />
                        <span>{content.hero?.phoneVideo ? '✓ Video Celular Configurado' : '+ Añadir Video Celular'}</span>
                      </span>
                    </InlineMediaUploader>
                  </div>
                </div>
              </section>

              {/* 2. MANICURE SECTION PREVIEW */}
              <section
                id="section-manicure"
                className="p-4 sm:p-8 md:p-10 bg-white border-b border-slate-100 transition-all relative w-full max-w-full overflow-x-hidden"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Section Header */}
                  <div className="border-b border-slate-100 pb-4 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="text-[#0A58CA] font-mono">⁽<InlineEdit value={content.manicureSection.badgeNumber} onChange={(val) => updateField('manicureSection.badgeNumber', val)} />⁾</span> 
                      <InlineEdit value={content.manicureSection.badgeTitle} onChange={(val) => updateField('manicureSection.badgeTitle', val)} />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-[#3D1A20] uppercase tracking-tight">
                      <InlineEdit value={content.manicureSection.mainTitle} onChange={(val) => updateField('manicureSection.mainTitle', val)} />
                    </h2>
                    <p className="text-xs text-slate-500 font-medium max-w-xl leading-relaxed">
                      <InlineEdit value={content.manicureSection.subtitle} onChange={(val) => updateField('manicureSection.subtitle', val)} multiline={true} className="block" />
                    </p>
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {content.manicureSection.items.map((item, i) => (
                      <div key={i} className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 text-left hover:border-[#0A58CA] hover:shadow-lg transition-all flex flex-col justify-between group shadow-sm">
                        <div>
                          <div className="aspect-[4/3] bg-slate-200 rounded-lg overflow-hidden mb-2.5 relative group/img shadow-inner border border-slate-200">
                            <InlineMediaUploader
                              currentMedia={item.image}
                              onMediaChange={(val) => {
                                const newItems = [...content.manicureSection.items];
                                newItems[i].image = val;
                                updateField('manicureSection.items', newItems);
                              }}
                              className="w-full h-full"
                            >
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" />
                            </InlineMediaUploader>
                          </div>
                          <div className="space-y-1 px-0.5">
                            <p className="font-bold text-xs text-[#3D1A20] truncate">
                              <InlineEdit 
                                value={item.title} 
                                onChange={(val) => {
                                  const newItems = [...content.manicureSection.items];
                                  newItems[i].title = val;
                                  updateField('manicureSection.items', newItems);
                                }} 
                              />
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-wider">
                              <InlineEdit 
                                value={item.subtitle} 
                                onChange={(val) => {
                                  const newItems = [...content.manicureSection.items];
                                  newItems[i].subtitle = val;
                                  updateField('manicureSection.items', newItems);
                                }} 
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 3. PEDICURE SECTION PREVIEW */}
              <section
                id="section-pedicure"
                className="p-4 sm:p-8 md:p-10 bg-[#3D1A20] text-[#E5D8CC] border-b border-[#3D1A20]/20 transition-all relative w-full max-w-full overflow-x-hidden"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Section Header */}
                  <div className="border-b border-[#E5D8CC]/15 pb-4 space-y-1.5">
                    <div className="text-[10px] font-bold text-[#E5D8CC]/60 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="text-[#E5D8CC] font-mono">⁽<InlineEdit value={content.pedicureSection.badgeNumber} onChange={(val) => updateField('pedicureSection.badgeNumber', val)} />⁾</span> 
                      <InlineEdit value={content.pedicureSection.badgeTitle} onChange={(val) => updateField('pedicureSection.badgeTitle', val)} />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black uppercase text-white tracking-tight">
                      <InlineEdit value={content.pedicureSection.mainTitle} onChange={(val) => updateField('pedicureSection.mainTitle', val)} />
                    </h2>
                    <p className="text-xs text-[#E5D8CC]/80 max-w-xl leading-relaxed">
                      <InlineEdit value={content.pedicureSection.subtitle} onChange={(val) => updateField('pedicureSection.subtitle', val)} multiline={true} className="block" />
                    </p>
                  </div>

                  {/* Slides Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {content.pedicureSection.slides.map((slide, idx) => (
                      <div key={idx} className="bg-[#2E1318] p-3 rounded-xl border border-[#E5D8CC]/15 hover:border-[#E5D8CC]/40 transition-all flex items-center gap-3 shadow-lg">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#3D1A20] shrink-0 border border-[#E5D8CC]/20 relative group/img shadow-inner">
                          <InlineMediaUploader
                            currentMedia={slide.image}
                            onMediaChange={(val) => {
                              const newSlides = [...content.pedicureSection.slides];
                              newSlides[idx].image = val;
                              updateField('pedicureSection.slides', newSlides);
                            }}
                            className="w-full h-full"
                          >
                            {slide.image ? (
                              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#E5D8CC]/40">
                                <FiImage size={18} />
                              </div>
                            )}
                          </InlineMediaUploader>
                        </div>
                        <div className="overflow-hidden flex-1 space-y-1">
                          <p className="font-bold text-xs text-[#E5D8CC] truncate">
                            <InlineEdit 
                              value={slide.title} 
                              onChange={(val) => {
                                const newSlides = [...content.pedicureSection.slides];
                                newSlides[idx].title = val;
                                updateField('pedicureSection.slides', newSlides);
                              }} 
                            />
                          </p>
                          <p className="text-[10px] text-[#E5D8CC]/70 font-medium truncate tracking-wide">
                            <InlineEdit 
                              value={slide.subtitle} 
                              onChange={(val) => {
                                const newSlides = [...content.pedicureSection.slides];
                                newSlides[idx].subtitle = val;
                                updateField('pedicureSection.slides', newSlides);
                              }} 
                            />
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 4. PRODUCTS PREVIEW */}
              <section
                id="section-products"
                className="p-6 sm:p-10 md:p-12 bg-[#E5D8CC] border-b border-[#3D1A20]/10 transition-all relative text-center w-full max-w-full overflow-x-hidden"
              >
                <div className="max-w-xl mx-auto space-y-5">
                  <span className="text-[10px] font-bold tracking-widest text-[#3D1A20]/60 uppercase block font-mono">⁽03⁾ SECCIÓN TIENDA</span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-[#3D1A20] uppercase tracking-tight">
                    <InlineEdit value={content.productsSection.title} onChange={(val) => updateField('productsSection.title', val)} />
                  </h2>
                  <p className="text-xs text-[#3D1A20]/80 leading-relaxed max-w-md mx-auto">
                    <InlineEdit value={content.productsSection.subtitle} onChange={(val) => updateField('productsSection.subtitle', val)} multiline={true} className="block" />
                  </p>
                  <div className="pt-2">
                    <div className="inline-block bg-[#3D1A20] text-[#E5D8CC] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 transition-all">
                      <InlineEdit value={content.productsSection.btnText} onChange={(val) => updateField('productsSection.btnText', val)} />
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. CURSOS PREVIEW */}
              <section
                id="section-cursos"
                className="p-6 sm:p-10 md:p-12 bg-white border-b border-slate-100 transition-all relative text-center w-full max-w-full overflow-x-hidden"
              >
                <div className="max-w-xl mx-auto space-y-5">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block font-mono">⁽04⁾ SECCIÓN CURSOS</span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-[#3D1A20] uppercase tracking-tight">
                    <InlineEdit value={content.cursosSection.title} onChange={(val) => updateField('cursosSection.title', val)} />
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                    <InlineEdit value={content.cursosSection.subtitle} onChange={(val) => updateField('cursosSection.subtitle', val)} multiline={true} className="block" />
                  </p>
                  <div className="pt-2">
                    <div className="inline-block border-2 border-[#3D1A20] text-[#3D1A20] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#3D1A20]/5 transition-all">
                      <InlineEdit value={content.cursosSection.btnText} onChange={(val) => updateField('cursosSection.btnText', val)} />
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. FOOTER BANNER PREVIEW */}
              <section
                id="section-footer"
                className="p-6 sm:p-10 md:p-12 bg-[#3D1A20] text-[#E5D8CC] text-center transition-all relative w-full max-w-full overflow-x-hidden"
              >
                <div className="max-w-xl mx-auto space-y-5">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-serif font-black text-white uppercase tracking-tight leading-tight">
                    <InlineEdit value={content.footerBanner.title} onChange={(val) => updateField('footerBanner.title', val)} multiline={true} className="block" />
                  </h2>
                  <p className="text-xs text-[#E5D8CC]/80 max-w-md mx-auto leading-relaxed">
                    <InlineEdit value={content.footerBanner.subtitle} onChange={(val) => updateField('footerBanner.subtitle', val)} multiline={true} className="block" />
                  </p>
                  <div className="pt-2">
                    <div className="inline-block bg-[#E5D8CC] text-[#3D1A20] font-black px-7 py-3 rounded-full text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform">
                      <InlineEdit value={content.footerBanner.btnText} onChange={(val) => updateField('footerBanner.btnText', val)} />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <span className="text-[10px] text-[#E5D8CC]/80 border border-[#E5D8CC]/20 bg-[#2E1318]/70 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm font-semibold">
                      <InlineEdit value={content.footerBanner.whatsappText} onChange={(val) => updateField('footerBanner.whatsappText', val)} />
                    </span>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
