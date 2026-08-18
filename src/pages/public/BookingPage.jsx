import React, { useState, useMemo } from 'react';
import { toast } from '../../components/ui/use-toast';
import { 
    ChevronLeft, ChevronRight, 
    User, Loader2, Check, Calendar, ShoppingBag, Sparkles
} from 'lucide-react';
import { 
    useGetPublicProfessionalsQuery, 
    useGetAvailableSlotsQuery, 
    useCreatePublicAppointmentMutation 
} from '../../services/api/kinesioApi.js';
import { useLogoutMutation } from '../../services/api/authApi.js';
import { useGetUserQuery } from '../../services/api/userApi.js';
import { logout } from '../../services/auth/authSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/es';
import PublicNavbar from '../../components/nav/PublicNavbar.jsx';

moment.locale('es');

// Service cover images mapping
const serviceImages = {
    'Manicure Clásica': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop',
    'Pedicure Spa': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=600&auto=format&fit=crop',
    'Nail Art Diseño': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
    'Esmaltado Semipermanente': 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=600&auto=format&fit=crop',
    'Uñas Esculpidas': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop'
};

const defaultServiceImage = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop';

export default function BookingPage() {
    const [selectedService, setSelectedService] = useState(null);
    const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const userInfo = useSelector((state) => state.authSlice?.userInfo);
    const accessToken = useSelector((state) => state.authSlice?.accessToken);

    // Fetch user info if logged in so we can prepopulate the booking form
    useGetUserQuery(undefined, { skip: !accessToken });

    const [logoutApi] = useLogoutMutation();

    React.useEffect(() => {
        if (userInfo) {
            if (userInfo.firstName || userInfo.lastName) {
                setPatientName(`${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim());
            }
            if (userInfo.email) {
                setPatientEmail(userInfo.email);
            }
        }
    }, [userInfo]);

    // Handle redirect success from MercadoPago
    React.useEffect(() => {
        const successParam = searchParams.get('success');
        if (successParam) {
            if (successParam === 'true' || successParam === 'pending') {
                setIsSuccess(true);
                setShowModal(true);
            } else if (successParam === 'false') {
                toast({ title: 'Atención', description: 'El pago no pudo completarse. Por favor, intenta de nuevo.', variant: 'destructive' });
            }
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Queries
    const { data: profData, isLoading: isLoadingProfs } = useGetPublicProfessionalsQuery();
    const professionals = profData?.data || [];

    const allSpecialties = useMemo(() => {
        const specs = new Set();
        professionals.forEach(p => {
            if (p.specialty && Array.isArray(p.specialty)) {
                p.specialty.forEach(s => specs.add(s));
            } else if (p.specialty && typeof p.specialty === 'string') {
                specs.add(p.specialty);
            }
        });
        if (specs.size === 0) {
            specs.add('Manicure Clásica');
            specs.add('Pedicure Spa');
            specs.add('Nail Art Diseño');
        }
        return Array.from(specs);
    }, [professionals]);

    React.useEffect(() => {
        if (!selectedService && allSpecialties.length > 0) {
            setSelectedService(allSpecialties[0]);
        }
    }, [allSpecialties, selectedService]);

    const filteredProfessionals = useMemo(() => {
        if (!selectedService) return professionals;
        const filtered = professionals.filter(p => {
            if (p.specialty && Array.isArray(p.specialty)) {
                return p.specialty.includes(selectedService);
            } else if (p.specialty && typeof p.specialty === 'string') {
                return p.specialty === selectedService;
            }
            return true;
        });
        return filtered.length > 0 ? filtered : professionals;
    }, [professionals, selectedService]);

    const { data: slotsData, isLoading: isLoadingSlots, isFetching: isFetchingSlots } = useGetAvailableSlotsQuery(
        { professional_id: selectedSpecialistId, date: selectedDate?.date, service: selectedService },
        { skip: !selectedSpecialistId || !selectedDate }
    );
    const availableSlots = slotsData?.data || [];

    const [createAppointment, { isLoading: isCreating }] = useCreatePublicAppointmentMutation();

    // Generate days
    const days = useMemo(() => {
        const d = [];
        const startOfWeek = moment().startOf('isoWeek').add(weekOffset, 'weeks');
        for(let i=0; i<5; i++) {
            const current = moment(startOfWeek).add(i, 'days');
            d.push({
                day: current.format('ddd').toUpperCase().slice(0, 3), // LUN, MAR, MIÉ
                date: current.format('YYYY-MM-DD'),
                displayNum: current.format('D'),
                fullDisplay: current.format('ddd D [Agosto], YYYY')
            });
        }
        return d;
    }, [weekOffset]);

    const handleConfirmClick = () => {
        if (!selectedSpecialistId || !selectedDate || !selectedTime) return;
        setShowModal(true);
    };

    const handleSubmitAppointment = async () => {
        if (!patientName || !patientPhone) return;
        try {
            const response = await createAppointment({
                professional_id: selectedSpecialistId,
                date: selectedDate.date,
                time: selectedTime,
                service: selectedService,
                patient_name: patientName,
                patient_phone: patientPhone,
                patient_email: patientEmail
            }).unwrap();

            if (response.init_point) {
                window.location.href = response.init_point;
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setIsSuccess(false);
                setSelectedTime(null);
                setPatientName('');
                setPatientPhone('');
            }, 3000);
        } catch (error) {
            toast({ title: 'Error', description: error?.data?.message || 'Error al confirmar el turno', variant: 'destructive' });
        }
    };

    const selectedSpecialist = professionals.find(p => p.id === selectedSpecialistId);
    const requiresPayment = selectedSpecialist && selectedSpecialist.require_payment && selectedSpecialist.session_fee > 0 && !!selectedSpecialist.mp_access_token;
    const sessionFee = selectedSpecialist?.session_fee || 1500;
    
    const currentMonthLabel = moment().startOf('isoWeek').add(weekOffset, 'weeks').format('MMMM YYYY');
    const isReadyToConfirm = selectedSpecialistId && selectedDate && selectedTime;

    return (
        <div className="bg-[#F8F5EE] min-h-screen font-sans text-[#3D1A20] pb-24 md:pb-20 pt-16 sm:pt-20">
            {/* Header Navbar */}
            <PublicNavbar />

            {/* Main Content Area */}
            <main className="max-w-[1400px] mx-auto px-4 md:px-12 pt-6 md:pt-8 pb-16">
                
                {/* Title & Subtitle Section */}
                <div className="mb-6 md:mb-8 text-center md:text-left border-b border-[#E5D8CC] pb-6">
                    <h1 
                        className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#3D1A20] mb-2 tracking-tight"
                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                        Luan Studio - Reservar Turno
                    </h1>
                    <p className="text-[#3D1A20]/80 text-xs sm:text-sm md:text-base font-normal max-w-xl mx-auto md:mx-0">
                        Siga los pasos a continuación para programar su sesión con nuestros especialistas en uñas y estética.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                    
                    {/* Left Column: Steps 1, 2, 3 */}
                    <div className="lg:col-span-8 space-y-8 md:space-y-10">
                        
                        {/* STEP 1: Seleccione un Servicio */}
                        <div>
                            <div className="flex items-center gap-3 mb-4 md:mb-5">
                                <div className="w-7 h-7 rounded-full bg-[#3D1A20] text-[#E8DDD3] flex items-center justify-center font-bold text-xs font-serif shadow-sm">
                                    1
                                </div>
                                <h2 
                                    className="text-lg md:text-2xl font-bold text-[#3D1A20]"
                                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                >
                                    Seleccione un Servicio
                                </h2>
                            </div>
                            
                            {/* Horizontal Scroll on Mobile / Grid on Desktop */}
                            <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-x-auto pb-4 sm:pb-0 scrollbar-none snap-x">
                                {allSpecialties.map((spec) => {
                                    const isSelected = selectedService === spec;
                                    const imgSrc = serviceImages[spec] || defaultServiceImage;

                                    return (
                                        <div 
                                            key={spec}
                                            onClick={() => { 
                                                setSelectedService(spec); 
                                                setSelectedSpecialistId(null); 
                                                setSelectedTime(null); 
                                            }}
                                            className={`min-w-[145px] sm:min-w-0 snap-start flex-1 p-3 md:p-4 rounded-2xl bg-[#FFFDF9] border-2 cursor-pointer transition-all duration-300 relative flex flex-col items-center text-center shadow-sm ${
                                                isSelected ? 'border-[#3D1A20] ring-1 ring-[#3D1A20]/30 shadow-md' : 'border-[#E8DDD3] hover:border-[#3D1A20]/40'
                                            }`}
                                        >
                                            {/* Photo Box */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden mb-3 bg-[#E8DDD3] relative shadow-inner">
                                                <img 
                                                    src={imgSrc} 
                                                    alt={spec} 
                                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                                />
                                            </div>

                                            {/* Title & Subtitle */}
                                            <h3 
                                                className="font-bold text-xs md:text-sm text-[#3D1A20] leading-tight mb-1"
                                                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                            >
                                                {spec}
                                            </h3>
                                            <span className="text-[10px] text-[#3D1A20]/60 font-medium">
                                                {spec.includes('Pedicure') ? 'Cuidado Total' : 'Servicio Base'}
                                            </span>

                                            {/* Selected Checkmark Badge */}
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 sm:bottom-2 sm:right-2 bg-[#3D1A20] text-[#E8DDD3] w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-[#E8DDD3]">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* STEP 2: Elija un Especialista */}
                        <div>
                            <div className="flex items-center gap-3 mb-4 md:mb-5">
                                <div className="w-7 h-7 rounded-full bg-[#3D1A20] text-[#E8DDD3] flex items-center justify-center font-bold text-xs font-serif shadow-sm">
                                    2
                                </div>
                                <h2 
                                    className="text-lg md:text-2xl font-bold text-[#3D1A20]"
                                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                >
                                    Elija un Especialista
                                </h2>
                            </div>
                            
                            {isLoadingProfs ? (
                                <div className="flex items-center gap-2 text-[#3D1A20]/70 py-4 font-medium text-xs md:text-sm">
                                    <Loader2 className="animate-spin" size={18}/> Cargando especialistas...
                                </div>
                            ) : filteredProfessionals.length === 0 ? (
                                <p className="text-[#3D1A20]/60 text-xs italic">No hay especialistas disponibles para este servicio.</p>
                            ) : (
                                <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto pb-4 sm:pb-0 scrollbar-none snap-x">
                                    {filteredProfessionals.map(prof => {
                                        const isSelected = selectedSpecialistId === prof.id;
                                        return (
                                            <div 
                                                key={prof.id}
                                                onClick={() => { setSelectedSpecialistId(prof.id); setSelectedTime(null); }}
                                                className={`min-w-[145px] sm:min-w-0 snap-start flex-1 p-3 md:p-5 rounded-2xl bg-[#FFFDF9] border-2 cursor-pointer transition-all duration-300 relative flex flex-col items-center text-center shadow-sm ${
                                                    isSelected ? 'border-[#3D1A20] ring-1 ring-[#3D1A20]/30 shadow-md' : 'border-[#E8DDD3] hover:border-[#3D1A20]/40'
                                                }`}
                                            >
                                                {/* Circular Avatar */}
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 border border-[#D8C7B8] p-1 bg-[#F8F5EE] flex items-center justify-center shadow-inner">
                                                    {prof.profile_picture ? (
                                                        <img src={prof.profile_picture} alt={prof.name} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <User size={28} className="text-[#3D1A20]/50" />
                                                    )}
                                                </div>

                                                {/* Name */}
                                                <h3 
                                                    className="font-bold text-xs md:text-sm text-[#3D1A20] leading-tight mb-1"
                                                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                                >
                                                    {prof.name || prof.email}
                                                </h3>

                                                {/* Specialty Badge */}
                                                <span className="text-[10px] text-[#3D1A20]/60 font-medium">
                                                    {Array.isArray(prof.specialty) ? prof.specialty.join(', ') : (prof.specialty || 'Especialista en Uñas')}
                                                </span>

                                                {/* Selected Badge */}
                                                {isSelected && (
                                                    <div className="absolute -bottom-1 -right-1 sm:bottom-2 sm:right-2 bg-[#3D1A20] text-[#E8DDD3] w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-[#E8DDD3]">
                                                        <Check size={14} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* STEP 3: Fecha y Hora */}
                        <div>
                            <div className="flex items-center gap-3 mb-4 md:mb-5">
                                <div className="w-7 h-7 rounded-full bg-[#3D1A20] text-[#E8DDD3] flex items-center justify-center font-bold text-xs font-serif shadow-sm">
                                    3
                                </div>
                                <h2 
                                    className="text-lg md:text-2xl font-bold text-[#3D1A20]"
                                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                >
                                    Fecha y Hora
                                </h2>
                            </div>
                            
                            <div className={`border border-[#E8DDD3] rounded-2xl p-4 md:p-6 bg-[#FFFDF9] shadow-sm transition-all ${!selectedSpecialistId ? 'opacity-50 pointer-events-none' : ''}`}>
                                
                                {/* Calendar Month Selector */}
                                <div className="flex items-center justify-between mb-5">
                                    <button 
                                        onClick={() => setWeekOffset(w => w - 1)} 
                                        className="p-1.5 hover:bg-[#E8DDD3]/40 rounded-full transition-colors text-[#3D1A20]"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    
                                    <h3 
                                        className="font-bold text-base md:text-xl text-[#3D1A20] capitalize"
                                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                    >
                                        {currentMonthLabel}
                                    </h3>
                                    
                                    <button 
                                        onClick={() => setWeekOffset(w => w + 1)} 
                                        className="p-1.5 hover:bg-[#E8DDD3]/40 rounded-full transition-colors text-[#3D1A20]"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                                
                                {/* Days Selector Row */}
                                <div className="grid grid-cols-5 gap-2 mb-6">
                                    {days.map((d) => {
                                        const isSelected = selectedDate?.date === d.date;
                                        return (
                                            <div 
                                                key={d.date} 
                                                onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                                className={`flex flex-col items-center justify-center py-2.5 rounded-xl cursor-pointer transition-all ${
                                                    isSelected ? 'bg-[#3D1A20] text-[#E8DDD3] shadow-md font-bold' : 'text-[#3D1A20] hover:bg-[#E8DDD3]/30 border border-[#E8DDD3]/40'
                                                }`}
                                            >
                                                <span className="text-[10px] md:text-xs uppercase tracking-wider mb-1 font-medium">{d.day}</span>
                                                <span className="text-base md:text-xl font-bold">{d.displayNum}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Available Times Grid */}
                                <div>
                                    <h4 className="text-xs md:text-sm text-[#3D1A20] font-bold tracking-wide mb-3">Horarios Disponibles</h4>
                                    {(!selectedSpecialistId || !selectedDate) ? (
                                        <p className="text-xs text-[#3D1A20]/60 italic">Seleccione un especialista y una fecha para ver horarios.</p>
                                    ) : isFetchingSlots || isLoadingSlots ? (
                                        <div className="flex items-center gap-2 text-[#3D1A20]/70 text-xs font-medium">
                                            <Loader2 className="animate-spin" size={14}/> Buscando disponibilidad...
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <p className="text-xs text-red-600 font-medium">No hay horarios libres este día.</p>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                                            {availableSlots.map((time) => {
                                                const isSelected = selectedTime === time;
                                                return (
                                                    <button 
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                                                            isSelected ? 'border-[#3D1A20] bg-[#3D1A20] text-[#E8DDD3] shadow-md' : 'border-[#E8DDD3] text-[#3D1A20] bg-white hover:border-[#3D1A20]'
                                                        }`}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* Right Column: Resumen de Turno (Card) */}
                    <div className="lg:col-span-4 sticky top-24">
                        <div className="bg-[#FFFDF9] border-2 border-[#E8DDD3] rounded-3xl p-5 md:p-8 shadow-xl relative overflow-hidden">
                            
                            {/* Decorative Corner Icons */}
                            <div className="flex justify-between text-[#3D1A20]/30 text-xs font-serif mb-2">
                                <span>✦</span>
                                <span>✦</span>
                            </div>

                            {/* Title */}
                            <h2 
                                className="text-xl md:text-3xl font-bold text-[#3D1A20] mb-5 text-center"
                                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                            >
                                Resumen de Turno
                            </h2>

                            <div className="space-y-3 mb-5 text-xs md:text-base border-b border-[#E8DDD3] pb-5">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[#3D1A20]/70">Servicio:</span>
                                    <span className="font-bold text-[#3D1A20] text-right">{selectedService || '-'}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[#3D1A20]/70">Especialista:</span>
                                    <span className="font-bold text-[#3D1A20] text-right">
                                        {selectedSpecialist ? (selectedSpecialist.name || selectedSpecialist.email) : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[#3D1A20]/70">Fecha:</span>
                                    <span className="font-bold text-[#3D1A20] text-right capitalize">
                                        {selectedDate ? selectedDate.fullDisplay : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[#3D1A20]/70">Hora:</span>
                                    <span className="font-bold text-[#3D1A20] text-right">{selectedTime || '-'}</span>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            {requiresPayment && (
                                <div className="space-y-2 mb-6 text-xs md:text-base">
                                    <div className="flex justify-between items-center text-[#3D1A20]/80">
                                        <span>Servicio:</span>
                                        <span className="font-semibold">${sessionFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[#3D1A20]/80">
                                        <span>Especialista:</span>
                                        <span className="font-semibold">$0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-base md:text-xl font-bold text-[#3D1A20] pt-2 border-t border-[#E8DDD3]/60">
                                        <span>Total</span>
                                        <span className="text-lg md:text-2xl">${sessionFee}</span>
                                    </div>
                                </div>
                            )}

                            {/* Confirm Button */}
                            <button 
                                onClick={handleConfirmClick}
                                disabled={!isReadyToConfirm}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm md:text-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${
                                    isReadyToConfirm 
                                        ? 'bg-[#3D1A20] text-[#E8DDD3] hover:bg-[#2E1318] shadow-lg transform hover:scale-[1.02]' 
                                        : 'bg-[#E8DDD3] text-[#3D1A20]/40 cursor-not-allowed'
                                }`}
                                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                            >
                                Confirmar Turno →
                            </button>
                            
                            <p className="text-center text-[10px] md:text-xs text-[#3D1A20]/60 mt-3 leading-relaxed">
                                Al confirmar, acepta nuestras políticas de cancelación.
                            </p>

                            <div className="flex justify-between text-[#3D1A20]/30 text-xs font-serif mt-2">
                                <span>✦</span>
                                <span>✦</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#FFFDF9] border-t border-[#E8DDD3] py-2 px-6 flex justify-around items-center md:hidden z-40 shadow-lg">
                <button 
                    onClick={() => navigate('/reservar')}
                    className="flex flex-col items-center text-[#3D1A20] text-[10px] font-bold"
                >
                    <Calendar size={18} />
                    <span>Book</span>
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center text-[#3D1A20]/60 text-[10px] font-semibold hover:text-[#3D1A20]"
                >
                    <Sparkles size={18} />
                    <span>Services</span>
                </button>
                <button 
                    onClick={() => navigate('/productos')}
                    className="flex flex-col items-center text-[#3D1A20]/60 text-[10px] font-semibold hover:text-[#3D1A20]"
                >
                    <ShoppingBag size={18} />
                    <span>Shop</span>
                </button>
                <button 
                    onClick={() => navigate('/mis-turnos')}
                    className="flex flex-col items-center text-[#3D1A20]/60 text-[10px] font-semibold hover:text-[#3D1A20]"
                >
                    <User size={18} />
                    <span>Account</span>
                </button>
            </div>

            {/* Modal de confirmación final */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-[#FFFDF9] border border-[#E8DDD3] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl text-[#3D1A20]">
                        {isSuccess ? (
                            <div className="flex flex-col items-center py-6 text-center">
                                <div className="w-16 h-16 bg-[#3D1A20] text-[#E8DDD3] rounded-full flex items-center justify-center mb-4 shadow-lg">
                                    <Check size={32} strokeWidth={3} />
                                </div>
                                <h3 
                                    className="text-2xl font-bold mb-2"
                                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                >
                                    ¡Turno Confirmado!
                                </h3>
                                <p className="text-[#3D1A20]/70 text-sm">Tu reserva ha sido guardada exitosamente. Te esperamos.</p>
                            </div>
                        ) : (
                            <>
                                <h3 
                                    className="text-2xl font-bold mb-2 text-center"
                                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                                >
                                    Completa tu Reserva
                                </h3>
                                <p className="text-[#3D1A20]/70 text-sm mb-6 text-center">Ingresa tus datos para finalizar la confirmación del turno.</p>
                                
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            placeholder="Ej. Sofía Pérez"
                                            className="w-full border border-[#E8DDD3] bg-white rounded-xl px-4 py-3 outline-none focus:border-[#3D1A20] focus:ring-1 focus:ring-[#3D1A20] text-sm" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider mb-1">Teléfono</label>
                                            <input 
                                                type="tel" 
                                                value={patientPhone}
                                                onChange={(e) => setPatientPhone(e.target.value)}
                                                placeholder="Ej. 1122334455"
                                                className="w-full border border-[#E8DDD3] bg-white rounded-xl px-4 py-3 outline-none focus:border-[#3D1A20] focus:ring-1 focus:ring-[#3D1A20] text-sm" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                value={patientEmail}
                                                onChange={(e) => setPatientEmail(e.target.value)}
                                                placeholder="tu@email.com"
                                                className="w-full border border-[#E8DDD3] bg-white rounded-xl px-4 py-3 outline-none focus:border-[#3D1A20] focus:ring-1 focus:ring-[#3D1A20] text-sm" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {requiresPayment && (
                                    <div className="mb-6 p-4 bg-[#E8DDD3]/40 border border-[#E8DDD3] rounded-xl text-center">
                                        <p className="text-xs text-[#3D1A20] font-medium">
                                            Se requiere abonar un monto de <strong>${sessionFee}</strong> para reservar el turno.
                                            <br/>Serás redirigido a MercadoPago.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-[#E8DDD3] text-[#3D1A20] rounded-xl font-bold hover:bg-[#D8C7B8] transition-colors text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleSubmitAppointment}
                                        disabled={isCreating || !patientName || !patientPhone}
                                        className="flex-1 py-3 bg-[#3D1A20] text-[#E8DDD3] rounded-xl font-bold hover:bg-[#2E1318] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 text-sm uppercase tracking-wider"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin" size={18} /> : (requiresPayment ? 'Proceder al Pago' : 'Finalizar')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
