import React, { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../services/api/kinesioApi.js';
import { User, Mail, Shield, Award, DollarSign, Key, Save, Loader2, LogOut, CheckCircle2, Stethoscope, ArrowLeft } from 'lucide-react';
import { toast } from '../ui/use-toast.tsx';
import { logoutUser } from '../../services/auth/authActions.js';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const navigate = useNavigate();
  const { data: profileData, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    session_fee: '',
    mp_access_token: '',
    is_public: true
  });

  useEffect(() => {
    if (profileData?.data) {
      const user = profileData.data;
      setFormData({
        name: user.name || user.nombre || '',
        email: user.email || '',
        specialty: user.specialty || '',
        session_fee: user.session_fee !== undefined && user.session_fee !== null ? user.session_fee : '',
        mp_access_token: user.mp_access_token || '',
        is_public: user.is_public !== undefined ? user.is_public : true
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: formData.name,
        specialty: formData.specialty,
        session_fee: formData.session_fee ? Number(formData.session_fee) : 0,
        mp_access_token: formData.mp_access_token,
        is_public: formData.is_public
      }).unwrap();

      toast({ title: 'Perfil Actualizado', description: 'Tus datos de usuario han sido guardados correctamente.', variant: 'success' });
      refetch();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudieron actualizar los datos.', variant: 'error' });
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0A58CA]" size={40} />
      </div>
    );
  }

  const user = profileData?.data || {};
  const initials = (formData.name || 'US').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="w-full h-full bg-[#F8FAFC] p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header / Back Button */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mi Perfil de Usuario</span>
        </div>

        {/* Profile Banner & Info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#0A58CA] via-blue-600 to-indigo-600 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-white">
                <div className="w-full h-full rounded-xl bg-blue-100 text-[#0A58CA] font-extrabold text-2xl flex items-center justify-center border border-blue-200">
                  {initials}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 px-8 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{formData.name || 'Usuario del Sistema'}</h1>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-0.5">
                <Mail size={14} className="text-gray-400" /> {formData.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-50 text-[#0A58CA] border border-blue-100 text-xs font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={14} /> {user.role || 'PROFESIONAL'}
              </span>
              {formData.specialty && (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                  <Stethoscope size={14} /> {formData.specialty}
                </span>
              )}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0A58CA] outline-none"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Correo Electrónico (No modificable)
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Especialidad / Área Clínica
                </label>
                <div className="relative">
                  <Award size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input 
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0A58CA] outline-none"
                    placeholder="Ej. Kinesiología Traumatológica, Fisioterapia"
                  />
                </div>
              </div>

              {/* Session Fee */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Honorario / Costo de Sesión ($)
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input 
                    type="number"
                    name="session_fee"
                    value={formData.session_fee}
                    onChange={handleChange}
                    min="0"
                    step="500"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0A58CA] outline-none"
                    placeholder="Ej. 15000"
                  />
                </div>
              </div>

              {/* Mercado Pago Access Token */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Token de Acceso Mercado Pago (Opcional para Cobro de Turnos)
                </label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input 
                    type="password"
                    name="mp_access_token"
                    value={formData.mp_access_token}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0A58CA] outline-none"
                    placeholder="APP_USR-..."
                  />
                </div>
              </div>

              {/* Public Visibility Toggle */}
              <div className="md:col-span-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Visibilidad en Portal de Reservas</h4>
                  <p className="text-xs text-gray-500">Permite que los clientes agenden turnos directamente contigo en la página web pública.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    name="is_public" 
                    checked={formData.is_public} 
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A58CA]"></div>
                </label>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <button 
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-bold transition-colors"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>

              <button 
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0A58CA] hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Guardar Cambios
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
