import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { Search, Plus, RotateCcw, Edit, X, Trash2, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetPatientsQuery, useUpdatePatientMutation, useCreatePatientMutation, useDeletePatientMutation, useGetProfessionalsQuery } from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import es from 'date-fns/locale/es';

registerLocale('es', es);

const parseDateString = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
};

const formatDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const PatientList = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.authSlice.userInfo);
  const [activeFilter, setActiveFilter] = useState('Todos los Clientes');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: patients = [], isLoading } = useGetPatientsQuery();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [deletePatient] = useDeletePatientMutation();
  const { data: professionalsResponse } = useGetProfessionalsQuery();
  const professionals = professionalsResponse?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const filters = ['Todos los Clientes', 'Visitas Recientes', 'Requiere Seguimiento', 'Nuevos esta Semana'];

  const filteredPatients = patients.filter(p => {
      if (!p.nombre) return false;
      return p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toString().includes(searchQuery);
  });

  const calculateAge = (dob) => {
      if (!dob) return 'N/A';
      const diff = Date.now() - new Date(dob).getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const getInitials = (name) => {
      if (!name) return '??';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleOpenModal = (patient = null) => {
      if (patient) {
          setEditingPatient({
              id: patient.id,
              nombre: patient.nombre || '',
              fecha_nacimiento: patient.fecha_nacimiento ? patient.fecha_nacimiento.split('T')[0] : '',
              gender: patient.gender || '',
              blood_type: patient.blood_type || '',
              status: patient.status || '',
              email: patient.datos_contacto?.email || '',
              phone: patient.datos_contacto?.phone || '',
              professionalIds: patient.professionals ? patient.professionals.map(p => p.id) : []
          });
      } else {
          setEditingPatient({
              nombre: '',
              fecha_nacimiento: '',
              gender: '',
              blood_type: '',
              status: '',
              email: '',
              phone: '',
              professionalIds: []
          });
      }
      setIsModalOpen(true);
  };

  const handleSave = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              nombre: editingPatient.nombre,
              fecha_nacimiento: editingPatient.fecha_nacimiento || null,
              gender: editingPatient.gender,
              blood_type: editingPatient.blood_type,
              status: editingPatient.status,
              datos_contacto: {
                  email: editingPatient.email,
                  phone: editingPatient.phone
              },
              professionalIds: editingPatient.professionalIds
          };

          if (editingPatient.id) {
              await updatePatient({ id: editingPatient.id, ...payload }).unwrap();
          } else {
              await createPatient(payload).unwrap();
          }
          setIsModalOpen(false);
      } catch (error) {
          console.error("Error saving patient", error);
          toast({ title: 'Error', description: 'Error al guardar cliente', variant: 'destructive' });
      }
  };

  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      setDeleteError(null);
      await deletePatient(patientToDelete.id).unwrap();
      setPatientToDelete(null);
    } catch (error) {
      console.error('Failed to delete patient:', error);
      setDeleteError('No se pudo eliminar el cliente. Verifica que no tenga registros bloqueantes.');
    }
  };

  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden p-3 md:p-5 bg-white min-h-screen">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111827]">Clientes</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestiona el historial y datos de tus clientes.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0A58CA] transition-shadow"
            />
          </div>
          <button 
            onClick={() => navigate('/historial?mode=template')}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg font-semibold shadow-xs transition-all flex items-center gap-1.5 text-xs whitespace-nowrap"
            title="Editar estructura del historial médico"
          >
            <Settings size={15} className="text-purple-600" /> Editar Estructura Historial
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#0A58CA] hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-1.5 text-xs whitespace-nowrap"
          >
            <Plus size={15} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
              activeFilter === filter 
                ? 'bg-[#F3E8FF] text-[#6D28D9] border-transparent' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
          <div className="text-center py-8 text-xs text-gray-500">Cargando clientes...</div>
      ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs w-full max-w-full">
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="p-2.5 pl-4">Cliente</th>
                    <th className="p-2.5">Contacto</th>
                    <th className="p-2.5">Detalles</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 pr-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      onClick={() => navigate(`/pacientes/${patient.id}`)}
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="p-2.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[#EDE9FE] text-[#6D28D9] shrink-0">
                            {getInitials(patient.nombre)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-xs">{patient.nombre}</div>
                            <div className="text-[10px] text-gray-500">ID: {patient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="text-xs font-medium text-gray-900">{patient.datos_contacto?.phone || '-'}</div>
                        <div className="text-[11px] text-gray-500">{patient.datos_contacto?.email || '-'}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="text-xs text-gray-900">{calculateAge(patient.fecha_nacimiento)} años</div>
                        <div className="text-[11px] text-gray-500">{patient.gender || '-'} • {patient.blood_type || '-'}</div>
                      </td>
                      <td className="p-2.5">
                        {patient.status ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            {patient.status}
                          </span>
                        ) : <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="p-2.5 pr-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/pacientes/${patient.id}`); }}
                            className="p-1.5 rounded-lg text-[#0A58CA] hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                            title="Ver Perfil de Cliente"
                          >
                            <User size={15} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(patient); }}
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                            title="Editar Cliente"
                          >
                            <Edit size={15} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient); }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                            title="Eliminar Cliente"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-500">No se encontraron clientes.</div>
              )}
            </div>
          </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
                      <h3 className="font-bold text-lg text-gray-900">
                          {editingPatient?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
                      </h3>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-5 flex flex-col gap-4 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo *</label>
                              <input 
                                  type="text" 
                                  required
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                  value={editingPatient?.nombre || ''}
                                  onChange={(e) => setEditingPatient({...editingPatient, nombre: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">DNI</label>
                              <input 
                                  type="text" 
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                  value={editingPatient?.dni || ''}
                                  onChange={(e) => setEditingPatient({...editingPatient, dni: e.target.value})}
                              />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                              <input 
                                  type="email" 
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                  value={editingPatient?.email || ''}
                                  onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                              <input 
                                  type="text" 
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                  value={editingPatient?.phone || ''}
                                  onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Nacimiento</label>
                              <DatePicker
                                  selected={parseDateString(editingPatient?.fecha_nacimiento)}
                                  onChange={(date) => setEditingPatient({...editingPatient, fecha_nacimiento: formatDateString(date)})}
                                  dateFormat="dd/MM/yyyy"
                                  locale="es"
                                  showMonthDropdown
                                  showYearDropdown
                                  dropdownMode="select"
                                  placeholderText="Seleccione fecha"
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                  wrapperClassName="w-full"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Género</label>
                              <select 
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                  value={editingPatient?.gender || ''}
                                  onChange={(e) => setEditingPatient({...editingPatient, gender: e.target.value})}
                              >
                                  <option value="">Seleccione</option>
                                  <option value="M">Masculino</option>
                                  <option value="F">Femenino</option>
                                  <option value="Otro">Otro</option>
                              </select>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Piel</label>
                              <select 
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                  value={editingPatient?.blood_type || ''}
                                  onChange={(e) => setEditingPatient({...editingPatient, blood_type: e.target.value})}
                              >
                                  <option value="">Seleccione</option>
                                  <option value="Normal">Normal</option>
                                  <option value="Seca">Seca</option>
                                  <option value="Grasa">Grasa</option>
                                  <option value="Mixta">Mixta</option>
                                  <option value="Sensible">Sensible</option>
                                  <option value="Madura">Madura</option>
                                  <option value="Acnéica">Acnéica</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                              <input 
                                  type="text" 
                                  placeholder="Ej. Estable, En tratamiento"
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                  value={editingPatient?.status || ''}
                                  onChange={(e) => setEditingPatient({...editingPatient, status: e.target.value})}
                              />
                          </div>
                      </div>

                      {['ADMIN', 'EMPLOYEE'].includes(user?.role) && (
                          <div className="grid grid-cols-1 gap-4">
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profesionales Asignados</label>
                                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      {professionals.map(prof => (
                                          <label key={prof.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                              <input 
                                                  type="checkbox" 
                                                  className="rounded text-[#0A58CA] focus:ring-[#0A58CA]"
                                                  checked={editingPatient?.professionalIds?.includes(prof.id) || false}
                                                  onChange={(e) => {
                                                      const newIds = e.target.checked 
                                                          ? [...(editingPatient.professionalIds || []), prof.id]
                                                          : (editingPatient.professionalIds || []).filter(id => id !== prof.id);
                                                      setEditingPatient({...editingPatient, professionalIds: newIds});
                                                  }}
                                              />
                                              {prof.name}
                                          </label>
                                      ))}
                                      {professionals.length === 0 && (
                                          <span className="text-gray-400 text-sm">No hay profesionales disponibles.</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}

                      <div className="mt-4 flex justify-end gap-2">
                          <button 
                              type="button" 
                              onClick={() => setIsModalOpen(false)}
                              className="px-4 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                          >
                              Cancelar
                          </button>
                          <button 
                              type="submit" 
                              disabled={isCreating || isUpdating}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
                          >
                              {isCreating || isUpdating ? 'Guardando...' : 'Guardar Cliente'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                      <Trash2 className="text-red-600" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Eliminar Cliente</h2>
                  <p className="text-center text-gray-500 mb-6">
                      ¿Estás seguro de que quieres eliminar a <span className="font-bold text-gray-700">{patientToDelete.nombre}</span>? 
                      Se eliminarán también sus turnos y su historial clínico. Esta acción no se puede deshacer.
                  </p>
                  
                  {deleteError && (
                      <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg mb-4 text-center">
                          {deleteError}
                      </div>
                  )}

                  <div className="flex justify-center gap-3">
                      <button 
                          onClick={() => {
                              setPatientToDelete(null);
                              setDeleteError(null);
                          }}
                          className="flex-1 px-5 py-2.5 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                      >
                          Sí, eliminar
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default PatientList;
