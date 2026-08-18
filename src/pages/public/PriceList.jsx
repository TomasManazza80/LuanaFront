import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { useGetProductsQuery } from '../../services/api/productApi.js';
import { useGetCategoriesQuery } from '../../services/api/categoryApi.js';
import { Search, PlusCircle, ArrowLeft, Beef } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/public/header.tsx';
import Loader from '../../components/public/Loader';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PromoBanner = ({ title = 'PROMO', items = ['MILAS DE CARNE', 'MILAS DE POLLO', 'MILAS DE CERDO'], price = '$30.000' }) => {
    
    // Dynamic font sizes based on length to prevent overflow
    const getTitleSize = (text) => {
        if (!text) return 'text-6xl md:text-7xl';
        if (text.length > 12) return 'text-3xl md:text-4xl';
        if (text.length > 9) return 'text-4xl md:text-5xl';
        if (text.length >= 7) return 'text-5xl md:text-6xl';
        return 'text-6xl md:text-7xl';
    };

    const getPriceSize = (text) => {
        if (!text) return 'text-6xl md:text-7xl';
        if (text.length > 8) return 'text-3xl md:text-4xl';
        if (text.length > 6) return 'text-4xl md:text-5xl';
        return 'text-6xl md:text-7xl';
    };

    return (
        <div className="bg-[#df1e25] rounded-xl overflow-hidden shadow-2xl relative flex flex-col items-center p-6 w-full h-full min-h-[400px] border-2 border-[#b9151a]">
            {/* Subtle background pattern to mimic the texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}></div>
            
            {/* PROMO TITLE */}
            <h3 className={`text-white font-oswald font-bold tracking-tight mb-8 mt-2 uppercase relative z-10 drop-shadow-lg text-center w-full leading-[0.9] ${getTitleSize(title)}`} style={{ transform: 'scaleY(1.15)', wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
                {title}
            </h3>
            
            {/* ITEMS */}
            <div className="w-full flex flex-col gap-5 relative z-10 mb-10 px-2">
                {items.filter(Boolean).map((text, i) => (
                    <div key={i} className="flex items-center relative h-14">
                        {/* Yellow Circle */}
                        <div className="absolute -left-2 z-20 w-16 h-16 bg-[#ffca08] rounded-full flex flex-col items-center justify-center border-[3px] border-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] shrink-0">
                            <span className="text-[#df1e25] font-black text-3xl leading-none mt-1">1</span>
                            <span className="text-[#df1e25] font-bold text-sm leading-none">kg</span>
                        </div>
                        {/* White Banner */}
                        <div className="bg-white w-full h-12 ml-8 pl-10 pr-4 flex items-center shadow-lg relative overflow-hidden" style={{ borderRadius: '5px 20px 20px 5px', transform: 'skewX(-3deg)' }}>
                            <span className={`text-[#222] font-oswald font-bold transform skewX(3deg) tracking-wide truncate w-full ${text.length > 15 ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>
                                {text}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* PRICE */}
            <div className="relative z-10 mt-auto w-[115%] flex justify-center items-center">
                {/* Splash/Brush background using CSS */}
                <div className="bg-[#1a1a1a] w-full py-4 px-2 flex items-center justify-center shadow-2xl relative border-y border-[#333]" style={{ borderRadius: '8px 30px 8px 30px', transform: 'rotate(-2deg)' }}>
                    {/* Yellow accents */}
                    <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-0">
                        <div className="w-4 md:w-5 h-1.5 bg-[#ffca08] rounded-full transform -rotate-12"></div>
                        <div className="w-2 md:w-3 h-1.5 bg-[#ffca08] rounded-full transform rotate-12 ml-2"></div>
                    </div>
                    <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-end z-0">
                        <div className="w-4 md:w-5 h-1.5 bg-[#ffca08] rounded-full transform rotate-12"></div>
                        <div className="w-2 md:w-3 h-1.5 bg-[#ffca08] rounded-full transform -rotate-12 mr-2"></div>
                    </div>
                    
                    <div className={`text-[#ffca08] font-oswald font-black tracking-tighter drop-shadow-md z-10 truncate max-w-[80%] text-center ${getPriceSize(price)}`} style={{ transform: 'scaleY(1.1)' }}>
                        {price}
                    </div>
                </div>
            </div>
            
            {/* Logo Spacer */}
            <div className="mt-10 mb-2 flex flex-col items-center relative z-10">
                <div className="flex items-center gap-2 font-black text-white font-oswald text-3xl tracking-widest drop-shadow-md">
                    EL 
                    <span className="flex items-center justify-center text-white bg-transparent">
                        <Beef className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </span> 
                    CRUCE
                </div>
                <span className="text-white text-xs uppercase font-black tracking-[0.4em] bg-[#1a1a1a] px-3 py-1 rounded-sm mt-1 shadow-md">
                    Carnes
                </span>
            </div>
        </div>
    );
};

export default function PriceList() {
    const { data: products, isLoading } = useGetProductsQuery();
    const { data: dbCategories } = useGetCategoriesQuery();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('TODOS');
    const [promoConfig, setPromoConfig] = useState(null);
    
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/settings/hero`);
                const json = await res.json();
                if (json.success && json.data?.homeContent) {
                    setPromoConfig(json.data.homeContent);
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);
    
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.from(headerRef.current, {
                    y: -40,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            }
        });
        return () => ctx.revert();
    }, []);

    useLayoutEffect(() => {
        if (!isLoading && contentRef.current) {
            const ctx = gsap.context(() => {
                gsap.fromTo(".category-block", 
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
                );
                gsap.fromTo(".product-item", 
                    { y: 20, opacity: 0, scale: 0.95 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)", delay: 0.1 }
                );
            }, contentRef);
            return () => ctx.revert();
        }
    }, [isLoading, selectedCategory, searchTerm]);

    const categories = ['TODOS', ...(dbCategories?.map(c => c.name).filter(name => name.toUpperCase() !== 'DESTACADOS VERTICAL') || [])];

    const filteredProducts = products?.filter(product => {
        if (product.category?.toUpperCase() === 'DESTACADOS VERTICAL') return false;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'TODOS' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const groupedProducts = filteredProducts?.reduce((acc, product) => {
        const category = product.category?.toUpperCase() || 'OTROS';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    const isFiltered = searchTerm !== '' || selectedCategory !== 'TODOS';

    return (
        <div className="min-h-screen bg-[#f9f9f9] flex justify-center">
            {/* Contenedor principal adaptable - ocupa toda la pantalla en PC */}
            <div className="w-full bg-white min-h-screen shadow-2xl relative flex flex-col font-oswald">
                
                <Header alwaysSolid={true} />

                {/* Header Rojo Oscuro */}
                <div ref={headerRef} className="bg-[#800b0e] mt-[92px] md:mt-[100px] pt-6 pb-0 flex flex-col shadow-md z-10">
                    <div className="px-4 flex items-center justify-between mb-2 text-white w-full">
                        <button onClick={() => navigate('/')} className="hover:text-gray-200 transition">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </div>

                    <h1 className="text-center text-3xl md:text-3xl text-white font-bold tracking-wider uppercase mb-4 mt-2">
                        Listado de Precios
                    </h1>
                    
                    <div className="px-4 mb-4 relative w-full lg:max-w-4xl mx-auto">
                        <input
                            type="text"
                            placeholder="Buscar cortes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-4 pr-10 rounded text-gray-700 focus:outline-none font-sans"
                        />
                        <Search className="absolute right-7 top-2.5 text-gray-400 w-5 h-5" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 px-2 w-full pb-4">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors uppercase tracking-wider ${
                                    selectedCategory === cat 
                                    ? 'text-white border-b-2 border-white' 
                                    : 'text-white/70 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body - Lista de Productos */}
                <div ref={contentRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 font-sans" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}>
                    {isLoading ? (
                        <Loader />
                    ) : filteredProducts?.length > 0 ? (
                        <div className="flex flex-col gap-12">
                            {Object.keys(groupedProducts).sort().map(categoryName => (
                                <div key={categoryName} className="flex flex-col category-block">
                                    {/* Professional Section Title */}
                                    <div className="flex items-center mb-6 mt-2">
                                        <h2 className="text-2xl md:text-3xl font-bold text-[#800b0e] uppercase tracking-wider font-oswald">{categoryName}</h2>
                                        <div className="flex-1 h-px bg-gradient-to-r from-[#800b0e]/40 to-transparent ml-4"></div>
                                    </div>
                                    
                                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                                            {groupedProducts[categoryName].map(product => (
                                                <div key={product.id} className="product-item flex items-center justify-between p-4 border border-black/80 shadow-sm bg-white/80 rounded-md hover:bg-white hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        {/* Imagen */}
                                                        <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 shadow-sm rounded-lg overflow-hidden bg-white">
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-[10px]">Sin foto</div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Nombre */}
                                                        <h3 className="font-bold text-gray-800 text-lg md:text-xl leading-tight line-clamp-2">
                                                            {product.name}
                                                        </h3>
                                                    </div>
                                                    
                                                    {/* Precio */}
                                                    <div className="flex flex-col items-end justify-center shrink-0 ml-2">
                                                        <div className="text-right">
                                                            <span className="font-bold text-[#800b0e] text-xl md:text-3xl">${product.pricePerKilo}</span>
                                                            <span className="text-gray-500 text-sm md:text-base font-semibold"> /kg</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {promoConfig?.categoryPromos?.[categoryName] && (
                                            <div className="w-full lg:w-[320px] shrink-0">
                                                <PromoBanner 
                                                    title={promoConfig.categoryPromos[categoryName].title || 'PROMO'}
                                                    items={promoConfig.categoryPromos[categoryName].items || []}
                                                    price={promoConfig.categoryPromos[categoryName].price || ''}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center p-10 text-gray-500 text-sm font-sans text-center">
                            No se encontraron productos en esta categoría o búsqueda.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
