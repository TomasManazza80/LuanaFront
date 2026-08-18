import React, { useState, useEffect } from 'react';
import { 
  useCreateMedicalRecordMutation, 
  useUpdateMedicalRecordMutation, 
  useUploadImageMutation 
} from '../../services/api/kinesioApi';
import SpeechToTextButton from '../ui/SpeechToTextButton.jsx';
import { Image as ImageIcon, Camera, Loader2, X } from 'lucide-react';

export default function MedicalRecordForm({ template, patientId, recordId, initialData, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState(initialData || {});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [createRecord, { isLoading: isCreating }] = useCreateMedicalRecordMutation();
  const [updateRecord, { isLoading: isUpdating }] = useUpdateMedicalRecordMutation();
  const [uploadImage] = useUploadImageMutation();

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Parse template snapshot
  let fields = [];
  try {
    fields = typeof template?.fields === 'string' ? JSON.parse(template.fields) : template?.fields || [];
  } catch (e) {
    console.error("Error parsing template fields", e);
  }

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSpeechInput = (fieldId, text) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: prev[fieldId] ? prev[fieldId] + ' ' + text : text
    }));
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    setFormData(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter(item => item !== option) };
      }
    });
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
    } catch (error) {
      console.error(error);
      alert('No se pudieron subir las imágenes.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      archivos_adjuntos: (prev.archivos_adjuntos || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const saveRecord = async (status) => {
    // Basic validation
    const missingRequired = fields.some(f => f.required && !formData[f.id]);
    if (missingRequired && status === 'signed') {
      alert("Por favor, completa todos los campos obligatorios antes de firmar.");
      return;
    }

    try {
      if (recordId) {
        await updateRecord({
          id: recordId,
          record_data: formData,
          status
        }).unwrap();
      } else {
        await createRecord({
          patient_id: patientId,
          template_id: template?.id,
          record_data: formData,
          status
        }).unwrap();
      }
      alert(status === 'signed' ? 'Registro firmado y guardado.' : 'Guardado correctamente.');
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error al guardar el registro.');
    }
  };

  const renderField = (field) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'short_text':
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
            />
            <SpeechToTextButton onTranscript={(text) => handleSpeechInput(field.id, text)} />
          </div>
        );
      case 'long_text':
        return (
          <div className="flex gap-2">
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
            />
            <SpeechToTextButton onTranscript={(text) => handleSpeechInput(field.id, text)} className="self-start mt-1" />
          </div>
        );
      case 'pain_scale':
        return (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              className="w-full"
              value={value || 1}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
            <span className="font-bold text-red-500 w-8 text-center">{value || 1}</span>
          </div>
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={!!value}
              onChange={(e) => handleChange(field.id, e.target.checked)}
            />
            <span className="text-gray-700">Sí</span>
          </label>
        );
      case 'multiselect':
        return (
          <div className="space-y-2">
            {(field.options || ['Opción 1', 'Opción 2', 'Opción 3']).map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={(formData[field.id] || []).includes(opt)}
                  onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'anatomical_map':
        return (
          <div className="p-4 border border-purple-200 bg-purple-50/50 rounded-xl space-y-3">
            <p className="text-xs font-bold text-purple-700">Imágenes Anatómicas / Adjuntos</p>
            <div className="flex flex-wrap gap-3">
              {(formData[field.id] || []).map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={url} alt={`Anatómico ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => {
                      const current = formData[field.id] || [];
                      handleChange(field.id, current.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-100/50 text-purple-600 transition-colors">
                {isUploadingImage ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                <span className="text-[10px] font-bold mt-1">Añadir Foto</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    if (!files.length) return;
                    setIsUploadingImage(true);
                    try {
                      const uploadedUrls = [];
                      for (let file of files) {
                        const data = new FormData();
                        data.append('image', file);
                        const result = await uploadImage(data).unwrap();
                        if (result.success) uploadedUrls.push(result.url);
                      }
                      const current = formData[field.id] || [];
                      handleChange(field.id, [...current, ...uploadedUrls]);
                    } catch(err) {
                      alert('Error al subir imagen.');
                    } finally {
                      setIsUploadingImage(false);
                    }
                  }} 
                  disabled={isUploadingImage} 
                />
              </label>
            </div>
          </div>
        );
      default:
        return <p className="text-red-500">Tipo de campo no soportado</p>;
    }
  };

  const archivosAdjuntos = formData.archivos_adjuntos || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{template?.name || 'Formulario de Consulta'}</h2>
          {template?.description && <p className="text-sm text-gray-500 mt-1">{template.description}</p>}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {fields.length === 0 ? (
          <p className="text-gray-500">Esta plantilla no tiene campos definidos.</p>
        ) : (
          fields.map(field => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))
        )}

        {/* Global Photos & Attachments Section for Dynamic Records */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <ImageIcon size={18} className="text-[#0A58CA]" /> Archivos Adjuntos y Fotos
          </label>
          <div className="flex flex-wrap gap-4">
            {archivosAdjuntos.map((url, idx) => (
              <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 group shadow-xs">
                <img src={url} alt={`Adjunto ${idx}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
            <label className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#0A58CA] transition-colors text-gray-500 hover:text-[#0A58CA]">
              {isUploadingImage ? <Loader2 className="animate-spin mb-1" size={22} /> : <Camera size={22} className="mb-1" />}
              <span className="text-[11px] font-bold text-center px-1">{isUploadingImage ? 'Subiendo...' : 'Añadir Fotos'}</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
            </label>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => saveRecord('draft')}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          Guardar Borrador
        </button>
        <button
          onClick={() => saveRecord('signed')}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          Firmar y Guardar
        </button>
      </div>
    </div>
  );
}
