import { useState } from 'react';
import axios from 'axios';

export const useMpCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initPayment = async (type, referenceId, amount, description, userId) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/mercadopago/create`, {
        type,
        referenceId,
        amount,
        description,
        userId
      });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return { initPayment, loading, error };
};
