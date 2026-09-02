import React, { useState, useEffect } from 'react';
import { 
    useGetWhatsappStatusQuery, 
    useStartWhatsappMutation, 
    useDisconnectWhatsappMutation, 
    useSaveWhatsappTemplateMutation 
} from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast';
import { QrCode, Smartphone, LogOut, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const WhatsAppSettings = ({ profId }) => {
    const { data, isLoading, refetch } = useGetWhatsappStatusQuery(profId);
    
    const [startWhatsapp, { isLoading: isStarting }] = useStartWhatsappMutation();
    const [disconnectWhatsapp, { isLoading: isDisconnecting }] = useDisconnectWhatsappMutation();
    const [saveTemplate, { isLoading: isSaving }] = useSaveWhatsappTemplateMutation();
    
    const [template, setTemplate] = useState('');
    const [status, setStatus] = useState('disconnected');
    const [qr, setQr] = useState(null);

    useEffect(() => {
        if (data) {
            setStatus(data.status);
            if (data.profId) {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
                const socket = io(backendUrl, {
                    reconnectionAttempts: 10,
                    reconnectionDelay: 2000
                });

                socket.on(`whatsapp-status`, (newStatus) => {
                    setStatus(newStatus);
                    if (newStatus === 'connected') setQr(null);
                });

                socket.on(`whatsapp-qr`, (newQr) => {
                    setQr(newQr);
                });

                return () => socket.disconnect();
            }
        }
    }, [data]);

    useEffect(() => {
        if (data?.template !== undefined) {
            setTemplate(data.template);
        }
    }, [data?.template]);

    const handleStart = async () => {
        try {
            await startWhatsapp(profId).unwrap();
            toast({ title: 'Iniciando conexión', description: 'Generando código QR...' });
            refetch();
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo iniciar el servicio de WhatsApp', variant: 'destructive' });
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnectWhatsapp(profId).unwrap();
            toast({ title: 'Desconectado', description: 'Sesión de WhatsApp cerrada' });
            refetch();
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo desconectar el servicio', variant: 'destructive' });
        }
    };

    const handleSaveTemplate = async () => {
        try {
            await saveTemplate({ template, profId }).unwrap();
            toast({ title: 'Guardado', description: 'Plantilla de mensaje guardada correctamente' });
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo guardar la plantilla', variant: 'destructive' });
        }
    };

    const insertVariable = (variable) => {
        setTemplate((prev) => prev + variable);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando configuración de WhatsApp...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <Smartphone size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Integración con WhatsApp</h2>
                    <p className="text-gray-500 text-sm">Automatiza los recordatorios de turnos usando tu propio número</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status and Connection Section */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                    {status === 'connected' ? (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">WhatsApp Conectado</h3>
                            <p className="text-gray-500 text-sm mb-6">Tus clientes recibirán notificaciones automáticamente desde tu número.</p>
                            <button 
                                onClick={handleDisconnect}
                                disabled={isDisconnecting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl transition-colors disabled:opacity-50"
                            >
                                <LogOut size={18} /> {isDisconnecting ? 'Desconectando...' : 'Desconectar Cuenta'}
                            </button>
                        </>
                    ) : status === 'initializing' || status === 'qr_ready' || status === 'qr' ? (
                        <>
                            <div className="mb-4 text-blue-600">
                                <QrCode size={40} className="mx-auto mb-2 opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Escanea el Código QR</h3>
                            <p className="text-gray-500 text-sm mb-6">Abre WhatsApp en tu teléfono, ve a "Dispositivos vinculados" y escanea este código.</p>
                            
                            {qr ? (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 inline-block">
                                    <QRCodeSVG value={qr} size={192} />
                                </div>
                            ) : (
                                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-4 text-gray-400">
                                    Generando QR...
                                </div>
                            )}
                            
                            <button 
                                onClick={handleDisconnect}
                                className="text-gray-500 hover:text-gray-900 text-sm font-semibold mt-2 underline"
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-500">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Conectado</h3>
                            <p className="text-gray-500 text-sm mb-6">Vincula tu cuenta de WhatsApp para activar los mensajes automáticos.</p>
                            <button 
                                onClick={handleStart}
                                disabled={isStarting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white hover:bg-[#128C7E] font-semibold rounded-xl transition-colors shadow-sm shadow-[#25D366]/30 disabled:opacity-50"
                            >
                                <Smartphone size={18} /> {isStarting ? 'Iniciando...' : 'Vincular WhatsApp'}
                            </button>
                        </>
                    )}
                </div>

                {/* Message Template Section */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Plantilla de Mensaje</h3>
                    <p className="text-gray-500 text-sm mb-4">Este mensaje se enviará automáticamente cuando un cliente reserve un turno contigo.</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => insertVariable('{{patient_name}}')} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">Nombre Cliente</button>
                        <button onClick={() => insertVariable('{{date}}')} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">Fecha</button>
                        <button onClick={() => insertVariable('{{time}}')} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">Hora</button>
                        <button onClick={() => insertVariable('{{service}}')} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">Servicio</button>
                        <button onClick={() => insertVariable('{{professional_name}}')} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">Tu Nombre</button>
                    </div>

                    <textarea
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        placeholder="Hola {{patient_name}}, tu turno para {{service}} el día {{date}} a las {{time}} hs ha sido reservado. Te saluda {{professional_name}}."
                        className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none"
                    />

                    <div className="flex justify-between items-center mt-4">
                        <button 
                            onClick={() => setTemplate("Estimado/a {{patient_name}},\n\nNos comunicamos del Centro Kinesiológico para confirmar su turno de {{service}}.\n\n📅 Fecha: {{date}}\n⏰ Hora: {{time}} hs\n👨‍⚕️ Profesional: {{professional_name}}\n\nPor favor, en caso de no poder asistir le solicitamos avisar con al menos 24 horas de anticipación.\n\n¡Lo esperamos!")}
                            className="text-[#0A58CA] hover:text-blue-800 text-sm font-semibold underline transition-colors"
                        >
                            Generar mensaje predeterminado
                        </button>
                        <button 
                            onClick={handleSaveTemplate}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A58CA] text-white hover:bg-blue-700 font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppSettings;
