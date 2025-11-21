/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

interface CreatePaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreatePaymentResponse>,
) {
  console.log('💳 [Create Payment] Request received');

  if (req.method !== 'POST') {
    console.log('❌ [Create Payment] Invalid method:', req.method);
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount < 50) {
      console.log('❌ [Create Payment] Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Minimum $0.50 required.',
      });
    }

    // Check Stripe API key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ [Create Payment] STRIPE_SECRET_KEY is not set');
      return res.status(500).json({
        success: false,
        error: 'Payment configuration error',
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
    });

    console.log(
      `💳 [Create Payment] Creating checkout session for $${amount / 100}`,
    );

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Avatar Processing',
              description: 'Support for AI-powered avatar generation',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}?payment=cancelled`,
    });

    console.log('✅ [Create Payment] Checkout session created:', session.id);

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url || undefined,
    });
  } catch (error: any) {
    console.error('❌ [Create Payment] Error:', error);

    return res.status(500).json({
      success: false,
      error:
        error.message || 'Failed to create payment session. Please try again.',
    });
  }
}
