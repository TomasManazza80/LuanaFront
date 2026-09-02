import React, { useState } from 'react';
import { Select, Divider, Input, Button } from 'antd';
import { 
    useGetProfessionalsQuery, 
    useCreateProfessionalMutation, 
    useUpdateProfessionalMutation, 
    useUploadImageMutation,
    useGetSpecialtiesQuery,
    useCreateSpecialtyMutation,
    useUpdateSpecialtyMutation,
    useDeleteSpecialtyMutation
} from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast.tsx';
import { Plus, User, Mail, Shield, ShieldAlert, Loader2, X, Briefcase, Search, Filter, Camera, Check, Users, Edit2, Trash2 } from 'lucide-react';


const ProfessionalList = () => {
    const { data, isLoading, error } = useGetProfessionalsQuery();
    const [createProfessional, { isLoading: isCreating }] = useCreateProfessionalMutation();
    const [updateProfessional, { isLoading: isUpdating }] = useUpdateProfessionalMutation();
    const [uploadImage] = useUploadImageMutation();

    const { data: specData, isLoading: isLoadingSpecs } = useGetSpecialtiesQuery();
    const [createSpecialtyMutation] = useCreateSpecialtyMutation();
    const [updateSpecialtyMutation] = useUpdateSpecialtyMutation();
    const [deleteSpecialtyMutation] = useDeleteSpecialtyMutation();
    const specialties = specData?.data || [];
    
    const [isManageSpecialtiesModalOpen, setIsManageSpecialtiesModalOpen] = useState(false);
    const [editingSpecialtyId, setEditingSpecialtyId] = useState(null);
    const [editingSpecialtyName, setEditingSpecialtyName] = useState('');
    
    const [newSpecialtyName, setNewSpecialtyName] = useState('');
    const inputRef = React.useRef(null);

    const handleAddSpecialty = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!newSpecialtyName) return;
        try {
            await createSpecialtyMutation({ name: newSpecialtyName }).unwrap();
            setNewSpecialtyName('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        } catch (err) {
            toast({ title: 'Error', description: err?.data?.message || 'Error al agregar', variant: 'error' });
        }
    };

    const handleUpdateSpecialty = async (id) => {
        if (!editingSpecialtyName) return;
        try {
            await updateSpecialtyMutation({ id, name: editingSpecialtyName }).unwrap();
            setEditingSpecialtyId(null);
            setEditingSpecialtyName('');
            toast({ title: 'Éxito', description: 'Especialidad actualizada', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: err?.data?.message || 'Error al actualizar', variant: 'error' });
        }
    };

    const handleDeleteSpecialty = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta especialidad? Se quitará también de los profesionales asignados.')) return;
        try {
            await deleteSpecialtyMutation(id).unwrap();
            toast({ title: 'Éxito', description: 'Especialidad eliminada', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: err?.data?.message || 'Error al eliminar', variant: 'error' });
        }
    };
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialty: [],
        profile_picture: '',
        service_images: [],
        role: 'ADMIN', // Always creating an ADMIN for now
        is_public: true
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingServiceImage, setIsUploadingServiceImage] = useState(false);

    const professionals = data?.data || [];
    
    const filteredProfessionals = professionals.filter(prof => {
        const matchesSearch = (prof.name || prof.email).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || prof.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProfessional(formData).unwrap();
            toast({
                title: 'Éxito',
                description: 'Profesional creado correctamente.',
                variant: 'success'
            });
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', specialty: [], profile_picture: '', service_images: [], role: 'ADMIN', is_public: true });
        } catch (err) {
            toast({
                title: 'Error',
                description: err?.data?.message || 'Error al crear profesional',
                variant: 'error'
            });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfessional({ id: selectedProfessional.id, ...editFormData }).unwrap();
            toast({
                title: 'Éxito',
                description: 'Profesional actualizado correctamente.',
                variant: 'success'
            });
            setIsEditing(false);
            setSelectedProfessional({ ...selectedProfessional, ...editFormData });
        } catch (err) {
            toast({
                title: 'Error',
                description: err?.data?.message || 'Error al actualizar',
                variant: 'error'
            });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploadingImage(true);
        try {
            const result = await uploadImage(formData).unwrap();
            if (result.success) {
                setEditFormData(prev => ({ ...prev, profile_picture: result.url }));
                toast({ title: 'Imagen subida', description: 'La imagen se subió correctamente', variant: 'success' });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'error' });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleCreateImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        setIsUploadingImage(true);
        try {
            const result = await uploadImage(uploadFormData).unwrap();
            if (result.success) {
                setFormData(prev => ({ ...prev, profile_picture: result.url }));
                toast({ title: 'Foto subida', description: 'La foto se cargó correctamente', variant: 'success' });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'error' });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleServiceImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setIsUploadingServiceImage(true);
        try {
            const newUrls = [];
            for (const file of files) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', file);
                const result = await uploadImage(uploadFormData).unwrap();
                if (result.success && result.url) {
                    newUrls.push(result.url);
                }
            }
            if (newUrls.length > 0) {
                const currentImages = editFormData.service_images || selectedProfessional?.service_images || [];
                const updatedImages = [...currentImages, ...newUrls];
                
                setEditFormData(prev => ({ ...prev, service_images: updatedImages }));
                
                if (selectedProfessional && !isEditing) {
                    await updateProfessional({ id: selectedProfessional.id, service_images: updatedImages }).unwrap();
                    setSelectedProfessional(prev => ({ ...prev, service_images: updatedImages }));
                }
                
                toast({ title: 'Fotos del servicio subidas', description: 'Las fotos del servicio se guardaron correctamente', variant: 'success' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'No se pudieron subir las fotos del servicio', variant: 'error' });
        } finally {
            setIsUploadingServiceImage(false);
        }
    };

    const handleRemoveServiceImage = async (indexToRemove) => {
        const currentImages = editFormData.service_images || selectedProfessional?.service_images || [];
        const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
        
        setEditFormData(prev => ({ ...prev, service_images: updatedImages }));
        if (selectedProfessional && !isEditing) {
            try {
                await updateProfessional({ id: selectedProfessional.id, service_images: updatedImages }).unwrap();
                setSelectedProfessional(prev => ({ ...prev, service_images: updatedImages }));
                toast({ title: 'Imagen eliminada', description: 'La foto se quitó correctamente', variant: 'success' });
            } catch (error) {
                toast({ title: 'Error', description: 'Error al actualizar', variant: 'error' });
            }
        }
    };

    const specialtyOptionRender = (option) => {
        const spec = specialties.find(s => s.name === option.value);
        if (!spec) return <span>{option.label}</span>;
        
        if (editingSpecialtyId === spec.id) {
            return (
                <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                    <input 
                        type="text" 
                        value={editingSpecialtyName}
                        onChange={(e) => setEditingSpecialtyName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') handleUpdateSpecialty(spec.id);
                        }}
                    />
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateSpecialty(spec.id); }} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"><Check size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingSpecialtyId(null); }} className="text-gray-400 hover:bg-gray-200 p-1 rounded transition-colors"><X size={14}/></button>
                </div>
            );
        }

        return (
            <div className="flex justify-between items-center w-full">
                <span className="text-sm">{option.label}</span>
                <div className="flex gap-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingSpecialtyId(spec.id);
                            setEditingSpecialtyName(spec.name);
                        }}
                        className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                        title="Editar"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSpecialty(spec.id);
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden bg-[#F8FAFC] p-3 md:p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111827]">Equipo / Profesionales</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Gestiona los profesionales y usuarios administradores del sistema.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#0A58CA] hover:bg-blue-700 text-white font-bold py-1.5 px-3.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 text-xs"
                >
                    <Plus size={16} />
                    Añadir Profesional
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]"
                    />
                </div>
                <div className="sm:w-64 relative flex items-center">
                    <Filter className="absolute left-3 text-gray-400" size={18} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0A58CA] appearance-none bg-white cursor-pointer"
                    >
                        <option value="ALL">Todos los roles</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="animate-spin text-[#0A58CA]" size={32} />
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
                    <ShieldAlert size={32} className="mb-2" />
                    <p className="font-semibold">Error al cargar los profesionales.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-[#F8FAFC] text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Profesional</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4 text-center">Público (Web)</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProfessionals.length > 0 ? (
                                    filteredProfessionals.map((prof) => (
                                        <tr key={prof.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {prof.profile_picture ? (
                                                        <img src={prof.profile_picture} alt={prof.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                                            {(prof.name || prof.email).charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900">{prof.name || '-'}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{(prof.specialty && prof.specialty.length > 0) ? prof.specialty.join(', ') : 'Kinesiología'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail size={16} className="text-gray-400" />
                                                    {prof.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max ${
                                                    prof.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    <Shield size={12} />
                                                    {prof.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={prof.is_public || false}
                                                        onChange={async (e) => {
                                                            try {
                                                                await updateProfessional({ id: prof.id, is_public: e.target.checked }).unwrap();
                                                                toast({ title: 'Actualizado', description: 'Visibilidad actualizada.', variant: 'success' });
                                                            } catch(err) {
                                                                toast({ title: 'Error', description: 'No se pudo actualizar.', variant: 'error' });
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedProfessional(prof);
                                                        setEditFormData(prof);
                                                        setIsEditing(false);
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                                                >
                                                    Ver Detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No hay profesionales registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Creación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Añadir Profesional</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="profForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {/* Upload Photo Section */}
                                <div className="flex flex-col items-center justify-center gap-2 mb-2">
                                    <div className="relative group cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-[#0A58CA] flex flex-col items-center justify-center bg-gray-50 overflow-hidden transition-all shadow-inner">
                                        {formData.profile_picture ? (
                                            <img src={formData.profile_picture} alt="Foto" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <Camera size={24} />
                                                <span className="text-[10px] font-semibold mt-1">Cargar Foto</span>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            onChange={handleCreateImageUpload} 
                                            disabled={isUploadingImage} 
                                        />
                                        {isUploadingImage && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                                                <Loader2 className="animate-spin" size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Foto del Profesional / Servicio</span>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><User size={16}/> Nombre Completo</label>
                                    <input 
                                        type="text" name="name" required
                                        value={formData.name} onChange={handleInputChange}
                                        placeholder="Ej. Dr. Juan Pérez"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Briefcase size={16}/> Especialidad</label>
                                    <Select 
                                        mode="multiple"
                                        style={{ width: '100%', minHeight: '46px' }}
                                        placeholder="Seleccione especialidades"
                                        value={formData.specialty || []} 
                                        onChange={(val) => setFormData(prev => ({ ...prev, specialty: val }))}
                                        options={specialties.map(s => ({ value: s.name, label: s.name }))}
                                        loading={isLoadingSpecs}
                                        optionRender={specialtyOptionRender}
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <div className="flex px-2 pb-2 gap-2" onMouseDown={(e) => e.preventDefault()}>
                                                    <Input
                                                        placeholder="Nueva especialidad"
                                                        ref={inputRef}
                                                        value={newSpecialtyName}
                                                        onChange={(e) => setNewSpecialtyName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            e.stopPropagation();
                                                            if (e.key === 'Enter') {
                                                                handleAddSpecialty(e);
                                                            }
                                                        }}
                                                    />
                                                    <Button type="text" icon={<Plus size={16} />} onClick={handleAddSpecialty} className="flex items-center text-blue-600 hover:text-blue-800">
                                                        Añadir
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Mail size={16}/> Email (Usuario)</label>
                                    <input 
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleInputChange}
                                        placeholder="correo@ejemplo.com"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Shield size={16}/> Contraseña de Acceso</label>
                                    <input 
                                        type="password" name="password" required minLength="6"
                                        value={formData.password} onChange={handleInputChange}
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]" 
                                    />
                                </div>
                                <div className="mt-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-2">
                                    <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                                    <p>Este usuario se creará con el rol <strong>ADMIN</strong>, lo que le dará acceso al panel de administración para gestionar su propia agenda y clientes.</p>
                                </div>
                                <div className="pt-2 border-t border-gray-200 mt-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Mostrar en web pública</p>
                                        <p className="text-xs text-gray-500">Permite que los clientes agenden turnos con este profesional</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={formData.is_public !== undefined ? formData.is_public : true}
                                            onChange={e => setFormData({...formData, is_public: e.target.checked})}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 mt-auto">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                form="profForm"
                                type="submit"
                                disabled={isCreating}
                                className="flex-1 py-2.5 bg-[#0A58CA] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreating && <Loader2 className="animate-spin" size={18} />}
                                Guardar Profesional
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalle */}
            {selectedProfessional && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#F8FAFC]">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isEditing ? 'Editar Profesional' : 'Detalles del Profesional'}
                            </h2>
                            <button onClick={() => setSelectedProfessional(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative group">
                                    {isEditing && editFormData.profile_picture ? (
                                        <img src={editFormData.profile_picture} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-inner border border-gray-200" />
                                    ) : !isEditing && selectedProfessional.profile_picture ? (
                                        <img src={selectedProfessional.profile_picture} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-inner border border-gray-200" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl shadow-inner shrink-0 border border-blue-200">
                                            {(selectedProfessional.name || selectedProfessional.email).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    
                                    {isEditing && (
                                        <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            {isUploadingImage ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                            <span className="text-[10px] mt-1 font-semibold">Subir</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                        </label>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className="w-full">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            value={editFormData.name || ''} 
                                            onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#0A58CA] text-sm font-semibold"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedProfessional.name || 'Sin Nombre'}</h3>
                                        <p className="text-blue-600 font-medium text-sm flex items-center gap-1 mt-1">
                                            <Briefcase size={14} />
                                            {(selectedProfessional.specialty && selectedProfessional.specialty.length > 0) ? selectedProfessional.specialty.join(', ') : 'Kinesiología'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Especialidad</p>
                                    {isEditing ? (
                                        <Select 
                                            mode="multiple"
                                            style={{ width: '100%' }}
                                            placeholder="Seleccione especialidades"
                                            value={editFormData.specialty || []} 
                                            onChange={(val) => setEditFormData({...editFormData, specialty: val})}
                                            options={specialties.map(s => ({ value: s.name, label: s.name }))}
                                            loading={isLoadingSpecs}
                                            optionRender={specialtyOptionRender}
                                            dropdownRender={(menu) => (
                                                <>
                                                    {menu}
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <div className="flex px-2 pb-2 gap-2" onMouseDown={(e) => e.preventDefault()}>
                                                        <Input
                                                            placeholder="Nueva especialidad"
                                                            ref={inputRef}
                                                            value={newSpecialtyName}
                                                            onChange={(e) => setNewSpecialtyName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                e.stopPropagation();
                                                                if (e.key === 'Enter') {
                                                                    handleAddSpecialty(e);
                                                                }
                                                            }}
                                                        />
                                                        <Button type="text" icon={<Plus size={16} />} onClick={handleAddSpecialty} className="flex items-center text-blue-600 hover:text-blue-800">
                                                            Añadir
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2">
                                            <Briefcase size={16} className="text-gray-400" />
                                            {(selectedProfessional.specialty && selectedProfessional.specialty.length > 0) ? selectedProfessional.specialty.join(', ') : 'No especificada'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contacto / Usuario</p>
                                    {isEditing ? (
                                        <input 
                                            type="email" 
                                            value={editFormData.email || ''} 
                                            onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#0A58CA] text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            {selectedProfessional.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rol de Usuario</p>
                                    {isEditing ? (
                                        <select 
                                            value={editFormData.role || 'ADMIN'} 
                                            onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#0A58CA] text-sm bg-white"
                                        >
                                            <option value="ADMIN">ADMIN (Acceso Total)</option>
                                            <option value="USER">USER (Acceso Limitado)</option>
                                            <option value="EMPLOYEE">EMPLOYEE (Staff)</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2.5 py-1 rounded-md text-sm font-semibold flex items-center gap-1.5 w-max ${
                                            selectedProfessional.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            <Shield size={14} />
                                            {selectedProfessional.role}
                                        </span>
                                    )}
                                </div>
                                
                                {isEditing && (
                                    <div className="pt-2 border-t border-gray-200 mt-2 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Mostrar en web pública</p>
                                            <p className="text-xs text-gray-500">Permite que los clientes agenden turnos con este profesional</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={editFormData.is_public || false}
                                                onChange={e => setEditFormData({...editFormData, is_public: e.target.checked})}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                )}

                                {/* Fotos del Servicio / Muestras de Trabajo */}
                                <div className="pt-3 border-t border-gray-200 mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Camera size={14} className="text-gray-400" />
                                            Fotos del Servicio / Muestras ({(editFormData.service_images || selectedProfessional.service_images || []).length})
                                        </p>
                                        <label className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                                            {isUploadingServiceImage ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                                            <span>Subir Fotos</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                multiple 
                                                className="hidden" 
                                                onChange={handleServiceImageUpload} 
                                                disabled={isUploadingServiceImage} 
                                            />
                                        </label>
                                    </div>

                                    {((editFormData.service_images || selectedProfessional.service_images || []).length > 0) ? (
                                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                                            {(editFormData.service_images || selectedProfessional.service_images || []).map((imgUrl, idx) => (
                                                <div key={idx} className="relative group w-full aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                                                    <img src={imgUrl} alt={`Muestra ${idx + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveServiceImage(idx)}
                                                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Eliminar foto"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic py-1">No hay fotos registradas para mostrar este servicio.</p>
                                    )}
                                </div>
                                
                                {!isEditing && (
                                    <div className="pt-2 border-t border-gray-200 mt-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Users size={14} />
                                            Clientes Asignados ({selectedProfessional.patients?.length || 0})
                                        </p>
                                        {selectedProfessional.patients && selectedProfessional.patients.length > 0 ? (
                                            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                {selectedProfessional.patients.map(patient => (
                                                    <li key={patient.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm text-sm">
                                                        <span className="font-semibold text-gray-800">{patient.nombre}</span>
                                                        <span className="text-gray-500 text-xs truncate max-w-[150px]">
                                                            {patient.datos_contacto?.email || patient.datos_contacto?.phone || 'Sin contacto'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No hay clientes asignados a este profesional.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 mt-auto">
                            {isEditing ? (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditFormData(selectedProfessional);
                                        }}
                                        className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleUpdate}
                                        disabled={isUpdating}
                                        className="flex-1 py-2.5 bg-[#0A58CA] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isUpdating && <Loader2 className="animate-spin" size={16} />}
                                        Guardar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedProfessional(null)}
                                        className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 py-2.5 bg-[#0A58CA] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        Editar Datos
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalList;
