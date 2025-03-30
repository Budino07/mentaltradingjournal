
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

interface MonthSelectorProps {
  months: string[];
  onSelectMonth: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ months, onSelectMonth }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {months.map((month) => (
        <motion.div key={month} variants={item}>
          <Card 
            className="overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border border-primary/20 group"
            onClick={() => onSelectMonth(month)}
          >
            <CardContent className="p-0">
              <div className="relative h-48 w-full bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-b from-primary/40 to-accent/40 transition-opacity duration-300" />
                
                <CalendarIcon className="h-12 w-12 text-primary mb-4" />
                
                <h3 className="text-2xl font-bold text-primary drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{month}</h3>
                
                <p className="text-sm text-muted-foreground mt-2 opacity-70">
                  Click to view your monthly wrapped insights
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
