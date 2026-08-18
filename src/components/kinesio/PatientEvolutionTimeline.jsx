import React from 'react';
import { useGetMedicalRecordsQuery } from '../../services/api/kinesioApi';
import { Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PatientEvolutionTimeline({ patientId }) {
  const { data: records = [], isLoading: loading } = useGetMedicalRecordsQuery(patientId, {
    skip: !patientId
  });

  const renderFieldValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return value;
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Cargando historial clínico...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-gray-800 font-medium">Sin Evoluciones</h3>
        <p className="text-sm text-gray-500">El cliente aún no tiene registros en su ficha.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {records.map((record, index) => {
        const isSigned = record.status === 'signed';
        
        let templateFields = [];
        try {
           templateFields = typeof record.template_snapshot === 'string' 
             ? JSON.parse(record.template_snapshot) 
             : (record.template_snapshot || []);
        } catch(e) {}

        const recordData = typeof record.record_data === 'string' 
           ? JSON.parse(record.record_data) 
           : (record.record_data || {});

        return (
          <div key={record.id} className="relative pl-8">
            {/* Timeline Line */}
            {index !== records.length - 1 && (
              <div className="absolute top-10 left-3.5 bottom-[-2rem] w-px bg-gray-200"></div>
            )}
            
            {/* Timeline Dot */}
            <div className={`absolute top-1.5 left-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${isSigned ? 'bg-blue-500' : 'bg-gray-400'}`}>
              {isSigned ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {record.template_name}
                    {!isSigned && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Borrador</span>}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Profesional: <span className="font-medium text-gray-700">{record.professional_name}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(record.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(record.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {templateFields.length === 0 ? (
                  <p className="text-gray-500 italic">Los datos de este registro no están disponibles o usaban un formato antiguo.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {templateFields.map(field => (
                      <div key={field.id} className={field.type === 'long_text' || field.type === 'anatomical_map' ? 'col-span-full' : ''}>
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{field.label}</h5>
                        <div className="text-sm text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg min-h-[2.5rem]">
                          {recordData[field.id] ? renderFieldValue(recordData[field.id]) : <span className="text-gray-400 italic">No especificado</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {isSigned && record.signature_timestamp && (
                <div className="px-6 py-3 border-t border-gray-100 bg-blue-50/50 rounded-b-2xl text-xs text-blue-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Firmado digitalmente el {format(new Date(record.signature_timestamp), "dd/MM/yyyy HH:mm")}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
