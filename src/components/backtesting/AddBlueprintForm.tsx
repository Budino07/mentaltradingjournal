
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface AddBlueprintFormProps {
  onSuccess: () => void;
}

export function AddBlueprintForm({ onSuccess }: AddBlueprintFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    strategy: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("trading_blueprints")
        .insert({
          user_id: user.id,
          name: formData.strategy,
          description: formData.description,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trading blueprint has been created",
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create trading blueprint",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="strategy">Strategy Name*</Label>
        <Input
          id="strategy"
          value={formData.strategy}
          onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
          placeholder="Enter strategy name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description*</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your strategy, including rules, exit management, etc."
          className="min-h-[150px]"
          required
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Creating..." : "Create Blueprint"}
        </Button>
      </div>
    </form>
  );
}
