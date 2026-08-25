import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/**
 * Global page-view tracker. Mounted once inside the router so it also covers
 * public pages (landing, pricing, login) visited by logged-out people.
 */
export const AnalyticsTracker = () => {
  const location = useLocation();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === location.pathname) return;
    last.current = location.pathname;
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
};
