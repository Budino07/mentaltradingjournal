
import { supabase } from "@/integrations/supabase/client";
import { trackUpgradeClicked } from "@/lib/analytics";

export async function createCheckoutSession(priceId: string, source?: string) {
  try {
    void trackUpgradeClicked(
      source ?? (typeof window !== "undefined" ? window.location.pathname : "unknown"),
      priceId
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User must be logged in');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        userId: session.user.id,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No checkout URL returned');

    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createPortalSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User must be logged in');
    }

    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {},
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No portal URL returned');

    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}
