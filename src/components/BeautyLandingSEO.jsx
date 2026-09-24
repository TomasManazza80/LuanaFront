import React from 'react';

export const BeautyLandingSEO = () => {
  return (
    <>
      {/* 
        NOTA SEO: En Vite/React SPA, los metadatos globales (como <title> y JSON-LD) 
        ya fueron optimizados directamente en el archivo /index.html.
        Aquí nos enfocamos en la Estructura Semántica HTML5 (Core Web Vitals y Local SEO).
      */}
      
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo con atributo alt descriptivo y carga eager porque está above the fold */}
          <img 
            src="/images/logoLuan.jpeg" 
            alt="Logo Luan Studio - Salón de belleza en Santa Fe" 
            className="h-12 w-auto" 
            loading="eager" 
          />
          <nav aria-label="Navegación principal">
            <ul className="flex gap-6 font-medium text-gray-700">
              <li><a href="#servicios" className="hover:text-black">Servicios</a></li>
              <li><a href="#ubicacion" className="hover:text-black">Ubicación</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION: Único H1 de la página con la keyword principal y ciudad */}
        <section className="relative w-full min-h-[80vh] flex items-center justify-center bg-pink-50">
          <div className="absolute inset-0 z-0">
            {/* LCP Optimization: fetchPriority high en la imagen de hero */}
            <img 
              src="/image_dd5182.jpg" 
              alt="Mujer recibiendo un perfilado de cejas profesional en Luan Studio Santa Fe" 
              className="w-full h-full object-cover opacity-50" 
              loading="eager" 
              fetchPriority="high"
            />
          </div>
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 drop-shadow-sm text-balance">
              Salón de Belleza y Perfilado de Cejas en Santa Fe
            </h1>
            <p className="text-lg md:text-xl text-gray-900 mb-8 font-medium max-w-2xl mx-auto text-balance">
              Especialistas en cejas, uñas esculpidas y lifting de pestañas. ¡Realzá tu belleza natural en pleno centro de Santa Fe Capital!
            </p>
            <a 
              href="https://wa.me/5493424417939" 
              className="inline-block bg-black text-white font-semibold py-4 px-8 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
              aria-label="Reservar turno por WhatsApp"
            >
              Reservar Turno
            </a>
          </div>
        </section>

        {/* SERVICIOS SECTION: Estructura lógica con H2 y H3 */}
        <section id="servicios" className="py-20 bg-white container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios de Estética</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Ofrecemos tratamientos de alta calidad para destacar tu mirada y el cuidado de tus manos.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="bg-gray-50 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Perfilado de Cejas</h3>
              <p className="text-gray-600">Diseñamos tus cejas según la estructura de tu rostro. Incluye visagismo y depilación precisa.</p>
            </article>

            <article className="bg-gray-50 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Uñas Esculpidas y Semipermanente</h3>
              <p className="text-gray-600">Manicura rusa, kapping, esculpidas en gel/acrílico y esmaltado semipermanente de larga duración.</p>
            </article>

            <article className="bg-gray-50 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lifting de Pestañas</h3>
              <p className="text-gray-600">Curvatura natural para tus pestañas, logrando una mirada más abierta y expresiva sin extensiones.</p>
            </article>
          </div>
        </section>

        {/* ABOUT / UBICACIÓN: Refuerza el Local SEO */}
        <section id="ubicacion" className="py-20 bg-pink-50">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ubicados en Santa Fe Capital</h2>
            <p className="text-gray-700 text-lg mb-8">
              En Luan Studio te brindamos un espacio relajante y profesional. 
              Utilizamos productos de primera línea para garantizar resultados excepcionales en cada servicio de estética.
            </p>
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
              {/* Aquí iría el iframe de Google Maps. Uso lazy loading vital para Core Web Vitals */}
              <p className="text-gray-500 font-medium">Reemplazar por iframe de Google Maps (loading="lazy")</p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER: Datos de contacto NAP (Name, Address, Phone) cruciales para Local SEO */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Luan Studio</h2>
            <p className="text-gray-400 text-balance">Tu salón de belleza y estética de confianza en Santa Fe Capital. Realzamos tu belleza natural.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Ubicación y Contacto</h3>
            <address className="not-italic text-gray-400 flex flex-col gap-3">
              <p>📍 Santa Fe Capital, Santa Fe, Argentina (CP 3000)</p>
              <p>📱 WhatsApp: <a href="https://wa.me/5493424417939" className="hover:text-white transition-colors underline underline-offset-4">+54 9 342 441-7939</a></p>
              <p>🕒 Lunes a Sábados (Con cita previa)</p>
            </address>
          </div>
        </div>
      </footer>
    </>
  );
};
