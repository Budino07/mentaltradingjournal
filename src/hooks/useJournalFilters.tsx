
import { useState } from "react";
import { isWithinInterval, startOfMonth, endOfMonth, subMonths, isSameDay, startOfYear, endOfYear, subYears } from "date-fns";
import { JournalEntryType } from "@/types/journal";

export type TimeFilter = "this-month" | "last-month" | "last-three-months" | "last-year" | "eternal" | "custom" | null;

export const useJournalFilters = (entries: JournalEntryType[]) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);
  const [detailFilter, setDetailFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(null);
  const [outcomeFilter, setOutcomeFilter] = useState<string | null>(null);

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    const matchesDate = !selectedDate || isSameDay(entryDate, selectedDate);
    const matchesEmotion = !emotionFilter || entry.emotion.toLowerCase() === emotionFilter.toLowerCase();
    const matchesDetail = !detailFilter || entry.emotion_detail === detailFilter;
    const matchesOutcome = !outcomeFilter || (entry.outcome === outcomeFilter && entry.session_type === 'post');
    
    let matchesTimeFilter = true;
    if (timeFilter && timeFilter !== 'eternal' && timeFilter !== 'custom') {
      const now = new Date();
      const intervals: Record<Exclude<TimeFilter, "eternal" | "custom" | null>, { start: Date; end: Date }> = {
        "this-month": {
          start: startOfMonth(now),
          end: endOfMonth(now)
        },
        "last-month": {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        },
        "last-three-months": {
          start: startOfMonth(subMonths(now, 3)),
          end: endOfMonth(now)
        },
        "last-year": {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1))
        }
      };

      const interval = intervals[timeFilter as Exclude<TimeFilter, "eternal" | "custom" | null>];
      matchesTimeFilter = isWithinInterval(entryDate, interval);
    }

    return matchesDate && matchesEmotion && matchesDetail && matchesTimeFilter && matchesOutcome;
  });

  return {
    selectedDate,
    setSelectedDate,
    emotionFilter,
    setEmotionFilter,
    detailFilter,
    setDetailFilter,
    timeFilter,
    setTimeFilter,
    outcomeFilter,
    setOutcomeFilter,
    filteredEntries
  };
};
