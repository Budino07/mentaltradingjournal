
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // Using "instant" instead of "smooth" to avoid animation issues
    });
  }, [pathname]);

  return null;
};
