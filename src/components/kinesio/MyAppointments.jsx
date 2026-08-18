import React, { useMemo } from 'react';
import { useGetMyAppointmentsQuery } from '../../services/api/kinesioApi.js';
import { Calendar, Clock, Stethoscope, CheckCircle2, XCircle, Clock4, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import PublicNavbar from '../nav/PublicNavbar.jsx';

dayjs.locale('es');

const MyAppointments = () => {
    const { data: appointments, isLoading, error } = useGetMyAppointmentsQuery();
    const navigate = useNavigate();

    const { upcoming, past } = useMemo(() => {
        if (!appointments) return { upcoming: [], past: [] };
        const now = dayjs();
        const upcomingList = [];
        const pastList = [];

        appointments.forEach(appt => {
            if (dayjs(appt.fecha_hora).isAfter(now) && appt.estado !== 'cancelado') {
                upcomingList.push(appt);
            } else {
                pastList.push(appt);
            }
        });

        return { 
            upcoming: upcomingList.sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora)), 
            past: pastList.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)) 
        };
    }, [appointments]);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'confirmado':
            case 'completado': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
            case 'pendiente_pago': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'confirmado':
            case 'completado': return <CheckCircle2 size={14} />;
            case 'cancelado': return <XCircle size={14} />;
            default: return <Clock4 size={14} />;
        }
    };

    return (
        <div className="bg-[#f7f9fc] min-h-screen font-sans text-gray-800 pt-16 sm:pt-20">
            <PublicNavbar />
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/reservar')} className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1E293B]">Mis Turnos</h1>
                        <p className="text-gray-500 text-sm mt-1">Revisa el historial de tus turnos programados y pasados.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0a47d4] mb-4"></div>
                        <p>Cargando tus turnos...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
                        <p className="font-semibold">No se pudieron cargar tus turnos.</p>
                        <p className="text-sm mt-1">Por favor, asegúrate de haber iniciado sesión y vuelve a intentar.</p>
                        <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm">Iniciar Sesión</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        
                        {/* Próximos Turnos */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar size={22} className="text-[#0a47d4]" />
                                Próximos Turnos
                            </h2>
                            {upcoming.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                                        <Calendar size={32} />
                                    </div>
                                    <p className="text-gray-500 font-medium">No tienes turnos programados a futuro.</p>
                                    <button onClick={() => navigate('/reservar')} className="mt-4 text-[#0a47d4] font-bold hover:underline">Reservar un nuevo turno</button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {upcoming.map(appt => (
                                        <AppointmentCard key={appt.id} appt={appt} getStatusStyle={getStatusStyle} getStatusIcon={getStatusIcon} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Historial (Pasados o Cancelados) */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock size={22} className="text-gray-400" />
                                Historial
                            </h2>
                            {past.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">Aún no tienes un historial de turnos previos.</p>
                            ) : (
                                <div className="grid gap-4 opacity-80">
                                    {past.map(appt => (
                                        <AppointmentCard key={appt.id} appt={appt} getStatusStyle={getStatusStyle} getStatusIcon={getStatusIcon} />
                                    ))}
                                </div>
                            )}
                        </section>

                    </div>
                )}
            </div>
        </div>
    );
};

const AppointmentCard = ({ appt, getStatusStyle, getStatusIcon }) => {
    const date = dayjs(appt.fecha_hora);
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-transform hover:-translate-y-0.5">
            <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-100 text-blue-800 rounded-xl w-16 h-16 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider">{date.format('MMM')}</span>
                <span className="text-2xl font-black leading-none">{date.format('DD')}</span>
            </div>
            
            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h3 className="font-bold text-gray-900 text-lg capitalize">{date.format('dddd, YYYY')}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${getStatusStyle(appt.estado)}`}>
                        {getStatusIcon(appt.estado)}
                        {appt.estado || 'Pendiente'}
                    </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600 font-medium">
                    <span className="flex items-center gap-1.5">
                        <Clock size={16} className="text-gray-400" />
                        {date.format('HH:mm')} hs
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Stethoscope size={16} className="text-gray-400" />
                        {appt.motivo || 'Kinesiología'}
                    </span>
                    {appt.professional && (
                        <span className="flex items-center gap-1.5">
                            <span className="text-gray-400">Prof:</span>
                            {appt.professional.first_name || appt.professional.firstName} {appt.professional.last_name || appt.professional.lastName}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAppointments;
