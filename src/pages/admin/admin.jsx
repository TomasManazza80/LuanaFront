import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiDollarSign,
  FiPackage, FiShoppingCart, FiCalendar, FiClock, FiBarChart2, FiHome,
  FiTag, FiLayers, FiAlertTriangle, FiSearch, FiTrendingUp, FiArrowLeft, FiArrowRight, FiUploadCloud,
  FiMinusCircle, FiCornerDownRight, FiMenu, FiCreditCard, FiMessageSquare, FiUser, FiTruck, FiActivity, FiHeart,
  FiBookOpen, FiPlusCircle
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Componentes internos (Submódulos)
import HistorialDeVentas from '../admin/historialVentas';
import ModuloCaja from '../admin/caja.jsx';
import ConfiguracionCostos from './configuracionCostos.jsx';
import Encargos from './encargos.jsx';
import HistorialDeVentasLocal from '../admin/ventasLocalFisico.jsx';
import HistorialRecaudacionFinal from '../admin/cierresDeCaja/historialRecaudacionFinal.jsx';
import CierreCajaDiario from '../admin/cierresDeCaja/cierreCajaDiario.jsx';
import BalanceModule from './balance/balance.jsx';
import PersonalBalance from './balance/personalBalance.jsx';
import CargaDeProductos from './productos/CargaProductoEcommerce.jsx';
import CargaDeCursos from './cursos/CargaDeCursos.jsx';
import Facturacion from './facturacion/facturacion.jsx';
import InventarioProductos from './productos/inventarioProductos.jsx';
import LikesControl from './productos/LikesControl.jsx';
import ModuloClientes from './clientes/clientes.jsx';
import ModuloRevendedores from './revendedores/revendedoresAdmin.jsx';
import VentasEcommerceOnline from './ventas/ventasEcommerceOnline.jsx';
import CargaContenidoWeb from './cargaDeContenido/cargaDeContenido.jsx';
import Gastos from './gastos.jsx';
import WhatsappQrSection from './whatsapp/whatsappQrSection.jsx';
import ReporteGanancias from './reporteGanancias.jsx';
import ConfiguracionMayorista from './configuracionMayorista.jsx';
import ModuloEmpleados from './empleados/moduloEmpleados.jsx';
import AdminPronunciation from '../AdminPronunciation.jsx';
import GestorHomeLive from './gestorHome/GestorHomeLive.jsx';

const API_URL = import.meta.env.VITE_API_URL;

// --- CONFIGURACIÓN DE ANIMACIÓN ---
const springTransition = { type: "spring", stiffness: 300, damping: 30 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: springTransition }
};

const sectionVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
};

const sidebarGroupVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.05, ...springTransition }
  }
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0 }
};

// =================================================================
// ESTILOS MIGRADOS A TAILWIND UTILS
// =================================================================

const EditarProducto = ({ producto, onGuardarCambios, onCancelar }) => {
  const [formData, setFormData] = useState({ ...producto });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white border border-gray-200 shadow-sm p-6 md:p-8 w-full max-w-xl rounded-2xl"
      >
        <h3 className="text-xl font-black tracking-tighter uppercase text-black mb-6 flex items-center gap-2 border-b border-gray-200 pb-4">
          <div className="w-10 h-10 bg-gray-50 border border-gray-200 text-black flex items-center justify-center mr-2 rounded-xl">
            <FiEdit2 size={18} />
          </div>
          EDIT SCENARIO
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onGuardarCambios(formData); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase text-gray-500 block mb-2 font-bold">Scenario Name</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-black focus:border-black focus:ring-1 focus:ring-black outline-none text-sm font-medium transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 block mb-2 font-bold">Price</label>
              <input type="number" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-black focus:border-black focus:ring-1 focus:ring-black outline-none text-sm font-medium transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 block mb-2 font-bold">Stock / Seats</label>
              <input type="number" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-black focus:border-black focus:ring-1 focus:ring-black outline-none text-sm font-medium transition-all" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-8">
            <button type="button" onClick={onCancelar} className="py-3 px-6 bg-white border border-gray-300 text-gray-500 hover:text-black hover:border-black font-bold uppercase text-[10px] rounded-lg transition-all">Cancel</button>
            <button type="submit" className="py-3 px-6 bg-black text-white font-bold uppercase text-xs rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">Save Changes</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Admin = () => {
  const [recaudaciones, setRecaudaciones] = useState([]);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState(() => {
    const saved = localStorage.getItem('adminSeccionActiva');
    return (saved && saved !== 'dashboard') ? saved : 'control';
  });
  const [loading, setLoading] = useState(false);
  const [ventasPendientesDeCierre, setVentasPendientesDeCierre] = useState([]);
  const [pagosCajaPendientes, setPagosCajaPendientes] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const dateInicioRef = useRef(null);
  const dateFinRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarVisible(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setSeccionActiva(tabParam);
    } else if (location.pathname === '/dashboard' && !location.search) {
      setSeccionActiva(prev => prev === 'dashboard' ? 'control' : prev);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    localStorage.setItem('adminSeccionActiva', seccionActiva);
  }, [seccionActiva]);

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const [vent, rec, caja] = await Promise.all([
        axios.get(`${API_URL}/boughtProduct/AllboughtProducts`),
        axios.get(`${API_URL}/recaudacionFinal`),
        axios.get(`${API_URL}/pagoCaja/pagos`)
      ]);
      setVentasPendientesDeCierre(vent.data);
      setPagosCajaPendientes(caja.data || []);
      setRecaudaciones(rec.data.map(r => {
        let fechaExplicita = (r.op2 || '').replace('Fecha: ', '');
        if (!fechaExplicita && r.createdAt) {
          fechaExplicita = new Date(r.createdAt).toLocaleDateString('es-AR');
        }
        return {
          id: r.id,
          mes: fechaExplicita || r.mes || 'S/D',
          montoRecaudado: parseFloat(r.totalFinal) || 0,
          productosVendidos: [...(r.pagosEcommerce || []), ...(r.pagosLocal || [])],
          createdAt: r.createdAt
        };
      }));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { obtenerDatos(); }, []);

  const dataGrafico = useMemo(() => {
    let filtered = [...recaudaciones].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (fechaInicio || fechaFin) {
      if (fechaInicio) filtered = filtered.filter(r => new Date(r.createdAt) >= new Date(fechaInicio + 'T00:00:00'));
      if (fechaFin) filtered = filtered.filter(r => new Date(r.createdAt) <= new Date(fechaFin + 'T23:59:59'));
      return filtered.map(r => ({ mes: r.mes, recaudado: r.montoRecaudado }));
    }
    return filtered.map(r => ({ mes: r.mes, recaudado: r.montoRecaudado })).slice(-10);
  }, [recaudaciones, fechaInicio, fechaFin]);

  const recaudacionPendienteTotal = useMemo(() => {
    const ecom = ventasPendientesDeCierre.reduce((acc, s) => acc + (parseFloat(s.precio) * parseInt(s.cantidad) * (1 - parseFloat(s.descuentoGlobalAplicado || 0) / 100)), 0);
    const local = pagosCajaPendientes.reduce((acc, p) => acc + parseFloat(p.montoTotal || 0), 0);
    return ecom + local;
  }, [ventasPendientesDeCierre, pagosCajaPendientes]);

  const desgloseCajaAbierta = useMemo(() => {
    let ecomRev = 0, ecomCost = 0, localRev = 0, localCost = 0;
    ventasPendientesDeCierre.forEach(s => {
      const precioVenta = (parseFloat(s.precio) || 0) * (parseInt(s.cantidad) || 1) * (1 - parseFloat(s.descuentoGlobalAplicado || 0) / 100);
      const costo = (parseFloat(s.precioCompra) || 0) * (parseInt(s.cantidad) || 1);
      ecomRev += precioVenta; ecomCost += costo;
    });
    pagosCajaPendientes.forEach(p => {
      localRev += parseFloat(p.montoTotal) || 0;
      (p.productos || []).forEach(prod => {
        localCost += (parseFloat(prod.precioCompra) || 0) * (parseInt(prod.cantidad) || 1);
      });
    });
    const gananciaTotal = (ecomRev + localRev) - (ecomCost + localCost);
    return {
      ecommerce: { rev: ecomRev, cost: ecomCost, profit: ecomRev - ecomCost },
      local: { rev: localRev, cost: localCost, profit: localRev - localCost },
      total: { rev: ecomRev + localRev, cost: ecomCost + localCost, profit: gananciaTotal }
    };
  }, [ventasPendientesDeCierre, pagosCajaPendientes]);

  const gananciaPendienteTotal = desgloseCajaAbierta.total.profit;

  return (
    <div className="text-black bg-white min-h-screen overflow-x-hidden" style={{ fontFamily: '"Inter", sans-serif' }}>

      <AnimatePresence>
        {isMobile && sidebarVisible && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarVisible(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR BRUTALIST */}
      <motion.div
        initial={false}
        animate={{ x: sidebarVisible ? 0 : (isMobile ? '-100%' : -260) }}
        transition={springTransition}
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-[55] overflow-y-auto pb-24 ${isMobile ? 'w-[85vw]' : 'w-[260px]'} custom-scrollbar`}
      >
        <div className="p-8 pt-24 pb-6 flex justify-between items-center border-b border-gray-100">

          {isMobile && (
            <button onClick={() => setSidebarVisible(false)} className="text-gray-500 bg-gray-50 border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all hover:text-black">
              <FiX size={14} />
            </button>
          )}
        </div>

        <motion.nav variants={containerVariants} initial="hidden" animate="visible" className="px-4 py-6 space-y-8">
          {[
            {
              title: 'DISEÑO & PORTADA',
              items: [
                { id: 'gestorHome', label: 'EDITAR INICIO & HERO (LIVE)', icon: <FiHome /> },
              ]
            },
            {
              title: 'OVERVIEW',
              items: [
                { id: 'control', label: 'DAILY CLOSING', icon: <FiCheck /> },
              ]
            },
            {
              title: 'FINANCE',
              items: [
                { id: 'Balance', label: 'BALANCE', icon: <FiBarChart2 /> },
                { id: 'ganancias', label: 'EARNINGS', icon: <FiTrendingUp /> },
              ]
            },
            {
              title: 'TIENDA Y CURSOS',
              items: [
                { id: 'cargar', label: 'CARGAR PRODUCTOS', icon: <FiPlusCircle /> },
                { id: 'cargarCursos', label: 'CARGAR CURSOS', icon: <FiBookOpen /> },
                { id: 'productos', label: 'INVENTARIO PRODUCTOS', icon: <FiPackage /> },
                { id: 'likes', label: 'POPULARIDAD', icon: <FiHeart /> },

              ]
            },
            {
              title: 'SALES',
              items: [
                { id: 'ventasOnline', label: 'B2C SUBS', icon: <FiUploadCloud /> },
                { id: 'clientes', label: 'CLIENTES', icon: <FiUser /> },
              ]
            },
            {
              title: 'SYSTEM',
              items: [
                { id: 'whatsapp', label: 'WHATSAPP BOT', icon: <FiMessageSquare /> },
                { id: 'empleados', label: 'TUTORS', icon: <FiUser /> },
                { id: 'pronunciacion', label: 'ENGINE', icon: <FiMessageSquare /> },
              ]
            }
          ].map((group, i) => (
            <motion.div key={i} variants={sidebarGroupVariants} className="space-y-2">
              <motion.p variants={sidebarItemVariants} className="px-3 text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">{group.title}</motion.p>
              {group.items.map(item => (
                <motion.button
                  key={item.id}
                  variants={sidebarItemVariants}
                  onClick={() => {
                    setSeccionActiva(item.id);
                    if (isMobile) setSidebarVisible(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 font-bold text-xs uppercase tracking-widest transition-all rounded-xl border
                  ${seccionActiva === item.id
                      ? 'bg-gray-50 border-black text-black'
                      : 'bg-white border-transparent text-gray-500 hover:border-gray-300 hover:text-black'}`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span> {item.label}
                </motion.button>
              ))}
            </motion.div>
          ))}
        </motion.nav>
      </motion.div>

      <motion.div
        animate={{ paddingLeft: (sidebarVisible && !isMobile) ? 260 : 0 }}
        transition={springTransition}
        className={`w-full bg-white ${seccionActiva === 'gestorHome' ? 'h-[calc(100vh-80px)] overflow-hidden' : 'pt-24 md:pt-32 md:p-12 min-h-screen'}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={seccionActiva}
            variants={sectionVariants}
            initial="initial" animate="animate" exit="exit"
            className={seccionActiva === 'gestorHome' ? 'w-full h-full' : 'max-w-7xl mx-auto'}
          >


            {/* SECCIÓN DE RENDERIZADO DE SUBMÓDULOS */}
            <div className={`w-full relative z-10 ${seccionActiva === 'gestorHome' ? 'h-full' : 'pt-4'}`}>
              {seccionActiva === 'Balance' && <BalanceModule />}
              {seccionActiva === 'personalBalance' && <PersonalBalance />}
              {seccionActiva === 'Encargos' && <Encargos />}
              {seccionActiva === 'caja' && <ModuloCaja />}
              {seccionActiva === 'productos' && <InventarioProductos />}
              {seccionActiva === 'cargar' && <CargaDeProductos />}
              {seccionActiva === 'cargarCursos' && <CargaDeCursos />}
              {seccionActiva === 'likes' && <LikesControl />}
              {seccionActiva === 'ventasOnline' && <VentasEcommerceOnline />}
              {seccionActiva === 'ventasLocal' && <HistorialDeVentasLocal />}
              {seccionActiva === 'historialRecaudacionFinal' && <HistorialRecaudacionFinal />}
              {seccionActiva === 'facturacion' && <Facturacion />}
              {seccionActiva === 'clientes' && <ModuloClientes />}
              {seccionActiva === 'revendedores' && <ModuloRevendedores />}
              {seccionActiva === 'gestorHome' && <GestorHomeLive />}
              {seccionActiva === 'cargarContenidoWeb' && <CargaContenidoWeb />}
              {seccionActiva === 'gastos' && <Gastos />}
              {seccionActiva === 'whatsapp' && <WhatsappQrSection />}
              {seccionActiva === 'ganancias' && <ReporteGanancias />}
              {seccionActiva === 'control' && <CierreCajaDiario />}
              {seccionActiva === 'configMayorista' && <ConfiguracionMayorista />}
              {seccionActiva === 'empleados' && <ModuloEmpleados />}
              {seccionActiva === 'pronunciacion' && <AdminPronunciation />}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {productoAEditar && (
            <EditarProducto
              producto={productoAEditar}
              onCancelar={() => setProductoAEditar(null)}
              onGuardarCambios={() => { }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Admin;