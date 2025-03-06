
import { Trade } from "@/types/trade";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AddTradeDialog } from "@/components/analytics/AddTradeDialog";
import { TradeActions } from "./trade-item/TradeActions";
import { TradeDetails } from "./trade-item/TradeDetails";
import { TradeHeader } from "./trade-item/TradeHeader";
import { TradeDeleteDialog } from "./trade-item/TradeDeleteDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTradeActions } from "./hooks/useTradeActions";
import { formatDate } from "./utils/dateUtils";

interface TradesListProps {
  trades: Trade[];
  journalEntryId?: string; // Make this optional
}

export const TradesList = ({ trades, journalEntryId }: TradesListProps) => {
  const { user } = useAuth();
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedTrade,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm,
    handleTradeUpdate
  } = useTradeActions(user);

  return (
    <>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {trades.map((trade, index) => (
          <AccordionItem 
            key={trade.id || index} 
            value={`trade-${index}`} 
            className="border rounded-lg px-2 md:px-4"
          >
            <AccordionTrigger className="hover:no-underline py-2 md:py-3">
              <TradeHeader trade={trade} />
            </AccordionTrigger>
            <AccordionContent className="pb-3 md:pb-4 space-y-4">
              <TradeActions
                trade={trade}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
              <TradeDetails trade={trade} formatDate={formatDate} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddTradeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleTradeUpdate}
        editTrade={selectedTrade}
      />

      <TradeDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
