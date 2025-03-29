import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, isToday, isYesterday, parseISO, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smile, Meh, Frown, ArrowRight, Calendar, BarChart3, ListFilter } from "lucide-react";
import { EmotionSelector } from "./EmotionSelector";
import { TradeForm } from "./TradeForm";
import { JournalEntryForm } from "./JournalEntryForm";
import { useJournalEntries } from "@/hooks/use-journal-entries";
import { JournalCalendar } from "./calendar/JournalCalendar";
import { useTimeFilter } from "@/contexts/TimeFilterContext";
import { EmotionBadge } from "./EmotionBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { TimeFilter } from "@/components/journal/TimeFilter";
import { JournalStats } from "./JournalStats";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { emotions } from "./emotionConfig";
import { useToast } from "@/components/ui/use-toast";

export const EmotionLogger = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { selectedDate, setSelectedDate } = useTimeFilter();
  const [activeTab, setActiveTab] = useState("pre");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedDetail, setSelectedDetail] = useState("");
  const [journalNote, setJournalNote] = useState("");
  const [preActivities, setPreActivities] = useState<string[]>([]);
  const [marketConditions, setMarketConditions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPreSession, setHasPreSession] = useState(false);
  const [hasPostSession, setHasPostSession] = useState(false);
  
  const { 
    entries, 
    isLoading, 
    refetch: refetchEntries 
  } = useJournalEntries(selectedDate);

  // Check if we have a date passed from another component
  useEffect(() => {
    if (location.state?.selectedDate) {
      setSelectedDate(new Date(location.state.selectedDate));
      // Clear the location state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, setSelectedDate]);

  // Check for existing entries when date changes
  useEffect(() => {
    if (entries && entries.length > 0) {
      const preEntry = entries.find(entry => entry.session_type === 'pre');
      const postEntry = entries.find(entry => entry.session_type === 'post');
      
      setHasPreSession(!!preEntry);
      setHasPostSession(!!postEntry);
      
      // If we have a pre-session entry, populate the form with its data
      if (preEntry && activeTab === 'pre') {
        setSelectedEmotion(preEntry.emotion || '');
        setSelectedDetail(preEntry.emotion_detail || '');
        setJournalNote(preEntry.notes || '');
        setPreActivities(preEntry.pre_trading_activities || []);
        setMarketConditions(preEntry.market_conditions || []);
      }
      
      // If we have a post-session entry, populate the form with its data
      if (postEntry && activeTab === 'post') {
        setSelectedEmotion(postEntry.emotion || '');
        setSelectedDetail(postEntry.emotion_detail || '');
        setJournalNote(postEntry.notes || '');
      }
    } else {
      // Reset form when no entries exist
      resetForm();
      setHasPreSession(false);
      setHasPostSession(false);
    }
  }, [entries, selectedDate, activeTab]);

  const resetForm = () => {
    setSelectedEmotion("");
    setSelectedDetail("");
    setJournalNote("");
    setPreActivities([]);
    setMarketConditions([]);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save journal entries",
        variant: "destructive",
      });
      return;
    }

    if (!selectedEmotion) {
      toast({
        title: "Emotion required",
        description: "Please select your emotional state",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const existingEntry = entries.find(entry => entry.session_type === activeTab);
      
      const entryData = {
        user_id: user.id,
        created_at: startOfDay(selectedDate).toISOString(),
        session_type: activeTab,
        emotion: selectedEmotion,
        emotion_detail: selectedDetail,
        notes: journalNote,
        pre_trading_activities: activeTab === 'pre' ? preActivities : undefined,
        market_conditions: activeTab === 'pre' ? marketConditions : undefined,
      };

      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', existingEntry.id);

        if (error) throw error;
        
        toast({
          title: "Entry updated",
          description: `Your ${activeTab}-session journal has been updated`,
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert([entryData]);

        if (error) throw error;
        
        toast({
          title: "Entry saved",
          description: `Your ${activeTab}-session journal has been saved`,
        });
      }

      // Refetch entries to update the UI
      refetchEntries();
      
      // If this was a pre-session entry, switch to trade tab
      if (activeTab === 'pre') {
        setActiveTab('trade');
        setHasPreSession(true);
      } else if (activeTab === 'post') {
        setHasPostSession(true);
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSelectedDate = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    return format(selectedDate, "MMMM d, yyyy");
  };

  const renderDateSelector = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{formatSelectedDate()}</h2>
      </div>
      <div className="flex items-center gap-2">
        <TimeFilter />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/analytics')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>
    </div>
  );

  const renderEmotionSummary = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 animate-pulse">
          <Skeleton className="h-8 w-24" />
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-8 w-24" />
        </div>
      );
    }

    const preEntry = entries.find(entry => entry.session_type === 'pre');
    const postEntry = entries.find(entry => entry.session_type === 'post');

    return (
      <div className="flex flex-wrap items-center gap-2">
        {preEntry?.emotion ? (
          <EmotionBadge 
            emotion={preEntry.emotion} 
            detail={preEntry.emotion_detail || preEntry.emotion} 
          />
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab('pre')}
            className="border-dashed"
          >
            + Pre-session
          </Button>
        )}
        
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        
        {postEntry?.emotion ? (
          <EmotionBadge 
            emotion={postEntry.emotion} 
            detail={postEntry.emotion_detail || postEntry.emotion} 
          />
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab('post')}
            className="border-dashed"
            disabled={!hasPreSession}
          >
            + Post-session
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderDateSelector()}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Trading Journal</CardTitle>
              <CardDescription>
                Track your emotions and performance
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                {renderEmotionSummary()}
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="pre">Pre-Session</TabsTrigger>
                  <TabsTrigger value="trade" disabled={!hasPreSession}>Trades</TabsTrigger>
                  <TabsTrigger value="post" disabled={!hasPreSession}>Post-Session</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pre">
                  <JournalEntryForm
                    selectedEmotion={selectedEmotion}
                    setSelectedEmotion={setSelectedEmotion}
                    selectedDetail={selectedDetail}
                    setSelectedDetail={setSelectedDetail}
                    journalNote={journalNote}
                    setJournalNote={setJournalNote}
                    preActivities={preActivities}
                    setPreActivities={setPreActivities}
                    marketConditions={marketConditions}
                    setMarketConditions={setMarketConditions}
                    showPreSessionFields={true}
                  />
                </TabsContent>
                
                <TabsContent value="trade">
                  <TradeForm 
                    selectedDate={selectedDate}
                    onTradeAdded={() => refetchEntries()}
                  />
                </TabsContent>
                
                <TabsContent value="post">
                  <JournalEntryForm
                    selectedEmotion={selectedEmotion}
                    setSelectedEmotion={setSelectedEmotion}
                    selectedDetail={selectedDetail}
                    setSelectedDetail={setSelectedDetail}
                    journalNote={journalNote}
                    setJournalNote={setJournalNote}
                    showPreSessionFields={false}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              {(activeTab === 'pre' || activeTab === 'post') && (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !selectedEmotion}
                >
                  {isSubmitting ? "Saving..." : "Save Entry"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-4">
          <JournalStats />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                View your journal history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JournalCalendar />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
