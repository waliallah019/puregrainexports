// app/api/stripe-webhooks/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/config/db';
import SampleRequest from '@/lib/models/sampleRequestModel';
import notificationService from '@/lib/services/notificationService';
import logger from '@/lib/config/logger';

// Make sure your Stripe API version matches what your Stripe library types expect.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // Match the API version from your other Stripe routes
});

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  await connectDB();
  const rawBody = await req.text(); // Get raw body for webhook verification
  const signature = req.headers.get('stripe-signature');

  logger.info('Stripe Webhook received.');

  let event: Stripe.Event;

  try {
    if (!signature) {
      logger.warn('Webhook error: No stripe-signature header.');
      return new NextResponse('No stripe-signature header', { status: 400 });
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    logger.info(`Webhook event constructed: type=${event.type}, id=${event.id}`);
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      logger.info(`PaymentIntent Succeeded: ${paymentIntentSucceeded.id}`);

      try {
        const sampleRequestId = paymentIntentSucceeded.metadata?.sampleRequestId;
        // Or if you only stored paymentIntentId on SampleRequest, you can find by that.
        // It's crucial that `sampleRequestId` exists in metadata if you want to link it directly.
        // Based on your `create-payment-intent` and `sample-requests` POST,
        // you only store `stripePaymentIntentId` on the SampleRequest.
        // So, we'll find by that.

        const sampleRequest = await SampleRequest.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntentSucceeded.id },
          { paymentStatus: 'paid', updatedAt: new Date() },
          { new: true } // Return the updated document
        );

        if (sampleRequest) {
          logger.info(`Sample Request ${sampleRequest._id} status updated to 'paid' via webhook.`);
          await notificationService.createNotification({
            title: `Payment Confirmed for Sample Request`,
            message: `Sample Request ${sampleRequest._id.toString().substring(0, 8)}... from ${sampleRequest.companyName} is now paid.`,
            type: 'payment_confirmed',
            link: `/admin/samples/${sampleRequest._id.toString()}`,
            relatedId: sampleRequest._id.toString(),
          });
        } else {
          logger.warn(`Sample Request not found for PaymentIntent ${paymentIntentSucceeded.id}.`);
          // This might happen if your client-side submission failed or if
          // the sample request was created by another process.
          // Consider handling order fulfillment directly here if not already done by client.
        }
      } catch (dbError: any) {
        logger.error(`Database update error for payment_intent.succeeded ${paymentIntentSucceeded.id}: ${dbError.message}`);
        return new NextResponse(`Database Error: ${dbError.message}`, { status: 500 }); // Don't return 200 to Stripe, retry
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      logger.info(`PaymentIntent Failed: ${paymentIntentFailed.id}, reason: ${paymentIntentFailed.last_payment_error?.message}`);

      try {
        const sampleRequest = await SampleRequest.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntentFailed.id },
          { paymentStatus: 'failed', updatedAt: new Date(), 'paymentError.code': paymentIntentFailed.last_payment_error?.code, 'paymentError.message': paymentIntentFailed.last_payment_error?.message },
          { new: true }
        );

        if (sampleRequest) {
          logger.warn(`Sample Request ${sampleRequest._id} status updated to 'failed' via webhook.`);
          await notificationService.createNotification({
            title: `Payment Failed for Sample Request`,
            message: `Sample Request ${sampleRequest._id.toString().substring(0, 8)}... from ${sampleRequest.companyName} failed. Reason: ${paymentIntentFailed.last_payment_error?.message || 'Unknown'}.`,
            type: 'payment_failed',
            link: `/admin/samples/${sampleRequest._id.toString()}`,
            relatedId: sampleRequest._id.toString(),
          });
        } else {
          logger.warn(`Sample Request not found for failed PaymentIntent ${paymentIntentFailed.id}.`);
        }
      } catch (dbError: any) {
        logger.error(`Database update error for payment_intent.payment_failed ${paymentIntentFailed.id}: ${dbError.message}`);
        return new NextResponse(`Database Error: ${dbError.message}`, { status: 500 });
      }
      break;

    // Add more event types as needed (e.g., checkout.session.completed if using Checkout Sessions)
    default:
      logger.warn(`Unhandled webhook event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return new NextResponse('Received', { status: 200 });
}