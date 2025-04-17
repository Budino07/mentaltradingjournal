
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPreviousSetups();
    }
  }, [user]);

  useEffect(() => {
    // If value exists and setup options are loaded, check if it's custom or existing
    if (value && previousSetups.length > 0) {
      setIsCustomSetup(!previousSetups.includes(value));
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
      
      // After loading setups, check if our value should trigger custom mode
      if (value && !Array.from(setups).includes(value)) {
        setIsCustomSetup(true);
      }
    } catch (error) {
      console.error("Error fetching previous setups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSetup = (setupValue: string) => {
    onChange(setupValue);
    setIsCustomSetup(false);
  };

  const handleCustomSetup = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const toggleCustomMode = () => {
    setIsCustomSetup(!isCustomSetup);
    if (!isCustomSetup) {
      onChange(""); // Clear value when switching to custom mode
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
            name="setup"
            value={value}
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
            value={value || ""} 
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
    </div>
  );
};
