// app/api/sample-requests/create-wise-transfer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getShippingFeeInDollars } from '@/lib/config/shippingConfig';
import logger from '@/lib/config/logger';

export async function POST(req: NextRequest) {
  try {
    // Validate Wise API credentials
    if (!process.env.WISE_API_TOKEN) {
      logger.error('WISE_API_TOKEN is not configured');
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { country, currency = 'usd', metadata = {}, email, contactPerson, companyName } = body;

    logger.info('Received request for Wise Transfer:', { country, currency, metadata });

    // Validation
    if (!country || typeof country !== 'string') {
      return NextResponse.json({ error: 'Valid country is required to calculate shipping.' }, { status: 400 });
    }

    if (!currency || currency.toLowerCase() !== 'usd') {
      return NextResponse.json({ error: 'Only USD currency is supported currently.' }, { status: 400 });
    }

    // Calculate the amount based on the country
    const amountInDollars = getShippingFeeInDollars(country);

    if (typeof amountInDollars !== 'number' || amountInDollars <= 0) {
      logger.warn(`Invalid shipping amount calculated for country ${country}: ${amountInDollars}`);
      return NextResponse.json({ error: 'Unable to calculate shipping cost for this country or amount is zero/negative.' }, { status: 400 });
    }

    // Get Wise profile ID (you'll need to configure this)
    const profileId = process.env.WISE_PROFILE_ID;
    if (!profileId) {
      logger.error('WISE_PROFILE_ID is not configured');
      return NextResponse.json({ error: 'Wise profile not configured' }, { status: 500 });
    }

    // Determine API base URL (sandbox for testing, production by default)
    const apiBaseUrl = process.env.WISE_API_BASE_URL || 'https://api.wise.com';
    
    // Test mode: If token starts with "test-", return mock response
    const isTestMode = process.env.WISE_API_TOKEN?.startsWith('test-') || 
                       process.env.WISE_API_TOKEN === 'test-token-placeholder';
    
    if (isTestMode) {
      logger.info('Wise Transfer Test Mode: Returning mock response');
      return NextResponse.json({ 
        success: true,
        transferId: `test-transfer-${Date.now()}`,
        quoteId: `test-quote-${Date.now()}`,
        amount: amountInDollars,
        currency: currency,
        status: 'incoming_payment_waiting',
        paymentInstructions: {
          accountDetails: {
            accountNumber: '1234567890',
            routingNumber: '987654321',
            bankName: 'Test Bank',
            swiftCode: 'TESTUS33',
            iban: 'US64TEST1234567890123456',
            reference: `TEST-REF-${Date.now()}`
          }
        },
        recipientId: `test-recipient-${Date.now()}`,
        _testMode: true
      });
    }

    // Create a quote first to get exchange rate and fees
    let quoteResponse;
    try {
      quoteResponse = await fetch(`${apiBaseUrl}/v3/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WISE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCurrency: 'USD',
          targetCurrency: 'USD', // Since we're receiving USD
          sourceAmount: amountInDollars,
          profile: parseInt(profileId),
        }),
      });
    } catch (fetchError: any) {
      logger.error('Wise API Fetch Error:', {
        message: fetchError.message,
        url: `${apiBaseUrl}/v3/quotes`,
        cause: fetchError.cause
      });
      return NextResponse.json({ 
        error: 'Failed to connect to Wise API',
        details: {
          message: fetchError.message,
          url: `${apiBaseUrl}/v3/quotes`,
          hint: 'Check your WISE_API_BASE_URL. For testing, use test-token-placeholder as WISE_API_TOKEN to enable test mode.'
        }
      }, { status: 503 });
    }

    if (!quoteResponse.ok) {
      const errorData = await quoteResponse.json().catch(() => ({}));
      logger.error('Wise Quote Error:', {
        status: quoteResponse.status,
        statusText: quoteResponse.statusText,
        error: errorData
      });
      return NextResponse.json({ 
        error: 'Failed to create payment quote',
        details: errorData,
        status: quoteResponse.status
      }, { status: quoteResponse.status });
    }

    const quoteData = await quoteResponse.json();
    logger.info('Wise Quote created:', { quoteId: quoteData.id, rate: quoteData.rate });

    // Create a recipient (or use existing one)
    // For sample requests, we'll create a temporary recipient
    let recipientResponse;
    try {
      recipientResponse = await fetch(`${apiBaseUrl}/v1/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WISE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: 'USD',
          type: 'email',
          profile: parseInt(profileId),
          accountHolderName: companyName || contactPerson || 'Sample Request Customer',
          email: email,
          legalType: 'PRIVATE',
        }),
      });
    } catch (fetchError: any) {
      logger.warn('Failed to create recipient (non-critical):', fetchError.message);
      recipientResponse = null;
    }

    let recipientId;
    if (recipientResponse && recipientResponse.ok) {
      const recipientData = await recipientResponse.json();
      recipientId = recipientData.id;
      logger.info('Wise Recipient created:', { recipientId });
    } else if (recipientResponse) {
      // If recipient creation fails, try to get existing or handle error
      const errorData = await recipientResponse.json().catch(() => ({}));
      logger.warn('Failed to create recipient, may already exist:', errorData);
      // For now, we'll proceed without a recipient and let the user provide bank details
    }

    // Create transfer
    let transferResponse;
    try {
      transferResponse = await fetch(`${apiBaseUrl}/v1/transfers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WISE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetAccount: recipientId || undefined,
          quoteUuid: quoteData.id,
          customerTransactionId: `sample-request-${Date.now()}-${metadata.productId || 'unknown'}`,
          details: {
            reference: `Sample Request Shipping - ${companyName || 'Customer'}`,
            transferPurpose: 'verification.transfers.purpose.pay.bills',
            sourceOfFunds: 'verification.source.of.funds.other',
          },
        }),
      });
    } catch (fetchError: any) {
      logger.error('Wise Transfer Creation Fetch Error:', {
        message: fetchError.message,
        url: `${apiBaseUrl}/v1/transfers`,
        cause: fetchError.cause
      });
      return NextResponse.json({ 
        error: 'Failed to connect to Wise API',
        details: {
          message: fetchError.message,
          url: `${apiBaseUrl}/v1/transfers`,
          hint: 'Check your network connection and WISE_API_BASE_URL'
        }
      }, { status: 503 });
    }

    if (!transferResponse.ok) {
      const errorData = await transferResponse.json().catch(() => ({}));
      logger.error('Wise Transfer Error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to create transfer',
        details: errorData 
      }, { status: transferResponse.status });
    }

    const transferData = await transferResponse.json();
    logger.info('Wise Transfer created successfully:', { 
      id: transferData.id, 
      status: transferData.status,
      quoteId: quoteData.id
    });

    // Get payment instructions
    let paymentInstructions = null;
    if (transferData.id) {
      try {
        let instructionsResponse;
        try {
          instructionsResponse = await fetch(
            `${apiBaseUrl}/v1/transfers/${transferData.id}/funding-instructions`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${process.env.WISE_API_TOKEN}`,
              },
            }
          );
        } catch (fetchError: any) {
          logger.warn('Failed to fetch payment instructions:', fetchError.message);
          instructionsResponse = null;
        }

        if (instructionsResponse && instructionsResponse.ok) {
          paymentInstructions = await instructionsResponse.json();
          logger.info('Payment instructions retrieved:', { transferId: transferData.id });
        }
      } catch (error) {
        logger.warn('Failed to fetch payment instructions:', error);
      }
    }

    return NextResponse.json({ 
      success: true,
      transferId: transferData.id,
      quoteId: quoteData.id,
      amount: amountInDollars,
      currency: currency,
      status: transferData.status,
      paymentInstructions: paymentInstructions,
      recipientId: recipientId,
    });

  } catch (error: any) {
    logger.error('Wise Transfer Error:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({ 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to create payment transfer due to an internal server error. Please try again or contact support.' 
    }, { status: 500 });
  }
}

