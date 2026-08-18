import React, { useState, useMemo } from 'react';
import { useGetAppointmentsQuery } from '../../services/api/kinesioApi.js';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/index.js';
import { Search, Calendar as CalendarIcon, Filter, User, Stethoscope, ChevronLeft, ChevronRight, Loader2, Edit2, Trash2, Phone, X, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useDeleteAppointmentMutation, useUpdateAppointmentMutation } from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast.tsx';

const AppointmentHistory = () => {
    const user = useSelector(state => state.authSlice.userInfo);
    const { data: appointments, isLoading, isError } = useGetAppointmentsQuery({}, { refetchOnMountOrArgChange: true });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [deleteAppointment] = useDeleteAppointmentMutation();
    const [updateAppointment] = useUpdateAppointmentMutation();
    const [editingAppt, setEditingAppt] = useState(null);
    const [deletingAppt, setDeletingAppt] = useState(null);

    const filteredAppointments = useMemo(() => {
        if (!appointments) return [];
        return appointments.filter(appt => {
            const matchesSearch = appt.patient?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  appt.patient?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  appt.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || appt.estado === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)); // Sort descending by date
    }, [appointments, searchTerm, statusFilter]);

    const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
            case 'confirmado': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
            case 'completado': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
            case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'pendiente': return 'Pendiente';
            case 'confirmed':
            case 'confirmado': return 'Confirmado';
            case 'completed':
            case 'completado': return 'Completado';
            case 'cancelled':
            case 'cancelado': return 'Cancelado';
            default: return status;
        }
    };

    const handleDelete = async () => {
        if (!deletingAppt) return;
        try {
            await deleteAppointment(deletingAppt.id).unwrap();
            toast({ title: 'Éxito', description: 'Turno eliminado correctamente' });
            setDeletingAppt(null);
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar el turno', variant: 'destructive' });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateAppointment({
                id: editingAppt.id,
                estado: editingAppt.estado,
                motivo: editingAppt.motivo,
                fecha_hora: editingAppt.fecha_hora
            }).unwrap();
            toast({ title: 'Éxito', description: 'Turno actualizado correctamente' });
            setEditingAppt(null);
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo actualizar el turno', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A58CA] mb-4" />
                <p className="text-gray-500 font-medium">Cargando historial de turnos...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 p-8 bg-[#F8FAFC]">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
                    Error al cargar el historial de turnos. Por favor, intenta nuevamente.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden flex-1 bg-[#F8FAFC] p-3 md:p-5 flex flex-col font-sans h-full">
            <div className="mb-4">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111827]">Historial de Turnos</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    Consulta el registro completo de todos los turnos agendados en el sistema.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white z-10">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar cliente o servicio..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold shrink-0">
                            <Filter size={16} className="text-gray-500" />
                            <select 
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="bg-transparent outline-none text-gray-700 cursor-pointer"
                            >
                                <option value="ALL">Todos los Estados</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="confirmado">Confirmados</option>
                                <option value="completado">Completados</option>
                                <option value="cancelado">Cancelados</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table container */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Motivo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Profesional</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {paginatedAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <CalendarIcon size={48} className="text-gray-300 mb-4" />
                                            <p className="text-lg font-semibold text-gray-700">No se encontraron turnos</p>
                                            <p className="text-sm">Prueba ajustando los filtros de búsqueda.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedAppointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 p-2 rounded-lg text-[#0A58CA]">
                                                    <CalendarIcon size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">
                                                        {format(parseISO(appt.fecha_hora), "dd 'de' MMMM, yyyy", { locale: es })}
                                                    </div>
                                                    <div className="text-sm text-gray-500 font-medium">
                                                        {format(parseISO(appt.fecha_hora), "HH:mm")} hs
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {appt.patient?.foto_perfil ? (
                                                        <img src={appt.patient.foto_perfil} alt={appt.patient.nombre} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={16} className="text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {appt.patient ? `${appt.patient.nombre || ''} ${appt.patient.apellido || ''}`.trim() : 'Sin cliente'}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                        <Phone size={12} />
                                                        <span>{appt.patient?.datos_contacto?.telefono || appt.patient?.datos_contacto?.phone || 'Sin teléfono'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-sm text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full">
                                                {appt.motivo || 'Sesión Kinesiología'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Stethoscope size={16} className="text-gray-400" />
                                                <span className="font-medium text-sm">{appt.professional?.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(appt.estado)}`}>
                                                {translateStatus(appt.estado)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditingAppt({...appt})}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar turno"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeletingAppt(appt)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar turno"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">
                            Mostrando <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredAppointments.length)}</span> de <span className="font-bold text-gray-900">{filteredAppointments.length}</span> turnos
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingAppt && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95">
                        <button onClick={() => setEditingAppt(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Turno</h2>
                        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente</label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700">
                                    {editingAppt.patient?.nombre} {editingAppt.patient?.apellido}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo de Sesión</label>
                                <input 
                                    type="text"
                                    value={editingAppt.motivo || ''}
                                    onChange={e => setEditingAppt({...editingAppt, motivo: e.target.value})}
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha y Hora</label>
                                <input 
                                    type="datetime-local"
                                    value={editingAppt.fecha_hora ? format(new Date(editingAppt.fecha_hora), "yyyy-MM-dd'T'HH:mm") : ''}
                                    onChange={e => setEditingAppt({...editingAppt, fecha_hora: e.target.value})}
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                                <select 
                                    value={editingAppt.estado}
                                    onChange={e => setEditingAppt({...editingAppt, estado: e.target.value})}
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="confirmado">Confirmado</option>
                                    <option value="completado">Completado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full mt-4 bg-[#0A58CA] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all duration-200">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deletingAppt && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center animate-in zoom-in-95">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar turno?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Estás a punto de eliminar el turno de <span className="font-bold text-gray-700">{deletingAppt.patient?.nombre}</span>. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingAppt(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentHistory;
