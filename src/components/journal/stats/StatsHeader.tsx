import { useState } from "react";
import { useTradingAccounts } from "@/contexts/TradingAccountsContext";
import { AccountSelector } from "../accounts/AccountSelector";
import { AccountsManagement } from "../accounts/AccountsManagement";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const StatsHeader = () => {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const { activeAccount } = useTradingAccounts();

  return (
    <div className="bg-card/30 backdrop-blur-xl p-6 rounded-lg border border-primary/10 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Trading Journal
            </h1>
            <p className="text-muted-foreground">
              Track your trading performance and emotional state over time
            </p>
          </div>
        </div>
        
        <div className="flex justify-start md:justify-end items-center gap-2">
          <AccountSelector />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setIsManagementOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage Accounts</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Trading stats will go here */}
      {activeAccount && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Put your trading stats here */}
        </div>
      )}
      
      <AccountsManagement 
        open={isManagementOpen}
        onOpenChange={setIsManagementOpen}
      />
    </div>
  );
};
