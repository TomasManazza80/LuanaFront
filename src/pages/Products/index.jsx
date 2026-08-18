import axios from "axios";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, Link, useSearchParams } from "react-router-dom";
import { FiX, FiSearch, FiDollarSign, FiFilter, FiPlusCircle, FiHeart, FiShoppingCart } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PublicNavbar from "../../components/nav/PublicNavbar.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const API_URL = import.meta.env.VITE_API_URL;

const optimizeImage = (url) => {
    if (!url) return url;
    if (url.includes('imagekit.io')) {
        return `${url}?tr=w-500,f-webp,q-80`;
    }
    if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_500,f_webp,q_auto/');
    }
    return url;
};

// =================================================================
// ESTILOS AI SPEAKING PRACTICE: MODERN SAAS
// =================================================================
const AiStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');

.ai-font { font-family: 'Inter', sans-serif; }

.ai-card {
    background-color: #ffffff;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    border: 1px solid #f0dff3;
}

.ai-card:hover {
    box-shadow: 0 25px 50px -12px rgba(178, 115, 194, 0.25);
    transform: translateY(-8px);
}

.ai-gradient-btn {
    background: #b273c2;
    transition: all 0.3s ease;
}

.ai-gradient-btn:hover {
    background: #9d5fb0;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(178, 115, 194, 0.3);
}

.ai-input {
    background-color: #ffffff;
    border: 1px solid #f0dff3;
    color: #1d1d1d;
    transition: all 0.3s ease;
}

.ai-input:focus {
    border-color: #b273c2;
    outline: none;
    box-shadow: 0 0 0 4px rgba(178, 115, 194, 0.1);
}

.ai-category {
    color: #6b7280;
    background-color: #ffffff;
    border: 1px solid #f0dff3;
    border-radius: 9999px;
    padding: 0.5rem 1.2rem;
    transition: all 0.3s ease;
}

.ai-category.active {
    color: #ffffff;
    background-color: #b273c2;
    border-color: #b273c2;
    box-shadow: 0 4px 10px rgba(178, 115, 194, 0.3);
}

.ai-category:hover:not(.active) {
    background-color: #f6edf8;
    color: #b273c2;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
`;

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [sortOption, setSortOption] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [likedProducts, setLikedProducts] = useState([]);
    const [searchParams] = useSearchParams();
    
    const gridRef = useRef(null);

    // Cargar likes desde localStorage
    useEffect(() => {
        const savedLikes = JSON.parse(localStorage.getItem('ai_liked_products')) || [];
        setLikedProducts(savedLikes);
    }, []);

    const handleToggleLike = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();

        const isLiked = likedProducts.includes(productId);
        let updatedLikes;

        if (isLiked) {
            updatedLikes = likedProducts.filter(id => id !== productId);
        } else {
            updatedLikes = [...likedProducts, productId];
        }

        setLikedProducts(updatedLikes);
        localStorage.setItem('ai_liked_products', JSON.stringify(updatedLikes));

        try {
            await axios.patch(`${API_URL}/products/${productId}/like`, { isIncrement: !isLiked });
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setCategory(categoryParam);
            setShowFilters(true);
        }
    }, [searchParams]);
    
    const availableCategories = [...new Set(products.map(p => p.categoria))].filter(Boolean).sort();
    const availableBrands = [...new Set(products.map(p => p.marca))].filter(Boolean).sort();

    const MAX_PREVIEW_RESULTS = 10;
    const previewProducts = search.length > 0 ? filteredProducts.slice(0, MAX_PREVIEW_RESULTS) : [];

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchProducts = useCallback(async (currentPage, searchQuery) => {
        try {
            if (currentPage === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const limit = 20;
            const url = `${API_URL}/products?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery || '')}`;
            const { data } = await axios.get(url);

            const fetchedProducts = data.products || data;

            if (currentPage === 1) {
                setProducts(fetchedProducts);
            } else {
                setProducts(prev => [...prev, ...fetchedProducts]);
            }

            if (data.totalPages !== undefined) {
                setTotalPages(data.totalPages);
                setHasMore(currentPage < data.totalPages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(page, debouncedSearch);
    }, [page, debouncedSearch, fetchProducts]);

    useEffect(() => {
        let filtered = products;

        if (category) filtered = filtered.filter(item => item.categoria.toLowerCase() === category.toLowerCase());
        if (brand) filtered = filtered.filter(item => item.marca && item.marca.toLowerCase() === brand.toLowerCase());
        if (minPrice) filtered = filtered.filter(item => {
            const stockVariant = item.variantes?.find(v => Number(v.stock) > 0) || (item.variantes?.length > 0 ? item.variantes[0] : null);
            const price = stockVariant?.precioAlPublico || item.precioVenta || 0;
            return parseFloat(price) >= parseFloat(minPrice);
        });
        if (maxPrice) filtered = filtered.filter(item => {
            const stockVariant = item.variantes?.find(v => Number(v.stock) > 0) || (item.variantes?.length > 0 ? item.variantes[0] : null);
            const price = stockVariant?.precioAlPublico || item.precioVenta || 0;
            return parseFloat(price) <= parseFloat(maxPrice);
        });

        if (sortOption === "price-asc") {
            filtered = [...filtered].sort((a, b) => {
                const priceA = a.variantes?.find(v => Number(v.stock) > 0)?.precioAlPublico || a.precioVenta || 0;
                const priceB = b.variantes?.find(v => Number(v.stock) > 0)?.precioAlPublico || b.precioVenta || 0;
                return parseFloat(priceA) - parseFloat(priceB);
            });
        }
        if (sortOption === "price-desc") {
            filtered = [...filtered].sort((a, b) => {
                const priceA = a.variantes?.find(v => Number(v.stock) > 0)?.precioAlPublico || a.precioVenta || 0;
                const priceB = b.variantes?.find(v => Number(v.stock) > 0)?.precioAlPublico || b.precioVenta || 0;
                return parseFloat(priceB) - parseFloat(priceA);
            });
        }

        setFilteredProducts(filtered);
    }, [search, category, brand, products, sortOption, minPrice, maxPrice, debouncedSearch]);

    // GSAP Animation for grid elements
    useGSAP(() => {
        if (!isLoading && filteredProducts.length > 0) {
            gsap.fromTo(
                ".gsap-card",
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                    willChange: "transform, opacity",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }
    }, { scope: gridRef, dependencies: [isLoading, filteredProducts] });

    const formatPrice = (price) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price).replace('ARS', '$');

    const resetFilters = () => {
        setSearch(""); setCategory(""); setBrand(""); setSortOption(""); setMinPrice(""); setMaxPrice("");
    };

    return (
        <div className="min-h-screen bg-[#fdfcf8] text-[#1d1d1d] font-sans pb-24 overflow-x-hidden">
            <PublicNavbar />
            <Outlet />

            {/* HEADER SECTION */}
            <div className="pt-16 md:pt-20 pb-8 text-center px-4">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#3b181e] tracking-tight leading-tight mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700 }}>
                        SHOP
                    </h1>
                    <p className="text-gray-600 font-medium max-w-xl mx-auto text-sm md:text-base">
                        Curated essentials for your home studio.
                    </p>
                </motion.div>
            </div>

            {/* TABS */}
            <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 mb-10">
                <div className="flex flex-wrap justify-center gap-6 md:gap-10 border-b border-gray-200 pb-2">
                    <button onClick={() => setCategory("")} className={`text-[10px] md:text-xs font-bold uppercase tracking-widest pb-2 transition-all ${category === "" ? "border-b-2 border-[#3b181e] text-[#3b181e]" : "text-gray-500 hover:text-[#3b181e]"}`}>ALL</button>
                    {availableCategories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)} className={`text-[10px] md:text-xs font-bold uppercase tracking-widest pb-2 transition-all ${category === cat ? "border-b-2 border-[#3b181e] text-[#3b181e]" : "text-gray-500 hover:text-[#3b181e]"}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* GRID DE PRODUCTOS */}
            <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-gray-200 rounded-[20px] md:rounded-[30px] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-10 md:gap-16">
                        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                            <AnimatePresence>
                                {filteredProducts.length === 0 ? (
                                    <div className="col-span-full py-20 text-center">
                                        <p className="font-medium text-gray-500 text-lg">No products found.</p>
                                    </div>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const stockVariant = product.variantes?.find(v => Number(v.stock) > 0) || (product.variantes?.length > 0 ? product.variantes[0] : null);
                                        const price = stockVariant?.precioAlPublico || product.precioVenta || 0;
                                        const oldPrice = parseFloat(price) * 1.5; // Placeholder for original price to show discount

                                        return (
                                            <Link to={`/product/${product.id}`} key={product.id} className="block group h-full gsap-card">
                                                <div className="h-full flex flex-col relative bg-transparent overflow-hidden">
                                                    
                                                    {/* IMAGE SECTION */}
                                                    <div className="relative w-full aspect-square bg-[#f5f5f5] overflow-hidden mb-4">
                                                        <img
                                                            src={optimizeImage(product.imagenes?.[0] || product.image)}
                                                            alt={product.nombre}
                                                            loading="lazy"
                                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    </div>

                                                    {/* INFO SECTION */}
                                                    <div className="flex flex-col flex-1">
                                                        <h3 className="text-sm text-[#333333] font-medium tracking-tight mb-1 line-clamp-1">{product.nombre}</h3>
                                                        <span className="text-sm text-gray-600 mb-4">{formatPrice(price)}</span>

                                                        <div className="mt-auto pt-2">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    // add to cart logic would go here
                                                                }}
                                                                className="w-full border border-[#333333] py-3 text-[10px] md:text-xs font-bold text-[#333333] tracking-widest hover:bg-[#333333] hover:text-white transition-colors"
                                                            >
                                                                ADD TO CART
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>

                        {/* BOTON CARGAR MAS */}
                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={isLoadingMore}
                                    className="bg-transparent border border-[#3b181e] text-[#3b181e] px-8 py-3 md:py-4 font-bold text-xs md:text-[12px] hover:bg-[#3b181e] hover:text-white disabled:opacity-50 transition-colors uppercase tracking-widest"
                                >
                                    {isLoadingMore ? "LOADING..." : "LOAD MORE PRODUCTS"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;