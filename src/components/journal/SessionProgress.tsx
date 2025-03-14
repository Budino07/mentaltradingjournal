
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useIsMobile } from "@/hooks/use-mobile";

export interface SessionProgressProps {
  emotionSelected: boolean;
  emotionDetailSelected: boolean;
  activitiesSelected: boolean;
  notesEntered: boolean;
  outcomeSelected: boolean;
  rulesSelected: boolean;
  mistakesReviewed: boolean;
  tradesAdded: boolean;
  isPostSession: boolean;
  showCelebration: boolean;
}

export const SessionProgress = ({
  emotionSelected,
  emotionDetailSelected,
  activitiesSelected,
  notesEntered,
  outcomeSelected,
  rulesSelected,
  mistakesReviewed,
  tradesAdded,
  isPostSession,
  showCelebration,
}: SessionProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const isMobile = useIsMobile();

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

  const calculateProgress = () => {
    const steps = isPostSession
      ? [
          emotionSelected,
          emotionDetailSelected,
          notesEntered,
          outcomeSelected,
          rulesSelected
        ]
      : [emotionSelected, emotionDetailSelected, activitiesSelected, notesEntered];

    const completedSteps = steps.filter(Boolean).length;
    return (completedSteps / steps.length) * 100;
  };

  useEffect(() => {
    const newProgress = calculateProgress();
    setProgress(newProgress);
  }, [
    emotionSelected,
    emotionDetailSelected,
    activitiesSelected,
    notesEntered,
    outcomeSelected,
    rulesSelected,
    mistakesReviewed,
    tradesAdded,
    isPostSession,
  ]);

  return (
    <div className="space-y-4">
      {showCelebration && (
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
      )}
      <div className={`flex justify-between items-center ${isMobile ? 'px-1' : ''}`}>
        <span className="text-sm font-medium text-muted-foreground">
          {isPostSession ? "Post-Session Progress" : "Pre-Session Progress"}
        </span>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-[#2A2A2A] rounded-lg"
        >
          <Trophy className="w-5 h-5 text-[#FFB156]" />
          <span className="text-sm font-medium text-white">
            {isPostSession ? "Post-session completed!" : "Pre-session completed!"} Keep up the great work!
          </span>
        </motion.div>
      )}
    </div>
  );
};
