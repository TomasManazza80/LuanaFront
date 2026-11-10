import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, Plus, CalendarX, X, ChevronLeft, ChevronRight, Trash2, AlertTriangle, CreditCard, DollarSign, CheckCircle } from 'lucide-react';
import { useGetAvailabilityQuery, useSaveAvailabilityMutation, useGetProfessionalsQuery, useUpdateProfessionalMutation } from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast';
import WhatsAppSettings from '../profile/WhatsAppSettings.jsx';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const getUserIdFromToken = (token) => {
    if (!token) return '';
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return (payload.id || payload.userId || '').toString();
    } catch {
        return '';
    }
};

const AvailabilityManager = () => {
    const userInfo = useSelector((state) => state.authSlice?.userInfo || state.auth?.userInfo);
    const accessToken = useSelector((state) => state.authSlice?.accessToken || state.auth?.accessToken);
    const myProfId = (userInfo?.id || userInfo?._id || userInfo?.userId || getUserIdFromToken(accessToken) || '').toString();

    const { data, isLoading } = useGetAvailabilityQuery(myProfId || undefined, { skip: !myProfId });
    const [saveAvailability, { isLoading: isSaving }] = useSaveAvailabilityMutation();
    const [updateProfessional, { isLoading: isUpdatingProfile }] = useUpdateProfessionalMutation();
    
    const { data: profData, isLoading: isProfLoading } = useGetProfessionalsQuery();
    const professionals = profData?.data || [];
    const myProfileData = professionals.find(p => p.id?.toString() === myProfId);

    // Map day -> array of { start_time, end_time }
    const [schedules, setSchedules] = useState({});
    const [exceptions, setExceptions] = useState([]);
    const [newExceptionDate, setNewExceptionDate] = useState('');
    const [newExceptionEndDate, setNewExceptionEndDate] = useState('');
    const [newExceptionTitle, setNewExceptionTitle] = useState('');
    const [requiresDeposit, setRequiresDeposit] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [paymentTimeoutMinutes, setPaymentTimeoutMinutes] = useState(15);
    const [applyGlobally, setApplyGlobally] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [mpAccessToken, setMpAccessToken] = useState('');
    const [mpAuthUrl, setMpAuthUrl] = useState('');

    useEffect(() => {
        if (myProfileData) {
            const rawAmount = Number(myProfileData.deposit_amount || myProfileData.session_fee);
            setDepositAmount(rawAmount === 0 || isNaN(rawAmount) ? '' : rawAmount.toString());
            setRequiresDeposit(Boolean(myProfileData.requires_deposit ?? myProfileData.require_payment ?? false));
            setPaymentTimeoutMinutes(Number(myProfileData.payment_timeout_minutes) || 15);
            setMpAccessToken(myProfileData.mp_access_token || '');
        }
    }, [myProfileData]);

    useEffect(() => {
        // Fetch MP Auth URL if token is missing
        if (!mpAccessToken) {
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
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
                if (item.is_exception && item.exception_date) {
                    const normalizedDate = typeof item.exception_date === 'string'
                        ? item.exception_date.substring(0, 10)
                        : new Date(item.exception_date).toISOString().substring(0, 10);
                    newExceptions.push({
                        exception_date: normalizedDate,
                        exception_title: item.exception_title || 'Día cancelado'
                    });
                } else if (!item.is_exception) {
                    if (!newSchedules[item.day_of_week]) newSchedules[item.day_of_week] = [];
                    newSchedules[item.day_of_week].push({
                        start_time: item.start_time ? item.start_time.substring(0, 5) : '',
                        end_time: item.end_time ? item.end_time.substring(0, 5) : '',
                        session_duration: item.session_duration || 30
                    });
                }
            });

            newExceptions.sort((a, b) => a.exception_date.localeCompare(b.exception_date));
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

    const handleTimeInput = (day, index, field, value, nativeEvent) => {
        let val = value.replace(/[^\d:]/g, '');
        if (val.length === 2 && !val.includes(':') && nativeEvent?.inputType !== 'deleteContentBackward') {
            val += ':';
        }
        if (val.length > 5) val = val.substring(0, 5);
        handleTimeChange(day, index, field, val);
    };

    const buildPayloadSchedules = (currentSchedules = schedules) => {
        const payloadSchedules = [];
        Object.keys(currentSchedules).forEach(day => {
            (currentSchedules[day] || []).forEach(block => {
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
        return payloadSchedules;
    };

    const handleAddException = async (e) => {
        if (e) e.preventDefault();
        if (!newExceptionDate) {
            toast({ title: 'Atención', description: 'Selecciona una fecha para cancelar.', variant: 'error' });
            return;
        }
        if (!myProfId) {
            toast({ title: 'Error', description: 'No se pudo identificar tu usuario.', variant: 'error' });
            return;
        }

        const start = new Date(`${newExceptionDate}T00:00:00`);
        const end = newExceptionEndDate ? new Date(`${newExceptionEndDate}T00:00:00`) : start;

        if (end < start) {
            toast({ title: 'Atención', description: 'La fecha final no puede ser anterior a la inicial.', variant: 'error' });
            return;
        }

        const datesToAdd = [];
        const current = new Date(start);
        while (current <= end) {
            const yyyy = current.getFullYear();
            const mm = String(current.getMonth() + 1).padStart(2, '0');
            const dd = String(current.getDate()).padStart(2, '0');
            datesToAdd.push(`${yyyy}-${mm}-${dd}`);
            current.setDate(current.getDate() + 1);
        }

        const title = newExceptionTitle.trim() || 'Día cancelado';
        const existingMap = new Map(exceptions.map(item => [item.exception_date, item]));
        datesToAdd.forEach(dateStr => {
            existingMap.set(dateStr, { exception_date: dateStr, exception_title: title });
        });

        const updatedExceptions = Array.from(existingMap.values()).sort((a, b) =>
            a.exception_date.localeCompare(b.exception_date)
        );

        setExceptions(updatedExceptions);
        setNewExceptionDate('');
        setNewExceptionEndDate('');
        setNewExceptionTitle('');

        try {
            await saveAvailability({
                schedules: buildPayloadSchedules(schedules),
                exceptions: updatedExceptions,
                professional_id: myProfId
            }).unwrap();
            toast({
                title: 'Día cancelado',
                description: datesToAdd.length > 1
                    ? `Se cancelaron ${datesToAdd.length} días en tu agenda.`
                    : 'El día seleccionado fue cancelado en tu agenda.',
                variant: 'success'
            });
        } catch (err) {
            toast({ title: 'Error', description: 'No se pudo guardar el día cancelado.', variant: 'error' });
        }
    };

    const handleRemoveException = async (dateToRemove) => {
        const updatedExceptions = exceptions.filter(exc => exc.exception_date !== dateToRemove);
        setExceptions(updatedExceptions);

        if (!myProfId) return;
        try {
            await saveAvailability({
                schedules: buildPayloadSchedules(schedules),
                exceptions: updatedExceptions,
                professional_id: myProfId
            }).unwrap();
            toast({
                title: 'Día habilitado',
                description: 'La fecha vuelve a estar disponible según tu horario regular.',
                variant: 'success'
            });
        } catch (err) {
            toast({ title: 'Error', description: 'No se pudo actualizar la disponibilidad.', variant: 'error' });
        }
    };

    const formatExceptionDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.substring(0, 10).split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleSave = async () => {
        if (!myProfId) {
            toast({ title: 'Error', description: 'No se pudo identificar tu usuario.', variant: 'error' });
            return;
        }

        const payloadSchedules = buildPayloadSchedules(schedules);

        try {
            await saveAvailability({ schedules: payloadSchedules, exceptions, professional_id: myProfId }).unwrap();
            
            const numAmount = depositAmount === '' ? 0 : Number(depositAmount);
            const feePayload = { 
                requires_deposit: Boolean(requiresDeposit),
                require_payment: Boolean(requiresDeposit),
                deposit_amount: numAmount,
                session_fee: numAmount,
                payment_timeout_minutes: Number(paymentTimeoutMinutes) || 15,
                apply_deposit_globally: applyGlobally
            };

            await updateProfessional({ id: myProfId, ...feePayload }).unwrap();
            
            toast({ title: 'Éxito', description: 'Disponibilidad y cobro de turnos guardados correctamente', variant: 'success' });
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo guardar la configuración', variant: 'error' });
        }
    };

    if (isLoading || isProfLoading) return <div className="p-8">Cargando...</div>;

    return (
        <div className="w-full max-w-full overflow-x-hidden bg-[#F8FAFC] p-3 md:p-5 flex flex-col gap-4 font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111827]">Gestión de Disponibilidad</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Configura tus horarios de atención y días no laborables.</p>
                </div>
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
                                                    type="text"
                                                    placeholder="09:00"
                                                    maxLength={5}
                                                    value={block.start_time ? block.start_time.substring(0, 5) : ''}
                                                    onChange={(e) => handleTimeInput(day, index, 'start_time', e.target.value, e.nativeEvent)}
                                                    className="w-full px-3 py-1.5 text-sm font-semibold text-gray-700 bg-transparent outline-none text-center tracking-widest"
                                                />
                                            </div>
                                            <span className="text-gray-400 font-bold">-</span>
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg flex items-center shadow-sm">
                                                <input
                                                    type="text"
                                                    placeholder="13:00"
                                                    maxLength={5}
                                                    value={block.end_time ? block.end_time.substring(0, 5) : ''}
                                                    onChange={(e) => handleTimeInput(day, index, 'end_time', e.target.value, e.nativeEvent)}
                                                    className="w-full px-3 py-1.5 text-sm font-semibold text-gray-700 bg-transparent outline-none text-center tracking-widest"
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

                    {/* Cobro de Seña Obligatoria (Mercado Pago Checkout Pro) */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#009EE3] font-bold text-lg">
                                <CreditCard size={20} strokeWidth={2.5} />
                                <h2>Cobro de Turno / Seña</h2>
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-[#009EE3] border border-sky-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#009EE3] animate-pulse"></span>
                                Mercado Pago
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                            Configura si los pacientes deben abonar una seña previa o el costo del turno mediante Mercado Pago Checkout Pro para poder reservar desde la web.
                        </p>

                        {/* Toggle Switch */}
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-bold text-gray-900">Cobro obligatorio para confirmar turno</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {requiresDeposit 
                                        ? 'Activo: se requerirá el pago por Mercado Pago para validar el turno.' 
                                        : 'Inactivo: los turnos se reservan directamente sin cobro previo.'}
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={requiresDeposit}
                                    onChange={(e) => setRequiresDeposit(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#009EE3]"></div>
                            </label>
                        </div>

                        {requiresDeposit && (
                            <div className="flex flex-col gap-4 pt-1 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Monto a abonar ($ ARS) *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                            <input
                                                type="number"
                                                min="1"
                                                step="100"
                                                placeholder="Ej. 5000"
                                                value={depositAmount}
                                                onChange={(e) => setDepositAmount(e.target.value)}
                                                className="w-full pl-8 pr-3 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#009EE3] focus:ring-2 focus:ring-sky-100 transition-all"
                                                required={requiresDeposit}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Tiempo límite (minutos)
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="120"
                                            value={paymentTimeoutMinutes}
                                            onChange={(e) => setPaymentTimeoutMinutes(parseInt(e.target.value) || 15)}
                                            className="w-full px-3 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#009EE3] focus:ring-2 focus:ring-sky-100 transition-all text-center"
                                            title="Tiempo de retención del horario en minutos"
                                        />
                                    </div>
                                </div>

                                <p className="text-[11px] text-gray-400 leading-tight">
                                    El horario quedará retenido durante {paymentTimeoutMinutes || 15} minutos mientras el usuario paga en Checkout Pro. Si no abona en ese plazo, el turno expira y el horario se libera automáticamente.
                                </p>

                                {(userInfo?.role === 'ADMIN' || userInfo?.role === 'admin') && (
                                    <label className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs font-bold text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyGlobally}
                                            onChange={(e) => setApplyGlobally(e.target.checked)}
                                            className="w-4 h-4 text-[#009EE3] rounded border-gray-300 focus:ring-[#009EE3]"
                                        />
                                        Aplicar esta configuración de seña a todos los profesionales
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || isUpdatingProfile}
                        className="w-full bg-[#0A58CA] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSaving || isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                {/* Right Column: Cancelled Days & Information/Preview */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Cancelar Días Específicos (Excepciones por Profesional) */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
                                <CalendarX size={20} strokeWidth={2.5} />
                                <h2>Cancelar Días Específicos</h2>
                            </div>
                            {myProfileData?.name && (
                                <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                    Agenda de: {myProfileData.name}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            Bloquea fechas puntuales o rangos (vacaciones, feriados, ausencias). Esos días no aparecerás disponible para reservas y <strong>solo afectará a tu agenda profesional</strong>.
                        </p>

                        <form onSubmit={handleAddException} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Fecha desde *</label>
                                <input
                                    type="date"
                                    value={newExceptionDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setNewExceptionDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 text-gray-800 font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Fecha hasta (opcional)</label>
                                <input
                                    type="date"
                                    value={newExceptionEndDate}
                                    min={newExceptionDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setNewExceptionEndDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 text-gray-800 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Motivo (opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Vacaciones, Feriado..."
                                    value={newExceptionTitle}
                                    onChange={(e) => setNewExceptionTitle(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 text-gray-800"
                                />
                            </div>
                            <div className="sm:col-span-3 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving || !newExceptionDate}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                >
                                    <CalendarX size={16} />
                                    Cancelar Día(s)
                                </button>
                            </div>
                        </form>

                        {/* Lista de días cancelados */}
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                            {exceptions.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                                    No tienes días cancelados actualmente.
                                </div>
                            ) : (
                                exceptions.map((exc) => (
                                    <div
                                        key={exc.exception_date}
                                        className="flex items-center justify-between px-4 py-3 bg-red-50/60 border border-red-100 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                                <CalendarX size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 capitalize">
                                                    {formatExceptionDate(exc.exception_date)}
                                                </p>
                                                <p className="text-xs text-red-600 font-medium">
                                                    {exc.exception_title || 'Día cancelado'} — No disponible
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveException(exc.exception_date)}
                                            className="text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                            title="Habilitar día nuevamente"
                                        >
                                            <Trash2 size={14} />
                                            Habilitar
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                        <h3 className="text-blue-800 font-bold text-lg mb-2">¿Cómo funciona?</h3>
                        <p className="text-blue-600 text-sm mb-4 leading-relaxed">
                            Al guardar tu disponibilidad, los clientes solo podrán ver y reservar turnos en los bloques horarios que definas aquí. Si un cliente reserva un turno en tu horario laboral, automáticamente ese espacio quedará ocupado y ya no se mostrará como disponible para otros clientes.
                        </p>
                        <ul className="text-sm text-blue-700 list-disc pl-5 flex flex-col gap-2">
                            <li>Puedes agregar múltiples bloques de horas (ej. mañana y tarde).</li>
                            <li>Ajusta la duración (en minutos) de cada sesión para que los turnos se generen con ese intervalo exacto.</li>
                            <li>Si un día está desmarcado o agregado en <strong>Cancelar Días Específicos</strong>, no aparecerás disponible en esa fecha sin afectar al resto de profesionales.</li>
                        </ul>
                    </div>
                    
                    <WhatsAppSettings profId={myProfId} />
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
                                    updateProfessional({ id: myProfId, mp_access_token: null, mp_refresh_token: null, mp_user_id: null })
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
