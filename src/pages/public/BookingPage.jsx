import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from '../../components/ui/use-toast';
import { 
    ChevronLeft, ChevronRight, 
    User, Loader2, Check, Calendar, ArrowLeft, ArrowRight, Printer, AlertCircle
} from 'lucide-react';
import { 
    useGetPublicProfessionalsQuery, 
    useGetAvailableSlotsQuery, 
    useCreatePublicAppointmentMutation 
} from '../../services/api/kinesioApi.js';
import { useGetUserQuery } from '../../services/api/userApi.js';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/es';
import PublicNavbar from '../../components/nav/PublicNavbar.jsx';

moment.locale('es');

export default function BookingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    
    // Step 1 States
    const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    
    // Step 2 States
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [patientData, setPatientData] = useState({
        nombre: '',
        dni: '',
        telefono: '',
        email: ''
    });

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const userInfo = useSelector((state) => state.authSlice?.userInfo);
    const accessToken = useSelector((state) => state.authSlice?.accessToken);
    const printFrameRef = useRef(null);

    useGetUserQuery(undefined, { skip: !accessToken });

    useEffect(() => {
        if (userInfo) {
            setPatientData(prev => ({
                ...prev,
                nombre: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || prev.nombre,
                email: userInfo.email || prev.email
            }));
        }
    }, [userInfo]);

    useEffect(() => {
        const successParam = searchParams.get('success');
        if (successParam) {
            if (successParam === 'true' || successParam === 'pending') {
                setIsSuccess(true);
                setShowModal(true);
            } else if (successParam === 'false') {
                toast({ title: 'Atención', description: 'El pago no pudo completarse.', variant: 'destructive' });
            }
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Queries
    const { data: profData, isLoading: isLoadingProfs } = useGetPublicProfessionalsQuery();
    const professionals = profData?.data || [];
    const selectedSpecialist = professionals.find(p => p.id === selectedSpecialistId);

    const { data: slotsData, isLoading: isLoadingSlots, isFetching: isFetchingSlots } = useGetAvailableSlotsQuery(
        { professional_id: selectedSpecialistId, date: selectedDate?.date, service: selectedService },
        { skip: !selectedSpecialistId || !selectedDate }
    );
    const availableSlots = slotsData?.data || [];

    const [createAppointment, { isLoading: isCreating }] = useCreatePublicAppointmentMutation();

    // Logic Functions
    const handleSelectProfessional = (prof) => {
        setSelectedSpecialistId(prof.id);
        const spec = Array.isArray(prof.specialty) ? prof.specialty[0] : (prof.specialty || 'Servicio de Belleza');
        setSelectedService(spec);
        setSelectedTime(null);
        setSelectedDate(null);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const generateWeekDays = () => {
        const d = [];
        const startOfWeek = moment().startOf('isoWeek').add(weekOffset, 'weeks');
        for(let i=0; i<5; i++) { // Lunes a Viernes
            const current = moment(startOfWeek).add(i, 'days');
            d.push({
                dayShort: current.format('ddd').toUpperCase().slice(0, 3),
                date: current.format('YYYY-MM-DD'),
                displayNum: current.format('D'),
                fullDisplay: current.format('dddd D [de] MMMM'),
                isPast: current.isBefore(moment(), 'day')
            });
        }
        return d;
    };
    const days = useMemo(() => generateWeekDays(), [weekOffset]);
    const currentMonthLabel = moment().startOf('isoWeek').add(weekOffset, 'weeks').format('MMMM YYYY');

    const handleConfirmSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createAppointment({
                professional_id: selectedSpecialistId,
                date: selectedDate.date,
                time: selectedTime,
                service: selectedService,
                patient_name: patientData.nombre,
                patient_phone: patientData.telefono,
                patient_email: patientData.email,
                // DNI sent as part of data if backend supports it
            }).unwrap();

            if (response.init_point) {
                window.location.href = response.init_point;
                return;
            }

            setIsSuccess(true);
        } catch (error) {
            toast({ title: 'Error', description: error?.data?.message || 'Error al confirmar el turno', variant: 'destructive' });
        }
    };

    const handlePrintTicket = () => {
        const content = `
            <html>
                <head>
                    <title>Comprobante de Turno</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                        .ticket { border: 2px dashed #ccc; padding: 30px; max-width: 400px; margin: 0 auto; border-radius: 12px; }
                        h1 { color: #0f172a; font-size: 24px; text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
                        .detail { margin: 15px 0; font-size: 16px; }
                        .label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
                        .value { font-weight: bold; color: #0f172a; }
                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <h1>Luana Studio</h1>
                        <div class="detail"><span class="label">Paciente</span><span class="value">${patientData.nombre}</span></div>
                        <div class="detail"><span class="label">Servicio</span><span class="value">${selectedService}</span></div>
                        <div class="detail"><span class="label">Especialista</span><span class="value">${selectedSpecialist?.name}</span></div>
                        <div class="detail"><span class="label">Fecha</span><span class="value">${selectedDate?.fullDisplay}</span></div>
                        <div class="detail"><span class="label">Hora</span><span class="value">${selectedTime} hs</span></div>
                        <div class="footer">¡Gracias por elegirnos! Te esperamos.</div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `;
        
        if (printFrameRef.current) {
            const doc = printFrameRef.current.contentDocument || printFrameRef.current.contentWindow.document;
            doc.open();
            doc.write(content);
            doc.close();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 pt-16">
            <PublicNavbar />
            <iframe ref={printFrameRef} style={{ display: 'none' }} title="print-frame" />

            <main className="max-w-5xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
                
                {/* Header & Progress */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Reservar Turno</h1>
                    <div className="flex justify-between max-w-lg mx-auto gap-3">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex-1">
                                <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${currentStep >= step ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                                <p className={`text-[10px] md:text-xs mt-2 font-bold uppercase tracking-wider transition-colors duration-300 ${currentStep >= step ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step === 1 ? 'Especialista' : step === 2 ? 'Fecha y Hora' : 'Confirmación'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] relative">
                    
                    {/* WIZARD CONTENT */}
                    <div className="p-6 md:p-10">
                        {/* STEP 1: PROFESIONALES */}
                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Elegí tu Especialista</h2>
                                    <p className="text-gray-500 text-sm">Selecciona al profesional con el que deseas agendar tu cita.</p>
                                </div>

                                {isLoadingProfs ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <Loader2 className="animate-spin w-10 h-10 mb-4 text-gray-900"/>
                                        <p className="font-medium">Cargando especialistas...</p>
                                    </div>
                                ) : professionals.length === 0 ? (
                                    <div className="text-center py-20">
                                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No hay especialistas disponibles en este momento.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                                        {professionals.map(prof => {
                                            const isSelected = selectedSpecialistId === prof.id;
                                            return (
                                                <div 
                                                    key={prof.id}
                                                    onClick={() => handleSelectProfessional(prof)}
                                                    className={`group p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-2 flex flex-col items-center text-center relative bg-white ${
                                                        isSelected ? 'border-gray-900 ring-4 ring-gray-900/5' : 'border-gray-100'
                                                    }`}
                                                >
                                                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center">
                                                        {prof.profile_picture ? (
                                                            <img src={prof.profile_picture} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"/>
                                                        ) : (
                                                            <User className="w-8 h-8 md:w-10 md:h-10 text-gray-300"/>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 text-sm md:text-lg mb-1">{prof.name || prof.email}</h3>
                                                    <span className="bg-gray-100 text-gray-600 text-[10px] md:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                                        {Array.isArray(prof.specialty) ? prof.specialty[0] : (prof.specialty || 'Especialista')}
                                                    </span>
                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3 bg-gray-900 text-white rounded-full p-1 shadow-md animate-in zoom-in">
                                                            <Check size={14} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                <div className="flex justify-end pt-4 border-t border-gray-100 mt-auto">
                                    <button 
                                        onClick={nextStep}
                                        disabled={!selectedSpecialistId}
                                        className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20"
                                    >
                                        Siguiente Paso <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: FECHA Y HORA */}
                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Fecha y Hora</h2>
                                    <p className="text-gray-500 text-sm">Seleccioná un día y un horario disponible para tu turno.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 flex-1">
                                    {/* CALENDAR */}
                                    <div>
                                        <div className="flex items-center justify-between mb-6 bg-gray-50 p-2 rounded-2xl">
                                            <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 hover:bg-white rounded-xl shadow-sm transition-all text-gray-600">
                                                <ChevronLeft size={20} />
                                            </button>
                                            <h3 className="font-bold text-gray-900 capitalize text-sm md:text-base tracking-wide">
                                                {currentMonthLabel}
                                            </h3>
                                            <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 hover:bg-white rounded-xl shadow-sm transition-all text-gray-600">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-5 gap-2 md:gap-3">
                                            {days.map((d) => {
                                                const isSelected = selectedDate?.date === d.date;
                                                const isBlocked = d.isPast;
                                                return (
                                                    <button 
                                                        key={d.date} 
                                                        disabled={isBlocked}
                                                        onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                                        className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-300 relative border-2 ${
                                                            isBlocked ? 'opacity-40 cursor-not-allowed bg-gray-50 border-transparent grayscale' :
                                                            isSelected ? 'bg-gray-900 border-gray-900 text-white shadow-lg transform -translate-y-1' : 
                                                            'bg-white border-gray-100 text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>{d.dayShort}</span>
                                                        <span className="text-xl md:text-2xl font-extrabold">{d.displayNum}</span>
                                                        {isBlocked && <div className="absolute w-full h-px bg-gray-400 rotate-45 transform origin-center opacity-50"></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* TIMESLOTS */}
                                    <div className="bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 flex flex-col">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400"/> Horarios
                                        </h4>
                                        
                                        <div className="flex-1 flex flex-col justify-center">
                                            {!selectedDate ? (
                                                <div className="text-center text-gray-400 flex flex-col items-center">
                                                    <Calendar size={48} strokeWidth={1} className="mb-4 opacity-50"/>
                                                    <p className="text-sm font-medium">Seleccioná un día para ver la disponibilidad</p>
                                                </div>
                                            ) : isFetchingSlots || isLoadingSlots ? (
                                                <div className="text-center text-gray-400 flex flex-col items-center">
                                                    <Loader2 className="animate-spin w-8 h-8 mb-4 text-gray-900"/>
                                                    <p className="text-sm font-medium text-gray-500">Buscando horarios...</p>
                                                </div>
                                            ) : availableSlots.length === 0 ? (
                                                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-start gap-3 border border-yellow-200">
                                                    <AlertCircle size={20} className="shrink-0 mt-0.5 text-yellow-600"/>
                                                    <p className="text-sm font-medium">Lo sentimos, no hay turnos disponibles para este día. Por favor, intentá con otra fecha.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-in fade-in zoom-in-95 duration-300">
                                                    {availableSlots.map((time) => {
                                                        const isSelected = selectedTime === time;
                                                        return (
                                                            <button 
                                                                key={time}
                                                                onClick={() => setSelectedTime(time)}
                                                                className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                                                                    isSelected ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900'
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

                                <div className="flex flex-col-reverse md:flex-row justify-between pt-6 border-t border-gray-100 mt-8 gap-3">
                                    <button 
                                        onClick={prevStep}
                                        className="w-full md:w-auto bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <ArrowLeft size={18} /> Atrás
                                    </button>
                                    <button 
                                        onClick={nextStep}
                                        disabled={!selectedTime}
                                        className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20"
                                    >
                                        Continuar <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: RESUMEN */}
                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="mb-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumen de tu Turno</h2>
                                    <p className="text-gray-500 text-sm">Verificá que todo esté correcto antes de confirmar.</p>
                                </div>

                                <div className="max-w-2xl mx-auto bg-gray-900 text-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden mb-10">
                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gray-800 shadow-xl shrink-0 bg-gray-800 flex items-center justify-center">
                                            {selectedSpecialist?.profile_picture ? (
                                                <img src={selectedSpecialist.profile_picture} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-500"/>
                                            )}
                                        </div>
                                        <div className="flex-1 w-full">
                                            <div className="inline-block px-3 py-1 bg-gray-800 rounded-full text-xs font-bold uppercase tracking-widest text-gray-300 mb-3 border border-gray-700">
                                                {selectedService}
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-extrabold mb-1">{selectedSpecialist?.name || 'Especialista'}</h3>
                                            <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-gray-800">
                                                {Array.isArray(selectedSpecialist?.specialty) ? selectedSpecialist?.specialty.join(', ') : selectedSpecialist?.specialty}
                                            </p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 flex items-center gap-4">
                                                    <div className="bg-gray-900 p-3 rounded-xl"><Calendar size={20} className="text-blue-400"/></div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Día</p>
                                                        <p className="font-bold text-sm">{selectedDate?.fullDisplay}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 flex items-center gap-4">
                                                    <div className="bg-gray-900 p-3 rounded-xl flex items-center justify-center text-blue-400 font-bold text-lg font-mono">
                                                        {selectedTime?.split(':')[0]}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hora</p>
                                                        <p className="font-bold text-sm">{selectedTime} hs</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse md:flex-row justify-center gap-4">
                                    <button 
                                        onClick={prevStep}
                                        className="w-full md:w-auto bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <ArrowLeft size={18} /> Modificar
                                    </button>
                                    <button 
                                        onClick={() => setShowModal(true)}
                                        className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-gray-900/20 transform hover:-translate-y-1"
                                    >
                                        <Check size={20} /> Confirmar Turno
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* FINAL MODAL: DATOS DEL PACIENTE / ÉXITO */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        {isSuccess ? (
                            <div className="p-10 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">¡Reserva Confirmada!</h2>
                                <p className="text-gray-500 mb-8">Tu turno fue agendado exitosamente. Te esperamos.</p>
                                
                                <div className="bg-gray-50 p-6 rounded-2xl w-full text-left mb-8 border border-gray-100">
                                    <p className="text-sm font-bold text-gray-900 mb-1">{selectedService} con {selectedSpecialist?.name}</p>
                                    <p className="text-gray-500 text-sm capitalize">{selectedDate?.fullDisplay} a las {selectedTime} hs</p>
                                </div>

                                <div className="flex flex-col w-full gap-3">
                                    <button 
                                        onClick={handlePrintTicket}
                                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Printer size={18}/> Descargar Comprobante
                                    </button>
                                    <button 
                                        onClick={() => navigate('/')}
                                        className="w-full bg-white text-gray-700 border-2 border-gray-200 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Volver al Inicio
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 md:p-10">
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tus Datos Personales</h2>
                                <p className="text-gray-500 text-sm mb-8">Completá tus datos para finalizar la reserva.</p>
                                
                                <form onSubmit={handleConfirmSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Nombre Completo</label>
                                            <input 
                                                required
                                                type="text" 
                                                value={patientData.nombre}
                                                onChange={(e) => setPatientData({...patientData, nombre: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 focus:outline-none focus:border-gray-900 focus:bg-white transition-all font-medium"
                                                placeholder="Ej. Juan Pérez"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">DNI</label>
                                            <input 
                                                required
                                                type="text" 
                                                value={patientData.dni}
                                                onChange={(e) => setPatientData({...patientData, dni: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 focus:outline-none focus:border-gray-900 focus:bg-white transition-all font-medium"
                                                placeholder="Sin puntos"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Teléfono</label>
                                            <input 
                                                required
                                                type="tel" 
                                                value={patientData.telefono}
                                                onChange={(e) => setPatientData({...patientData, telefono: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 focus:outline-none focus:border-gray-900 focus:bg-white transition-all font-medium"
                                                placeholder="Ej. 1122334455"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Email</label>
                                            <input 
                                                required
                                                type="email" 
                                                value={patientData.email}
                                                onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 focus:outline-none focus:border-gray-900 focus:bg-white transition-all font-medium"
                                                placeholder="tu@email.com"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3 pt-6 mt-2 border-t border-gray-100">
                                        <button 
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-6 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isCreating}
                                            className="flex-1 bg-gray-900 text-white rounded-xl font-bold py-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-70"
                                        >
                                            {isCreating ? <Loader2 className="animate-spin w-5 h-5"/> : 'Finalizar Reserva'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
