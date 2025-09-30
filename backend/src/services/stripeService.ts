// backend/src/services/stripeService.ts
import Stripe from 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: 'basic' | 'standard' | 'premium';
  price: number;
  promptsPerDay: number;
  features: string[];
}

export class StripeService {
  private stripe: Stripe;
  private plans: Map<string, SubscriptionPlan> = new Map();

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });

    this.initializePlans();
  }

  private initializePlans() {
    this.plans.set('basic', {
      id: 'price_basic',
      name: 'basic',
      price: 2000, // $20.00
      promptsPerDay: 50,
      features: ['50 prompts/day', 'Basic templates', 'Community support']
    });

    this.plans.set('standard', {
      id: 'price_standard',
      name: 'standard',
      price: 3500, // $35.00
      promptsPerDay: 200,
      features: ['200 prompts/day', 'All templates', 'Priority support', 'GitHub export']
    });

    this.plans.set('premium', {
      id: 'price_premium',
      name: 'premium',
      price: 5000, // $50.00
      promptsPerDay: 1000,
      features: ['1000 prompts/day', 'All templates', '24/7 support', 'GitHub export', 'Custom domains']
    });
  }

  async createCheckoutSession(userId: string, planId: string, successUrl: string, cancelUrl: string) {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Multiverse ${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Plan`,
              description: plan.features.join(', ')
            },
            unit_amount: plan.price,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        plan: plan.name
      }
    });

    return session;
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object);
          break;
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  private async handleSubscriptionCreated(session: any) {
    // Update user subscription in database
    // Implement based on your user management system
  }
}
