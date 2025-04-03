
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";
import { TimeFilterProvider } from "@/contexts/TimeFilterContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarModeProvider } from "@/contexts/CalendarModeContext";
import { MorningRecap } from "@/components/notifications/MorningRecap";
import { ThemeProvider } from "next-themes";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TimeFilterProvider>
        <CalendarModeProvider>
          <AppLayout>
            <div className={`container mx-auto py-0 ${isMobile ? 'px-3' : 'px-2'}`}>
              <EmotionLogger />
              <MorningRecap />
            </div>
          </AppLayout>
        </CalendarModeProvider>
      </TimeFilterProvider>
    </ThemeProvider>
  );
};

export default Index;
