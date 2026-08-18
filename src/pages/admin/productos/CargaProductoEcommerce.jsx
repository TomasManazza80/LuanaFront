import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiCamera, FiImage, FiInfo, FiBox, FiDollarSign,
  FiCheckCircle, FiTrash2, FiTag, FiLayers, FiTruck, FiUploadCloud
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultCategorias = [
  'Manicuría & Uñas',
  'Pedicuría & Spa',
  'Insumos Profesionales',
  'Equipamiento',
  'Kits & Regalos'
];

const defaultSubcategorias = [
  'Esmaltes Semipermanentes',
  'Geles & Acrílicos',
  'Torneado & Limas',
  'Cuidado Cutículas'
];

const defaultProveedores = [
  'Distribuidora Luan Studio',
  'Importaciones Nails AR'
];

const CargaProductoEcommerce = () => {
  // --- LISTAS DINÁMICAS PERSISTENTES DE CATEGORÍAS ---
  const [categorias, setCategorias] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('admin_custom_categorias_luan'));
    return saved && Array.isArray(saved) && saved.length > 0 ? saved : defaultCategorias;
  });

  const [subcategorias, setSubcategorias] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('admin_custom_subcategorias_luan'));
    return saved && Array.isArray(saved) && saved.length > 0 ? saved : defaultSubcategorias;
  });

  const [proveedores, setProveedores] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('admin_custom_proveedores_luan'));
    return saved && Array.isArray(saved) && saved.length > 0 ? saved : defaultProveedores;
  });

  // --- ESTADOS DE FORMULARIO ---
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    codigoBarras: '',
    categoria: 'Manicuría & Uñas',
    nuevaCategoria: '',
    subcategoria: '',
    nuevaSubcategoria: '',
    proveedor: '',
    nuevoProveedor: '',
    descripcion: '',
    costo: '',
    publico: '',
    mayorista: '',
    revendedor: '',
    imagenUrl: ''
  });

  const [variantes, setVariantes] = useState([]);
  const [nuevaVariante, setNuevaVariante] = useState({
    color: '',
    talle: '',
    capacidad: '',
    stock: ''
  });

  const [loading, setLoading] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [porcentajeCarga, setPorcentajeCarga] = useState(0);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleVarianteChange = (e) => {
    const { name, value } = e.target;
    setNuevaVariante(prev => ({ ...prev, [name]: value }));
  };

  // MANEJADOR DE CARGA A IMAGEKIT
  const handleSubirFotoImageKit = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor seleccione un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    setSubiendoFoto(true);
    setPorcentajeCarga(0);
    setErrorMsg('');

    try {
      // 1. Obtener firma de autenticación del servidor backend
      const authRes = await axios.get(`${API_URL}/api/auth/imagekit`);
      const { signature, expire, token } = authRes.data;

      // 2. Preparar FormData para ImageKit API
      const bodyFormData = new FormData();
      bodyFormData.append('file', file);
      bodyFormData.append('fileName', file.name || `producto_${Date.now()}`);
      const rawPublicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_pB1a+9e/sMMMW/Gbea9jF3YYmB8=';
      const cleanPublicKey = String(rawPublicKey).replace(/^["']|["']$/g, '');

      bodyFormData.append('publicKey', cleanPublicKey);
      bodyFormData.append('signature', signature);
      bodyFormData.append('expire', expire);
      bodyFormData.append('token', token);
      bodyFormData.append('useUniqueFileName', 'true');

      // 3. Subir a ImageKit
      const ikRes = await axios.post('https://upload.imagekit.io/api/v1/files/upload', bodyFormData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setPorcentajeCarga(percent);
          }
        }
      });

      if (ikRes.data && ikRes.data.url) {
        setFormData(prev => ({ ...prev, imagenUrl: ikRes.data.url }));
        setMensajeExito('¡Fotografía cargada y optimizada en ImageKit!');
        setTimeout(() => setMensajeExito(''), 3500);
      } else {
        throw new Error('ImageKit no devolvió una URL válida');
      }
    } catch (err) {
      console.error('Error al subir imagen a ImageKit:', err);
      const detail = err.response?.data?.message || err.response?.data?.error || err.message;
      setErrorMsg(`Error al subir la imagen a ImageKit: ${detail}`);
    } finally {
      setSubiendoFoto(false);
      setPorcentajeCarga(0);
    }
  };

  // AGREGAR Y GUARDAR NUEVA CATEGORÍA PERSISTENTE
  const handleAgregarNuevaCategoria = (e) => {
    if (e) e.preventDefault();
    const val = formData.nuevaCategoria.trim();
    if (!val) return;

    if (!categorias.some(c => c.toLowerCase() === val.toLowerCase())) {
      const updated = [...categorias, val];
      setCategorias(updated);
      localStorage.setItem('admin_custom_categorias_luan', JSON.stringify(updated));
    }

    setFormData(prev => ({
      ...prev,
      categoria: val,
      nuevaCategoria: ''
    }));
    setMensajeExito(`¡Nueva categoría "${val}" guardada!`);
    setTimeout(() => setMensajeExito(''), 3500);
  };

  // AGREGAR Y GUARDAR NUEVA SUBCATEGORÍA PERSISTENTE
  const handleAgregarNuevaSubcategoria = (e) => {
    if (e) e.preventDefault();
    const val = formData.nuevaSubcategoria.trim();
    if (!val) return;

    if (!subcategorias.some(s => s.toLowerCase() === val.toLowerCase())) {
      const updated = [...subcategorias, val];
      setSubcategorias(updated);
      localStorage.setItem('admin_custom_subcategorias_luan', JSON.stringify(updated));
    }

    setFormData(prev => ({
      ...prev,
      subcategoria: val,
      nuevaSubcategoria: ''
    }));
    setMensajeExito(`¡Nueva subcategoría "${val}" guardada!`);
    setTimeout(() => setMensajeExito(''), 3500);
  };

  // AGREGAR Y GUARDAR NUEVO PROVEEDOR PERSISTENTE
  const handleAgregarNuevoProveedor = (e) => {
    if (e) e.preventDefault();
    const val = formData.nuevoProveedor.trim();
    if (!val) return;

    if (!proveedores.some(p => p.toLowerCase() === val.toLowerCase())) {
      const updated = [...proveedores, val];
      setProveedores(updated);
      localStorage.setItem('admin_custom_proveedores_luan', JSON.stringify(updated));
    }

    setFormData(prev => ({
      ...prev,
      proveedor: val,
      nuevoProveedor: ''
    }));
    setMensajeExito(`¡Nuevo proveedor "${val}" guardado!`);
    setTimeout(() => setMensajeExito(''), 3500);
  };

  const addVariante = (e) => {
    e.preventDefault();
    if (!nuevaVariante.stock) {
      setErrorMsg('Especifique el stock de la variante.');
      return;
    }
    setVariantes(prev => [...prev, { ...nuevaVariante, id: Date.now() }]);
    setNuevaVariante({ color: '', talle: '', capacidad: '', stock: '' });
    setErrorMsg('');
  };

  const removeVariante = (id) => {
    setVariantes(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.publico) {
      setErrorMsg('Por favor complete el nombre del producto y el precio al público.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Asegurar guardado automático de nuevas categorías al enviar
    let catDefinitiva = formData.categoria;
    if (formData.nuevaCategoria.trim()) {
      catDefinitiva = formData.nuevaCategoria.trim();
      if (!categorias.includes(catDefinitiva)) {
        const updatedCats = [...categorias, catDefinitiva];
        setCategorias(updatedCats);
        localStorage.setItem('admin_custom_categorias_luan', JSON.stringify(updatedCats));
      }
    }

    let subcatDefinitiva = formData.subcategoria;
    if (formData.nuevaSubcategoria.trim()) {
      subcatDefinitiva = formData.nuevaSubcategoria.trim();
      if (!subcategorias.includes(subcatDefinitiva)) {
        const updatedSubs = [...subcategorias, subcatDefinitiva];
        setSubcategorias(updatedSubs);
        localStorage.setItem('admin_custom_subcategorias_luan', JSON.stringify(updatedSubs));
      }
    }

    let provDefinitivo = formData.proveedor;
    if (formData.nuevoProveedor.trim()) {
      provDefinitivo = formData.nuevoProveedor.trim();
      if (!proveedores.includes(provDefinitivo)) {
        const updatedProvs = [...proveedores, provDefinitivo];
        setProveedores(updatedProvs);
        localStorage.setItem('admin_custom_proveedores_luan', JSON.stringify(updatedProvs));
      }
    }

    // Estructurar variantes respetando las propiedades obligatorias que exige el modelo backend (validarEstructura)
    const variantesFormateadas = (variantes.length > 0 ? variantes : [{ stock: 10 }]).map(v => ({
      color: v.color || 'Único',
      almacenamiento: v.almacenamiento || v.talle || v.capacidad || 'Único',
      stock: Number(v.stock !== undefined ? v.stock : 10),
      precioAlPublico: Number(formData.publico),
      precioRevendedor: Number(formData.revendedor || formData.publico),
      precioMayorista: Number(formData.mayorista || formData.publico),
      costoDeCompra: Number(formData.costo || 0)
    }));

    const productoPayload = {
      nombre: formData.nombre,
      marca: formData.marca,
      codigoBarras: formData.codigoBarras,
      categoria: catDefinitiva,
      subcategoria: subcatDefinitiva,
      proveedor: provDefinitivo,
      descripcion: formData.descripcion,
      precio: Number(formData.publico),
      imagen: formData.imagenUrl || "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop",
      imagenes: [formData.imagenUrl || "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop"],
      variantes: variantesFormateadas
    };

    try {
      // Guardar en backend API
      const res = await axios.post(`${API_URL}/products`, productoPayload);
      const productoGuardado = res.data || productoPayload;

      // Guardar en localStorage fallback
      const savedLocal = JSON.parse(localStorage.getItem('admin_productos_luan')) || [];
      localStorage.setItem('admin_productos_luan', JSON.stringify([productoGuardado, ...savedLocal]));

      setMensajeExito('¡Producto registrado e ingresado al catálogo con éxito!');

      // Reset Form
      setFormData(prev => ({
        ...prev,
        nombre: '', marca: '', codigoBarras: '',
        nuevaCategoria: '', nuevaSubcategoria: '', nuevoProveedor: '',
        descripcion: '', costo: '', publico: '', mayorista: '', revendedor: '', imagenUrl: ''
      }));
      setVariantes([]);

      setTimeout(() => setMensajeExito(''), 4000);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      const errorDetalle = err.response?.data?.error || err.response?.data?.message || err.message;
      setErrorMsg(`No se pudo registrar el producto: ${errorDetalle}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 sm:px-6 md:px-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ENCABEZADO */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            CATÁLOGO & E-COMMERCE · LUAN STUDIO
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            NUEVO PRODUCTO PASO A PASO
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
            Las categorías que cree se guardarán automáticamente en la lista para futuros productos.
          </p>
        </div>

        {/* ALERTAS Y MENSAJES */}
        <AnimatePresence>
          {mensajeExito && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider shadow-sm">
              <FiCheckCircle size={18} className="text-emerald-600 shrink-0" />
              <span>{mensajeExito}</span>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm">
              ⚠️ {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* PASO 01: INFORMACIÓN PRINCIPAL */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                01
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  INFORMACIÓN GENERAL DEL PRODUCTO
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Nombre, marca y código de identificación</span>
              </div>
            </div>

            <div className="space-y-5">
              {/* NOMBRE */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  NOMBRE DEL PRODUCTO <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="EJ: ESMALTE SEMIPERMANENTE GEL SHINE 15ML"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              {/* MARCA Y CODIGO BARRAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    MARCA / FABRICANTE
                  </label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    placeholder="EJ: LUAN NAILS / CHERIMOYA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    CÓDIGO DE BARRAS (OPCIONAL)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="codigoBarras"
                      value={formData.codigoBarras}
                      onChange={handleInputChange}
                      placeholder="ESCANEE O INGRESE CÓDIGO..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                    <div className="absolute right-3 top-3.5 bg-slate-900 text-white p-2 rounded-xl">
                      <FiCamera size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PASO 02: CATEGORÍAS Y CLASIFICACIÓN (DINÁMICA PERSISTENTE) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  CATEGORIZACIÓN Y CLASIFICACIÓN
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Cree categorías personalizadas y quedarán guardadas permanentemente</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* CATEGORÍA PRINCIPAL */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    CATEGORÍA PRINCIPAL <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {categorias.length} Categorías Guardadas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 uppercase"
                  >
                    {categorias.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="nuevaCategoria"
                      value={formData.nuevaCategoria}
                      onChange={handleInputChange}
                      placeholder="ESCRIBA NUEVA CATEGORÍA..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAgregarNuevaCategoria}
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors shrink-0 flex items-center gap-1"
                      title="Guardar nueva categoría permanentemente"
                    >
                      <FiPlus size={16} /> CREAR
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBCATEGORÍA */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    SUBCATEGORÍA
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {subcategorias.length} Subcategorías
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 uppercase"
                  >
                    <option value="">SELECCIONAR SUBCATEGORÍA...</option>
                    {subcategorias.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="nuevaSubcategoria"
                      value={formData.nuevaSubcategoria}
                      onChange={handleInputChange}
                      placeholder="ESCRIBA NUEVA SUBCAT..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAgregarNuevaSubcategoria}
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors shrink-0 flex items-center gap-1"
                    >
                      <FiPlus size={16} /> CREAR
                    </button>
                  </div>
                </div>
              </div>

              {/* PROVEEDOR */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    PROVEEDOR / DISTRIBUIDOR ORIGEN
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {proveedores.length} Proveedores
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    name="proveedor"
                    value={formData.proveedor}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 uppercase"
                  >
                    <option value="">SELECCIONAR PROVEEDOR...</option>
                    {proveedores.map((prov, idx) => (
                      <option key={idx} value={prov}>{prov}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="nuevoProveedor"
                      value={formData.nuevoProveedor}
                      onChange={handleInputChange}
                      placeholder="ESCRIBA NUEVO PROVEEDOR..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAgregarNuevoProveedor}
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors shrink-0 flex items-center gap-1"
                    >
                      <FiPlus size={16} /> CREAR
                    </button>
                  </div>
                </div>
              </div>

              {/* DESCRIPCION COMPLETA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  DESCRIPCIÓN Y ESPECIFICACIONES TÉCNICAS
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Escriba los detalles, volumen, ingredientes o instrucciones de uso del producto..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 outline-none min-h-[110px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* PASO 03: INVENTARIO Y VARIANTES */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                03
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  INVENTARIO Y VARIANTES DE STOCK
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Colores, talles, capacidad y cantidad disponible</span>
              </div>
            </div>

            {/* FORMULARIO DE NUEVA VARIANTE CON CAMPOS ESPACIOSOS */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-2">
                AÑADIR VARIANTE DE PRODUCTO
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    COLOR / TONO
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      onChange={(e) => setNuevaVariante(prev => ({ ...prev, color: e.target.value }))}
                      value={/^#[0-9A-F]{6}$/i.test(nuevaVariante.color) ? nuevaVariante.color : '#000000'}
                      className="w-12 h-11 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition-colors"
                      title="Elegir color de la paleta"
                    />
                    <input
                      type="text"
                      name="color"
                      value={nuevaVariante.color}
                      onChange={handleVarianteChange}
                      placeholder="EJ: ROJO PASIÓN #04 o seleccionar 🎨"
                      className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    TALLE / TAMAÑO
                  </label>
                  <input
                    type="text"
                    name="talle"
                    value={nuevaVariante.talle}
                    onChange={handleVarianteChange}
                    placeholder="EJ: 15ML / MEDIANO"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    CAPACIDAD / PRESENTACIÓN
                  </label>
                  <input
                    type="text"
                    name="capacidad"
                    value={nuevaVariante.capacidad}
                    onChange={handleVarianteChange}
                    placeholder="EJ: FRASCO DE VIDRIO 15 ML"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    STOCK DISPONIBLE <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={nuevaVariante.stock}
                    onChange={handleVarianteChange}
                    placeholder="CANTIDAD DE UNIDADES (EJ: 25)"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addVariante}
                className="w-full py-3.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <FiPlus size={16} /> + AGREGAR ESTA VARIANTE
              </button>
            </div>

            {/* LISTADO DE VARIANTES CREADAS */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                VARIANTES INGRESADAS ({variantes.length})
              </span>

              {variantes.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Si no agrega variantes específicas, el sistema creará una variante estándar con el stock ingresado.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {variantes.map((varItem) => (
                    <div key={varItem.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-800">
                        {varItem.color && <span className="bg-slate-100 px-3 py-1 rounded-full">🎨 Color: {varItem.color}</span>}
                        {varItem.talle && <span className="bg-slate-100 px-3 py-1 rounded-full">📏 Talle: {varItem.talle}</span>}
                        {varItem.capacidad && <span className="bg-slate-100 px-3 py-1 rounded-full">📦 Capacidad: {varItem.capacidad}</span>}
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                          Stock: {varItem.stock} u.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariante(varItem.id)}
                        className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar variante"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PASO 04: PRECIOS Y RENTABILIDAD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                04
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  PRECIOS Y ESTRUCTURA DE VALORES ($ARS)
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Valores de costo, público, mayorista y revendedor</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  PRECIO AL PÚBLICO ($ARS) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="publico"
                  value={formData.publico}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  COSTO DE COMPRA ($ARS)
                </label>
                <input
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  PRECIO MAYORISTA ($ARS)
                </label>
                <input
                  type="number"
                  name="mayorista"
                  value={formData.mayorista}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  PRECIO REVENDEDOR ($ARS)
                </label>
                <input
                  type="number"
                  name="revendedor"
                  value={formData.revendedor}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* PASO 05: FOTO PROMOCIONAL (IMAGEKIT) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                05
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  FOTOGRAFÍA DEL PRODUCTO (IMAGEKIT)
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  Suba la imagen oficial del producto cargándolo directamente en la nube de ImageKit
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* AREA DE DROP/SUBIDA IMAGEKIT */}
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-slate-100 transition-all rounded-3xl p-6 text-center cursor-pointer relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubirFotoImageKit}
                  disabled={subiendoFoto}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    {subiendoFoto ? <FiUploadCloud className="animate-bounce" size={26} /> : <FiImage size={26} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      {subiendoFoto ? `SUBIENDO A IMAGEKIT (${porcentajeCarga}%)...` : 'CLIC O ARRASTRE UNA FOTO AQUÍ PARA SUBIR A IMAGEKIT'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      Formatos soportados: JPG, PNG, WEBP. Optimización automática ImageKit CDN.
                    </p>
                  </div>
                </div>

                {subiendoFoto && (
                  <div className="mt-4 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-900 h-full transition-all duration-300"
                      style={{ width: `${porcentajeCarga}%` }}
                    />
                  </div>
                )}
              </div>

              {/* VISTA PREVIA CON BADGE DE IMAGEKIT */}
              {formData.imagenUrl && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-emerald-300 bg-white shrink-0 shadow-xs">
                      <img src={formData.imagenUrl} alt="Vista Previa" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 uppercase tracking-wider">
                        <FiCheckCircle size={12} /> Foto lista en ImageKit CDN
                      </span>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-xs mt-1">
                        {formData.imagenUrl}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imagenUrl: '' }))}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 p-2 rounded-xl hover:bg-rose-100 transition-colors uppercase tracking-wider flex items-center gap-1"
                  >
                    <FiTrash2 size={16} /> Eliminar Foto
                  </button>
                </div>
              )}

              {/* OPCIONAL: URL MANUAL */}
              <div className="pt-2">
                <details className="text-xs text-slate-500">
                  <summary className="cursor-pointer font-bold uppercase tracking-wider text-[10px] text-slate-600 hover:text-slate-900">
                    Opcional: Pegar URL de imagen manualmente
                  </summary>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="imagenUrl"
                      value={formData.imagenUrl}
                      onChange={handleInputChange}
                      placeholder="HTTPS://IK.IMAGEKIT.IO/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                    />
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* ACCIONES FINAL DE GUARDADO */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nombre: '', marca: '', codigoBarras: '', categoria: 'Manicuría & Uñas',
                  nuevaCategoria: '', nuevaSubcategoria: '', nuevoProveedor: '',
                  descripcion: '', costo: '', publico: '', mayorista: '', revendedor: '', imagenUrl: ''
                });
                setVariantes([]);
              }}
              className="w-full sm:w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs rounded-2xl transition-colors text-center"
            >
              LIMPIAR CAMPOS
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-2/3 py-4 bg-slate-900 hover:bg-black text-white font-bold uppercase text-xs rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? 'PUBLICANDO PRODUCTO...' : 'GUARDAR Y PUBLICAR PRODUCTO ✨'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CargaProductoEcommerce;
