import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Filter, CalendarDays, Download, Search, HeadphonesIcon, LayoutGrid, ChevronLeft, ChevronRight, X, Check, List, History, MessageCircle, Trash2, Settings } from "lucide-react";
import {
    useGetProfessionalsQuery,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetAppointmentsQuery,
    useGetPatientsQuery,
    useCreateAppointmentMutation,
    useUpdateAppointmentMutation,
    useDeleteAppointmentMutation,
    useCreatePatientMutation,
    useGetAvailabilityQuery,
    useSendWhatsappMessageMutation
} from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast';
import { LiaCloneSolid } from 'react-icons/lia';

// Date Helpers
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Robust date parser to handle UTC properly even if backend drops the 'Z'
const parseDateString = (dateStr) => {
    if (!dateStr) return new Date();
    let d = dateStr;
    if (d.includes(' ')) d = d.replace(' ', 'T');
    if (!d.endsWith('Z') && !d.match(/[+-]\d{2}:?\d{2}$/)) {
        d += 'Z';
    }
    return new Date(d);
};

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const AppointmentCalendar = () => {

    const user = useSelector(state => state.authSlice.userInfo);
    const navigate = useNavigate();
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [selectedApptDetail, setSelectedApptDetail] = useState(null);

    // States for Date Navigation
    const [currentDate, setCurrentDate] = useState(new Date());
    const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [newAppt, setNewAppt] = useState({ patient_id: '', fecha_hora: '', duration: 30, motivo: '' });
    const [isCreatingPatient, setIsCreatingPatient] = useState(false);
    const [newPatientName, setNewPatientName] = useState('');

    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configData, setConfigData] = useState({
        whatsapp_reminder_minutes: 60,
        whatsapp_creation_template: 'Hola {{patient_name}}, tu turno para {{service}} ha sido reservado para el día {{date}} a las {{time}} hs.',
        whatsapp_reminder_template: 'Hola {{patient_name}}, te recordamos tu turno de {{service}} para hoy a las {{time}} hs.'
    });

    const [viewMode, setViewMode] = useState('Semanal');
    const [isCompact, setIsCompact] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');

    // Data Fetching
    const { data: professionalsData, isLoading: isProfLoading } = useGetProfessionalsQuery();
    const professionals = professionalsData?.data || [];
    const activeProfessionalId = (['ADMIN', 'EMPLOYEE'].includes(user?.role) && selectedProfessional) ? selectedProfessional : user?.id;

    const { data: profileData } = useGetProfileQuery(undefined, { skip: !user });
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

    // Effect to load config when modal opens or profile changes
    React.useEffect(() => {
        if (profileData?.data) {
            setConfigData({
                whatsapp_reminder_minutes: profileData.data.whatsapp_reminder_minutes || 60,
                whatsapp_creation_template: profileData.data.whatsapp_creation_template || 'Hola {{patient_name}}, tu turno para {{service}} ha sido reservado para el día {{date}} a las {{time}} hs.',
                whatsapp_reminder_template: profileData.data.whatsapp_reminder_template || 'Hola {{patient_name}}, te recordamos tu turno de {{service}} para hoy a las {{time}} hs.'
            });
        }
    }, [profileData]);

    const { data: patientsData } = useGetPatientsQuery();
    const patients = patientsData || [];

    const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
    const [updateAppointment] = useUpdateAppointmentMutation();
    const [deleteAppointment] = useDeleteAppointmentMutation();
    const [createPatient, { isLoading: isCreatingPatientLoading }] = useCreatePatientMutation();
    const [sendWhatsappMessage] = useSendWhatsappMessageMutation();

    const handleCompleteAppointment = async (id) => {
        try {
            await updateAppointment({ id, estado: 'completado' }).unwrap();
            toast({ title: 'Éxito', description: 'Turno marcado como completado' });
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'No se pudo actualizar el turno', variant: 'destructive' });
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar este turno?')) return;
        try {
            await updateAppointment({ id, estado: 'cancelado' }).unwrap();
            toast({ title: 'Éxito', description: 'Turno cancelado correctamente' });
            setSelectedApptDetail(null);
            if (isListModalOpen) setIsListModalOpen(false);
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'No se pudo cancelar el turno', variant: 'destructive' });
        }
    };

    const handleSendReminder = async (appt) => {
        const phone = appt.patient?.datos_contacto?.telefono || appt.patient?.datos_contacto?.phone;
        if (!phone) {
            toast({ title: 'Aviso', description: 'El paciente no tiene teléfono registrado.', variant: 'destructive' });
            return;
        }
        
        const date = parseDateString(appt.fecha_hora);
        const dateString = date.toLocaleDateString();
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const message = `Hola ${appt.patient?.nombre || ''}, te recordamos tu turno para el día ${dateString} a las ${timeString}. ¡Te esperamos!`;
        
        let phoneNumber = phone.replace(/\D/g, '');
        if (!phoneNumber.startsWith('54') && phoneNumber.length === 10) {
            phoneNumber = '549' + phoneNumber;
        }
        
        try {
            await sendWhatsappMessage({ phone: phoneNumber, message }).unwrap();
            toast({ title: 'Éxito', description: 'Recordatorio manual de WhatsApp enviado.' });
        } catch (error) {
            console.error('Error enviando WhatsApp:', error);
            if (error.data?.code === 'WHATSAPP_NOT_CONNECTED') {
                toast({ title: 'Error', description: 'WhatsApp no está conectado. Por favor, escanea el QR en la configuración.', variant: 'destructive' });
            } else {
                toast({ title: 'Error', description: 'No se pudo enviar el recordatorio por WhatsApp.', variant: 'destructive' });
            }
        }
    };

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(configData).unwrap();
            toast({ title: 'Éxito', description: 'Configuración guardada correctamente.' });
            setIsConfigModalOpen(false);
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo guardar la configuración.', variant: 'destructive' });
        }
    };


    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const { data: appointments, isLoading: isApptLoading } = useGetAppointmentsQuery({
        professional_id: activeProfessionalId,
        start_date: startOfWeek.toISOString(),
        end_date: endOfWeek.toISOString()
    }, {
        skip: !activeProfessionalId
    });

    const displayDays = viewMode === 'Semanal'
        ? Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return d;
        })
        : [currentDate];

    const appointmentsByDay = Array.from({ length: displayDays.length }, () => []);
    if (appointments && Array.isArray(appointments)) {
        appointments.forEach(appt => {
            if (!appt.fecha_hora) return;
            if (appt.estado === 'cancelado') return;

            // Filters
            if (statusFilter && appt.estado !== statusFilter) return;
            if (searchQuery) {
                const patientName = appt.patient?.nombre?.toLowerCase() || '';
                if (!patientName.includes(searchQuery.toLowerCase())) return;
            }

            const date = parseDateString(appt.fecha_hora);

            if (viewMode === 'Semanal') {
                const dayOfWeek = date.getDay();
                const colIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                if (colIndex >= 0 && colIndex < 7) {
                    appointmentsByDay[colIndex].push(appt);
                }
            } else {
                // Diario mode
                if (date.toDateString() === currentDate.toDateString()) {
                    appointmentsByDay[0].push(appt);
                }
            }
        });
    }

    // Handlers for Navigation
    const prevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
        setMiniCalendarDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
        setMiniCalendarDate(newDate);
    };

    const goToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setMiniCalendarDate(today);
    };

    // Mini Calendar Generation
    const generateMiniCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        while (days.length % 7 !== 0) days.push(null);
        return days;
    };
    const miniCalendarDays = generateMiniCalendar(miniCalendarDate);

    const prevMonth = () => {
        const newDate = new Date(miniCalendarDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setMiniCalendarDate(newDate);
    };

    const nextMonth = () => {
        const newDate = new Date(miniCalendarDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setMiniCalendarDate(newDate);
    };

    const selectMiniDay = (day) => {
        if (day) {
            setCurrentDate(day);
        }
    };

    // Create Appointment Handler
    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        try {
            const startDate = new Date(newAppt.fecha_hora);
            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + Number(newAppt.duration));

            await createAppointment({
                patient_id: newAppt.patient_id,
                professional_id: activeProfessionalId,
                fecha_hora: startDate.toISOString(),
                end_time: endDate.toISOString(),
                motivo: newAppt.motivo
            }).unwrap();
            setIsModalOpen(false);
            setNewAppt({ patient_id: '', fecha_hora: '', duration: 30, motivo: '' });
        } catch (err) {
            console.error("Failed to create appointment", err);
            toast({ title: 'Error', description: 'Error al crear el turno', variant: 'destructive' });
        }
    };

    const renderAppointment = (appt) => {
        const date = parseDateString(appt.fecha_hora);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const hourHeight = isCompact ? 40 : 60;

        let top = (hours - 8) * hourHeight + (minutes / 60) * hourHeight;
        if (top < 0) top = 0;

        let height = hourHeight;
        if (appt.end_time) {
            const endDate = parseDateString(appt.end_time);
            const durationMinutes = (endDate - date) / (1000 * 60);
            if (durationMinutes > 15) height = (durationMinutes / 60) * hourHeight;
        }

        const colors = [
            { bg: '#FCF0FF', border: '#F2D5FA', text: '#83389A', timeText: '#A975BD' },
            { bg: '#F0FDF4', border: '#D1FADF', text: '#059669', timeText: '#34D399' },
            { bg: '#FEFCE8', border: '#FEF08A', text: '#CA8A04', timeText: '#FBBF24' },
            { bg: '#F0FDFA', border: '#CCFBF1', text: '#0D9488', timeText: '#5EEAD4' },
            { bg: '#FFF7ED', border: '#FFEDD5', text: '#EA580C', timeText: '#FDBA74' },
            { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', timeText: '#60A5FA' },
        ];
        const color = colors[appt.id % colors.length] || colors[0];

        const patientName = appt.patient ? appt.patient.nombre : '';

        return (
            <div key={appt.id} className="absolute left-2 right-2 p-2 rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer z-20"
                onClick={() => setSelectedApptDetail(appt)}
                style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: color.bg,
                    borderColor: color.border
                }}>
                <div className="flex justify-between items-start">
                    <div className="text-sm font-bold truncate" style={{ color: color.text }}>{appt.motivo || 'Turno'}</div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(appt.id); }}
                        className={`p-1 rounded-full transition-colors ${appt.estado === 'completado' ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-white/50'}`}
                        title="Marcar como completado"
                    >
                        <Check size={14} />
                    </button>
                </div>
                {patientName && <div className="text-xs font-semibold truncate" style={{ color: color.text }}>{patientName}</div>}
                <div className="text-xs font-medium mt-0.5" style={{ color: color.timeText }}>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden flex flex-col h-full bg-white p-3 md:p-5 relative">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#1E293B]">Turnos</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow-sm transition-all flex items-center gap-1.5 text-xs"
                >
                    <span>+</span> Nuevo Turno
                </button>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2.5 border-b border-gray-100 pb-3">
                <div className="flex flex-wrap items-center gap-2 relative">
                    <button
                        onClick={() => setStatusFilter(statusFilter ? '' : 'confirmado')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-medium transition-colors ${statusFilter ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Filter size={14} /> {statusFilter ? 'Solo Confirmados' : 'Filtro'}
                    </button>
                    <button
                        onClick={() => setViewMode(viewMode === 'Semanal' ? 'Diario' : 'Semanal')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors justify-center min-w-[100px]"
                    >
                        <CalendarDays size={14} /> {viewMode} <ChevronDown size={12} className="ml-1" />
                    </button>
                    <button
                        onClick={() => setIsListModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <List size={14} /> Ver listado
                    </button>
                    <button
                        onClick={() => navigate('/historial-turnos')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A58CA] border border-blue-600 rounded-full text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <History size={14} /> Historial Turnos
                    </button>
                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-900 rounded-full text-xs font-medium text-white hover:bg-gray-900 transition-colors shadow-sm"
                    >
                        <Settings size={14} /> Configuración de Turnos
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 relative">
                    {isSearchOpen && (
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-2.5 py-1 border border-gray-200 rounded-full text-xs outline-none focus:border-[#0a47d4] shadow-sm animate-in fade-in slide-in-from-right-4 w-[160px]"
                            autoFocus
                        />
                    )}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`p-1.5 rounded-full transition-colors ${isSearchOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Search size={16} />
                    </button>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <button
                        onClick={() => window.open('https://wa.me/3245937358', '_blank')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                    >
                        <HeadphonesIcon size={14} /> Soporte
                    </button>
                    <button
                        onClick={() => setIsCompact(!isCompact)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-medium transition-colors ${isCompact ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <LayoutGrid size={14} /> Diseño
                    </button>
                </div>
            </div>

            {/* Main Grid Area */}
            <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 w-full max-w-full overflow-x-hidden">

                {/* Left Sidebar (Mini Calendar & List) */}
                <div className="w-full lg:w-64 flex flex-col gap-4 shrink-0 border-r border-gray-100 pr-4">

                    {/* Mini Calendar */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[16px] font-bold text-[#1E293B]">
                                {monthNames[miniCalendarDate.getMonth()]} {miniCalendarDate.getFullYear()}
                            </h2>
                            <div className="flex gap-1">
                                <button onClick={prevMonth} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><ChevronLeft size={16} /></button>
                                <button onClick={nextMonth} className="p-1 rounded-full bg-[#3B82F6] text-white shadow-sm shadow-blue-500/30"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                            <div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div><div>Do</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                            {miniCalendarDays.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`}></div>;
                                const isSelected = day.toDateString() === currentDate.toDateString();
                                const isToday = day.toDateString() === new Date().toDateString();
                                return (
                                    <div
                                        key={i}
                                        onClick={() => selectMiniDay(day)}
                                        className={`p-1.5 rounded-full cursor-pointer transition-colors ${isSelected ? 'bg-[#3B82F6] text-white shadow-sm'
                                            : isToday ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {['ADMIN', 'EMPLOYEE'].includes(user?.role) && (
                        <>
                            <div className="w-full h-px bg-gray-100"></div>

                            {/* Doctor List */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-[16px] font-bold text-[#1E293B]">Profesionales</h2>
                                </div>
                                <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
                                    {isProfLoading ? (
                                        <div className="text-sm text-gray-500">Cargando...</div>
                                    ) : professionals.map((prof) => (
                                        <div
                                            key={prof.id}
                                            onClick={() => setSelectedProfessional(prof.id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${activeProfessionalId === prof.id
                                                ? 'bg-blue-50 border border-blue-200 shadow-sm'
                                                : 'hover:bg-gray-50 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <img src={`https://ui-avatars.com/api/?name=${prof.name || 'Doc'}&background=F3F4F6&color=374151`} className="w-10 h-10 rounded-full" alt="Doctor" />
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{prof.name || prof.email}</h3>
                                                    <p className="text-xs font-medium text-blue-500">{prof.specialty || 'Kinesiólogo'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Calendar Area */}
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                    {/* Calendar Header Controls */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full p-1 gap-1">
                                <button onClick={goToday} className="px-4 py-1 text-sm font-semibold text-blue-600 bg-white rounded-full shadow-sm hover:bg-blue-50">Hoy</button>
                                <button onClick={prevWeek} className="p-1.5 text-gray-400 hover:text-gray-600"><ChevronLeft size={16} /></button>
                                <button onClick={nextWeek} className="p-1.5 text-gray-400 hover:text-gray-600"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        {isApptLoading && <div className="text-sm text-gray-500 animate-pulse">Cargando turnos...</div>}
                    </div>

                    {/* Calendar Grid Container */}
                    <div className="flex-1 overflow-auto border border-gray-300 rounded-2xl relative bg-[linear-gradient(#D1D5DB_1px,transparent_1px)]" style={{ backgroundSize: `100% ${isCompact ? 40 : 60}px` }}>
                        <div className={`grid ${viewMode === 'Semanal' ? 'grid-cols-7' : 'grid-cols-1'} min-w-[800px] divide-x divide-gray-300 relative pt-12 pl-12 pb-12`} style={{ minHeight: isCompact ? '600px' : '800px' }}>

                            {/* Absolute Day Headers */}
                            <div className="absolute top-0 left-12 right-0 h-12 flex divide-x divide-gray-300 border-b border-gray-300 bg-white/90 backdrop-blur-sm z-30">
                                {displayDays.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-center">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${day.toDateString() === new Date().toDateString() ? 'text-blue-600' : 'text-gray-800'}`}>
                                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day.getDay()]} {day.getDate()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Absolute Time Labels (Left) */}
                            <div className="absolute top-12 left-0 bottom-0 w-12 flex flex-col text-[10px] font-bold text-gray-800 items-center pt-4 bg-white/90 z-30" style={{ gap: isCompact ? '25px' : '45px' }}>
                                <span>08 AM</span>
                                <span>09 AM</span>
                                <span>10 AM</span>
                                <span>11 AM</span>
                                <span>12 PM</span>
                                <span>01 PM</span>
                                <span>02 PM</span>
                                <span>03 PM</span>
                                <span>04 PM</span>
                                <span>05 PM</span>
                                <span>06 PM</span>
                                <span>07 PM</span>
                                <span>08 PM</span>
                            </div>

                            {/* Dynamic Columns */}
                            {appointmentsByDay.map((dayAppts, colIndex) => (
                                <div key={colIndex} className="relative group border-r border-transparent">
                                    <div className="absolute inset-0 bg-transparent group-hover:bg-gray-50/50 transition-colors pointer-events-none" />
                                    {dayAppts.map(renderAppointment)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal Nuevo Turno */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">Nuevo Turno</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateAppointment} className="p-4 flex flex-col gap-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-semibold text-gray-700">Cliente</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingPatient(!isCreatingPatient)}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        {isCreatingPatient ? 'Usar Existente' : '+ Nuevo Cliente'}
                                    </button>
                                </div>
                                {isCreatingPatient ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nombre del cliente"
                                            className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                            value={newPatientName}
                                            onChange={(e) => setNewPatientName(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            disabled={!newPatientName.trim() || isCreatingPatientLoading}
                                            onClick={async () => {
                                                try {
                                                    const result = await createPatient({ nombre: newPatientName.trim() }).unwrap();
                                                    setNewAppt({ ...newAppt, patient_id: result.id });
                                                    setIsCreatingPatient(false);
                                                    setNewPatientName('');
                                                } catch (e) {
                                                    toast({ title: 'Error', description: 'Error creando cliente', variant: 'destructive' });
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 disabled:opacity-50"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        required
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        value={newAppt.patient_id}
                                        onChange={(e) => setNewAppt({ ...newAppt, patient_id: e.target.value })}
                                    >
                                        <option value="">Seleccione un cliente</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Inicio</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                                        value={newAppt.fecha_hora}
                                        onChange={(e) => setNewAppt({ ...newAppt, fecha_hora: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duración</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                        value={newAppt.duration}
                                        onChange={(e) => setNewAppt({ ...newAppt, duration: e.target.value })}
                                    >
                                        <option value={15}>15 minutos</option>
                                        <option value={30}>30 minutos</option>
                                        <option value={45}>45 minutos</option>
                                        <option value={60}>1 hora</option>
                                        <option value={90}>1 hora y media</option>
                                        <option value={120}>2 horas</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Chequeo de rutina"
                                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    value={newAppt.motivo}
                                    onChange={(e) => setNewAppt({ ...newAppt, motivo: e.target.value })}
                                />
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
                                >
                                    {isCreating ? 'Guardando...' : 'Crear Turno'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalles del Turno */}
            {selectedApptDetail && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">Detalles del Turno</h3>
                            <button onClick={() => setSelectedApptDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
                                <p className="text-base font-semibold text-gray-900">{selectedApptDetail.patient?.nombre || 'Sin nombre'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Motivo</p>
                                <p className="text-base font-semibold text-gray-900">{selectedApptDetail.motivo || 'No especificado'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Inicio</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {parseDateString(selectedApptDetail.fecha_hora).toLocaleString()}
                                    </p>
                                </div>
                                {selectedApptDetail.end_time && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fin</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {parseDateString(selectedApptDetail.end_time).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedApptDetail.patient && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                                    <button
                                        onClick={() => handleSendReminder(selectedApptDetail)}
                                        className="w-full bg-[#25D366] hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={16} /> Recordatorio WhatsApp
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/historial/${selectedApptDetail.patient.id}`)}
                                            className="flex-1 bg-[#0A58CA] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            Ver Perfil
                                        </button>
                                        {['ADMIN', 'EMPLOYEE'].includes(user?.role) && (
                                            <button
                                                onClick={() => handleCancelAppointment(selectedApptDetail.id)}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors text-sm flex items-center justify-center gap-2 border border-red-200"
                                            >
                                                <Trash2 size={16} /> Cancelar Turno
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Listado de Turnos del Día */}
            {isListModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[500px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                            <h3 className="font-bold text-lg text-gray-900">Turnos del {currentDate.toLocaleDateString()}</h3>
                            <button onClick={() => setIsListModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
                            {(() => {
                                const dayAppts = appointments ? appointments.filter(a => parseDateString(a.fecha_hora).toDateString() === currentDate.toDateString()) : [];
                                if (dayAppts.length === 0) {
                                    return <p className="text-sm text-gray-500 text-center py-4">No hay turnos para este día.</p>;
                                }
                                return dayAppts.sort((a, b) => parseDateString(a.fecha_hora) - parseDateString(b.fecha_hora)).map(appt => (
                                    <div key={appt.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedApptDetail(appt); setIsListModalOpen(false); }}>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{appt.patient?.nombre || 'Sin nombre'}</p>
                                            <p className="text-xs text-gray-500">{parseDateString(appt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appt.motivo}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${appt.estado === 'completado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {appt.estado || 'Confirmado'}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(appt.id); }}
                                                className={`p-1.5 rounded-full transition-colors ${appt.estado === 'completado' ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'}`}
                                                title="Marcar como completado"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Configuración de Turnos */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Settings size={18} /> Configuración de Turnos</h3>
                            <button onClick={() => setIsConfigModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveConfig} className="p-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Anticipación del Recordatorio (Automático)</label>
                                <p className="text-xs text-gray-500 mb-2">Selecciona cuánto tiempo antes del turno deseas enviar el recordatorio automático por WhatsApp.</p>
                                <select
                                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    value={configData.whatsapp_reminder_minutes}
                                    onChange={(e) => setConfigData({ ...configData, whatsapp_reminder_minutes: parseInt(e.target.value) })}
                                >
                                    <option value={15}>15 minutos antes</option>
                                    <option value={30}>30 minutos antes</option>
                                    <option value={60}>1 hora antes</option>
                                    <option value={120}>2 horas antes</option>
                                    <option value={1440}>24 horas antes (1 día)</option>
                                    <option value={2880}>48 horas antes (2 días)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje al Crear Turno</label>
                                <p className="text-xs text-gray-500 mb-2">Este mensaje se envía inmediatamente al reservar un nuevo turno. Puedes usar variables como: {'{{patient_name}}, {{service}}, {{date}}, {{time}}'}</p>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
                                    value={configData.whatsapp_creation_template}
                                    onChange={(e) => setConfigData({ ...configData, whatsapp_creation_template: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje de Recordatorio (Automático y Manual)</label>
                                <p className="text-xs text-gray-500 mb-2">Este mensaje se envía automáticamente antes del turno, o cuando presionas "Recordatorio WhatsApp". Variables: {'{{patient_name}}, {{service}}, {{date}}, {{time}}'}</p>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
                                    value={configData.whatsapp_reminder_template}
                                    onChange={(e) => setConfigData({ ...configData, whatsapp_reminder_template: e.target.value })}
                                />
                            </div>

                            <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsConfigModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                    className="px-4 py-2 bg-[#0A58CA] hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 text-sm shadow-sm"
                                >
                                    {isUpdatingProfile ? 'Guardando...' : 'Guardar Configuración'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

// Helper component for ChevronDown
const ChevronDown = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

export default AppointmentCalendar;
