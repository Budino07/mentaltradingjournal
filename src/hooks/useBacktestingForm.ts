
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormData {
  entryDate: string;
  entryDuration: number;
  instrument: string;
  setup: string;
  direction: 'buy' | 'sell' | null;
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  exitDate: string;
  exitDuration: number;
  exitPrice: number;
  pnl: number;
  highestPrice: number;
  lowestPrice: number;
  beforeUrl: string;
  afterUrl: string;
  weeklyUrl: string;
  dailyUrl: string;
  fourHourUrl: string;
  oneHourUrl: string;
  refinedEntryUrl: string;
}

export function useBacktestingForm(userId: string | undefined, navigate: (path: string) => void) {
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>();
  const [direction, setDirection] = useState<'buy' | 'sell' | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  
  const [formData, setFormData] = useState<FormData>({
    entryDate: '',
    entryDuration: 0,
    instrument: '',
    setup: '',
    direction: null,
    entryPrice: 0,
    quantity: 0,
    stopLoss: 0,
    takeProfit: 0,
    exitDate: '',
    exitDuration: 0,
    exitPrice: 0,
    pnl: 0,
    highestPrice: 0,
    lowestPrice: 0,
    beforeUrl: '',
    afterUrl: '',
    weeklyUrl: '',
    dailyUrl: '',
    fourHourUrl: '',
    oneHourUrl: '',
    refinedEntryUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleDirectionSelect = (selectedDirection: 'buy' | 'sell') => {
    setDirection(selectedDirection);
    setFormData(prev => ({
      ...prev,
      direction: selectedDirection
    }));
  };

  const validateForm = () => {
    if (!selectedBlueprint) {
      setValidationError("Please select a playbook");
      return false;
    }
    if (!formData.instrument) {
      setValidationError("Please enter an instrument");
      return false;
    }
    if (!direction) {
      setValidationError("Please select a direction (buy/sell)");
      return false;
    }
    if (!formData.entryPrice) {
      setValidationError("Please enter an entry price");
      return false;
    }
    if (!formData.entryDate) {
      setValidationError("Please enter an entry date");
      return false;
    }
    setValidationError("");
    return true;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      // Ensure the date is in ISO format and includes timezone
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!userId || !selectedBlueprint) {
      toast.error("Please select a playbook first");
      return;
    }

    try {
      const { data: blueprint, error: blueprintError } = await supabase
        .from("trading_blueprints")
        .select("*")
        .eq("id", selectedBlueprint)
        .single();

      if (blueprintError) throw blueprintError;

      const entryDate = formatDate(formData.entryDate);
      const exitDate = formatDate(formData.exitDate);

      const { error } = await supabase
        .from("backtesting_sessions")
        .insert({
          user_id: userId,
          playbook_id: selectedBlueprint,
          name: `${formData.instrument} ${direction?.toUpperCase()} Session`,
          description: blueprint.description,
          market_type: "forex",
          symbol: formData.instrument,
          start_balance: 10000,
          start_date: entryDate || new Date().toISOString(),
          end_date: exitDate || new Date().toISOString(),
          entry_date: entryDate,
          exit_date: exitDate,
          instrument: formData.instrument,
          setup: formData.setup,
          direction: direction,
          entry_price: formData.entryPrice,
          exit_price: formData.exitPrice,
          quantity: formData.quantity,
          stop_loss: formData.stopLoss,
          take_profit: formData.takeProfit,
          pnl: formData.pnl,
          highest_price: formData.highestPrice,
          lowest_price: formData.lowestPrice,
          before_url: formData.beforeUrl,
          after_url: formData.afterUrl,
          weekly_url: formData.weeklyUrl,
          daily_url: formData.dailyUrl,
          four_hour_url: formData.fourHourUrl,
          one_hour_url: formData.oneHourUrl,
          refined_entry_url: formData.refinedEntryUrl
        });

      if (error) throw error;

      toast.success("Session created successfully!");
      navigate(`/blueprint/${selectedBlueprint}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    }
  };

  return {
    formData,
    selectedBlueprint,
    direction,
    validationError,
    setSelectedBlueprint,
    handleInputChange,
    handleDirectionSelect,
    handleSubmit
  };
}
