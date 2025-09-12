// app/api/sample-requests/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getShippingFeeInCents } from '@/lib/config/shippingConfig';
import logger from '@/lib/config/logger';

// Use the API version that matches your Stripe TypeScript definitions
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any, // bypass strict literal type
  typescript: true,
});


export async function POST(req: NextRequest) {
  try {
    // Add request validation
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { country, currency = 'usd', metadata = {} } = body;

    logger.info('Received request for Payment Intent:', { country, currency, metadata });

    // Validation
    if (!country || typeof country !== 'string') {
      return NextResponse.json({ error: 'Valid country is required to calculate shipping.' }, { status: 400 });
    }

    if (!currency || currency.toLowerCase() !== 'usd') {
      return NextResponse.json({ error: 'Only USD currency is supported currently.' }, { status: 400 });
    }

    // Calculate the amount on the backend based on the country
    const amountInCents = getShippingFeeInCents(country);

    if (typeof amountInCents !== 'number' || amountInCents <= 0) {
      logger.warn(`Invalid shipping amount calculated for country ${country}: ${amountInCents}`);
      return NextResponse.json({ error: 'Unable to calculate shipping cost for this country or amount is zero/negative.' }, { status: 400 });
    }

    // Create payment intent with basic configuration that works reliably
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      // Use payment_method_types for more control
      payment_method_types: ['card'],
      metadata: {
        ...metadata,
        country: country,
        shippingAmount: (amountInCents / 100).toFixed(2),
        source: 'sample_request',
        created_at: new Date().toISOString(),
      },
      // Add description for better tracking
      description: `Sample request shipping fee for ${country}`,
    });

    logger.info('Payment Intent created successfully:', { 
      id: paymentIntent.id, 
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status 
    });

    return NextResponse.json({ 
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: currency
    });

  } catch (error: any) {
    logger.error('Stripe Payment Intent Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      stack: error.stack
    });

    // Return more specific error messages for common Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json({ error: 'Payment card was declined.', details: error.message }, { status: 400 });
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: 'Invalid payment request. Please check your input.', details: error.message }, { status: 400 });
    }
    
    if (error.type === 'StripeAPIError') {
      return NextResponse.json({ error: 'Payment service temporarily unavailable. Please try again later.', details: error.message }, { status: 503 });
    }
    
    // Catch-all for other unexpected errors
    return NextResponse.json({ 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to create payment intent due to an internal server error. Please try again or contact support.' 
    }, { status: 500 });
  }
}