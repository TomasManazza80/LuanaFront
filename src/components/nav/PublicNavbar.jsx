import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/auth/authSlice.js';
import { useLogoutMutation } from '../../services/api/authApi.js';

export default function PublicNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const userInfo = useSelector((state) => state.authSlice?.userInfo);
    const accessToken = useSelector((state) => state.authSlice?.accessToken);
    const [logoutApi] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            dispatch(logout());
            navigate('/login');
        }
    };

    const isInicio = location.pathname === '/';
    const isReservar = location.pathname === '/reservar';
    const isProductos = location.pathname.startsWith('/productos');
    const isMisTurnos = location.pathname === '/mis-turnos';
    const isMisCursos = location.pathname === '/mis-cursos';

    const handleSectionClick = (sectionId) => {
        setIsMobileMenuOpen(false);
        if (sectionId === 'inicio') {
            if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                navigate('/', { state: { scrollTo: 'inicio' } });
            }
            return;
        }

        if (location.pathname === '/') {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };

    useEffect(() => {
        if (location.pathname === '/' && location.state?.scrollTo) {
            const sectionId = location.state.scrollTo;
            setTimeout(() => {
                if (sectionId === 'inicio') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    const el = document.getElementById(sectionId);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 150);
        }
    }, [location]);

    return (
        <>
        <header className="w-full bg-[#3D1A20]/95 backdrop-blur-md text-[#E8DDD3] fixed top-0 left-0 right-0 z-[1000] shadow-md transition-all duration-300">
            <div className="max-w-[1400px] mx-auto px-6 py-4 md:px-10 flex items-center justify-between">
                
                {/* Left: Mobile Menu Toggle & Monogram Logo */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 -ml-2 text-[#E8DDD3] hover:text-white transition-colors md:hidden"
                        aria-label="Abrir menú"
                    >
                        <Menu size={24} />
                    </button>

                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => handleSectionClick('inicio')}
                    >
                        <img 
                            src="/images/logoLuan.jpeg" 
                            alt="Luan Studio" 
                            className="w-9 h-9 rounded-full object-cover border border-[#E8DDD3]/40 group-hover:border-white transition-all shadow-sm"
                        />
                    </div>
                </div>
                
                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-[#E8DDD3]/80">
                    <button 
                        onClick={() => handleSectionClick('inicio')} 
                        className={`transition-colors ${isInicio ? 'text-white font-bold' : 'hover:text-white'}`}
                    >
                        INICIO
                    </button>
                    <button 
                        onClick={() => handleSectionClick('manicure')} 
                        className="hover:text-white transition-colors"
                    >
                        MANICURE
                    </button>
                    <button 
                        onClick={() => handleSectionClick('pedicure')} 
                        className="hover:text-white transition-colors"
                    >
                        PEDICURE
                    </button>
                    <button 
                        onClick={() => navigate('/productos')} 
                        className={`transition-colors ${isProductos ? 'text-white font-bold' : 'hover:text-white'}`}
                    >
                        TIENDA
                    </button>
                    <button 
                        onClick={() => navigate('/mis-turnos')} 
                        className={`transition-colors ${isMisTurnos ? 'text-white font-bold' : 'hover:text-white'}`}
                    >
                        MIS TURNOS
                    </button>
                    <button 
                        onClick={() => navigate('/mis-cursos')} 
                        className={`transition-colors ${isMisCursos ? 'text-white font-bold' : 'hover:text-white'}`}
                    >
                        MIS CURSOS
                    </button>
                    
                    {userInfo?.role?.toUpperCase() === 'ADMIN' || userInfo?.role?.toUpperCase() === 'EMPLOYEE' ? (
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-[#3D1A20] font-bold bg-[#E8DDD3] px-3.5 py-1.5 rounded-full hover:bg-white transition-colors text-[10px] tracking-wider"
                        >
                            PANEL ADMIN
                        </button>
                    ) : null}
                </nav>

                {/* Right: Reserve Button & User Profile */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/reservar')}
                        className={`text-xs uppercase tracking-widest font-bold bg-[#E8DDD3] text-[#3D1A20] px-5 py-2.5 rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-sm ${isReservar ? 'ring-2 ring-white' : ''}`}
                    >
                        RESERVAR AHORA
                    </button>

                    <div className="relative">
                        <button 
                            onClick={() => {
                                if (!accessToken) {
                                    navigate('/login');
                                } else {
                                    setIsUserMenuOpen(!isUserMenuOpen);
                                }
                            }}
                            className="w-8 h-8 rounded-full border border-[#E8DDD3]/40 bg-[#3D1A20] flex justify-center items-center hover:border-white transition-colors cursor-pointer"
                            aria-label="Menú de usuario"
                        >
                            <User size={16} className="text-[#E8DDD3]" />
                        </button>
                        
                        {isUserMenuOpen && accessToken && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#3D1A20] text-[#E8DDD3] rounded-xl shadow-2xl border border-[#E8DDD3]/20 py-2 z-50">
                                <div className="px-4 py-3 border-b border-[#E8DDD3]/10 mb-1">
                                    <p className="text-xs font-bold truncate">
                                        {userInfo?.firstName || userInfo?.lastName ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : userInfo?.email}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-300 hover:bg-[#4E222A] transition-colors flex items-center gap-2"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>

        {/* Mobile Navigation Drawer & Overlay */}
        <div 
            className={`fixed inset-0 bg-black/60 z-[1010] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        <div 
            className={`fixed top-0 left-0 h-[100dvh] w-[280px] bg-[#3D1A20] text-[#E8DDD3] z-[1020] transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="flex items-center justify-between p-6 border-b border-[#E8DDD3]/10">
                <div className="flex items-center gap-3">
                    <img 
                        src="/images/logoLuan.jpeg" 
                        alt="Luan Studio" 
                        className="w-8 h-8 rounded-full object-cover border border-[#E8DDD3]/40"
                    />
                    <span className="text-lg font-bold font-serif text-[#E8DDD3]">Luan Studio</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#E8DDD3] hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div className="flex flex-col p-6 gap-6 text-xs uppercase tracking-widest overflow-y-auto">
                <button 
                    onClick={() => handleSectionClick('inicio')} 
                    className={`text-left font-semibold transition-colors ${isInicio ? 'text-white font-bold' : 'text-[#E8DDD3]/80 hover:text-white'}`}
                >
                    INICIO
                </button>
                <button 
                    onClick={() => handleSectionClick('manicure')} 
                    className="text-left font-semibold text-[#E8DDD3]/80 hover:text-white transition-colors"
                >
                    MANICURE
                </button>
                <button 
                    onClick={() => handleSectionClick('pedicure')} 
                    className="text-left font-semibold text-[#E8DDD3]/80 hover:text-white transition-colors"
                >
                    PEDICURE
                </button>
                <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/productos'); }} 
                    className={`text-left font-semibold transition-colors ${isProductos ? 'text-white font-bold' : 'text-[#E8DDD3]/80 hover:text-white'}`}
                >
                    TIENDA
                </button>
                <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/mis-turnos'); }} 
                    className={`text-left font-semibold transition-colors ${isMisTurnos ? 'text-white font-bold' : 'text-[#E8DDD3]/80 hover:text-white'}`}
                >
                    MIS TURNOS
                </button>
                <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/mis-cursos'); }} 
                    className={`text-left font-semibold transition-colors ${isMisCursos ? 'text-white font-bold' : 'text-[#E8DDD3]/80 hover:text-white'}`}
                >
                    MIS CURSOS
                </button>
                
                {userInfo?.role?.toUpperCase() === 'ADMIN' || userInfo?.role?.toUpperCase() === 'EMPLOYEE' ? (
                    <button 
                        onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }}
                        className="text-left font-bold text-[#E8DDD3] transition-colors"
                    >
                        PANEL ADMIN
                    </button>
                ) : null}

                <div className="h-px bg-[#E8DDD3]/10 w-full my-2"></div>

                {accessToken ? (
                    <button 
                        onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                        className="text-left font-semibold text-red-300 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                ) : (
                    <button 
                        onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                        className="text-left font-semibold text-[#E8DDD3] transition-colors"
                    >
                        Iniciar Sesión
                    </button>
                )}
            </div>
        </div>
        </>
    );
}
