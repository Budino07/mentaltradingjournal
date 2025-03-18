
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TradeFormDialog } from "./trade-form/TradeFormDialog";
import { useQueryClient } from "@tanstack/react-query";

interface AddTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tradeData: any, isEdit: boolean) => void;
  editTrade?: any;
}

export const AddTradeDialog = (props: AddTradeDialogProps) => {
  const queryClient = useQueryClient();

  const handleTradeSubmit = async (tradeData: any, isEdit: boolean) => {
    await props.onSubmit(tradeData, isEdit);
    
    // Immediately invalidate and refetch all relevant queries
    const queries = ['journal-entries', 'analytics', 'weekly-performance'];
    await Promise.all(
      queries.map(query => 
        queryClient.invalidateQueries({
          queryKey: [query],
          refetchType: 'active',
          exact: true
        })
      )
    );
    
    // Force an immediate refetch
    await Promise.all(
      queries.map(query => 
        queryClient.refetchQueries({
          queryKey: [query],
          type: 'active',
          exact: true
        })
      )
    );
  };

  return (
    <TradeFormDialog 
      open={props.open} 
      onOpenChange={props.onOpenChange} 
      onSubmit={handleTradeSubmit}
      editTrade={props.editTrade}
    >
      {/* Empty children to avoid rendering a trigger button */}
      <></>
    </TradeFormDialog>
  );
};
