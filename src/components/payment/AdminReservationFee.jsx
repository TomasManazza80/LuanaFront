import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AdminReservationFee = () => {
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Cargar la tarifa actual al montar el componente
  useEffect(() => {
    const fetchFee = async () => {
      try {
        const { data } = await axios.get('http://localhost:10000/api/config/reservation-fee');
        setFee(data.value);
      } catch (err) {
        console.error('Error fetching fee', err);
      }
    };
    fetchFee();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Importante: En producción, asegúrate de enviar el token de admin en los headers
      const { data } = await axios.put('http://localhost:10000/api/config/reservation-fee', {
        amount: parseFloat(fee)
      });
      setMessage('✅ ' + data.message);
    } catch (err) {
      setMessage('❌ Error al actualizar la tarifa.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Configurar Tarifa de Seña</h3>
      <p className="text-sm text-gray-500 mb-6">
        Establece el monto que los clientes deben abonar obligatoriamente mediante Vexor para confirmar la reserva de su turno.
      </p>

      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Monto (ARS)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              required
              className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej. 1500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
        >
          {loading ? 'Guardando...' : 'Guardar Tarifa'}
        </button>

        {message && (
          <p className={`text-center font-medium mt-2 ${message.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};
