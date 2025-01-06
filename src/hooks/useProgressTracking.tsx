import { useState, useEffect } from 'react';

interface ProgressStats {
  preSessionStreak: number;
  postSessionStreak: number;
  dailyStreak: number;
  level: number;
  levelProgress: number;
}

const STORAGE_KEY = 'trading-journal-progress';

export const useProgressTracking = () => {
  const [stats, setStats] = useState<ProgressStats>(() => {
    const savedStats = localStorage.getItem(STORAGE_KEY);
    return savedStats ? JSON.parse(savedStats) : {
      preSessionStreak: 0,
      postSessionStreak: 0,
      dailyStreak: 0,
      level: 1,
      levelProgress: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const updateProgress = (sessionType: 'pre' | 'post') => {
    setStats(prevStats => {
      const newStats = { ...prevStats };

      if (sessionType === 'pre') {
        newStats.preSessionStreak += 1;
      } else {
        newStats.postSessionStreak += 1;
      }

      if (newStats.preSessionStreak > 0 && newStats.postSessionStreak > 0) {
        newStats.dailyStreak += 1;
        newStats.preSessionStreak = 0;
        newStats.postSessionStreak = 0;
        newStats.levelProgress += 20;
        
        if (newStats.levelProgress >= 100) {
          newStats.level += 1;
          newStats.levelProgress = 0;
        }
      }

      return newStats;
    });
  };

  return { stats, updateProgress };
};