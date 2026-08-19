import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Add } from "../../store/redux/cart/CartAction";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faShieldHalved,
  faTruckFast,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faCircleExclamation,
  faBagShopping,
  faBoxOpen,
  faTag,
  faAward
} from "@fortawesome/free-solid-svg-icons";
import { FaWhatsapp } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import PublicNavbar from "../../components/nav/PublicNavbar.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const COLOR_MAP = {
  "rojo": "#A50011",
  "blanco": "#FFFFFF",
  "negro": "#1C1C1E",
  "azul": "#273746",
  "gris": "#8E8E93",
  "oro": "#F9E5C9",
  "nude": "#E8C2A8",
  "rosa": "#F3B0C3",
  "lavanda": "#E6E6FA"
};

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/products/${id}`);
      setProduct(data);

      if (data.variantes && data.variantes.length > 0) {
        setSelectedColor(data.variantes[0].color || "Único");
        setSelectedStorage(data.variantes[0].almacenamiento || "Único");
      }
    } catch (error) {
      console.error("Error al obtener detalle del producto:", error);
    } finally {
      setLoading(false);
    }
  };

  const variants = product?.variantes || [];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];

  const availableStorages = variants
    .filter(v => v.color === selectedColor)
    .map(v => v.almacenamiento);

  const currentVariant = variants.find(
    v => v.color === selectedColor && v.almacenamiento === selectedStorage
  ) || variants[0] || null;

  useEffect(() => {
    if (variants.length > 0 && selectedColor) {
      const validStorages = variants
        .filter(v => v.color === selectedColor)
        .map(v => v.almacenamiento);

      if (validStorages.length > 0 && !validStorages.includes(selectedStorage)) {
        setSelectedStorage(validStorages[0]);
      }
    }
  }, [selectedColor, variants]);

  const images = (product?.imagenes && product.imagenes.length > 0)
    ? product.imagenes
    : (product?.imagen || product?.image ? [product.imagen || product.image] : ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop"]);

  const currentPrice = currentVariant?.precioAlPublico || product?.precioVenta || product?.precio || 0;
  const oldPrice = Math.round(Number(currentPrice) * 1.4);
  const currentStock = currentVariant?.stock !== undefined ? currentVariant.stock : 10;

  const handleAddToCart = () => {
    if (!product || currentStock < 1) return;

    const basePrice = Number(currentPrice);
    const wholePrice = Number(currentVariant?.precioMayorista) || basePrice;

    dispatch(Add({
      ProductId: product.id,
      id: `${product.id}-${selectedColor}-${selectedStorage}`,
      title: `${product.nombre}${selectedColor && selectedColor !== 'Único' ? ` (${selectedColor.toUpperCase()})` : ''}`,
      price: basePrice,
      precioAlPublico: basePrice,
      precioMayorista: wholePrice,
      image: images[0],
      quantity,
      color: selectedColor,
      storage: selectedStorage
    }));

    Swal.fire({
      title: "¡AGREGADO AL CARRITO!",
      text: `${product.nombre} ha sido añadido a tu pedido.`,
      icon: "success",
      background: "#F7F2F3",
      color: "#2C2426",
      confirmButtonColor: "#3B181E",
      timer: 1800,
      showConfirmButton: false
    });
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(`Hola Luana Studio! Me interesa obtener más información sobre el producto: "${product?.nombre}". Categoría: ${product?.categoria || 'General'}.`);
    window.open(`https://wa.me/+543425937358?text=${text}`, '_blank');
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
      .format(price)
      .replace('ARS', '$ ');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#3B181E]/20 border-t-[#3B181E] rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 animate-pulse">Cargando especificaciones...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-center items-center px-4">
        <h2 className="text-2xl font-bold text-[#3B181E] mb-4">Producto no encontrado</h2>
        <button onClick={() => navigate('/productos')} className="bg-[#3B181E] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
          Volver a la Tienda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2426] font-sans pb-24 pt-20">
      <PublicNavbar />

      <div className="container mx-auto max-w-6xl px-4 pt-6 md:pt-10">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 mb-8 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-[#3B181E] transition-colors">INICIO</Link>
          <span>/</span>
          <Link to="/productos" className="hover:text-[#3B181E] transition-colors">CURSOS</Link>
          <span>/</span>
          <span className="text-[#3B181E] truncate">{product.categoria || 'CAPACITACIÓN'}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES */}
          <div className="w-full lg:w-1/2 sticky top-24">
            <div className="relative aspect-square bg-[#F7F2F3] rounded-[28px] md:rounded-[36px] overflow-hidden border border-black/5 shadow-sm p-4 flex items-center justify-center group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={product.nombre}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover rounded-[20px] md:rounded-[28px]"
                />
              </AnimatePresence>

              {/* CONTROLES DE NAVEGACIÓN GALERÍA */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#2C2426] hover:bg-white shadow-md transition-all"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                  </button>

                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#2C2426] hover:bg-white shadow-md transition-all"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-[#F7F2F3] ${currentImageIndex === idx ? 'border-[#3B181E] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}

            {/* BENEFICIOS DESTACADOS */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-[#F7F2F3] p-3 rounded-2xl text-center border border-black/5">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[#3B181E] text-base mb-1" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Garantía Oficial</p>
              </div>
              <div className="bg-[#F7F2F3] p-3 rounded-2xl text-center border border-black/5">
                <FontAwesomeIcon icon={faTruckFast} className="text-[#3B181E] text-base mb-1" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Envío Rápido</p>
              </div>
              <div className="bg-[#F7F2F3] p-3 rounded-2xl text-center border border-black/5">
                <FontAwesomeIcon icon={faAward} className="text-[#3B181E] text-base mb-1" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Alta Calidad</p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: ESPECIFICACIONES & COMPRA */}
          <div className="w-full lg:w-1/2 flex flex-col">
            
            {/* BADGES & HEADER */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#3B181E]/10 text-[#3B181E] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {product.categoria || 'PRODUCTO EXCLUSIVO'}
                </span>
                {product.marca && (
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {product.marca}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-[#2C2426] leading-tight mb-4">
                {product.nombre}
              </h1>

              {/* PRECIO & STOCK */}
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-2xl md:text-3xl font-extrabold text-[#3B181E]">
                  {formatPrice(currentPrice)}
                </span>
                {oldPrice > currentPrice && (
                  <span className="text-sm md:text-base text-gray-400 line-through">
                    {formatPrice(oldPrice)}
                  </span>
                )}
              </div>

              <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${currentStock > 0 ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl' : 'text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl'}`}>
                <FontAwesomeIcon icon={currentStock > 0 ? faCheck : faCircleExclamation} />
                {currentStock > 0 ? `Stock Disponible (${currentStock} unidades)` : 'Agotado Temporalmente'}
              </div>
            </div>

            {/* SELECCIÓN DE VARIANTES */}
            {colors.length > 0 && colors[0] !== 'Único' && (
              <div className="mb-6">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-2">
                  Tono / Color: <span className="text-[#3B181E]">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${selectedColor === color ? 'bg-[#3B181E] text-white border-[#3B181E] shadow-sm' : 'bg-[#F7F2F3] text-gray-700 border-transparent hover:border-gray-300'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableStorages.length > 0 && availableStorages[0] !== 'Único' && (
              <div className="mb-6">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-2">
                  Presentación / Medida: <span className="text-[#3B181E]">{selectedStorage}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableStorages.map(storage => (
                    <button
                      key={storage}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${selectedStorage === storage ? 'bg-[#3B181E] text-white border-[#3B181E] shadow-sm' : 'bg-[#F7F2F3] text-gray-700 border-transparent hover:border-gray-300'}`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BOTONES DE CANTIDAD Y CARRITO */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center justify-between border border-gray-300 rounded-2xl bg-[#F7F2F3] px-4 h-13 sm:w-36">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="text-gray-500 hover:text-[#3B181E] p-2"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <span className="font-bold text-sm text-[#2C2426]">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(currentStock || 1, q + 1))}
                  className="text-gray-500 hover:text-[#3B181E] p-2"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={currentStock < 1}
                className={`flex-1 h-13 py-3.5 px-8 rounded-2xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-md ${currentStock < 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#2A2426] hover:bg-[#4A3B3E] text-white'}`}
              >
                <FontAwesomeIcon icon={faBagShopping} className="text-sm" />
                <span>AGREGAR AL CARRITO</span>
              </button>
            </div>

            {/* CONSULTA WHATSAPP */}
            <button
              onClick={handleWhatsAppInquiry}
              className="w-full py-3.5 px-6 rounded-2xl border border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-8 shadow-sm"
            >
              <FaWhatsapp className="text-base text-emerald-600" />
              <span>CONSULTAR POR WHATSAPP</span>
            </button>

            {/* ESPECIFICACIONES TÉCNICAS */}
            <div className="bg-[#F7F2F3] p-6 rounded-[24px] border border-black/5 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#3B181E] mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faBoxOpen} />
                ESPECIFICACIONES DEL CURSO
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4 pb-4 border-b border-black/10">
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">Categoría</span>
                  <span className="font-semibold text-[#2C2426]">{product.categoria || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">Marca / Proveedor</span>
                  <span className="font-semibold text-[#2C2426]">{product.marca || product.proveedor || 'Luana Studio'}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">Origen de Venta</span>
                  <span className="font-semibold text-[#2C2426]">{product.origenDeVenta || 'Ecommerce'}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">Mayorista Habilitado</span>
                  <span className="font-semibold text-[#2C2426]">{product.aplicarMayoristaPorCantidad ? 'Sí (Aplica Descuento)' : 'No'}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 uppercase text-[10px] font-bold block mb-1">Descripción del Curso</span>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                  {product.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>
            </div>

            {/* CONTENIDO DEL CURSO / CURRÍCULUM */}
            {product.esInfoproducto && (
              <div className="bg-[#F7F2F3] p-6 rounded-[24px] border border-black/5 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#3B181E] mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBoxOpen} />
                  CONTENIDO INCLUÍDO EN EL CURSO
                </h3>
                
                <div className="space-y-3">
                  {product.archivosInfoproducto && product.archivosInfoproducto.length > 0 ? (
                    product.archivosInfoproducto.map((archivo, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-black/5 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-[#3B181E]/10 flex items-center justify-center text-[#3B181E] shrink-0">
                          <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#2C2426] truncate">{archivo.name || `Material Didáctico ${idx + 1}`}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {archivo.fileType?.includes('video') ? 'Video Lección' : archivo.fileType?.includes('pdf') ? 'Documento PDF' : 'Material Complementario'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 font-medium italic">El temario no está disponible públicamente o el curso aún no tiene materiales asignados.</p>
                  )}

                  {product.speakingActivities && product.speakingActivities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-black/10">
                      <span className="text-gray-400 uppercase text-[10px] font-bold block mb-2">Módulos Prácticos / Evaluaciones</span>
                      {product.speakingActivities.map((act, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-black/5 shadow-sm mb-2">
                           <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#2C2426] truncate">{act.title || `Evaluación Práctica ${idx + 1}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;