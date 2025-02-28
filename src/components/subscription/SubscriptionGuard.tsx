
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionDialog } from "./SubscriptionDialog";

// List of public routes that don't require subscription
const PUBLIC_ROUTES = ['/', '/login', '/pricing', '/features', '/journal-entry'];

export const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: hasActiveSubscription, isLoading, error } = useSubscription();
  const [showDialog, setShowDialog] = useState(false);
  const [showPricingPlans, setShowPricingPlans] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  useEffect(() => {
    // Check if user just confirmed email and is on journal-entry page
    const isNewUser = location.pathname === '/journal-entry' && 
                     !hasActiveSubscription && 
                     !isLoading && 
                     user && 
                     session;

    if (isNewUser) {
      setShowPricingPlans(true);
      setShowDialog(true);
      return;
    }

    // Regular subscription guard logic
    if (isPublicRoute) {
      return;
    }

    if (!user || !session) {
      return;
    }

    if (error) {
      console.error("Subscription check error:", error);
      return;
    }

    if (!isPublicRoute && user && !isLoading && hasActiveSubscription === false) {
      setShowPricingPlans(false);
      setShowDialog(true);
    }
  }, [hasActiveSubscription, isLoading, navigate, user, session, error, isPublicRoute, location.pathname]);

  // Always render content for public routes
  if (isPublicRoute) {
    return (
      <>
        {children}
        <SubscriptionDialog
          open={showDialog}
          showPricingPlans={showPricingPlans}
          onClose={() => {
            setShowDialog(false);
            if (!hasActiveSubscription) {
              navigate('/dashboard');
            }
          }}
        />
      </>
    );
  }

  // Show nothing while loading or if not authenticated
  if (isLoading || !user || !session) {
    return null;
  }

  // Allow access if subscription check failed (to prevent blocking legitimate users)
  if (error) {
    console.warn("Subscription check failed, allowing access:", error);
    return <>{children}</>;
  }

  // For protected routes, require subscription
  if (!hasActiveSubscription) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold text-gradient mb-4">Subscribe to Access Features</h2>
            <p className="text-muted-foreground mb-6">
              This premium feature requires a subscription. Upgrade to get access to all advanced trading tools and analytics.
            </p>
            <button 
              onClick={() => navigate('/pricing')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
        
        <SubscriptionDialog
          open={showDialog}
          showPricingPlans={showPricingPlans}
          onClose={() => {
            setShowDialog(false);
            navigate('/dashboard');
          }}
        />
      </>
    );
  }

  return <>{children}</>;
};
