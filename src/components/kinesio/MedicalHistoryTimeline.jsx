import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    useGetPatientsQuery,
    useGetMedicalHistoryQuery,
    useGetMedicalRecordsQuery,
    useGetTemplatesQuery,
    useCreateMedicalHistoryMutation,
    useUpdateMedicalHistoryMutation,
    useUploadImageMutation,
    useUpdatePatientMutation
} from '../../services/api/kinesioApi.js';
import { 
    Activity, Stethoscope, Droplet, User, History, Mic, ShieldPlus as Shield, 
    ClipboardList, Save, Plus, ArrowLeft, Image as ImageIcon, Loader2, X, Camera, 
    Settings, Search, CheckCircle2, Clock, FileText, ChevronDown, ChevronUp, Sliders, Check, Layers, Pencil, Edit2 
} from 'lucide-react';
import { toast } from '../ui/use-toast.tsx';
import moment from 'moment';
import TemplateBuilder from './TemplateBuilder.jsx';
import MedicalRecordForm from './MedicalRecordForm.jsx';
import SpeechToTextButton from '../ui/SpeechToTextButton.jsx';

const MedicalHistoryEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isTemplateMode = searchParams.get('mode') === 'template' || location.state?.mode === 'template';

  const { data: patients, isLoading: isLoadingPatients } = useGetPatientsQuery();
  const { data: historyList = [], isLoading: isLoadingHistory, refetch: refetchHistory } = useGetMedicalHistoryQuery(id, { skip: !id });
  const { data: records = [], isLoading: isLoadingRecords, refetch: refetchRecords } = useGetMedicalRecordsQuery(id, { skip: !id });
  const { data: templates = [], isLoading: isLoadingTemplates } = useGetTemplatesQuery();

  const [createMedicalHistory, { isLoading: isSaving }] = useCreateMedicalHistoryMutation();
  const [updateMedicalHistory, { isLoading: isUpdatingHistory }] = useUpdateMedicalHistoryMutation();
  const [uploadImage] = useUploadImageMutation();
  const [updatePatient, { isLoading: isUpdatingPatient }] = useUpdatePatientMutation();

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    reason_for_visit: '',
    blood_pressure: '',
    heart_rate: '',
    physical_findings: '',
    diagnostico: '',
    tratamiento: '',
    archivos_adjuntos: []
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [viewMode, setViewMode] = useState(isTemplateMode ? 'template' : 'history'); // 'history', 'new', 'template'
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrevious, setShowPrevious] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editingPatientData, setEditingPatientData] = useState({});

  useEffect(() => {
    if (isTemplateMode) {
      setViewMode('template');
    }
  }, [isTemplateMode]);

  const selectedTemplate = useMemo(() => {
    if (!templates || templates.length === 0) return null;
    if (selectedTemplateId === 'standard') return null;
    if (selectedTemplateId) {
      return templates.find(t => t.id === selectedTemplateId) || null;
    }
    return templates[0] || null;
  }, [templates, selectedTemplateId]);

  const patient = useMemo(() => {
    if (!patients || !id) return null;
    return patients.find(p => p.id === parseInt(id));
  }, [patients, id]);

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

  const calculateAge = (dob) => {
      if (!dob) return 'N/A';
      const diff = Date.now() - new Date(dob).getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const getInitials = (name) => {
      if (!name) return '??';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpeechInput = (name, text) => {
      setFormData(prev => ({ ...prev, [name]: prev[name] ? prev[name] + ' ' + text : text }));
  };

  const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      setIsUploadingImage(true);
      try {
          const uploadedUrls = [];
          for (let file of files) {
              const data = new FormData();
              data.append('image', file);
              const result = await uploadImage(data).unwrap();
              if (result.success) {
                  uploadedUrls.push(result.url);
              } else {
                  throw new Error(result.message);
              }
          }
          setFormData(prev => ({
              ...prev,
              archivos_adjuntos: [...(prev.archivos_adjuntos || []), ...uploadedUrls]
          }));
          toast({ title: 'Éxito', description: 'Imágenes subidas correctamente.', variant: 'success' });
      } catch (error) {
          console.error(error);
          toast({ title: 'Error', description: 'No se pudieron subir las imágenes.', variant: 'error' });
      } finally {
          setIsUploadingImage(false);
      }
  };

  const removeImage = (indexToRemove) => {
      setFormData(prev => ({
          ...prev,
          archivos_adjuntos: prev.archivos_adjuntos.filter((_, idx) => idx !== indexToRemove)
      }));
  };

  const handleSave = async () => {
      if (!id) return;
      try {
          await createMedicalHistory({
              patient_id: parseInt(id),
              ...formData
          }).unwrap();
          toast({ title: 'Guardado', description: 'Registro guardado correctamente.', variant: 'success' });
          if (refetchHistory) refetchHistory();
          if (refetchRecords) refetchRecords();
          setFormData({
              reason_for_visit: '',
              blood_pressure: '',
              heart_rate: '',
              physical_findings: '',
              diagnostico: '',
              tratamiento: '',
              archivos_adjuntos: []
          });
          setViewMode('history');
      } catch (err) {
          toast({ title: 'Error', description: 'Ocurrió un error al guardar.', variant: 'error' });
      }
  };

  const handleStartEdit = (consultation) => {
    setEditingConsultation(consultation);
    if (consultation.type === 'static') {
      setFormData({
        reason_for_visit: consultation.reason_for_visit || '',
        blood_pressure: consultation.blood_pressure || '',
        heart_rate: consultation.heart_rate || '',
        physical_findings: consultation.physical_findings || '',
        diagnostico: consultation.diagnostico || '',
        tratamiento: consultation.tratamiento || '',
        archivos_adjuntos: consultation.archivos_adjuntos || []
      });
    }
    setViewMode('edit');
  };

  const handleUpdateStatic = async () => {
    if (!editingConsultation || editingConsultation.type !== 'static') return;
    try {
      await updateMedicalHistory({
        id: editingConsultation.raw.id,
        ...formData
      }).unwrap();
      toast({ title: 'Éxito', description: 'Registro actualizado correctamente.', variant: 'success' });
      if (refetchHistory) refetchHistory();
      setEditingConsultation(null);
      setViewMode('history');
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo actualizar el registro.', variant: 'error' });
    }
  };

  const renderFieldValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return value;
  };

  const renderConsultationCard = (consultation, isLatest = false) => {
    const isDynamic = consultation.type === 'dynamic';

    return (
      <div key={consultation.id} className={`bg-white rounded-2xl border ${isLatest ? 'border-[#0A58CA]/30 shadow-md ring-1 ring-[#0A58CA]/10' : 'border-gray-100 shadow-sm'} p-6 transition-all`}>
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-100 mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isLatest ? (
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0A58CA] border border-blue-100 text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5 shadow-xs">
                  <Stethoscope size={14} /> Último Servicio
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-bold">
                  Servicio Previo
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
              {moment(consultation.date).format('DD [de] MMMM, YYYY [•] HH:mm [hs]')}
            </h3>
            {consultation.professional_name && (
              <p className="text-xs text-gray-500 font-medium">
                Atendido por: <span className="font-semibold text-gray-700">{consultation.professional_name}</span>
              </p>
            )}
          </div>

          {/* Edit Action Button */}
          <button
            onClick={() => handleStartEdit(consultation)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
            title="Editar este registro médico"
          >
            <Pencil size={14} /> Editar Servicio
          </button>
        </div>

        {/* Body */}
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
            {consultation.status === 'signed' && consultation.signature_timestamp && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-blue-600 font-semibold bg-blue-50/50 p-3 rounded-xl">
                <CheckCircle2 size={16} /> Firmado digitalmente el {moment(consultation.signature_timestamp).format('DD/MM/YYYY [a las] HH:mm [hs]')}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {consultation.reason_for_visit && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Servicio Solicitado</h4>
                <p className="text-sm text-gray-800 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {consultation.reason_for_visit}
                </p>
              </div>
            )}



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultation.diagnostico && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Shield size={14} className="text-[#0A58CA]"/> Evaluación Inicial
                  </h4>
                  <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium">
                    {consultation.diagnostico}
                  </div>
                </div>
              )}
            </div>

            {consultation.physical_findings && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Observaciones / Análisis Inicial</h4>
                <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap">
                  {consultation.physical_findings}
                </div>
              </div>
            )}

            {consultation.tratamiento && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <ClipboardList size={14} className="text-[#0A58CA]"/> Tratamiento Realizado
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

  if (isLoadingPatients) return <div className="p-8 text-gray-500 flex justify-center"><Loader2 className="animate-spin text-[#0A58CA]" size={32} /></div>;

  if (id && !patient) return <div className="p-8 text-red-500">Cliente no encontrado.</div>;
  
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#F8FAFC] p-3 md:p-5 flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
              <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111827]">Ficha del Cliente</h1>
            <p className="text-xs text-gray-500 mt-0.5">Gestión de historial de servicios y tratamientos.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Template Selector Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsTemplateSelectorOpen(!isTemplateSelectorOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
              title="Seleccionar estructura de ficha del cliente"
            >
              <Sliders size={18} className="text-[#0A58CA]" /> 
              <span className="truncate max-w-[180px]">{selectedTemplate ? selectedTemplate.name : 'Formulario Estándar'}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            
            {isTemplateSelectorOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estructura Activa</p>
                </div>
                
                <button
                  onClick={() => { 
                    setSelectedTemplateId('standard'); 
                    setIsTemplateSelectorOpen(false); 
                    toast({ title: 'Estructura cambiada', description: 'Formulario Estándar activo.', variant: 'success' });
                  }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors ${selectedTemplateId === 'standard' || (!selectedTemplateId && !selectedTemplate) ? 'bg-blue-50/80 text-[#0A58CA] font-bold' : 'text-gray-700'}`}
                >
                  <span>Formulario Estándar</span>
                  {(selectedTemplateId === 'standard' || (!selectedTemplateId && !selectedTemplate)) && <Check size={16} className="text-[#0A58CA]" />}
                </button>
                
                {templates.map(t => (
                  <div key={t.id} className="flex items-center justify-between hover:bg-blue-50/60 transition-colors pr-2">
                    <button
                      onClick={() => { 
                        setSelectedTemplateId(t.id); 
                        setIsTemplateSelectorOpen(false); 
                        toast({ title: 'Estructura seleccionada', description: `Plantilla activa: ${t.name}`, variant: 'success' });
                      }}
                      className={`flex-1 text-left px-4 py-3 text-sm flex items-center justify-between ${(selectedTemplateId === t.id || (!selectedTemplateId && selectedTemplate?.id === t.id)) ? 'bg-blue-50/80 text-[#0A58CA] font-bold' : 'text-gray-700'}`}
                    >
                      <div>
                        <p className="font-bold">{t.name}</p>
                        {t.description && <p className="text-xs text-gray-400 truncate max-w-[180px]">{t.description}</p>}
                      </div>
                      {(selectedTemplateId === t.id || (!selectedTemplateId && selectedTemplate?.id === t.id)) && <Check size={16} className="text-[#0A58CA]" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTemplate(t);
                        setViewMode('template');
                        setIsTemplateSelectorOpen(false);
                      }}
                      className="p-1.5 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-colors"
                      title="Editar esta plantilla"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                  <button
                    onClick={() => { setEditingTemplate(null); setViewMode('template'); setIsTemplateSelectorOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> Crear nueva plantilla
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
              onClick={() => {
                if (viewMode === 'template') {
                  setEditingTemplate(null);
                  setViewMode(id ? 'history' : 'search');
                } else {
                  setEditingTemplate(null);
                  setViewMode('template');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                viewMode === 'template' 
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
          >
            <Settings size={18} className={viewMode === 'template' ? "text-purple-600" : "text-gray-500"} /> 
            {viewMode === 'template' ? 'Volver a Historiales' : 'Constructor de Plantillas'}
          </button>
        </div>
      </div>

      {viewMode === 'template' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="text-purple-600" /> {editingTemplate ? `Editando Plantilla: ${editingTemplate.name}` : 'Constructor de Plantillas de Servicios'}
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <TemplateBuilder 
                    templateToEdit={editingTemplate}
                    onSaveSuccess={async (saved) => {
                      if (refetchTemplates) {
                        await refetchTemplates();
                      }
                      if (saved && saved.id) {
                        setSelectedTemplateId(saved.id);
                      }
                      setEditingTemplate(null);
                      setViewMode(id ? 'history' : 'search');
                      toast({ title: 'Estructura lista', description: 'La estructura se actualizó de inmediato.', variant: 'success' });
                    }} 
                  />
              </div>
          </div>
      ) : (
        <>
          {/* Patient Summary Card */}
      {patient ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl bg-[#EDE9FE] text-[#6D28D9]">
                {getInitials(patient.nombre)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{patient.nombre}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><User size={14} /> {calculateAge(patient.fecha_nacimiento)} años</span>
                <span className="flex items-center gap-1.5"><User size={14} /> {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={() => {
                  setEditingPatientData({
                    id: patient.id,
                    nombre: patient.nombre || '',
                    dni: patient.dni || '',
                    fecha_nacimiento: patient.fecha_nacimiento ? new Date(patient.fecha_nacimiento).toISOString().split('T')[0] : '',
                    gender: patient.gender || '',
                    email: patient.datos_contacto?.email || '',
                    phone: patient.datos_contacto?.phone || ''
                  });
                  setIsEditingPatient(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            >
              <Edit2 size={16} /> Editar Perfil
            </button>
            <button 
                onClick={() => setViewMode(viewMode === 'history' ? 'new' : 'history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${viewMode === 'history' ? 'bg-[#0A58CA] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <History size={16} /> {viewMode === 'history' ? 'Nuevo Servicio' : 'Registros Previos'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Buscar Cliente</h2>
                    <p className="text-gray-500 mt-2">Busque un cliente por nombre o DNI para acceder a su historial de servicios.</p>
                </div>
                
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, apellido o DNI..."
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-12 p-4 transition-all outline-none"
                    />
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {patients && patients.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (p.dni && p.dni.includes(searchTerm))).map(p => (
                        <div 
                            key={p.id}
                            onClick={() => navigate(`/historial/${p.id}`)}
                            className="flex items-center gap-4 p-4 hover:bg-blue-50 rounded-xl cursor-pointer border border-transparent hover:border-blue-100 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                                {getInitials(p.nombre)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-blue-700">{p.nombre}</h4>
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                    <span>DNI: {p.dni || 'No registrado'}</span>
                                    <span>•</span>
                                    <span>{calculateAge(p.fecha_nacimiento)} años</span>
                                </p>
                            </div>
                        </div>
                    ))}
                    {patients && patients.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (p.dni && p.dni.includes(searchTerm))).length === 0 && (
                        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                            No se encontraron clientes que coincidan con su búsqueda.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {patient && viewMode === 'history' ? (
          <div className="flex flex-col gap-6">
              {isLoadingHistory || isLoadingRecords ? (
                  <div className="flex justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <Loader2 className="animate-spin text-[#0A58CA]" size={32} />
                  </div>
              ) : allConsultations.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-800 font-bold text-lg mb-1">Sin Servicios Registrados</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                          El cliente aún no posee servicios cargados en su ficha.
                      </p>
                      <button 
                          onClick={() => setViewMode('new')}
                          className="inline-flex items-center gap-2 bg-[#0A58CA] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                      >
                          <Plus size={16} /> Cargar Primer Servicio
                      </button>
                  </div>
              ) : (
                  <div>
                      {/* Direct view of the latest consultation */}
                      {renderConsultationCard(allConsultations[0], true)}

                      {/* Section for previous consultations */}
                      {allConsultations.length > 1 && (
                          <div className="mt-6">
                              <button 
                                  onClick={() => setShowPrevious(!showPrevious)}
                                  className="flex items-center justify-between w-full p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-left hover:bg-gray-50/80 transition-colors"
                              >
                                  <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                      <History size={16} className="text-[#0A58CA]" />
                                      Servicios Anteriores ({allConsultations.length - 1})
                                  </span>
                                  {showPrevious ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                              </button>
                              {showPrevious && (
                                  <div className="flex flex-col gap-4 mt-4">
                                      {allConsultations.slice(1).map(c => renderConsultationCard(c, false))}
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              )}
          </div>
      ) : patient && viewMode === 'edit' && editingConsultation ? (
          editingConsultation.type === 'dynamic' ? (
              <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-amber-900 font-bold">
                          <Pencil size={18} className="text-amber-600" />
                          <span>Editando servicio realizado ({moment(editingConsultation.date).format('DD/MM/YYYY HH:mm [hs]')})</span>
                      </div>
                      <button 
                          onClick={() => { setViewMode('history'); setEditingConsultation(null); }}
                          className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
                      >
                          Cancelar Edición
                      </button>
                  </div>
                  <MedicalRecordForm 
                      template={{ fields: editingConsultation.fields }} 
                      recordId={editingConsultation.raw.id}
                      initialData={editingConsultation.data}
                      patientId={patient.id} 
                      onSaveSuccess={() => {
                          if (refetchRecords) refetchRecords();
                          if (refetchHistory) refetchHistory();
                          setViewMode('history');
                          setEditingConsultation(null);
                          toast({ title: 'Éxito', description: 'Registro actualizado en el historial.', variant: 'success' });
                      }} 
                      onCancel={() => { setViewMode('history'); setEditingConsultation(null); }} 
                  />
              </div>
          ) : (
              <div className="flex flex-col gap-6">
                  <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-amber-900 font-bold">
                          <Pencil size={18} className="text-amber-600" />
                          <span>Editando servicio histórico ({moment(editingConsultation.date).format('DD/MM/YYYY HH:mm [hs]')})</span>
                      </div>
                      <button 
                          onClick={() => { setViewMode('history'); setEditingConsultation(null); }}
                          className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
                      >
                          Cancelar Edición
                      </button>
                  </div>

                  {/* Reason for Visit Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-[#0A58CA]">
                        <Stethoscope size={20} strokeWidth={2.5} />
                        <h3 className="text-lg font-bold text-gray-900">Motivo de la Consulta</h3>
                      </div>
                      <SpeechToTextButton onTranscript={(text) => handleSpeechInput('reason_for_visit', text)} />
                    </div>
                    <textarea 
                      name="reason_for_visit"
                      value={formData.reason_for_visit}
                      onChange={handleInputChange}
                      className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                      placeholder="Ingrese las observaciones principales del cliente..."
                    ></textarea>
                  </div>

                  {/* Physical Examination Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-2 text-[#0A58CA]">
                        <Activity size={20} strokeWidth={2.5} />
                        <h3 className="text-lg font-bold text-gray-900">Análisis Inicial</h3>
                      </div>
                      <SpeechToTextButton onTranscript={(text) => handleSpeechInput('physical_findings', text)} />
                    </div>
                    
                    <textarea 
                      name="physical_findings"
                      value={formData.physical_findings}
                      onChange={handleInputChange}
                      className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                      placeholder="Observaciones iniciales..."
                    ></textarea>
                  </div>

                  {/* Diagnosis & Treatment Plan Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Diagnosis Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-[#0A58CA]">
                          <Shield size={20} strokeWidth={2.5} />
                          <h3 className="text-lg font-bold text-gray-900">Evaluación Inicial</h3>
                        </div>
                        <SpeechToTextButton onTranscript={(text) => handleSpeechInput('diagnostico', text)} />
                      </div>
                      <textarea 
                        name="diagnostico"
                        value={formData.diagnostico}
                        onChange={handleInputChange}
                        className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                        placeholder="Evaluaciones principales y secundarias..."
                      ></textarea>
                    </div>

                    {/* Treatment Plan Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-[#0A58CA]">
                          <ClipboardList size={20} strokeWidth={2.5} />
                          <h3 className="text-lg font-bold text-gray-900">Tratamiento Realizado</h3>
                        </div>
                        <SpeechToTextButton onTranscript={(text) => handleSpeechInput('tratamiento', text)} />
                      </div>
                      <textarea 
                        name="tratamiento"
                        value={formData.tratamiento}
                        onChange={handleInputChange}
                        className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                        placeholder="Productos utilizados, procedimientos y recomendaciones..."
                      ></textarea>
                    </div>

                  </div>
                  
                  {/* Image Attachments Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex items-center gap-2 text-[#0A58CA] mb-4">
                          <ImageIcon size={20} strokeWidth={2.5} />
                          <h3 className="text-lg font-bold text-gray-900">Archivos Adjuntos (Imágenes/Fotos)</h3>
                      </div>
                      <div className="flex flex-wrap gap-4">
                          {formData.archivos_adjuntos.map((url, idx) => (
                              <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                                  <img src={url} alt={`Adjunto ${idx}`} className="w-full h-full object-cover" />
                                  <button 
                                      onClick={() => removeImage(idx)}
                                      className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  >
                                      <X size={14} strokeWidth={3} />
                                  </button>
                              </div>
                          ))}
                          <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#0A58CA] transition-colors text-gray-500 hover:text-[#0A58CA]">
                              {isUploadingImage ? <Loader2 className="animate-spin mb-2" size={24} /> : <Camera size={24} className="mb-2" />}
                              <span className="text-xs font-semibold text-center px-2">{isUploadingImage ? 'Subiendo...' : 'Añadir Fotos'}</span>
                              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                          </label>
                      </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end items-center mt-2 pb-8">
                    <button 
                      onClick={handleUpdateStatic}
                      disabled={isUpdatingHistory}
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-50"
                    >
                      {isUpdatingHistory ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2.5} />} 
                      Guardar Cambios
                    </button>
                  </div>
              </div>
          )
      ) : patient && viewMode === 'new' ? (
          selectedTemplate ? (
              <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <Layers size={18} className="text-[#0A58CA]" />
                          <span>Estructura de ficha activa: <strong className="text-gray-900 font-bold">{selectedTemplate.name}</strong></span>
                      </div>
                      <button 
                          onClick={() => setViewMode('history')}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                          Cancelar
                      </button>
                  </div>
                  <MedicalRecordForm 
                      template={selectedTemplate} 
                      patientId={patient.id} 
                      onSaveSuccess={() => {
                          if (refetchRecords) refetchRecords();
                          if (refetchHistory) refetchHistory();
                          setViewMode('history');
                          toast({ title: 'Éxito', description: 'Registro guardado en el historial.', variant: 'success' });
                      }} 
                      onCancel={() => setViewMode('history')} 
                  />
              </div>
          ) : (
              <>
                  {/* Reason for Visit Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-[#0A58CA]">
                        <Stethoscope size={20} strokeWidth={2.5} />
                        <h3 className="text-lg font-bold text-gray-900">Motivo de la Consulta</h3>
                      </div>
                      <SpeechToTextButton onTranscript={(text) => handleSpeechInput('reason_for_visit', text)} />
                    </div>
                    <textarea 
                      name="reason_for_visit"
                      value={formData.reason_for_visit}
                      onChange={handleInputChange}
                      className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                      placeholder="Ingrese las observaciones principales del cliente..."
                    ></textarea>
                  </div>

                  {/* Physical Examination Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-2 text-[#0A58CA]">
                        <Activity size={20} strokeWidth={2.5} />
                        <h3 className="text-lg font-bold text-gray-900">Análisis Inicial</h3>
                      </div>
                      <SpeechToTextButton onTranscript={(text) => handleSpeechInput('physical_findings', text)} />
                    </div>
                    
                    <textarea 
                      name="physical_findings"
                      value={formData.physical_findings}
                      onChange={handleInputChange}
                      className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                      placeholder="Observaciones iniciales..."
                    ></textarea>
                  </div>

                  {/* Diagnosis & Treatment Plan Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Diagnosis Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-[#0A58CA]">
                          <Shield size={20} strokeWidth={2.5} />
                          <h3 className="text-lg font-bold text-gray-900">Evaluación Inicial</h3>
                        </div>
                        <SpeechToTextButton onTranscript={(text) => handleSpeechInput('diagnostico', text)} />
                      </div>
                      <textarea 
                        name="diagnostico"
                        value={formData.diagnostico}
                        onChange={handleInputChange}
                        className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                        placeholder="Evaluaciones principales y secundarias..."
                      ></textarea>
                    </div>

                    {/* Treatment Plan Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-[#0A58CA]">
                          <ClipboardList size={20} strokeWidth={2.5} />
                          <h3 className="text-lg font-bold text-gray-900">Tratamiento Realizado</h3>
                        </div>
                        <SpeechToTextButton onTranscript={(text) => handleSpeechInput('tratamiento', text)} />
                      </div>
                      <textarea 
                        name="tratamiento"
                        value={formData.tratamiento}
                        onChange={handleInputChange}
                        className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                        placeholder="Productos utilizados, procedimientos y recomendaciones..."
                      ></textarea>
                    </div>

                  </div>
                  
                  {/* Image Attachments Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex items-center gap-2 text-[#0A58CA] mb-4">
                          <ImageIcon size={20} strokeWidth={2.5} />
                          <h3 className="text-lg font-bold text-gray-900">Archivos Adjuntos (Imágenes/Fotos)</h3>
                      </div>
                      <div className="flex flex-wrap gap-4">
                          {formData.archivos_adjuntos.map((url, idx) => (
                              <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                                  <img src={url} alt={`Adjunto ${idx}`} className="w-full h-full object-cover" />
                                  <button 
                                      onClick={() => removeImage(idx)}
                                      className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  >
                                      <X size={14} strokeWidth={3} />
                                  </button>
                              </div>
                          ))}
                          <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#0A58CA] transition-colors text-gray-500 hover:text-[#0A58CA]">
                              {isUploadingImage ? <Loader2 className="animate-spin mb-2" size={24} /> : <Camera size={24} className="mb-2" />}
                              <span className="text-xs font-semibold text-center px-2">{isUploadingImage ? 'Subiendo...' : 'Añadir Fotos'}</span>
                              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                          </label>
                      </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end items-center mt-2 pb-8">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-[#0A58CA] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2.5} />} 
                      Guardar Registro
                    </button>
                  </div>
              </>
          )
      ) : null}
      
        </>
      )}

      {isEditingPatient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
                    <h3 className="font-bold text-lg text-gray-900">Editar Perfil del Cliente</h3>
                    <button type="button" onClick={() => setIsEditingPatient(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <form 
                    onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const payload = {
                                nombre: editingPatientData.nombre,
                                dni: editingPatientData.dni,
                                fecha_nacimiento: editingPatientData.fecha_nacimiento || null,
                                gender: editingPatientData.gender,
                                email: editingPatientData.email,
                                phone: editingPatientData.phone,
                                datos_contacto: {
                                    email: editingPatientData.email,
                                    phone: editingPatientData.phone
                                }
                            };
                            await updatePatient({ id: editingPatientData.id, ...payload }).unwrap();
                            toast({ title: 'Éxito', description: 'Perfil actualizado correctamente.', variant: 'success' });
                            setIsEditingPatient(false);
                        } catch (error) {
                            toast({ title: 'Error', description: 'No se pudo actualizar el perfil.', variant: 'error' });
                        }
                    }} 
                    className="p-5 flex flex-col gap-4 overflow-y-auto"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo *</label>
                            <input 
                                type="text" 
                                required
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                value={editingPatientData.nombre}
                                onChange={(e) => setEditingPatientData({...editingPatientData, nombre: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">DNI</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                value={editingPatientData.dni}
                                onChange={(e) => setEditingPatientData({...editingPatientData, dni: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                value={editingPatientData.email}
                                onChange={(e) => setEditingPatientData({...editingPatientData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                value={editingPatientData.phone}
                                onChange={(e) => setEditingPatientData({...editingPatientData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Nacimiento</label>
                            <input 
                                type="date"
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                value={editingPatientData.fecha_nacimiento}
                                onChange={(e) => setEditingPatientData({...editingPatientData, fecha_nacimiento: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Género</label>
                            <select 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                value={editingPatientData.gender}
                                onChange={(e) => setEditingPatientData({...editingPatientData, gender: e.target.value})}
                            >
                                <option value="">Seleccione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => setIsEditingPatient(false)}
                            className="px-4 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isUpdatingPatient}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {isUpdatingPatient ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default MedicalHistoryEntry;
