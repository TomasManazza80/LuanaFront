import React, { useState, useEffect } from 'react';
import { Clock, Plus, CalendarX, X, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { useGetAvailabilityQuery, useSaveAvailabilityMutation, useGetProfileQuery, useUpdateProfileMutation } from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast';
import WhatsAppSettings from '../profile/WhatsAppSettings.jsx';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const AvailabilityManager = () => {
    const { data, isLoading } = useGetAvailabilityQuery();
    const [saveAvailability, { isLoading: isSaving }] = useSaveAvailabilityMutation();

    const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

    // Map day -> array of { start_time, end_time }
    const [schedules, setSchedules] = useState({});
    const [exceptions, setExceptions] = useState([]);
    const [appointmentCost, setAppointmentCost] = useState('');
    const [requirePayment, setRequirePayment] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [sessionFee, setSessionFee] = useState('');
    const [mpAccessToken, setMpAccessToken] = useState('');
    const [mpAuthUrl, setMpAuthUrl] = useState('');

    useEffect(() => {
        if (profileData?.data) {
            const fee = Number(profileData.data.session_fee);
            setSessionFee(fee === 0 || isNaN(fee) ? '' : fee.toString());
            setRequirePayment(!!profileData.data.require_payment);
            setMpAccessToken(profileData.data.mp_access_token || '');
        }
    }, [profileData]);

    useEffect(() => {
        // Fetch MP Auth URL if token is missing
        if (!mpAccessToken) {
            const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:10000';
            const token = localStorage.getItem('token');
            if (token) {
                fetch(`${backendUrl}/api/kinesio/mp-auth-url`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.url) setMpAuthUrl(data.url);
                })
                .catch(err => console.error('Error fetching MP auth url:', err));
            }
        }
    }, [mpAccessToken]);

    useEffect(() => {
        if (data?.data) {
            const newSchedules = {};
            const newExceptions = [];

            data.data.forEach(item => {
                if (item.is_exception) {
                    newExceptions.push({ exception_date: item.exception_date, exception_title: item.exception_title });
                } else {
                    if (!newSchedules[item.day_of_week]) newSchedules[item.day_of_week] = [];
                    newSchedules[item.day_of_week].push({
                        start_time: item.start_time,
                        end_time: item.end_time,
                        session_duration: item.session_duration || 30
                    });
                }
            });

            setSchedules(newSchedules);
            setExceptions(newExceptions);
        }
    }, [data]);

    const handleAddBlock = (day) => {
        setSchedules(prev => {
            const daySched = prev[day] || [];
            return { ...prev, [day]: [...daySched, { start_time: '09:00', end_time: '13:00', session_duration: 30 }] };
        });
    };

    const handleRemoveBlock = (day, index) => {
        setSchedules(prev => {
            const daySched = [...(prev[day] || [])];
            daySched.splice(index, 1);
            return { ...prev, [day]: daySched };
        });
    };

    const handleTimeChange = (day, index, field, value) => {
        setSchedules(prev => {
            const daySched = [...(prev[day] || [])];
            daySched[index] = { ...daySched[index], [field]: value };
            return { ...prev, [day]: daySched };
        });
    };

    const handleSave = async () => {
        const payloadSchedules = [];
        Object.keys(schedules).forEach(day => {
            schedules[day].forEach(block => {
                if (block.start_time && block.end_time) {
                    payloadSchedules.push({
                        day_of_week: day,
                        start_time: block.start_time,
                        end_time: block.end_time,
                        session_duration: block.session_duration || 30
                    });
                }
            });
        });

        try {
            await saveAvailability({ schedules: payloadSchedules, exceptions }).unwrap();
            await updateProfile({ 
                session_fee: sessionFee === '' ? 0 : Number(sessionFee),
                require_payment: requirePayment
            }).unwrap();
            toast({ title: 'Éxito', description: 'Configuración guardada correctamente', variant: 'success' });
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo guardar la configuración', variant: 'error' });
        }
    };

    if (isLoading || isProfileLoading) return <div className="p-8">Cargando...</div>;

    return (
        <div className="w-full h-full bg-[#F8FAFC] p-4 md:p-8 flex flex-col gap-6 font-sans overflow-y-auto">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Gestión de Disponibilidad</h1>
                <p className="text-gray-500 mt-1">Configura tus horarios de atención y días no laborables.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column: Settings */}
                <div className="w-full lg:w-[450px] flex flex-col gap-6">

                    {/* Horarios Regulares */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[#0A58CA] font-bold text-lg mb-2">
                            <Clock size={20} strokeWidth={2.5} />
                            <h2>Horarios Regulares</h2>
                        </div>

                        {DAYS.map(day => {
                            const blocks = schedules[day] || [];
                            const isActive = blocks.length > 0;

                            return (
                                <div key={day} className={`border rounded-xl p-4 flex flex-col gap-3 ${isActive ? 'border-[#0A58CA] bg-blue-50/20' : 'border-gray-200 bg-white'}`}>
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center gap-2 font-bold text-gray-900 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={() => {
                                                    if (isActive) {
                                                        const newScheds = { ...schedules };
                                                        delete newScheds[day];
                                                        setSchedules(newScheds);
                                                    } else {
                                                        handleAddBlock(day);
                                                    }
                                                }}
                                                className="w-4 h-4 text-[#0A58CA] rounded border-gray-300 focus:ring-[#0A58CA]"
                                            />
                                            {day} {!isActive && <span className="text-gray-400 font-medium text-sm">(No laborable)</span>}
                                        </label>
                                        <button onClick={() => handleAddBlock(day)} className="text-[#0A58CA] hover:bg-blue-100 p-1 rounded transition-colors" title="Añadir bloque horario">
                                            <Plus size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {isActive && blocks.map((block, index) => (
                                        <div key={index} className="flex items-center gap-2 mt-2">
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg flex items-center shadow-sm">
                                                <input
                                                    type="time"
                                                    value={block.start_time}
                                                    onChange={(e) => handleTimeChange(day, index, 'start_time', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm font-semibold text-gray-700 bg-transparent outline-none"
                                                />
                                            </div>
                                            <span className="text-gray-400 font-bold">-</span>
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg flex items-center shadow-sm">
                                                <input
                                                    type="time"
                                                    value={block.end_time}
                                                    onChange={(e) => handleTimeChange(day, index, 'end_time', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm font-semibold text-gray-700 bg-transparent outline-none"
                                                />
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-lg flex items-center shadow-sm px-2 ml-2">
                                                <input
                                                    type="number"
                                                    min="5"
                                                    step="5"
                                                    value={block.session_duration || 30}
                                                    onChange={(e) => handleTimeChange(day, index, 'session_duration', parseInt(e.target.value) || 30)}
                                                    className="w-12 py-1.5 text-sm font-semibold text-gray-700 bg-transparent outline-none text-center"
                                                    title="Duración de sesión en minutos"
                                                />
                                                <span className="text-xs font-bold text-gray-400 mr-1">min</span>
                                            </div>
                                            <button onClick={() => handleRemoveBlock(day, index)} className="text-red-400 hover:text-red-600 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}

                    </div>



                    <button
                        onClick={handleSave}
                        disabled={isSaving || isUpdatingProfile}
                        className="w-full bg-[#0A58CA] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSaving || isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                {/* Right Column: Information/Preview */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                        <h3 className="text-blue-800 font-bold text-lg mb-2">¿Cómo funciona?</h3>
                        <p className="text-blue-600 text-sm mb-4 leading-relaxed">
                            Al guardar tu disponibilidad, los clientes solo podrán ver y reservar turnos en los bloques horarios que definas aquí. Si un cliente reserva un turno en tu horario laboral, automáticamente ese espacio quedará ocupado y ya no se mostrará como disponible para otros clientes.
                        </p>
                        <ul className="text-sm text-blue-700 list-disc pl-5 flex flex-col gap-2">
                            <li>Puedes agregar múltiples bloques de horas (ej. mañana y tarde).</li>
                            <li>Ajusta la duración (en minutos) de cada sesión para que los turnos se generen con ese intervalo exacto.</li>
                            <li>Si un día está desmarcado, nadie podrá reservar en ese día.</li>
                        </ul>
                    </div>
                    
                    <WhatsAppSettings />
                </div>

            </div>

            {/* Disconnect MercadoPago Confirmation Modal */}
            {showDisconnectModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Desvincular Cuenta</h2>
                        <p className="text-center text-gray-500 mb-6">
                            ¿Seguro que deseas desvincular tu cuenta de MercadoPago? Dejarás de recibir pagos automáticamente a través de la plataforma.
                        </p>
                        
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setShowDisconnectModal(false)}
                                className="flex-1 px-5 py-2.5 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    updateProfile({ mp_access_token: null, mp_refresh_token: null, mp_user_id: null })
                                    .unwrap().then(() => {
                                        setMpAccessToken('');
                                        setShowDisconnectModal(false);
                                    });
                                }}
                                className="flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Sí, desvincular
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityManager;
