
import { useState, useEffect, useRef } from "react";
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
  const [inputValue, setInputValue] = useState(value || "");
  const { user } = useAuth();
  const initialSetupRef = useRef<string | null>(null);
  const setupExists = useRef<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchPreviousSetups();
    }
  }, [user]);

  // Store initial setup value when component mounts
  useEffect(() => {
    if (value && initialSetupRef.current === null) {
      initialSetupRef.current = value;
      console.log("Initial setup value stored:", value);
    }
  }, [value]);

  // Update local input value when prop value changes
  useEffect(() => {
    console.log("Setup value changed to:", value);
    if (value && value.trim() !== "") {
      setInputValue(value);
      
      // If we have previous setups loaded, check if this is custom
      if (previousSetups.length > 0) {
        const exists = previousSetups.includes(value);
        setupExists.current = exists;
        setIsCustomSetup(!exists);
      }
    }
  }, [value, previousSetups]);

  // Listen for custom setup-value-changed events from parent components
  useEffect(() => {
    const handleSetupValueChanged = (e: CustomEvent) => {
      const newValue = e.detail?.value;
      console.log("Custom setup value changed event:", newValue);
      if (newValue !== undefined && newValue !== null) {
        setInputValue(newValue);
        onChange(newValue);
        
        // Check if this is a custom or existing setup
        if (previousSetups.length > 0) {
          const exists = previousSetups.includes(newValue);
          setupExists.current = exists;
          setIsCustomSetup(!exists && newValue.trim() !== "");
        }
      }
    };
    
    // Add event listener for setup-value-changed
    document.addEventListener('setup-value-changed', handleSetupValueChanged as EventListener);
    
    // Add event listener for force-setup-update
    const handleForceSetupUpdate = (e: CustomEvent) => {
      const forcedValue = e.detail?.value;
      console.log("Forced setup update:", forcedValue);
      if (forcedValue) {
        setInputValue(forcedValue);
        onChange(forcedValue);
        
        // Check if this value exists in previous setups
        if (previousSetups.length > 0) {
          const exists = previousSetups.includes(forcedValue);
          setupExists.current = exists;
          setIsCustomSetup(!exists);
        } else {
          // If we don't have setups yet, we'll assume it might be a custom one
          setIsCustomSetup(true);
        }
        
        // Update the hidden input value
        updateHiddenInput(forcedValue);
      }
    };
    
    document.addEventListener('force-setup-update', handleForceSetupUpdate as EventListener);

    // Cleanup
    return () => {
      document.removeEventListener('setup-value-changed', handleSetupValueChanged as EventListener);
      document.removeEventListener('force-setup-update', handleForceSetupUpdate as EventListener);
    };
  }, [previousSetups, onChange]);

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

      const setupsArray = Array.from(setups).sort();
      setPreviousSetups(setupsArray);
      
      console.log("Loaded previous setups:", setupsArray);
      
      // If current value is not empty, check if it's in the list
      if (value && value.trim() !== "") {
        const exists = setupsArray.includes(value);
        setupExists.current = exists;
        setIsCustomSetup(!exists);
        console.log(`Setup "${value}" exists in list: ${exists}, setting custom mode: ${!exists}`);
      }
    } catch (error) {
      console.error("Error fetching previous setups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSetup = (setupValue: string) => {
    console.log("Selected setup from dropdown:", setupValue);
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
      console.log("Updated hidden input value:", setupValue);
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
    <div className="grid w-full items-center gap-1.5 setup-selector">
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
            value={inputValue} 
            onValueChange={handleSelectSetup}
            disabled={isLoading || previousSetups.length === 0}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a setup">
                {inputValue}
              </SelectValue>
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
        value={inputValue} 
      />
    </div>
  );
};
