import {BrowserRouter as Router, Routes, Route, useLocation, Navigate} from "react-router-dom";
import NotFound from "./pages/NotFound.jsx";
import AuthVerify from "./services/auth/AuthVerify.js";
import LoginCard from "./components/auth/LoginCard.js";
import {Provider, useSelector} from "react-redux";
import {store} from "./services/store/store.js";
import {SignUpCard} from "./components/auth/SignUpCard.tsx";
import {SignUpAdminCard} from "./components/auth/SignUpAdminCard.tsx";
import Navbar from "./components/nav/Navbar.jsx";
import {TooltipProvider} from "./components/ui/tooltip.tsx";
import {useSocket} from "./services/hooks/useSocket.js";
import SocketContext from "./services/contexts/SocketContext.js";
import {ThemeProvider} from "./services/contexts/ThemeContext.tsx";
import BookingPage from "./pages/public/BookingPage.jsx";
import MyAppointments from "./components/kinesio/MyAppointments.jsx";
import Products from "./pages/Products/index.jsx";
import HOME from "./pages/Home/index.jsx";
import MisCursos from "./pages/MisCursos/MisCursos.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import CourseDetails from "./pages/ProductDetails/CourseDetails.jsx";
import ProductInventory from "./components/kinesio/ProductInventory.jsx";

import Dashboard from "./components/kinesio/Dashboard.jsx";
import AppointmentCalendar from "./components/kinesio/AppointmentCalendar.jsx";
import MedicalHistoryTimeline from "./components/kinesio/MedicalHistoryTimeline.jsx";
import PatientList from "./components/kinesio/PatientList.jsx";
import PatientProfile from "./components/kinesio/PatientProfile.jsx";
import FinancialOverview from "./components/kinesio/FinancialOverview.jsx";
import TaskList from "./components/kinesio/TaskList.jsx";
import ProfessionalList from "./components/kinesio/ProfessionalList.jsx";
import AvailabilityManager from "./components/kinesio/AvailabilityManager.jsx";
import AppointmentHistory from "./components/kinesio/AppointmentHistory.jsx";
import UserProfile from "./components/profile/UserProfile.jsx";

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Provider store={store}>
                <Router>
                    <AppContent/>
                </Router>
                <AuthVerify/>
            </Provider>
        </ThemeProvider>
    )
}

import { useState, useEffect } from "react";
import Loader from "./components/public/Loader.jsx";

const AppContent = () => {
    const location = useLocation();
    const [isAppLoading, setIsAppLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const isPublicRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/signup-admin' || location.pathname === '/reservar' || location.pathname === '/mis-turnos' || location.pathname === '/mis-cursos' || location.pathname.startsWith('/productos') || location.pathname.startsWith('/product/') || location.pathname.startsWith('/producto/');
    const showNavbar = !isPublicRoute;

    const token = useSelector(state => state.authSlice.accessToken)
    const socket = useSocket(token);

    return (
        <SocketContext.Provider value={socket}>
            <TooltipProvider>
                {showNavbar && (<Navbar>
                    <Routes>
                        <Route path="*" element={<NotFound/>} />
                        <Route path="/dashboard" element={<Dashboard/>} />
                        <Route path="/turnos" element={<AppointmentCalendar/>} />
                        <Route path="/pacientes" element={<PatientList/>} />
                        <Route path="/pacientes/:id" element={<PatientProfile/>} />
                        <Route path="/balance" element={<FinancialOverview/>} />
                        <Route path="/tareas" element={<TaskList/>} />
                        <Route path="/disponibilidad" element={<AvailabilityManager/>} />
                        <Route path="/profesionales" element={<ProfessionalList/>} />
                        <Route path="/historial/:id?" element={<MedicalHistoryTimeline/>} />
                        <Route path="/historial-turnos" element={<AppointmentHistory/>} />
                        <Route path="/perfil" element={<UserProfile/>} />
                        <Route path="/inventario" element={<ProductInventory/>} />
                    </Routes>
                </Navbar>)}
                {!showNavbar && (
                    <Routes>
                        <Route path="/" element={<HOME/>} />
                        <Route path="/login" element={<LoginCard/>} />
                        <Route path="/signup" element={<SignUpCard/>}/>
                        <Route path="/signup-admin" element={<SignUpAdminCard/>}/>
                        <Route path="/reservar" element={<BookingPage/>} />
                        <Route path="/mis-turnos" element={<MyAppointments/>} />
                        <Route path="/mis-cursos" element={<MisCursos/>} />
                        <Route path="/productos" element={<Products/>} />
                        <Route path="/productos/*" element={<Products/>} />
                        <Route path="/product/:id" element={<ProductDetails/>} />
                        <Route path="/producto/:id" element={<ProductDetails/>} />
                        <Route path="/curso/:id" element={<CourseDetails/>} />
                    </Routes>
                )}

                {/* Floating WhatsApp Button */}
                {isPublicRoute && (
                    <a 
                        href="https://wa.me/5493425547811" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 hover:shadow-[#25D366]/50 transition-all duration-300 flex items-center justify-center group"
                        aria-label="Contact us on WhatsApp"
                    >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                        </svg>
                    </a>
                )}
                <Loader fullScreen={true} isLoading={isAppLoading} />
            </TooltipProvider>
        </SocketContext.Provider>
    )
}

export default App;
