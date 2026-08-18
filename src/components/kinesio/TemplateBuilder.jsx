import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, Plus, Trash2, Settings, FileText, Type, CheckSquare, 
  List, Image as ImageIcon, Activity, Eye, Edit3, Save, ArrowUp, 
  ArrowDown, Sparkles, Check, HelpCircle, Layers, RefreshCw, AlertCircle
} from 'lucide-react';
import { useCreateTemplateMutation, useUpdateTemplateMutation } from '../../services/api/kinesioApi';
import { toast } from '../ui/use-toast.tsx';

// Sortable Field Item Component in Builder Mode
function SortableFieldCard({ 
  field, 
  index, 
  totalFields,
  updateField, 
  removeField, 
  moveField 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const [newOptionText, setNewOptionText] = useState('');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = (type) => {
    switch (type) {
      case 'short_text': return <Type className="w-4 h-4 text-blue-600" />;
      case 'long_text': return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'pain_scale': return <Activity className="w-4 h-4 text-red-500" />;
      case 'checkbox': return <CheckSquare className="w-4 h-4 text-emerald-600" />;
      case 'multiselect': return <List className="w-4 h-4 text-amber-600" />;
      case 'anatomical_map': return <ImageIcon className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    const currentOptions = field.options || [];
    updateField(field.id, { options: [...currentOptions, newOptionText.trim()] });
    setNewOptionText('');
  };

  const handleRemoveOption = (optIdx) => {
    const currentOptions = field.options || [];
    updateField(field.id, { options: currentOptions.filter((_, i) => i !== optIdx) });
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all p-5 mb-4 group ${
        isDragging ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200/80'
      }`}
    >
      {/* Card Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button 
            {...attributes} 
            {...listeners} 
            className="cursor-grab hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
            title="Arrastrar para reordenar"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <div className="p-2 bg-gray-50 rounded-xl flex items-center gap-2 border border-gray-100">
            {getIcon(field.type)}
            <span className="text-xs font-bold text-gray-600 capitalize">
              {field.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Move Up/Down controls */}
          <button
            onClick={() => moveField(index, -1)}
            disabled={index === 0}
            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-50 transition-colors"
            title="Mover arriba"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => moveField(index, 1)}
            disabled={index === totalFields - 1}
            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-50 transition-colors"
            title="Mover abajo"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button 
            onClick={() => removeField(field.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
            title="Eliminar este campo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content & Field Configuration */}
      <div className="space-y-4">
        {/* Label & Required Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Nombre / Etiqueta del Campo
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ej. Diagnóstico Kinesiológico Principal"
            />
          </div>

          <div className="md:col-span-4 flex items-center justify-end md:pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 transition-colors w-full md:w-auto justify-center">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span>Campo Obligatorio</span>
            </label>
          </div>
        </div>

        {/* Options Config for Multiselect */}
        {field.type === 'multiselect' && (
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Opciones Seleccionables
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(field.options || []).map((opt, optIdx) => (
                <span 
                  key={optIdx} 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold"
                >
                  {opt}
                  <button 
                    onClick={() => handleRemoveOption(optIdx)} 
                    className="hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
              {(!field.options || field.options.length === 0) && (
                <span className="text-xs text-gray-400 italic">No hay opciones agregadas aún.</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                placeholder="Añadir opción (ej. Cuello)..."
                className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TemplateBuilder({ templateToEdit, onSaveSuccess }) {
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [fields, setFields] = useState([]);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'liveview'
  
  // LiveView interactive test values state
  const [liveViewData, setLiveViewData] = useState({});

  const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (templateToEdit) {
      setTemplateName(templateToEdit.name || '');
      setTemplateDesc(templateToEdit.description || '');
      let parsedFields = [];
      try {
        parsedFields = typeof templateToEdit.fields === 'string' ? JSON.parse(templateToEdit.fields) : templateToEdit.fields || [];
      } catch (e) {}
      setFields(parsedFields);
    }
  }, [templateToEdit]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = (type) => {
    const defaultLabels = {
      short_text: 'Motivo de Consulta / Síntoma',
      long_text: 'Observaciones Fisioterapéuticas',
      pain_scale: 'Escala de Dolor EVA (1-10)',
      checkbox: '¿Requiere Seguimiento Semanal?',
      multiselect: 'Zona o Articulación Afectada',
      anatomical_map: 'Mapa de Puntos Anatómicos'
    };

    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      label: defaultLabels[type] || `Campo de ${type}`,
      required: false,
      options: type === 'multiselect' ? ['Cervical', 'Lumbar', 'Hombro', 'Rodilla'] : []
    };
    setFields([...fields, newField]);
  };

  const updateField = (id, updatedProperties) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updatedProperties } : f));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const moveField = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    setFields(prev => arrayMove(prev, index, newIndex));
  };

  // Quick Preset Loader for Kinesiology
  const loadKinesiologyPreset = () => {
    setTemplateName('Evaluación Kinesiológica Integral');
    setTemplateDesc('Estructura completa para la primera consulta de evaluación y seguimiento kinesiológico.');
    setFields([
      {
        id: `field_${Date.now()}_1`,
        type: 'short_text',
        label: 'Motivo Principal de Consulta',
        required: true
      },
      {
        id: `field_${Date.now()}_2`,
        type: 'pain_scale',
        label: 'Escala Análoga Visual del Dolor (EVA 1-10)',
        required: true
      },
      {
        id: `field_${Date.now()}_3`,
        type: 'multiselect',
        label: 'Zona Anatómica Afectada',
        required: false,
        options: ['Cervical', 'Dorsal', 'Lumbar', 'Hombro', 'Codo', 'Muñeca', 'Cadera', 'Rodilla', 'Tobillo']
      },
      {
        id: `field_${Date.now()}_4`,
        type: 'long_text',
        label: 'Examen Físico y Pruebas Funcionales',
        required: false
      },
      {
        id: `field_${Date.now()}_5`,
        type: 'long_text',
        label: 'Diagnóstico Kinesiológico y Plan de Tratamiento',
        required: true
      },
      {
        id: `field_${Date.now()}_6`,
        type: 'checkbox',
        label: '¿Se requiere reposo o suspensión de actividad física?',
        required: false
      }
    ]);
    toast({ title: 'Preset Cargado', description: 'Plantilla Kinesiológica Integral aplicada.', variant: 'success' });
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast({ title: 'Error', description: 'Por favor ingresa un nombre para la plantilla.', variant: 'error' });
      return;
    }
    if (fields.length === 0) {
      toast({ title: 'Error', description: 'Agrega al menos un campo a la plantilla.', variant: 'error' });
      return;
    }

    try {
      let saved;
      if (templateToEdit && templateToEdit.id) {
        saved = await updateTemplate({
          id: templateToEdit.id,
          name: templateName.trim(),
          description: templateDesc.trim(),
          fields: fields
        }).unwrap();
      } else {
        saved = await createTemplate({
          name: templateName.trim(),
          description: templateDesc.trim(),
          fields: fields
        }).unwrap();
      }
      
      toast({ title: '¡Éxito!', description: 'La plantilla clínica se guardó y actualizó correctamente.', variant: 'success' });
      setTemplateName('');
      setTemplateDesc('');
      setFields([]);
      setLiveViewData({});

      if (onSaveSuccess) {
        onSaveSuccess(saved);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({ title: 'Error', description: 'Hubo un problema al guardar la plantilla.', variant: 'error' });
    }
  };

  const fieldTypes = [
    { type: 'short_text', label: 'Texto Corto', icon: Type, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { type: 'long_text', label: 'Texto Largo / Notas', icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { type: 'pain_scale', label: 'Escala de Dolor (1-10)', icon: Activity, color: 'text-red-500 bg-red-50 border-red-100' },
    { type: 'checkbox', label: 'Casilla de Verificación', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { type: 'multiselect', label: 'Selección Múltiple', icon: List, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { type: 'anatomical_map', label: 'Mapa Anatómico / Fotos', icon: ImageIcon, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen p-4 md:p-8 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-wider">
              Diseñador de Formularios
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mt-1">
            Constructor de Plantillas Clínicas
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Crea formularios estructurados y pruébalos en vivo con LiveView antes de usarlos en consultas.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="bg-gray-200/80 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'editor' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 className="w-4 h-4 text-purple-600" /> Modo Edición ({fields.length})
            </button>
            <button
              onClick={() => setActiveTab('liveview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'liveview' 
                  ? 'bg-white text-[#0A58CA] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4 text-[#0A58CA]" /> LiveView en Vivo
            </button>
          </div>

          {/* Save Button */}
          <button 
            onClick={saveTemplate}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0A58CA] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Settings, Presets & Toolbox */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Template Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-600" /> Información de la Plantilla
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nombre de la Estructura *
                </label>
                <input 
                  type="text" 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ej: Evaluación Traumatológica Hombro"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Descripción (Opcional)
                </label>
                <textarea 
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Propósito de este formulario..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Preset Loader Banner */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-purple-950">Preset Kinesiología Rápido</h4>
                <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                  Carga automáticamente una plantilla estándar con Escala de Dolor EVA, Diagnóstico y Examen Funcional.
                </p>
                <button
                  onClick={loadKinesiologyPreset}
                  className="mt-3 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Aplicar Preset Estándar
                </button>
              </div>
            </div>
          </div>

          {/* Add Field Toolbox */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Añadir Nuevos Campos
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {fieldTypes.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-blue-50/60 border border-gray-100 hover:border-blue-200 rounded-xl transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border transition-transform group-hover:scale-110 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-[#0A58CA]">{label}</span>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#0A58CA] transition-colors" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Main Area: Builder Canvas or LiveView */}
        <div className="lg:col-span-8">
          
          {activeTab === 'editor' ? (
            /* Builder Canvas View */
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600" /> Estructura del Formulario
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Personaliza los nombres de cada campo y arrastra para reordenar.
                  </p>
                </div>
                {fields.length > 0 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                    {fields.length} {fields.length === 1 ? 'campo' : 'campos'}
                  </span>
                )}
              </div>

              <div className="flex-grow">
                {fields.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 min-h-[400px]">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 border border-gray-100">
                      <Settings className="w-8 h-8 text-purple-500 animate-spin-slow" />
                    </div>
                    <h4 className="text-gray-900 font-bold text-base mb-1">Canvas Vacío</h4>
                    <p className="text-xs text-gray-500 max-w-sm mb-6">
                      Haz clic en los tipos de campo del panel izquierdo o usa un preset rápido para construir tu plantilla clínica.
                    </p>
                    <button
                      onClick={loadKinesiologyPreset}
                      className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> Cargar Plantilla Kinesiológica de Ejemplo
                    </button>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      {fields.map((field, idx) => (
                        <SortableFieldCard 
                          key={field.id} 
                          field={field} 
                          index={idx}
                          totalFields={fields.length}
                          updateField={updateField}
                          removeField={removeField} 
                          moveField={moveField}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          ) : (
            /* LiveView Preview Screen */
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 min-h-[600px] flex flex-col">
              {/* LiveView Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0A58CA] text-white rounded-xl shadow-xs">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Vista Previa en Vivo (LiveView)</h3>
                    <p className="text-xs text-blue-700">
                      Simulación interactiva de cómo completará este formulario un profesional en la historia clínica.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Interactivo
                </span>
              </div>

              {/* Form Title Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900">
                  {templateName || 'Sin Título de Plantilla'}
                </h2>
                {templateDesc && (
                  <p className="text-sm text-gray-500 mt-1 font-medium">{templateDesc}</p>
                )}
              </div>

              {/* Live Form Renderer */}
              {fields.length === 0 ? (
                <div className="p-12 text-center text-gray-400 italic">
                  No hay campos configurados para previsualizar en LiveView.
                </div>
              ) : (
                <div className="space-y-6 flex-grow">
                  {fields.map(field => {
                    const value = liveViewData[field.id] || '';

                    return (
                      <div key={field.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-2xs">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'short_text' && (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setLiveViewData({ ...liveViewData, [field.id]: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Ingrese ${field.label.toLowerCase()}...`}
                          />
                        )}

                        {field.type === 'long_text' && (
                          <textarea
                            rows={3}
                            value={value}
                            onChange={(e) => setLiveViewData({ ...liveViewData, [field.id]: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder={`Ingrese detalles de ${field.label.toLowerCase()}...`}
                          />
                        )}

                        {field.type === 'pain_scale' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-green-600 font-bold">1 (Leve)</span>
                              <span className="text-sm font-black text-red-600 px-3 py-1 bg-red-50 rounded-lg border border-red-100">
                                Valor: {value || 1} / 10
                              </span>
                              <span className="text-xs text-red-600 font-bold">10 (Severo)</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={value || 1}
                              onChange={(e) => setLiveViewData({ ...liveViewData, [field.id]: e.target.value })}
                              className="w-full h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        )}

                        {field.type === 'checkbox' && (
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!value}
                              onChange={(e) => setLiveViewData({ ...liveViewData, [field.id]: e.target.checked })}
                              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-semibold text-gray-700">Sí, marcar opción</span>
                          </label>
                        )}

                        {field.type === 'multiselect' && (
                          <div className="flex flex-wrap gap-2">
                            {(field.options || []).map((opt, i) => {
                              const selectedOptions = Array.isArray(value) ? value : [];
                              const isSelected = selectedOptions.includes(opt);

                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    const next = isSelected 
                                      ? selectedOptions.filter(o => o !== opt)
                                      : [...selectedOptions, opt];
                                    setLiveViewData({ ...liveViewData, [field.id]: next });
                                  }}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {field.type === 'anatomical_map' && (
                          <div className="p-8 border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-xl text-center text-purple-700 font-semibold text-xs flex flex-col items-center gap-2">
                            <ImageIcon className="w-8 h-8 text-purple-400" />
                            <span>[Componente Interactivo de Mapa Anatómico / Carga de Fotos]</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
