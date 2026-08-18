import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IKContext, IKUpload } from 'imagekitio-react';
import {
  FiEdit3, FiSave, FiRefreshCw, FiEye, FiSmartphone, FiMonitor, FiTablet,
  FiCheck, FiSliders, FiImage, FiType, FiLayers, FiHelpCircle, FiArrowRight,
  FiUploadCloud, FiTrash2, FiLink, FiLoader
} from 'react-icons/fi';

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
          className={`${className} bg-slate-900/90 text-white border border-[#0A58CA] rounded-md p-2 outline-none w-full min-h-[80px] shadow-lg`}
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
        className={`${className} bg-slate-900/90 text-white border border-[#0A58CA] rounded-md px-2 py-1 outline-none w-full shadow-lg`}
      />
    );
  }

  return (
    <Element 
      className={`${className} cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-amber-400 hover:bg-amber-400/10 transition-all rounded px-1 relative group inline-block`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsEditing(true);
      }}
      title="Haz clic para editar"
    >
      {value || "Texto vacío"}
      <span className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 bg-amber-500 text-white rounded-full p-0.5 shadow-md pointer-events-none transition-opacity">
        <FiEdit3 size={10} />
      </span>
    </Element>
  );
};

const InlineMediaUploader = ({ currentMedia, onMediaChange, isVideo = false, className, children }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadStart = () => setIsUploading(true);
  const handleUploadSuccess = (res) => {
    setIsUploading(false);
    if (res && res.url) onMediaChange(res.url);
  };
  const handleUploadError = (err) => {
    setIsUploading(false);
    console.error("Error al subir a ImageKit:", err);
    alert("Ocurrió un error al subir el archivo.");
  };

  return (
    <div className={`relative group inline-block ${className}`}>
      {children}
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-50 rounded-[inherit]">
        {IK_PUBLIC_KEY && IK_URL_ENDPOINT ? (
          <IKContext
            publicKey={IK_PUBLIC_KEY}
            urlEndpoint={IK_URL_ENDPOINT}
            authenticator={authenticator}
          >
            <label className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xl border ${isUploading ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-[#0A58CA] hover:bg-blue-600 text-white border-blue-400'}`}>
              {isUploading ? (
                <>
                  <FiLoader size={16} className="animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <FiUploadCloud size={16} />
                  <span>Cambiar {isVideo ? 'Video' : 'Imagen'}</span>
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
        ) : (
          <div className="bg-red-500 text-white px-3 py-1 rounded text-xs">Error: IK Config</div>
        )}
      </div>
    </div>
  );
};

export default function GestorHomeLive() {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem('luan_home_content');
      return saved ? { ...DEFAULT_HOME_CONTENT, ...JSON.parse(saved) } : DEFAULT_HOME_CONTENT;
    } catch {
      return DEFAULT_HOME_CONTENT;
    }
  });

  const [viewport, setViewport] = useState('desktop'); // desktop | tablet | mobile
  const [saveStatus, setSaveStatus] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(80); // Default 80% zoom as requested

  // Fetch initial content from server on mount
  useEffect(() => {
    const fetchServerContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-content`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            setContent(prev => ({ ...DEFAULT_HOME_CONTENT, ...data.content }));
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
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto'
  };

  return (
    <div
      className="flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans transition-all duration-200 w-full h-full"
    >

      {/* 1. TOP HEADER CONTROL BAR */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A58CA] text-white flex items-center justify-center font-bold shadow-md">
            <FiSliders size={18} />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide text-white uppercase flex flex-wrap items-center gap-2">
              Gestor de Inicio (Live Editor)
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                Edición en Vivo
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Haz clic en los textos o edita desde el panel para ver los cambios al instante.</p>
          </div>
        </div>

        {/* Viewport & Zoom controls */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          {/* Zoom Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">Zoom:</span>
            {[75, 80, 90, 100].map(z => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${zoomLevel === z
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
                  }`}
                title={`Cambiar Zoom a ${z}%`}
              >
                {z}%
              </button>
            ))}
          </div>

          {/* Viewport controls */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewport === 'desktop' ? 'bg-[#0A58CA] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Vista Escritorio"
            >
              <FiMonitor size={15} /> <span className="hidden xl:inline">Escritorio</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewport === 'tablet' ? 'bg-[#0A58CA] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Vista Tablet"
            >
              <FiTablet size={15} /> <span className="hidden xl:inline">Tablet</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewport === 'mobile' ? 'bg-[#0A58CA] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Vista Celular"
            >
              <FiSmartphone size={15} /> <span className="hidden xl:inline">Móvil</span>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* Section Jumper */}
          <select 
            onChange={(e) => {
              const el = document.getElementById(e.target.value);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              e.target.value = ''; // Reset select after jump
            }}
            className="p-2 md:px-3 md:py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-[10px] md:text-xs font-bold transition-all outline-none focus:border-[#0A58CA] cursor-pointer"
          >
            <option value="" disabled selected>Ir a sección...</option>
            <option value="section-hero">1. Inicio & Héroe</option>
            <option value="section-manicure">2. Manicuría</option>
            <option value="section-pedicure">3. Pedicuría</option>
            <option value="section-products">4. Tienda (Productos)</option>
            <option value="section-cursos">5. Cursos</option>
            <option value="section-footer">6. Banner Contacto</option>
          </select>

          <button
            onClick={handleReset}
            className="p-2 md:px-3 md:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Restablecer textos predeterminados"
          >
            <FiRefreshCw size={14} />
            <span className="hidden sm:inline">Restablecer</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 md:px-3 md:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FiEye size={14} />
            <span className="hidden sm:inline">Ver Web Pública</span>
          </a>

          <button
            onClick={handleSave}
            className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] md:text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2"
          >
            {saveStatus ? <FiCheck size={16} className="animate-bounce" /> : <FiSave size={16} />}
            <span>{saveStatus ? '¡Guardado!' : 'Guardar'}</span>
          </button>
        </div>
      </header>
      {/* 2. MAIN CONTAINER: LIVE CANVAS PREVIEW */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* RIGHT PANEL: LIVE INTERACTIVE PREVIEW CANVAS */}
        <div className="flex-1 bg-slate-950 p-4 md:p-8 overflow-y-auto flex justify-center items-start">
          <div 
            style={{ zoom: `${zoomLevel}%` }}
            className={`transition-all duration-300 ${viewportWidths[viewport]} bg-[#E5D8CC] text-[#3D1A20] rounded-3xl shadow-2xl overflow-hidden border border-slate-700 min-h-[700px] flex flex-col font-sans select-none relative origin-top`}
          >

            {/* Live Canvas Top Notice */}
            <div className="bg-[#3D1A20] text-[#E5D8CC] px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-between border-b border-[#E5D8CC]/20 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                VISTA PREVIA EN VIVO (CLICK EN CUALQUIER TEXTO PARA EDITAR)
              </span>
              <span>LUANA STUDIO</span>
            </div>

            {/* LIVE PREVIEW BODY */}
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-10 pb-12">

              {/* 1. HERO PREVIEW */}
              <section
                id="section-hero"
                className="p-8 md:p-12 text-center bg-[#E5D8CC] border-b border-[#3D1A20]/10 transition-all relative"
              >
                <div className="inline-block bg-[#3D1A20] text-[#E5D8CC] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
                  <InlineEdit 
                    value={content.hero.badge} 
                    onChange={(val) => updateField('hero.badge', val)} 
                  />
                </div>

                <div className="my-6">
                  <span className="text-4xl md:text-6xl font-serif font-black tracking-tight block text-[#3D1A20]">
                    <InlineEdit 
                      value={content.hero.monogramText} 
                      onChange={(val) => updateField('hero.monogramText', val)} 
                    />
                  </span>
                  <span className="text-xs md:text-sm font-bold tracking-widest text-[#3D1A20]/80 uppercase mt-2 block">
                    <InlineEdit 
                      value={content.hero.monogramSub} 
                      onChange={(val) => updateField('hero.monogramSub', val)} 
                    />
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <div className="bg-[#3D1A20] text-[#E5D8CC] font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider shadow-md">
                    <InlineEdit 
                      value={content.hero.btn1Text} 
                      onChange={(val) => updateField('hero.btn1Text', val)} 
                    />
                  </div>
                  <div className="border border-[#3D1A20] text-[#3D1A20] font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider">
                    <InlineEdit 
                      value={content.hero.btn2Text} 
                      onChange={(val) => updateField('hero.btn2Text', val)} 
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#3D1A20]/60">
                  <InlineMediaUploader
                    isVideo={true}
                    currentMedia={content.hero.bgVideo}
                    onMediaChange={(val) => updateField('hero.bgVideo', val)}
                  >
                    <span className="flex items-center gap-1 bg-[#3D1A20]/10 px-3 py-1.5 rounded-full hover:bg-[#3D1A20]/20 transition-colors">
                      <FiMonitor size={12} /> {content.hero.bgVideo ? 'Video de Fondo Activo' : 'Añadir Video de Fondo'}
                    </span>
                  </InlineMediaUploader>

                  <InlineMediaUploader
                    isVideo={true}
                    currentMedia={content.hero.phoneVideo}
                    onMediaChange={(val) => updateField('hero.phoneVideo', val)}
                  >
                    <span className="flex items-center gap-1 bg-[#3D1A20]/10 px-3 py-1.5 rounded-full hover:bg-[#3D1A20]/20 transition-colors">
                      <FiSmartphone size={12} /> {content.hero.phoneVideo ? 'Video de Celular Activo' : 'Añadir Video de Celular'}
                    </span>
                  </InlineMediaUploader>
                </div>
              </section>

              {/* 2. MANICURE SECTION PREVIEW */}
              <section
                id="section-manicure"
                className="p-6 md:p-10 bg-white transition-all relative"
              >
                <div className="mb-6 border-b border-gray-100 pb-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    ⁽<InlineEdit value={content.manicureSection.badgeNumber} onChange={(val) => updateField('manicureSection.badgeNumber', val)} />⁾ 
                    <InlineEdit value={content.manicureSection.badgeTitle} onChange={(val) => updateField('manicureSection.badgeTitle', val)} />
                  </div>
                  <h3 className="text-2xl font-serif font-black text-[#3D1A20] uppercase">
                    <InlineEdit value={content.manicureSection.mainTitle} onChange={(val) => updateField('manicureSection.mainTitle', val)} />
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    <InlineEdit value={content.manicureSection.subtitle} onChange={(val) => updateField('manicureSection.subtitle', val)} multiline={true} className="block" />
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {content.manicureSection.items.map((item, i) => (
                    <div key={i} className="bg-slate-50 p-2.5 rounded-2xl border border-gray-200 text-left hover:border-[#0A58CA] transition-all">
                      <div className="h-28 bg-gray-200 rounded-xl overflow-hidden mb-2 relative group/img">
                        <InlineMediaUploader
                          currentMedia={item.image}
                          onMediaChange={(val) => {
                            const newItems = [...content.manicureSection.items];
                            newItems[i].image = val;
                            updateField('manicureSection.items', newItems);
                          }}
                          className="w-full h-full"
                        >
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </InlineMediaUploader>
                      </div>
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
                      <p className="text-[10px] text-gray-500 font-semibold truncate">
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
                  ))}
                </div>
              </section>

              {/* 3. PEDICURE SECTION PREVIEW */}
              <section
                id="section-pedicure"
                className="p-6 md:p-10 bg-[#3D1A20] text-[#E5D8CC] transition-all relative"
              >
                <div className="mb-6">
                  <div className="text-[10px] font-bold text-[#E5D8CC]/60 uppercase tracking-widest mb-1 flex items-center gap-1">
                    ⁽<InlineEdit value={content.pedicureSection.badgeNumber} onChange={(val) => updateField('pedicureSection.badgeNumber', val)} />⁾ 
                    <InlineEdit value={content.pedicureSection.badgeTitle} onChange={(val) => updateField('pedicureSection.badgeTitle', val)} />
                  </div>
                  <h3 className="text-2xl font-serif font-black uppercase text-white">
                    <InlineEdit value={content.pedicureSection.mainTitle} onChange={(val) => updateField('pedicureSection.mainTitle', val)} />
                  </h3>
                  <p className="text-xs text-[#E5D8CC]/80">
                    <InlineEdit value={content.pedicureSection.subtitle} onChange={(val) => updateField('pedicureSection.subtitle', val)} multiline={true} className="block" />
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.pedicureSection.slides.map((slide, idx) => (
                    <div key={idx} className="bg-[#2E1318] p-3 rounded-2xl border border-[#E5D8CC]/20 flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#3D1A20] shrink-0 border border-[#E5D8CC]/20 relative group/img">
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
                            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#E5D8CC]/40">
                              <FiImage size={16} />
                            </div>
                          )}
                        </InlineMediaUploader>
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="font-extrabold text-xs text-white truncate">
                          <InlineEdit 
                            value={slide.title} 
                            onChange={(val) => {
                              const newSlides = [...content.pedicureSection.slides];
                              newSlides[idx].title = val;
                              updateField('pedicureSection.slides', newSlides);
                            }} 
                          />
                        </p>
                        <p className="text-[10px] text-[#E5D8CC]/70 mt-0.5 truncate">
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
              </section>

              {/* 4. PRODUCTS PREVIEW */}
              <section
                id="section-products"
                className="p-6 md:p-10 bg-[#E5D8CC] transition-all relative"
              >
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-[#3D1A20]/60 uppercase">⁽03⁾ SECCIÓN TIENDA</span>
                  <h3 className="text-2xl font-serif font-black text-[#3D1A20] uppercase">
                    <InlineEdit value={content.productsSection.title} onChange={(val) => updateField('productsSection.title', val)} />
                  </h3>
                  <p className="text-xs text-[#3D1A20]/80 max-w-md mx-auto">
                    <InlineEdit value={content.productsSection.subtitle} onChange={(val) => updateField('productsSection.subtitle', val)} multiline={true} className="block" />
                  </p>
                  <div className="inline-block mt-3 bg-[#3D1A20] text-[#E5D8CC] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    <InlineEdit value={content.productsSection.btnText} onChange={(val) => updateField('productsSection.btnText', val)} />
                  </div>
                </div>
              </section>

              {/* 5. CURSOS PREVIEW */}
              <section
                id="section-cursos"
                className="p-6 md:p-10 bg-white transition-all relative"
              >
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">⁽04⁾ SECCIÓN CURSOS</span>
                  <h3 className="text-2xl font-serif font-black text-[#3D1A20] uppercase">
                    <InlineEdit value={content.cursosSection.title} onChange={(val) => updateField('cursosSection.title', val)} />
                  </h3>
                  <p className="text-xs text-gray-500 font-medium max-w-md mx-auto">
                    <InlineEdit value={content.cursosSection.subtitle} onChange={(val) => updateField('cursosSection.subtitle', val)} multiline={true} className="block" />
                  </p>
                  <div className="inline-block mt-3 border-2 border-[#3D1A20] text-[#3D1A20] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    <InlineEdit value={content.cursosSection.btnText} onChange={(val) => updateField('cursosSection.btnText', val)} />
                  </div>
                </div>
              </section>

              {/* 6. FOOTER BANNER PREVIEW */}
              <section
                id="section-footer"
                className="p-8 bg-[#3D1A20] text-[#E5D8CC] text-center transition-all relative"
              >
                <h3 className="text-xl font-serif font-black text-white uppercase">
                  <InlineEdit value={content.footerBanner.title} onChange={(val) => updateField('footerBanner.title', val)} multiline={true} className="block" />
                </h3>
                <p className="text-xs text-[#E5D8CC]/80 mt-2">
                  <InlineEdit value={content.footerBanner.subtitle} onChange={(val) => updateField('footerBanner.subtitle', val)} multiline={true} className="block" />
                </p>
                <div className="mt-4 inline-block bg-[#E5D8CC] text-[#3D1A20] font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider">
                  <InlineEdit value={content.footerBanner.btnText} onChange={(val) => updateField('footerBanner.btnText', val)} />
                </div>
                <div className="mt-6 flex justify-center">
                  <span className="text-[10px] text-[#E5D8CC]/50 border border-[#E5D8CC]/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <InlineEdit value={content.footerBanner.whatsappText} onChange={(val) => updateField('footerBanner.whatsappText', val)} />
                  </span>
                </div>
              </section>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
