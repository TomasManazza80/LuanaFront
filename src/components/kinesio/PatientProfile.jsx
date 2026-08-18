import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    useGetPatientsQuery, 
    useGetAppointmentsQuery, 
    useGetMedicalHistoryQuery,
    useGetMedicalRecordsQuery 
} from '../../services/api/kinesioApi.js';
import { 
    ArrowLeft, User, Phone, Mail, Droplet, Activity, 
    Calendar, Clock, FileText, ChevronRight, Stethoscope,
    CheckCircle2, ShieldPlus as Shield, ClipboardList, Image as ImageIcon,
    Plus, History, Loader2, ChevronDown, ChevronUp, ExternalLink, Pencil 
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('clinica');
    const [showPreviousInProfile, setShowPreviousInProfile] = useState(false);
    const [selectedConsultationId, setSelectedConsultationId] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    const { data: patients, isLoading: isLoadingPatients } = useGetPatientsQuery();
    const { data: allAppointments, isLoading: isLoadingAppointments } = useGetAppointmentsQuery({ patient_id: id });
    const { data: historyList = [], isLoading: isLoadingHistory } = useGetMedicalHistoryQuery(id, { skip: !id });
    const { data: records = [], isLoading: isLoadingRecords } = useGetMedicalRecordsQuery(id, { skip: !id });

    const patient = useMemo(() => {
        if (!patients || !id) return null;
        return patients.find(p => p.id === parseInt(id));
    }, [patients, id]);

    const patientAppointments = useMemo(() => {
        if (!allAppointments) return [];
        return [...allAppointments].sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
    }, [allAppointments]);

    const allConsultations = useMemo(() => {
        const list = [];
        
        // Process dynamic medical records
        if (records && records.length > 0) {
            records.forEach(r => {
                let templateFields = [];
                try {
                    templateFields = typeof r.template_snapshot === 'string' 
                        ? JSON.parse(r.template_snapshot) 
                        : (r.template_snapshot || []);
                } catch(e) {}

                let recordData = {};
                try {
                    recordData = typeof r.record_data === 'string' 
                        ? JSON.parse(r.record_data) 
                        : (r.record_data || {});
                } catch(e) {}

                list.push({
                    id: `dynamic-${r.id}`,
                    date: new Date(r.createdAt || r.updatedAt),
                    type: 'dynamic',
                    raw: r,
                    template_name: r.template_name,
                    professional_name: r.professional_name,
                    status: r.status,
                    signature_timestamp: r.signature_timestamp,
                    fields: templateFields,
                    data: recordData
                });
            });
        }

        // Process static medical history entries
        if (historyList && historyList.length > 0) {
            historyList.forEach(h => {
                list.push({
                    id: `static-${h.id}`,
                    date: new Date(h.fecha),
                    type: 'static',
                    raw: h,
                    reason_for_visit: h.reason_for_visit,
                    blood_pressure: h.blood_pressure,
                    heart_rate: h.heart_rate,
                    physical_findings: h.physical_findings,
                    diagnostico: h.diagnostico,
                    tratamiento: h.tratamiento,
                    archivos_adjuntos: h.archivos_adjuntos || []
                });
            });
        }

        // Sort descending (newest first)
        list.sort((a, b) => b.date.getTime() - a.date.getTime());
        return list;
    }, [records, historyList]);

    const activeConsultation = useMemo(() => {
        if (!allConsultations || allConsultations.length === 0) return null;
        if (selectedConsultationId) {
            return allConsultations.find(c => c.id === selectedConsultationId) || allConsultations[0];
        }
        return allConsultations[0];
    }, [allConsultations, selectedConsultationId]);

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const diff = Date.now() - new Date(dob).getTime();
        return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const renderFieldValue = (value) => {
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'boolean') return value ? 'Sí' : 'No';
        return value;
    };

    const renderConsultationCard = (consultation, isLatest = false) => {
        if (!consultation) return null;
        const isDynamic = consultation.type === 'dynamic';

        return (
            <div key={consultation.id} className={`bg-white rounded-2xl border ${isLatest ? 'border-[#0A58CA]/30 shadow-md ring-1 ring-[#0A58CA]/10' : 'border-gray-100 shadow-sm'} p-6 transition-all`}>
                <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-100 mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            {isLatest ? (
                                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0A58CA] border border-blue-100 text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5 shadow-xs">
                                    <Stethoscope size={14} /> Última Consulta
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-bold">
                                    Consulta Previa
                                </span>
                            )}
                            {isDynamic && consultation.template_name && (
                                <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-md border border-gray-200">
                                    {consultation.template_name}
                                </span>
                            )}
                            {isDynamic && (
                                consultation.status === 'signed' ? (
                                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                        <CheckCircle2 size={13} /> Firmado
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center gap-1">
                                        <Clock size={13} /> Borrador
                                    </span>
                                )
                            )}
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mt-1">
                            {dayjs(consultation.date).format('DD [de] MMMM, YYYY [•] HH:mm [hs]')}
                        </h3>
                        {consultation.professional_name && (
                            <p className="text-xs text-gray-500 font-medium">
                                Atendido por: <span className="font-semibold text-gray-700">{consultation.professional_name}</span>
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => navigate(`/historial/${patient.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
                        title="Editar en el editor de historia clínica"
                    >
                        <Pencil size={14} /> Editar Consulta
                    </button>
                </div>

                {isDynamic ? (
                    <div className="space-y-4">
                        {consultation.fields.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">Sin campos configurados para este registro.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {consultation.fields.map(field => (
                                    <div key={field.id} className={field.type === 'long_text' || field.type === 'anatomical_map' ? 'col-span-full' : ''}>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{field.label}</h4>
                                        <div className="text-sm text-gray-800 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 min-h-[2.5rem] whitespace-pre-wrap">
                                            {consultation.data[field.id] ? renderFieldValue(consultation.data[field.id]) : <span className="text-gray-400 italic">No especificado</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {((consultation.archivos_adjuntos && consultation.archivos_adjuntos.length > 0) || (consultation.data && Array.isArray(consultation.data.archivos_adjuntos) && consultation.data.archivos_adjuntos.length > 0)) && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                    <ImageIcon size={14} className="text-[#0A58CA]"/> Archivos Adjuntos ({(consultation.archivos_adjuntos || consultation.data?.archivos_adjuntos || []).length})
                                </h4>
                                <div className="flex gap-3 flex-wrap">
                                    {(consultation.archivos_adjuntos || consultation.data?.archivos_adjuntos || []).map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                            <img src={url} alt={`Adjunto ${i}`} className="w-24 h-24 object-cover transition-transform group-hover:scale-110" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {consultation.reason_for_visit && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Motivo de la Consulta</h4>
                                <p className="text-sm text-gray-800 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    {consultation.reason_for_visit}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(consultation.blood_pressure || consultation.heart_rate) && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                        <Activity size={14} className="text-[#0A58CA]"/> Signos Vitales
                                    </h4>
                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium">
                                        <span>PA: <strong className="text-gray-900">{consultation.blood_pressure || '-'}</strong></span>
                                        <span className="mx-2">•</span>
                                        <span>FC: <strong className="text-gray-900">{consultation.heart_rate || '-'}</strong></span>
                                    </div>
                                </div>
                            )}

                            {consultation.diagnostico && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                        <Shield size={14} className="text-[#0A58CA]"/> Diagnóstico
                                    </h4>
                                    <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium">
                                        {consultation.diagnostico}
                                    </div>
                                </div>
                            )}
                        </div>

                        {consultation.physical_findings && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Examen / Hallazgos Físicos</h4>
                                <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap">
                                    {consultation.physical_findings}
                                </div>
                            </div>
                        )}

                        {consultation.tratamiento && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                    <ClipboardList size={14} className="text-[#0A58CA]"/> Plan de Tratamiento
                                </h4>
                                <div className="text-sm text-gray-800 bg-gray-50 p-3.5 rounded-xl border border-gray-100 whitespace-pre-wrap font-medium">
                                    {consultation.tratamiento}
                                </div>
                            </div>
                        )}

                        {consultation.archivos_adjuntos && consultation.archivos_adjuntos.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                    <ImageIcon size={14} className="text-[#0A58CA]"/> Archivos Adjuntos
                                </h4>
                                <div className="flex gap-3 flex-wrap">
                                    {consultation.archivos_adjuntos.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                            <img src={url} alt={`Adjunto ${i}`} className="w-24 h-24 object-cover transition-transform group-hover:scale-110" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (isLoadingPatients) return <div className="p-8 text-center text-gray-500">Cargando perfil del cliente...</div>;
    if (!patient) return <div className="p-8 text-center text-red-500">Cliente no encontrado.</div>;

    return (
        <div className="w-full min-h-full bg-[#F8FAFC] p-4 md:p-8 flex flex-col gap-6 font-sans">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111827]">Perfil del Cliente</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestión completa de información y registros.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left Column: General Info */}
                <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-6 sticky top-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 mb-4 shadow-sm">
                            {getInitials(patient.nombre)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{patient.nombre}</h2>
                        <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            {patient.status || 'Activo'}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Datos Personales</h3>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><User size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">DNI</p>
                                <p className="font-semibold">{patient.dni || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><Calendar size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Edad y Género</p>
                                <p className="font-semibold">{calculateAge(patient.fecha_nacimiento)} años • {patient.gender || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 shrink-0"><Droplet size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Grupo Sanguíneo</p>
                                <p className="font-semibold text-red-600">{patient.blood_type || 'No especificado'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</h3>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><Phone size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                                <p className="font-semibold">{patient.datos_contacto?.phone || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-700 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><Mail size={16} /></div>
                            <div className="truncate">
                                <p className="text-xs text-gray-500 font-medium">Email</p>
                                <p className="font-semibold truncate">{patient.datos_contacto?.email || 'No registrado'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Especialistas</h3>
                        
                        {patient.professionals && patient.professionals.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {patient.professionals.map(prof => (
                                    <div key={prof.id} className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 font-bold text-xs">
                                            {getInitials(prof.name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{prof.name}</p>
                                            <p className="text-xs text-gray-500">{prof.specialty || 'Especialista'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No hay profesionales asignados.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Tabs & Content */}
                <div className="w-full lg:w-2/3 flex flex-col gap-4">
                    {/* Tabs Navigation */}
                    <div className="flex bg-white rounded-xl border border-gray-100 p-1.5 shadow-sm w-full md:w-fit">
                        <button 
                            onClick={() => setActiveTab('clinica')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'clinica' ? 'bg-[#0A58CA] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Ficha de Cliente
                        </button>
                        <button 
                            onClick={() => setActiveTab('turnos')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'turnos' ? 'bg-[#0A58CA] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Historial de Turnos ({patientAppointments.length})
                        </button>
                    </div>

                    {/* Tab Content: Turnos */}
                    {activeTab === 'turnos' && (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20} /></div>
                                    <h3 className="font-bold text-gray-900 text-lg">Turnos Registrados ({patientAppointments.length})</h3>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">Selecciona un turno para destacar</span>
                            </div>
                            
                            <div className="flex flex-col divide-y divide-gray-100">
                                {isLoadingAppointments ? (
                                    <div className="p-8 text-center text-gray-500 text-sm font-medium">Cargando turnos...</div>
                                ) : patientAppointments.length === 0 ? (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                                            <Calendar size={32} />
                                        </div>
                                        <p className="text-gray-500 font-medium">Este cliente aún no tiene turnos registrados.</p>
                                    </div>
                                ) : (
                                    patientAppointments.map(appt => {
                                        const date = dayjs(appt.fecha_hora);
                                        const isPast = date.isBefore(dayjs());
                                        const isSelected = selectedAppointmentId === appt.id;

                                        return (
                                            <div 
                                                key={appt.id} 
                                                onClick={() => setSelectedAppointmentId(isSelected ? null : appt.id)}
                                                className={`p-5 transition-all cursor-pointer flex items-center justify-between ${
                                                    isSelected ? 'bg-blue-50/80 border-l-4 border-l-[#0A58CA]' : 'hover:bg-gray-50/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border shrink-0 ${
                                                        isSelected ? 'bg-[#0A58CA] text-white border-[#0A58CA]' : isPast ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-blue-50 border-blue-100 text-blue-700'
                                                    }`}>
                                                        <span className="text-xs font-bold uppercase">{date.format('MMM')}</span>
                                                        <span className="text-lg font-black leading-none">{date.format('DD')}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-gray-900">{date.format('dddd, DD MMMM YYYY')}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                                                appt.estado === 'completado' ? 'bg-green-100 text-green-700' : appt.estado === 'cancelado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {appt.estado || 'Pendiente'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                                                                <Clock size={14} /> {date.format('HH:mm')} hs
                                                            </span>
                                                            {appt.motivo && (
                                                                <span className="text-sm text-gray-500 flex items-center gap-1.5 border-l border-gray-200 pl-4">
                                                                    <Stethoscope size={14} /> {appt.motivo}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className={`transition-transform ${isSelected ? 'text-[#0A58CA] translate-x-1' : 'text-gray-300'}`} />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Historia Clinica */}
                    {activeTab === 'clinica' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 text-[#0A58CA]">
                                    <FileText size={20} />
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        Ficha del Cliente {allConsultations.length > 0 && `(${allConsultations.length})`}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => navigate(`/historial/${patient.id}`)} 
                                    className="bg-[#0A58CA] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Plus size={14} /> Nuevo Servicio / Editor <ExternalLink size={14} />
                                </button>
                            </div>

                            {isLoadingHistory || isLoadingRecords ? (
                                <div className="flex justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <Loader2 className="animate-spin text-[#0A58CA]" size={32} />
                                </div>
                            ) : allConsultations.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-gray-800 font-bold text-lg mb-1">Sin Fichas Registradas</h3>
                                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                                        Este cliente aún no posee registros cargados en su ficha.
                                    </p>
                                    <button 
                                        onClick={() => navigate(`/historial/${patient.id}`)}
                                        className="inline-flex items-center gap-2 bg-[#0A58CA] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                                    >
                                        <Plus size={16} /> Registrar Primer Servicio
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {/* Selector Pill Bar for Multiple Consultations */}
                                    {allConsultations.length > 1 && (
                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <History size={14} className="text-[#0A58CA]" /> Seleccionar Consulta ({allConsultations.length})
                                                </h4>
                                                <span className="text-xs text-gray-500 font-medium">Haz clic en una consulta para ver sus detalles</span>
                                            </div>
                                            
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                                {allConsultations.map((c, idx) => {
                                                    const isSelected = activeConsultation?.id === c.id;
                                                    return (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => setSelectedConsultationId(c.id)}
                                                            className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all shrink-0 min-w-[200px] ${
                                                                isSelected 
                                                                    ? 'bg-blue-50/90 border-[#0A58CA] ring-2 ring-blue-100 shadow-xs' 
                                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-1.5 mb-1 w-full justify-between">
                                                                <span className={`text-xs font-bold ${isSelected ? 'text-[#0A58CA]' : 'text-gray-900'}`}>
                                                                    {dayjs(c.date).format('DD MMM YYYY')}
                                                                </span>
                                                                {idx === 0 && (
                                                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0A58CA] text-[10px] font-extrabold uppercase">
                                                                        Última
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-600 truncate w-full font-medium">
                                                                {c.template_name || (c.type === 'dynamic' ? 'Plantilla Dinámica' : 'Consulta General')}
                                                            </span>
                                                            {c.professional_name && (
                                                                <span className="text-[11px] text-gray-400 truncate w-full mt-0.5">
                                                                    {c.professional_name}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Selected Consultation Detail Card */}
                                    {renderConsultationCard(
                                        activeConsultation, 
                                        activeConsultation?.id === allConsultations[0]?.id
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
