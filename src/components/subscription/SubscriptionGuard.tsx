
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionDialog } from "./SubscriptionDialog";

// List of public routes that don't require subscription
const PUBLIC_ROUTES = ['/', '/login', '/pricing', '/features', '/journal-entry', '/dashboard'];

export const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: hasActiveSubscription, isLoading, error } = useSubscription();
  const [showDialog, setShowDialog] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  useEffect(() => {
    // Always allow access to public routes
    if (isPublicRoute) {
      return;
    }

    // Skip subscription check if user is not authenticated
    if (!user || !session) {
      return;
    }

    // Only show error if we have a session and there's a subscription check error
    if (error) {
      console.error("Subscription check error:", error);
      return;
    }

    // Show dialog if:
    // 1. Not on a public route
    // 2. User is authenticated
    // 3. Not loading
    // 4. No subscription found
    if (!isPublicRoute && user && !isLoading && hasActiveSubscription === false) {
      setShowDialog(true);
    }
  }, [hasActiveSubscription, isLoading, navigate, user, session, error, isPublicRoute]);

  // Always render content for public routes
  if (isPublicRoute) {
    return <>{children}</>;
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
      <SubscriptionDialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          navigate('/dashboard');
        }}
      />
    );
  }

  return <>{children}</>;
};
