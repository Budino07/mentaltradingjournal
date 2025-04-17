
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

  // Initialize custom mode based on value
  useEffect(() => {
    if (value) {
      console.log("Setup value in SetupSelector:", value);
      // Normalize the setup value
      const normalizedValue = value.trim();
      
      // If we have previous setups and the value isn't in them, set custom mode
      if (previousSetups.length > 0) {
        const setupExists = previousSetups.some(setup => setup.trim() === normalizedValue);
        setIsCustomSetup(!setupExists);
        console.log("Custom setup mode:", !setupExists);
      }
    }
  }, [value, previousSetups]);

  const fetchPreviousSetups = async () => {
    setIsLoading(true);
    try {
      const { data: journalEntries, error } = await supabase
        .from("journal_entries")
        .select("trades")
        .eq("user_id", user?.id)
        .not("trades", "is", null);

      if (error) throw error;

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

      const setupsArray = Array.from(setups).sort();
      setPreviousSetups(setupsArray);
      console.log("Previous setups loaded:", setupsArray);
      
      // Check if current value is in existing setups
      if (value && !setupsArray.includes(value.trim())) {
        setIsCustomSetup(true);
        console.log("Setting custom mode because value not in setups:", value);
      }
    } catch (error) {
      console.error("Error fetching previous setups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSetup = (setupValue: string) => {
    const normalizedSetup = setupValue.trim();
    console.log("Setup selected from dropdown:", normalizedSetup);
    onChange(normalizedSetup);
    setIsCustomSetup(false);
  };

  const handleCustomSetup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalizedSetup = e.target.value.trim();
    console.log("Custom setup changed:", normalizedSetup);
    onChange(normalizedSetup);
  };

  const toggleCustomMode = () => {
    console.log("Toggling custom mode from", isCustomSetup, "to", !isCustomSetup);
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
