import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
    LogOut, Settings, Bell, Users, Calendar, 
    FileText, Home, Menu, X, ChevronLeft, ChevronRight, Clock, UserCheck, Shield, GripVertical,
    PackagePlus, Package, GraduationCap, Globe
} from "lucide-react";
import { logoutUser } from "../../services/auth/authActions.js";

const Navbar = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector(state => state.authSlice.userInfo);

    // Sidebar state (Open by default on desktop, closed on mobile)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Resizable sidebar width (stored in localStorage)
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = localStorage.getItem('admin_sidebar_width');
        return saved ? parseInt(saved, 10) : 256;
    });
    const [isResizing, setIsResizing] = useState(false);

    // Auto-adjust sidebar for screen sizes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Drag to resize handler
    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            // Clamp sidebar width between 180px and 450px
            const newWidth = Math.max(180, Math.min(450, e.clientX));
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
                localStorage.setItem('admin_sidebar_width', sidebarWidth.toString());
            }
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, sidebarWidth]);

    const handleLogout = () => {
        logoutUser();
    };

    const navItems = [
        {
            path: '/dashboard?tab=gestorHome',
            tab: 'gestorHome',
            title: 'Editar Inicio & Hero (Live)',
            icon: Home
        },

        {
            path: '/turnos',
            title: 'Agenda / Turnos',
            icon: Calendar
        },
        {
            path: '/pacientes',
            title: 'Clientes',
            icon: Users
        },
        {
            path: '/balance',
            title: 'Balance & Caja',
            icon: FileText
        },
        {
            path: '/dashboard?tab=cargar',
            tab: 'cargar',
            title: 'Cargar Productos',
            icon: PackagePlus
        },
        {
            path: '/inventario',
            title: 'Inventario de Productos',
            icon: Package
        },
        {
            path: '/dashboard?tab=cargarCursos',
            tab: 'cargarCursos',
            title: 'Cargar Cursos',
            icon: GraduationCap
        },
        {
            path: '/dashboard?tab=cursos',
            tab: 'cursos',
            title: 'Ver Mis Cursos',
            icon: GraduationCap
        },
        {
            path: '/disponibilidad',
            title: 'Horarios / Disponibilidad',
            icon: Clock
        }
    ];

    if (user?.role?.toUpperCase() === 'ADMIN') {
        navItems.push({
            path: '/profesionales',
            title: 'Equipo / Profesionales',
            icon: UserCheck
        });
    }

    return (
        <div className={`flex h-[125vh] bg-[#F8FAFC] font-sans overflow-hidden ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
            
            {/* 1. DESKTOP COLLAPSIBLE & RESIZABLE LEFT SIDEBAR */}
            <aside 
                style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '80px' }}
                className={`hidden md:flex flex-col bg-[#0F172A] text-slate-200 transition-width ${
                    isResizing ? 'duration-0' : 'duration-300'
                } ease-in-out relative z-30 shadow-xl border-r border-slate-800/80 group/sidebar`}
            >
                {/* Draggable Resize Handle Bar */}
                {isSidebarOpen && (
                    <div
                        onMouseDown={startResizing}
                        className={`absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-[#0A58CA] transition-colors z-40 flex items-center justify-center ${
                            isResizing ? 'bg-[#0A58CA]' : 'bg-transparent group-hover/sidebar:bg-slate-700/50'
                        }`}
                        title="Arrastra para regular el tamaño del menú"
                    >
                        <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
                            <GripVertical size={12} className="text-slate-400" />
                        </div>
                    </div>
                )}

                {/* Sidebar Header / Brand */}
                <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                            src="/images/logoLuan.jpeg" 
                            alt="Logo" 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
                        />
                        {isSidebarOpen && (
                            <div className="flex flex-col truncate">
                                <span className="font-bold text-base text-white tracking-wide leading-tight">LUAN STUDIO</span>
                                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Studio Belleza</span>
                            </div>
                        )}
                    </div>

                    {/* Toggle Button */}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-sm shrink-0"
                        title={isSidebarOpen ? "Ocultar menú lateral" : "Expandir menú lateral"}
                    >
                        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto hide-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const currentTab = new URLSearchParams(location.search).get('tab');
                        const isActive = item.tab 
                            ? (location.pathname === '/dashboard' && currentTab === item.tab)
                            : (location.pathname === item.path && (!currentTab || item.path !== '/dashboard'));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-[#0A58CA] text-white shadow-lg shadow-blue-500/25'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                                }`}
                                title={!isSidebarOpen ? item.title : undefined}
                            >
                                <Icon size={20} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                                {isSidebarOpen && <span className="truncate">{item.title}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer: Profile & Logout */}
                <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
                    <Link
                        to="/perfil"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                            location.pathname === '/perfil' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`}
                        title={!isSidebarOpen ? "Mi Perfil" : undefined}
                    >
                        <Settings size={20} className="shrink-0" />
                        {isSidebarOpen && <span className="text-sm font-semibold truncate">Mi Perfil</span>}
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all mt-1"
                        title={!isSidebarOpen ? "Cerrar Sesión" : undefined}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {isSidebarOpen && <span className="text-sm font-semibold truncate">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* 2. MAIN APP CONTENT CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
                
                {/* Top Header Bar */}
                <header className="h-16 md:h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-xs z-20">
                    
                    {/* Left Actions: Hamburger Toggle */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Menu size={22} />
                        </button>

                        {/* Desktop Toggle Button when sidebar collapsed */}
                        {!isSidebarOpen && (
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="hidden md:flex items-center gap-2 p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-semibold text-xs"
                                title="Mostrar menú lateral"
                            >
                                <Menu size={18} />
                                <span>Menú</span>
                            </button>
                        )}

                        <span className="font-bold text-slate-800 text-base md:text-xl font-serif tracking-tight hidden sm:inline">
                            Panel de Administración
                        </span>
                    </div>

                    {/* Right Actions Header */}
                    <div className="flex items-center gap-3 md:gap-5">
                        <Link 
                            to="/reservar" 
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-xs font-semibold"
                            title="Ir a la vista pública de reservas"
                        >
                            <Home size={16} />
                            <span className="hidden md:inline">Ver Web Pública</span>
                        </Link>

                        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

                        {/* User Avatar Action */}
                        <div 
                            onClick={() => navigate('/perfil')}
                            className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-2xl transition-all border border-transparent hover:border-slate-200"
                            title="Ver mi perfil"
                        >
                            <div className="h-9 w-9 rounded-xl bg-[#0A58CA] text-white font-bold text-xs flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                                {user?.profile_picture ? (
                                    <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    (user?.name || user?.email || 'A').charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-800 leading-tight">{user?.name || user?.email}</span>
                                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                    <Shield size={10} className="text-[#0A58CA]" />
                                    {user?.role || 'ADMIN'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Drawer Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Slide-Out Drawer */}
                <div className={`fixed top-0 left-0 h-full w-[280px] bg-[#0F172A] text-slate-200 z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-5 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <img src="/images/logoLuan.jpeg" alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                            <span className="font-bold text-base text-white">LUAN STUDIO Admin</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                            <X size={22} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const currentTab = new URLSearchParams(location.search).get('tab');
                            const isActive = item.tab 
                                ? (location.pathname === '/dashboard' && currentTab === item.tab)
                                : (location.pathname === item.path && (!currentTab || item.path !== '/dashboard'));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                        isActive
                                            ? 'bg-[#0A58CA] text-white shadow-md'
                                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <Icon size={20} />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}

                        <div className="h-px bg-slate-800 w-full my-4" />

                        <Link 
                            to="/perfil" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-[#0A58CA] transition-colors"
                        >
                            <Settings size={20} />
                            <span>Mi Perfil</span>
                        </Link>
                        <Link 
                            to="/reservar" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <Home size={20} />
                            <span>Ver Web Pública</span>
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>

                {/* 3. MAIN PAGE CONTENT */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC]">
                    <div className="min-h-full w-full">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
};

export default Navbar;