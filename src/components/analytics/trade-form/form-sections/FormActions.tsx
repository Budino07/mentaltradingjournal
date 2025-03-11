
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isEdit: boolean;
}

export const FormActions = ({ isEdit }: FormActionsProps) => {
  return (
    <div className="p-6 pt-4 border-t sticky bottom-0 bg-background z-10 mt-auto">
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
        {isEdit ? 'Update' : 'Submit'}
      </Button>
    </div>
  );
};
