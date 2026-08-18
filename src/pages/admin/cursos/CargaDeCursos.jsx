import React, { useState, useEffect } from 'react';
import { 
  FiBookOpen, FiPlus, FiTrash2, FiEdit2, FiCalendar, FiClock, 
  FiDollarSign, FiUsers, FiCheckCircle, FiImage, FiAward, FiTag, FiUploadCloud 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CargaDeCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [porcentajeCarga, setPorcentajeCarga] = useState(0);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'Manicuría',
    modalidad: 'Presencial',
    precio: '',
    duracion: '',
    fechaInicio: '',
    cupos: '10',
    imagen: '',
    descripcion: '',
    temario: ''
  });

  const [editId, setEditId] = useState(null);

  const handleSubirFotoImageKit = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor seleccione una imagen válida.');
      return;
    }

    setSubiendoFoto(true);
    setPorcentajeCarga(0);
    setErrorMsg('');

    try {
      const authRes = await axios.get(`${API_URL}/api/auth/imagekit`);
      const { signature, expire, token } = authRes.data;

      const bodyFormData = new FormData();
      bodyFormData.append('file', file);
      bodyFormData.append('fileName', file.name || `curso_${Date.now()}`);
      const rawPublicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_pB1a+9e/sMMMW/Gbea9jF3YYmB8=';
      const cleanPublicKey = String(rawPublicKey).replace(/^["']|["']$/g, '');
      bodyFormData.append('publicKey', cleanPublicKey);
      bodyFormData.append('signature', signature);
      bodyFormData.append('expire', expire);
      bodyFormData.append('token', token);
      bodyFormData.append('useUniqueFileName', 'true');

      const ikRes = await axios.post('https://upload.imagekit.io/api/v1/files/upload', bodyFormData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setPorcentajeCarga(percent);
          }
        }
      });

      if (ikRes.data && ikRes.data.url) {
        setFormData(prev => ({ ...prev, imagen: ikRes.data.url }));
        setMensajeExito('¡Imagen promocional subida exitosamente a ImageKit!');
        setTimeout(() => setMensajeExito(''), 3500);
      }
    } catch (err) {
      console.error('Error al subir imagen a ImageKit:', err);
      setErrorMsg(`Error ImageKit: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubiendoFoto(false);
      setPorcentajeCarga(0);
    }
  };

  // Cargar cursos al iniciar
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    setLoading(true);
    try {
      // Intentar cargar cursos desde API o LocalStorage fallback
      const savedLocal = JSON.parse(localStorage.getItem('admin_cursos_luan')) || [];
      const res = await axios.get(`${API_URL}/products?search=curso`).catch(() => null);
      if (res && res.data) {
        const fetched = Array.isArray(res.data) ? res.data : (res.data.products || []);
        setCursos(fetched.length > 0 ? fetched : savedLocal);
      } else {
        setCursos(savedLocal);
      }
    } catch (err) {
      const savedLocal = JSON.parse(localStorage.getItem('admin_cursos_luan')) || [];
      setCursos(savedLocal);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.precio) return;

    setLoading(true);

    const nuevoCurso = {
      id: editId || Date.now(),
      nombre: formData.titulo,
      title: formData.titulo,
      categoria: formData.categoria,
      modalidad: formData.modalidad,
      precio: Number(formData.precio),
      duracion: formData.duracion,
      fechaInicio: formData.fechaInicio,
      cupos: formData.cupos,
      imagen: formData.imagen || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
      descripcion: formData.descripcion,
      temario: formData.temario,
      esInfoproducto: true
    };

    try {
      // Persistir en backend
      await axios.post(`${API_URL}/products`, {
        nombre: nuevoCurso.nombre,
        categoria: `Curso - ${nuevoCurso.categoria}`,
        descripcion: `${nuevoCurso.descripcion} | Modalidad: ${nuevoCurso.modalidad} | Duración: ${nuevoCurso.duracion}`,
        imagenes: [nuevoCurso.imagen],
        esInfoproducto: true,
        variantes: [{
          color: 'Estándar',
          almacenamiento: 'Cupo',
          stock: Number(formData.cupos) || 10,
          precioAlPublico: Number(formData.precio),
          precioRevendedor: Number(formData.precio),
          precioMayorista: Number(formData.precio),
          costoDeCompra: 0
        }]
      }).catch(() => null);

      // Guardar localmente
      let listaActualizada;
      if (editId) {
        listaActualizada = cursos.map(c => (c.id === editId ? nuevoCurso : c));
        setEditId(null);
      } else {
        listaActualizada = [nuevoCurso, ...cursos];
      }

      setCursos(listaActualizada);
      localStorage.setItem('admin_cursos_luan', JSON.stringify(listaActualizada));

      setMensajeExito(editId ? '¡Curso actualizado exitosamente!' : '¡Curso registrado exitosamente!');
      setTimeout(() => setMensajeExito(''), 4000);

      // Limpiar formulario
      setFormData({
        titulo: '',
        categoria: 'Manicuría',
        modalidad: 'Presencial',
        precio: '',
        duracion: '',
        fechaInicio: '',
        cupos: '10',
        imagen: '',
        descripcion: '',
        temario: ''
      });
    } catch (error) {
      console.error("Error al guardar curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (curso) => {
    setEditId(curso.id);
    setFormData({
      titulo: curso.nombre || curso.titulo || '',
      categoria: curso.categoria?.replace('Curso - ', '') || 'Manicuría',
      modalidad: curso.modalidad || 'Presencial',
      precio: curso.precio || (curso.variantes?.[0]?.precioAlPublico) || '',
      duracion: curso.duracion || '',
      fechaInicio: curso.fechaInicio || '',
      cupos: curso.cupos || '10',
      imagen: curso.imagen || curso.imagenes?.[0] || '',
      descripcion: curso.descripcion || '',
      temario: curso.temario || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este curso?')) return;
    const filtrados = cursos.filter(c => c.id !== id);
    setCursos(filtrados);
    localStorage.setItem('admin_cursos_luan', JSON.stringify(filtrados));
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-5 font-sans p-3 md:p-5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1 block">
            MÓDULO ADMINISTRATIVO
          </span>
          <h1 className="text-xl md:text-2xl font-black text-black tracking-tight uppercase flex items-center gap-2">
            <FiBookOpen className="text-black" />
            CARGAR CURSOS Y CAPACITACIONES
          </h1>
        </div>
      </div>

      {mensajeExito && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black text-white p-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs"
        >
          <FiCheckCircle size={16} className="text-green-400" />
          {mensajeExito}
        </motion.div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 space-y-5 shadow-xs">
        <h2 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2 border-b border-gray-100 pb-3">
          <FiPlus /> {editId ? 'EDITAR CURSO' : 'INFORMACIÓN DEL CURSO'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Título del curso */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Nombre del Curso / Taller *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ej: Masterclass de Nail Art & Esculpidas Rusa"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-black focus:border-black outline-none transition-all"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Categoría
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-black focus:border-black outline-none transition-all cursor-pointer"
            >
              <option value="Manicuría">Manicuría</option>
              <option value="Pedicuría">Pedicuría</option>
              <option value="Esculpidas en Gel">Esculpidas en Gel</option>
              <option value="Técnicas Rusas">Técnicas Rusas</option>
              <option value="Spa & Nutrición">Spa & Nutrición</option>
              <option value="Estética General">Estética General</option>
            </select>
          </div>

          {/* Modalidad */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Modalidad
            </label>
            <select
              name="modalidad"
              value={formData.modalidad}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-black focus:border-black outline-none transition-all cursor-pointer"
            >
              <option value="Presencial">Presencial (En Estudio)</option>
              <option value="Online en Vivo">Online en Vivo (Zoom)</option>
              <option value="Grabado / A tu Ritmo">Grabado / A tu Ritmo</option>
              <option value="Híbrido">Híbrido (Teórico + Práctico)</option>
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Precio al Público ($ARS) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="25000"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pl-8 text-sm font-bold text-black focus:border-black outline-none transition-all"
              />
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Duración / Intensidad
            </label>
            <input
              type="text"
              name="duracion"
              value={formData.duracion}
              onChange={handleInputChange}
              placeholder="Ej: 4 Clases de 3hs"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-black focus:border-black outline-none transition-all"
            />
          </div>

          {/* Fecha de Inicio */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Fecha de Inicio
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-black focus:border-black outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Cupos */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Cupos Disponibles
            </label>
            <input
              type="number"
              name="cupos"
              value={formData.cupos}
              onChange={handleInputChange}
              placeholder="10"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-black focus:border-black outline-none transition-all"
            />
          </div>

          {/* Imagen Promocional ImageKit */}
          <div className="md:col-span-3 bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-black block">
              Imagen Promocional del Curso (ImageKit)
            </label>

            <div className="border-2 border-dashed border-gray-300 hover:border-black bg-white transition-all rounded-xl p-4 text-center cursor-pointer relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleSubirFotoImageKit}
                disabled={subiendoFoto}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center justify-center gap-3">
                {subiendoFoto ? <FiUploadCloud className="animate-bounce text-black" size={20} /> : <FiImage size={20} className="text-black" />}
                <span className="text-xs font-bold text-black uppercase tracking-wider">
                  {subiendoFoto ? `Subiendo a ImageKit (${porcentajeCarga}%)...` : 'Clic o arrastre una imagen para subir a ImageKit'}
                </span>
              </div>
            </div>

            {formData.imagen && (
              <div className="flex items-center gap-4 bg-white p-3 border border-gray-200 rounded-xl">
                <img src={formData.imagen} alt="Vista previa" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                <div className="flex-1 truncate">
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase">ImageKit CDN OK</span>
                  <p className="text-xs font-semibold text-gray-700 truncate mt-1">{formData.imagen}</p>
                </div>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, imagen: '' }))} className="text-red-500 hover:text-red-700 text-xs font-bold p-2">
                  <FiTrash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Descripción General
            </label>
            <textarea
              name="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe lo que los alumnos aprenderán, requisitos, incluye kit de materiales, certificado, etc."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium text-black focus:border-black outline-none transition-all"
            />
          </div>

          {/* Temario / Módulos */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Temario / Módulos Incluidos
            </label>
            <textarea
              name="temario"
              rows={3}
              value={formData.temario}
              onChange={handleInputChange}
              placeholder="Módulo 1: Anatomía de la uña&#10;Módulo 2: Esmaltado perfecto&#10;Módulo 3: Diseños tendencia"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium text-black focus:border-black outline-none transition-all"
            />
          </div>

        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setFormData({
                  titulo: '', categoria: 'Manicuría', modalidad: 'Presencial',
                  precio: '', duracion: '', fechaInicio: '', cupos: '10', imagen: '', descripcion: '', temario: ''
                });
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all shadow-md flex items-center gap-2"
          >
            <FiCheckCircle size={16} />
            {editId ? 'GUARDAR CAMBIOS' : 'PUBLICAR CURSO'}
          </button>
        </div>
      </form>

      {/* List of Registered Courses */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
          <FiBookOpen /> CURSOS REGISTRADOS ({cursos.length})
        </h2>

        {cursos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <FiBookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-xs uppercase text-gray-500 tracking-wider">
              No hay cursos o capacitaciones cargadas todavía
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map(curso => (
              <motion.div 
                key={curso.id}
                whileHover={{ y: -4 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={curso.imagen || curso.imagenes?.[0] || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop"} 
                      alt={curso.nombre || curso.titulo} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {curso.modalidad || 'Presencial'}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      {curso.categoria || 'Manicuría'}
                    </span>
                    <h3 className="font-black text-base uppercase text-black line-clamp-2">
                      {curso.nombre || curso.titulo}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 font-medium">
                      {curso.descripcion || "Sin descripción adicional."}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs font-bold">
                      <span className="text-black text-base font-black">
                        ${(curso.precio || curso.variantes?.[0]?.precioAlPublico || 0).toLocaleString('es-AR')}
                      </span>
                      <span className="text-gray-500 text-[11px]">
                        Cupos: {curso.cupos || 10}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleEdit(curso)}
                    className="p-2 text-gray-600 hover:text-black hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-xs font-bold flex items-center gap-1"
                  >
                    <FiEdit2 size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(curso.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-white rounded-lg border border-transparent hover:border-red-200 transition-all text-xs font-bold flex items-center gap-1"
                  >
                    <FiTrash2 size={14} /> Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CargaDeCursos;
