import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Barcode, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from '../ui/use-toast'; 
import Swal from 'sweetalert2';
import { FormularioEditarModal } from '../../pages/admin/productos/inventarioProductos.jsx';
import { AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '';

const optimizeImage = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.includes('imagekit.io')) {
        return `${url}?tr=w-500,f-webp,q-80`;
    }
    if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_500,f_webp,q_auto/');
    }
    return url;
};

const ProductInventory = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Items');
    const [proveedores, setProveedores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [pronunciationActivities, setPronunciationActivities] = useState([]);
    const [productoAEditar, setProductoAEditar] = useState(null);

    const fetchPronunciationActivities = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/pronunciation/activities`);
            setPronunciationActivities(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const [prodData, provRes, catRes, actRes] = await Promise.all([
                    axios.get(`${API_URL}/products?limit=1000`),
                    axios.get(`${API_URL}/providers`),
                    axios.get(`${API_URL}/api/categories`),
                    axios.get(`${API_URL}/api/pronunciation/activities`)
                ]);
                
                const fetchedProducts = prodData.data.products || prodData.data || [];
                setProducts(fetchedProducts);
                setFilteredProducts(fetchedProducts);
                
                setProveedores(provRes.data);
                setCategorias(catRes.data);
                setPronunciationActivities(actRes.data);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast({ title: 'Error', description: 'Error al cargar productos', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const categories = ['All Items', ...new Set(products.map(p => p.categoria).filter(Boolean))];

    useEffect(() => {
        let result = products;
        
        if (activeCategory !== 'All Items') {
            result = result.filter(p => p.categoria === activeCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                (p.nombre && p.nombre.toLowerCase().includes(query)) ||
                (p.id && p.id.toString().includes(query)) ||
                (p.marca && p.marca.toLowerCase().includes(query))
            );
        }

        setFilteredProducts(result);
    }, [searchQuery, activeCategory, products]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    };

    // Calculate Summary
    const totalValue = products.reduce((acc, p) => {
        const stockVariant = p.variantes?.find(v => Number(v.stock) > 0) || (p.variantes?.length > 0 ? p.variantes[0] : null);
        const price = stockVariant?.precioAlPublico || p.precioVenta || 0;
        const stock = stockVariant?.stock || 0;
        return acc + (Number(price) * Number(stock));
    }, 0);

    const handleEliminarProducto = async (id) => {
        try {
            const confirm = await Swal.fire({
                title: '¿ELIMINAR PRODUCTO?',
                text: "Esta acción es irreversible.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ffffff',
                cancelButtonColor: '#f3f4f6',
                confirmButtonText: 'SÍ, ELIMINAR',
                cancelButtonText: 'CANCELAR',
                customClass: {
                    confirmButton: 'text-black border border-gray-300 font-bold uppercase text-xs rounded-xl px-4 py-3',
                    cancelButton: 'text-black font-bold uppercase text-xs rounded-xl px-4 py-3 border border-gray-300'
                }
            });

            if (!confirm.isConfirmed) return;

            const response = await axios.delete(`${API_URL}/products/${id}`);

            if (response.status === 204) {
                setProducts(products.filter(p => p.id !== id));
                toast({ title: 'Éxito', description: 'Producto eliminado' });
            }
        } catch (err) {
            console.error("Error al eliminar:", err);
            if (err.response?.data?.code === 'REQUIRE_ADMIN_PASS' || err.response?.status === 403) {
                const { value: pass } = await Swal.fire({
                    title: 'SEGURIDAD',
                    text: 'Este producto tiene stock. Ingrese contraseña maestra para forzar eliminación:',
                    input: 'password',
                    inputPlaceholder: 'CONTRASEÑA...',
                    showCancelButton: true,
                    confirmButtonColor: '#ffffff',
                    cancelButtonColor: '#f3f4f6',
                    customClass: {
                        confirmButton: 'text-black border border-gray-300',
                        cancelButton: 'text-black'
                    }
                });

                if (pass) {
                    try {
                        await axios.delete(`${API_URL}/products/${id}`, {
                            data: { adminPassword: pass }
                        });
                        setProducts(products.filter(p => p.id !== id));
                        toast({ title: 'Éxito', description: 'Producto eliminado forzosamente' });
                    } catch (e) {
                        toast({ title: 'Error', description: 'Contraseña incorrecta o fallo de sistema', variant: 'destructive' });
                    }
                }
            } else {
                toast({ title: 'Error', description: 'No se pudo eliminar el item', variant: 'destructive' });
            }
        }
    };

    const handleGuardarEdicion = async (datos) => {
        try {
            await axios.put(`${API_URL}/products/${datos.id}`, datos);
            setProducts(products.map(p => p.id === datos.id ? datos : p));
            setProductoAEditar(null);
            toast({ title: 'Éxito', description: 'Producto actualizado' });
        } catch (err) {
            toast({ title: 'Error', description: 'Fallo al actualizar el producto', variant: 'destructive' });
        }
    };

    const needsRestockCount = products.filter(p => {
        const stockVariant = p.variantes?.find(v => Number(v.stock) > 0) || (p.variantes?.length > 0 ? p.variantes[0] : null);
        const stock = stockVariant?.stock || 0;
        return Number(stock) <= 10; // Threshold for restock
    }).length;

    return (
        <div className="w-full min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans relative pb-24 md:pb-6">
            <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
                
                {/* Header (Visible mostly on mobile to match design, but Navbar handles desktop) */}
                <div className="md:hidden flex items-center justify-center mb-6 relative">
                    <h1 className="text-xl font-bold text-[#0058be]">Inventory</h1>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 md:p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#e2e8f0] flex flex-col justify-center">
                        <span className="text-[11px] md:text-xs font-semibold text-[#727785] tracking-widest uppercase mb-1">Total Value</span>
                        <span className="text-2xl md:text-3xl font-bold text-[#0058be]">{formatPrice(totalValue)}</span>
                    </div>
                    <div className="bg-white p-4 md:p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#e2e8f0] flex flex-col justify-center">
                        <div className="flex items-center gap-1 mb-1">
                            <span className="text-[11px] md:text-xs font-semibold text-[#727785] tracking-widest uppercase">Needs Restock</span>
                            <AlertTriangle size={14} className="text-[#ba1a1a]" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-3xl font-bold text-[#ba1a1a]">{needsRestockCount}</span>
                            <span className="text-sm font-medium text-[#727785]">Items</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-[#727785]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products, SKUs..."
                        className="w-full pl-10 pr-12 py-3.5 bg-[#f2f4f6] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be] transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-[#727785] hover:text-[#0058be] transition-colors">
                        <Barcode size={20} />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                                activeCategory === cat
                                    ? 'bg-[#0058be] text-white shadow-md shadow-blue-500/20'
                                    : 'bg-white text-[#424754] border border-[#e2e8f0] hover:bg-[#f2f4f6]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product List */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0058be]"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-10 text-[#727785]">No products found.</div>
                        ) : (
                            filteredProducts.map((product) => {
                                const stockVariant = product.variantes?.find(v => Number(v.stock) > 0) || (product.variantes?.length > 0 ? product.variantes[0] : null);
                                const price = stockVariant?.precioAlPublico || product.precioVenta || 0;
                                const stock = stockVariant?.stock || 0;
                                const isLowStock = Number(stock) <= 10;

                                return (
                                    <div key={product.id} className="bg-white rounded-2xl p-3 md:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#e2e8f0] flex items-center gap-4 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                                        
                                        {/* Image */}
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-[#f2f4f6] shrink-0 border border-[#eceef0]">
                                            <img
                                                src={optimizeImage(product.imagenes?.[0] || product.image)}
                                                alt={product.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[15px] md:text-base font-semibold text-[#191c1e] truncate mb-0.5">
                                                {product.nombre}
                                            </h3>
                                            <p className="text-[11px] md:text-xs text-[#727785] truncate mb-2">
                                                SKU: {product.id}
                                            </p>
                                            
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                                                    isLowStock 
                                                    ? 'bg-[#6063ee] text-white' // Using secondary-container style for low stock as in design (purple)
                                                    : 'bg-[#006947] text-white' // Tertiary green
                                                }`}>
                                                    {isLowStock ? `Low Stock: ${stock}` : `In Stock: ${stock}`}
                                                </span>
                                                <span className="text-[13px] md:text-sm font-bold text-[#0058be]">
                                                    {formatPrice(price)}/u
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button 
                                                onClick={() => setProductoAEditar(product)}
                                                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#f2f4f6] text-[#424754] flex items-center justify-center hover:bg-[#e2e8f0] transition-colors"
                                                title="Edit Product"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleEliminarProducto(product.id)}
                                                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) */}
            <button className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#0058be] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(0,88,190,0.3)] hover:scale-105 hover:bg-[#004bb0] transition-all z-40">
                <Plus size={28} />
            </button>

            <AnimatePresence>
                {productoAEditar && (
                    <FormularioEditarModal 
                        producto={productoAEditar} 
                        proveedores={proveedores} 
                        categorias={categorias} 
                        pronunciationActivities={pronunciationActivities} 
                        fetchPronunciationActivities={fetchPronunciationActivities} 
                        onClose={() => setProductoAEditar(null)} 
                        onSave={handleGuardarEdicion} 
                    />
                )}
            </AnimatePresence>

            {/* Hide scrollbar styles */}
            <style jsx="true">{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default ProductInventory;
