import React, { useState } from 'react';
import { Loader2, Copy, CheckCircle, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

export const AdminReservationCard = ({ encargo, onLinkGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(encargo.montoTotal ? (encargo.montoTotal * 0.5) : 0); // 50% por defecto

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const generatePaymentLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/sena/generate-link`, {
        encargoId: encargo.id,
        amount: Number(amount),
      });

      if (response.data && response.data.payment_url) {
        setPaymentUrl(response.data.payment_url);
        if (onLinkGenerated) onLinkGenerated(response.data.payment_url);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!paymentUrl) return;
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-6 rounded-3xl shadow-sm max-w-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {encargo.nombreCliente || 'Cliente sin nombre'}
          </h3>
          <p className="text-sm text-gray-500">
            Orden #{encargo.numeroOrden}
          </p>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          {encargo.estado}
        </span>
      </div>

      <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-2xl">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total Encargo</span>
          <span className="font-semibold">${encargo.montoTotal}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Señado hasta ahora</span>
          <span className="font-semibold">${encargo.senado || 0}</span>
        </div>
        
        {!paymentUrl && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Monto a cobrar de seña</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-black"
                placeholder="Monto"
              />
            </div>
          </div>
        )}
      </div>

      {!paymentUrl ? (
        <button
          onClick={generatePaymentLink}
          disabled={isLoading || !amount || amount <= 0}
          className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
          {isLoading ? 'Generando link...' : 'Generar Link de Pago'}
        </button>
      ) : (
        <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Link de pago generado
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={paymentUrl}
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="bg-gray-900 hover:bg-gray-800 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">Copia este link y envíaselo al cliente</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
    </div>
  );
};
