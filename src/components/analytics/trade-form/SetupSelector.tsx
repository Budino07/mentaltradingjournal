import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SetupSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const SetupSelector = ({ value, onChange }: SetupSelectorProps) => {
  const [previousSetups, setPreviousSetups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomSetup, setIsCustomSetup] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPreviousSetups();
    }
  }, [user]);

  // Update local input value when prop value changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Check if the current value exists in the previous setups
  useEffect(() => {
    if (value && previousSetups.length > 0) {
      const exists = previousSetups.includes(value);
      setIsCustomSetup(!exists && value.trim() !== "");
    }
  }, [value, previousSetups]);

  const fetchPreviousSetups = async () => {
    setIsLoading(true);
    try {
      // Get all journal entries with trades from the current user
      const { data: journalEntries, error } = await supabase
        .from("journal_entries")
        .select("trades")
        .eq("user_id", user?.id)
        .not("trades", "is", null);

      if (error) throw error;

      // Extract all unique setups from trades
      const setups = new Set<string>();
      
      journalEntries?.forEach(entry => {
        if (entry.trades && Array.isArray(entry.trades)) {
          entry.trades.forEach((trade: any) => {
            if (trade.setup && typeof trade.setup === 'string' && trade.setup.trim() !== '') {
              setups.add(trade.setup.trim());
            }
          });
        }
      });

      setPreviousSetups(Array.from(setups).sort());
    } catch (error) {
      console.error("Error fetching previous setups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSetup = (setupValue: string) => {
    onChange(setupValue);
    setInputValue(setupValue);
    setIsCustomSetup(false);
    
    // Update hidden input for form submission
    updateHiddenInput(setupValue);
  };

  const handleCustomSetup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Update hidden input for form submission
    updateHiddenInput(newValue);
  };

  const updateHiddenInput = (setupValue: string) => {
    const setupInput = document.querySelector('input[name="setup"]') as HTMLInputElement;
    if (setupInput) {
      setupInput.value = setupValue;
    }
  };

  const toggleCustomMode = () => {
    setIsCustomSetup(!isCustomSetup);
    
    // If switching to existing mode, update to selected setup if available
    if (isCustomSetup && previousSetups.length > 0) {
      if (value && previousSetups.includes(value)) {
        // Keep current value if it exists in previous setups
        setInputValue(value);
      } else {
        // Reset to empty to allow selection
        setInputValue("");
        onChange("");
        updateHiddenInput("");
      }
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="setup">Setup</Label>
      
      {isCustomSetup ? (
        <div className="flex gap-2">
          <Input
            type="text"
            id="setup"
            name="setup-input"
            value={inputValue}
            onChange={handleCustomSetup}
            placeholder="Enter your trading setup"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={toggleCustomMode}
          >
            Use Existing
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Select 
            value={value} 
            onValueChange={handleSelectSetup}
            disabled={isLoading || previousSetups.length === 0}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a setup" />
            </SelectTrigger>
            <SelectContent>
              {previousSetups.map((setup) => (
                <SelectItem key={setup} value={setup}>
                  {setup}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={toggleCustomMode}
          >
            Custom
          </Button>
        </div>
      )}
      
      {/* Hidden input to preserve form submission */}
      <input 
        type="hidden" 
        name="setup" 
        value={value || ""} 
      />
    </div>
  );
};
