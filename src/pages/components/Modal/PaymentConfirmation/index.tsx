import { useState } from 'react';
import { useTranslation } from 'next-i18next';

interface PaymentConfirmationModalProps {
  onConfirm: (shouldPay: boolean) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function PaymentConfirmationModal({
  onConfirm,
  onCancel,
  isProcessing = false,
}: PaymentConfirmationModalProps) {
  const { t } = useTranslation('common');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handlePayment = async () => {
    setIsPaymentProcessing(true);
    try {
      // Call the Stripe payment endpoint
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 200, // $2.00 in cents
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
      setIsPaymentProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Choose Your Option
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Processing your photo uses AI which costs money. Support this project
          or proceed for free.
        </p>

        <div className="space-y-4">
          {/* Free option with dramatic button */}
          <button
            type="button"
            onClick={() => onConfirm(false)}
            disabled={isProcessing || isPaymentProcessing}
            className="w-full focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:bg-red-600 outline-none flex items-center justify-center border-3 border-red-600 bg-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">Burn my bank account</span>
          </button>

          {/* Payment option */}
          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing || isPaymentProcessing}
            className="w-full focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:bg-green-600 outline-none flex items-center justify-center border-3 border-green-600 bg-green-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPaymentProcessing ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="text-lg">Help keep this alive by $2</span>
            )}
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing || isPaymentProcessing}
            className="w-full focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 hover:bg-gray-100 outline-none flex items-center justify-center border-2 border-gray-300 bg-white text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>

        {isProcessing && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center text-sm text-gray-600">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing your photo...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
