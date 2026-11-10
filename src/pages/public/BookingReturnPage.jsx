import React, { useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Loader2, Printer, Calendar, ArrowLeft } from 'lucide-react';
import { useGetPublicAppointmentStatusQuery } from '../../services/api/kinesioApi.js';
import PublicNavbar from '../../components/nav/PublicNavbar.jsx';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

export default function BookingReturnPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const printFrameRef = useRef(null);

    const externalReference = searchParams.get('external_reference');
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const mpStatus = searchParams.get('status') || searchParams.get('collection_status');

    const { data, isLoading, isError } = useGetPublicAppointmentStatusQuery(
        { id: externalReference, payment_id: paymentId },
        { skip: !externalReference }
    );

    const appointment = data?.data;
    const apptState = (appointment?.estado || '').toUpperCase();

    const isConfirmed = apptState === 'CONFIRMED' || apptState === 'CONFIRMADO' || mpStatus === 'approved';
    const isPending = !isConfirmed && (apptState === 'PENDING_PAYMENT' || mpStatus === 'pending' || mpStatus === 'in_process' || location.pathname.includes('pendiente'));

    const handlePrintTicket = () => {
        if (!appointment) return;
        const formattedDate = moment(appointment.fecha_hora).format('dddd D [de] MMMM YYYY');
        const formattedTime = moment(appointment.fecha_hora).format('HH:mm');
        const content = `
            <html>
                <head>
                    <title>Comprobante de Turno #${appointment.id}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                        .ticket { border: 2px dashed #ccc; padding: 30px; max-width: 400px; margin: 0 auto; border-radius: 12px; }
                        h1 { color: #0f172a; font-size: 24px; text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
                        .detail { margin: 15px 0; font-size: 16px; }
                        .label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
                        .value { font-weight: bold; color: #0f172a; }
                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <h1>Luana Studio</h1>
                        <div class="detail"><span class="label">Turno #</span><span class="value">${appointment.id}</span></div>
                        <div class="detail"><span class="label">Paciente</span><span class="value">${appointment.patient?.nombre || '-'}</span></div>
                        <div class="detail"><span class="label">Servicio</span><span class="value">${appointment.motivo || 'Turno'}</span></div>
                        <div class="detail"><span class="label">Especialista</span><span class="value">${appointment.professional?.name || '-'}</span></div>
                        <div class="detail"><span class="label">Fecha y Hora</span><span class="value">${formattedDate} - ${formattedTime} hs</span></div>
                        <div class="detail"><span class="label">Seña Abonada</span><span class="value">$${Number(appointment.deposit_amount_paid || 0).toLocaleString('es-AR')} ARS</span></div>
                        <div class="detail"><span class="label">ID Operación MP</span><span class="value">${appointment.mp_payment_id || paymentId || '-'}</span></div>
                        <div class="footer">¡Gracias por elegirnos! Te esperamos.</div>
                    </div>
                    <script>window.onload = function() { window.print(); }</script>
                </body>
            </html>
        `;
        if (printFrameRef.current) {
            const doc = printFrameRef.current.contentDocument || printFrameRef.current.contentWindow.document;
            doc.open();
            doc.write(content);
            doc.close();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 pt-20">
            <PublicNavbar />
            <iframe ref={printFrameRef} style={{ display: 'none' }} title="print-frame" />

            <main className="max-w-lg mx-auto px-4 pt-10">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 text-center">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center">
                            <Loader2 className="animate-spin w-12 h-12 text-gray-900 mb-4" />
                            <h2 className="text-xl font-bold text-gray-900">Verificando estado del pago...</h2>
                            <p className="text-sm text-gray-500 mt-1">Consultando tu reserva en tiempo real.</p>
                        </div>
                    ) : isConfirmed ? (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={44} strokeWidth={2.5} />
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                                Confirmado (Señado)
                            </span>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">¡Turno Confirmado!</h1>
                            <p className="text-gray-500 text-sm mb-6">
                                Recibimos el pago de tu seña correctamente. Tu horario ya se encuentra reservado.
                            </p>

                            {appointment && (
                                <div className="bg-gray-50 p-5 rounded-2xl w-full text-left mb-6 border border-gray-100 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Servicio:</span>
                                        <span className="font-bold text-gray-900">{appointment.motivo}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Especialista:</span>
                                        <span className="font-bold text-gray-900">{appointment.professional?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Fecha y Hora:</span>
                                        <span className="font-bold text-gray-900 capitalize">
                                            {moment(appointment.fecha_hora).format('DD/MM/YYYY HH:mm')} hs
                                        </span>
                                    </div>
                                    {Number(appointment.deposit_amount_paid) > 0 && (
                                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                            <span className="text-emerald-700 font-semibold">Seña Abonada:</span>
                                            <span className="font-extrabold text-emerald-700">
                                                ${Number(appointment.deposit_amount_paid).toLocaleString('es-AR')} ARS
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col w-full gap-3">
                                {appointment && (
                                    <button
                                        onClick={handlePrintTicket}
                                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Printer size={18} /> Descargar Comprobante
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-white text-gray-700 border-2 border-gray-200 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Volver al Inicio
                                </button>
                            </div>
                        </div>
                    ) : isPending ? (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
                                <Clock size={44} strokeWidth={2.5} />
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                                Pendiente de Pago
                            </span>
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Pago en Proceso</h1>
                            <p className="text-gray-500 text-sm mb-6">
                                Tu pago está siendo procesado por Mercado Pago. En cuanto se acredite, tu turno quedará confirmado automáticamente.
                            </p>
                            <button
                                onClick={() => navigate('/reservar')}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                Volver a Turnos
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                <XCircle size={44} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">No se pudo completar el pago</h1>
                            <p className="text-gray-500 text-sm mb-6">
                                {apptState === 'EXPIRED'
                                    ? 'El tiempo de reserva temporal expiró y el horario fue liberado.'
                                    : 'El pago fue rechazado o cancelado. Podés volver a intentar reservar tu turno.'}
                            </p>
                            <button
                                onClick={() => navigate('/reservar')}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} /> Intentar Nuevamente
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

