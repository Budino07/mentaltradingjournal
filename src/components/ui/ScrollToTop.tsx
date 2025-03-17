
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to top immediately when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use instant instead of smooth for immediate effect
    });
  }, [pathname]);

  return null;
};
