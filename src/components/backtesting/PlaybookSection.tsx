
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddBlueprintForm } from "./AddBlueprintForm";
import { BlueprintCard } from "./BlueprintCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PlaybookSectionProps {
  onBlueprintAdded?: () => void;
}

export function PlaybookSection({ onBlueprintAdded }: PlaybookSectionProps) {
  const [open, setOpen] = useState(false);
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [winRates, setWinRates] = useState<{[key: string]: number}>({});
  const { user } = useAuth();

  const fetchBlueprints = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("trading_blueprints")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBlueprints(data);
      // Fetch win rates for each blueprint
      data.forEach(blueprint => {
        calculateWinRate(blueprint.id);
      });
    }
  };

  const calculateWinRate = async (blueprintId: string) => {
    const { data: sessions, error } = await supabase
      .from("backtesting_sessions")
      .select("pnl")
      .eq("playbook_id", blueprintId);

    if (!error && sessions && sessions.length > 0) {
      const winningTrades = sessions.filter(session => (session.pnl || 0) > 0).length;
      const winRate = (winningTrades / sessions.length) * 100;
      setWinRates(prev => ({
        ...prev,
        [blueprintId]: Number(winRate.toFixed(2))
      }));
    } else {
      setWinRates(prev => ({
        ...prev,
        [blueprintId]: 0
      }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchBlueprints();
    }
  }, [user]);

  const handleSuccess = () => {
    setOpen(false);
    fetchBlueprints();
    if (onBlueprintAdded) {
      onBlueprintAdded();
    }
  };

  const handleDelete = () => {
    fetchBlueprints();
    if (onBlueprintAdded) {
      onBlueprintAdded();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Playbook</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Playbook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Trading Blueprint</DialogTitle>
            </DialogHeader>
            <AddBlueprintForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {blueprints.length === 0 ? (
          <p className="text-muted-foreground">
            Select or create a playbook to view trading rules and strategies for your backtesting session.
          </p>
        ) : (
          <div className="grid gap-4">
            {blueprints.map((blueprint) => (
              <BlueprintCard
                key={blueprint.id}
                id={blueprint.id}
                name={blueprint.name}
                instrument={blueprint.rules[0]?.replace("Instrument: ", "") || "N/A"}
                emoji={blueprint.emoji}
                winRate={winRates[blueprint.id] || 0}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
