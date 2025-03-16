
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to top immediately when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
