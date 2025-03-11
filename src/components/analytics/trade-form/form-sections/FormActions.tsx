
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isEdit: boolean;
}

export const FormActions = ({ isEdit }: FormActionsProps) => {
  return (
    <Button type="submit" className="w-full">
      {isEdit ? 'Update' : 'Submit'}
    </Button>
  );
};
