
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isEdit: boolean;
}

export const FormActions = ({ isEdit }: FormActionsProps) => {
  return (
    <div className="p-6 pt-4 border-t sticky bottom-0 bg-background z-10">
      <Button type="submit" className="w-full">
        {isEdit ? 'Update' : 'Submit'}
      </Button>
    </div>
  );
};
