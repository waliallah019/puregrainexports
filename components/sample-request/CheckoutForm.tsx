import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

interface CheckoutFormProps {
  onPaymentSuccess: (paymentIntentId: string) => void;
  shippingFee: number;
  clientSecret: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onPaymentSuccess,
  shippingFee,
  clientSecret
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe is not loaded yet. Please try again in a moment.');
      return;
    }

    if (!clientSecret) {
      toast.error('Payment not properly initialized. Please try again.');
      return;
    }

    setIsLoading(true);
    setPaymentError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setPaymentError('Card element not found. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting payment confirmation with clientSecret:', clientSecret);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add billing details here if needed
          },
        }
      });

      if (error) {
        console.error('Payment failed:', error);
        setPaymentError(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed. Please check your card details.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        toast.success('Payment successful!');
        onPaymentSuccess(paymentIntent.id);
      } else {
        console.error('Unexpected payment state:', paymentIntent);
        setPaymentError('Payment did not complete successfully.');
        toast.error('Payment did not complete. Please try again.');
      }
    } catch (error: any) {
      console.error('Error during payment:', error);
      setPaymentError('An unexpected error occurred while processing payment.');
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Credit or debit card
        </label>
        <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
          <CardElement
            id="card-element"
            options={cardElementOptions}
            onChange={(event) => {
              if (event.error) {
                setPaymentError(event.error.message || 'Card validation error');
              } else {
                setPaymentError('');
              }
            }}
          />
        </div>
      </div>

      {paymentError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm" role="alert">
          {paymentError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || !elements || isLoading}
        className={`w-full py-3 px-4 rounded-md font-semibold transition-colors duration-200 ${
          isLoading || !stripe || !elements
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
        } flex items-center justify-center`}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          'Pay Now'
        )}
        {` ($${shippingFee.toFixed(2)})`}
      </button>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
          <div className="font-medium">Test Card Numbers:</div>
          <div>Success: 4242 4242 4242 4242</div>
          <div>Decline: 4000 0000 0000 0002</div>
          <div>Use any future expiry date and any CVC</div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;