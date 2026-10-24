export interface StripePlanConfig {
  productId: string;
  priceId: string;
  paymentLinkUrl: string;
}

export const StripeConfig: Record<'1_month' | '3_months' | '6_months', StripePlanConfig> = {
  '1_month': {
    productId: 'prod_VUoNiDMn2Tvads',
    priceId: 'price_1UTol4GS4W9CZHGineHZpAN2',
    paymentLinkUrl: 'https://buy.stripe.com/test_bJe9AT78Keum39ze8kcV200'
  },
  '3_months': {
    productId: 'prod_VUoNNVxxJTlPf5',
    priceId: 'price_1UTol5GS4W9CZHGiNLpulrOw',
    paymentLinkUrl: 'https://buy.stripe.com/test_7sY3cv64Gae64dDd4gcV201'
  },
  '6_months': {
    productId: 'prod_VUoNBAsJB2KNpc',
    priceId: 'price_1UTol6GS4W9CZHGiPfsbJceK',
    paymentLinkUrl: 'https://buy.stripe.com/test_00w28rct40DwdOd6FScV202'
  }
};

/**
 * Retorna a URL de checkout da Stripe com o e-mail do usuário pré-preenchido
 */
export function getStripeCheckoutUrl(planId: string, email?: string): string {
  const plan = StripeConfig[planId as keyof typeof StripeConfig] || StripeConfig['3_months'];
  if (!plan) return 'https://buy.stripe.com/test_7sY3cv64Gae64dDd4gcV201';
  
  if (email && email.includes('@')) {
    const separator = plan.paymentLinkUrl.includes('?') ? '&' : '?';
    return `${plan.paymentLinkUrl}${separator}prefilled_email=${encodeURIComponent(email.trim())}`;
  }
  
  return plan.paymentLinkUrl;
}

export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Cria uma sessão do Stripe Embedded Checkout via endpoint serverless da Vercel
 */
export async function createEmbeddedCheckoutSession(
  planId: string, 
  email?: string
): Promise<{ clientSecret: string; publishableKey?: string } | null> {
  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, email })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.clientSecret ? { 
      clientSecret: data.clientSecret, 
      publishableKey: data.publishableKey || STRIPE_PUBLISHABLE_KEY 
    } : null;
  } catch (e) {
    return null;
  }
}
