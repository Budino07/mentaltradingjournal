
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useLocation } from "react-router-dom";

export const SuccessCelebration = () => {
  const location = useLocation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const sessionType = location.state?.sessionType || "pre";

  useEffect(() => {
    // Check if we should show celebration
    if (location.state?.showCelebration) {
      setShowCelebration(true);
      
      // Hide after 5 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!showCelebration) return null;

  return (
    <>
      <ReactConfetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.2}
        initialVelocityY={20}
        tweenDuration={2000}
        colors={['#6E59A5', '#9b87f5', '#FEC6A1', '#0EA5E9', '#38BDF8']}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          pointerEvents: 'none'
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 bg-[#2A2A2A] rounded-lg shadow-xl"
      >
        <Trophy className="w-5 h-5 text-[#FFB156]" />
        <span className="text-sm font-medium text-white">
          {sessionType === "post" ? "Post-session completed!" : "Pre-session completed!"} Keep up the great work!
        </span>
      </motion.div>
    </>
  );
};
