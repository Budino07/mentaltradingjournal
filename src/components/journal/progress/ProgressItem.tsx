import { Progress } from "@/components/ui/progress";
import { LucideIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useEffect, useState } from "react";

interface ProgressItemProps {
  icon: LucideIcon;
  title: string;
  value: number;
  maxValue: number;
  color: "primary" | "secondary" | "accent";
  unit?: string;
}

export const ProgressItem = ({
  icon: Icon,
  title,
  value,
  maxValue,
  color,
  unit = "entries",
}: ProgressItemProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (title.includes('Daily Activity') && value > prevValue) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevValue(value);
  }, [value, title, prevValue]);

  const progressValue = (value / maxValue) * 100;
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
  };

  const progressClasses = {
    primary: "bg-primary/20 [&>div]:bg-primary",
    secondary: "bg-secondary/20 [&>div]:bg-secondary",
    accent: "bg-accent/20 [&>div]:bg-accent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 relative"
    >
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          initialVelocityY={20}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 50,
            pointerEvents: 'none'
          }}
        />
      )}
      <div className={`p-2 rounded-full ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{title}</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={value}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                }
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`text-sm ${`text-${color}`} ${title.includes('Daily Activity') ? 'font-bold' : ''}`}
            >
              {value === 1 && maxValue === 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <>
                  {title.includes('Daily Activity') ? (
                    <motion.span
                      key={value}
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        transition: {
                          duration: 0.5,
                          times: [0, 0.5, 1],
                          ease: "easeInOut"
                        }
                      }}
                      className="inline-block"
                    >
                      {value}
                    </motion.span>
                  ) : (
                    value
                  )} {unit}
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
        <Progress
          value={progressValue}
          className={`h-1 ${progressClasses[color]}`}
        />
      </div>
    </motion.div>
  );
};