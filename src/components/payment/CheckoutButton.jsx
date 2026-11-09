import React from 'react';
import { useMpCheckout } from '../../hooks/useMpCheckout';

export const CheckoutButton = ({ 
  itemType, 
  referenceId,
  amount,
  description,
  userId
}) => {
  const { initPayment, loading, error } = useMpCheckout();

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={() => initPayment(itemType, referenceId, amount, description, userId)}
        disabled={loading}
        className={`px-6 py-3 font-semibold text-white rounded-lg shadow-md transition-all 
          ${loading ? 'bg-gray-400' : 'bg-[#009EE3] hover:bg-[#0086C1] active:scale-95'}`}
      >
        {loading ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};
