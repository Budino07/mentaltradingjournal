import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isEdit: boolean;
}

export const FormActions = ({ isEdit }: FormActionsProps) => {
  return (
    <div className="p-6 pt-0 border-t">
      <Button type="submit" className="w-full">
        {isEdit ? 'Update' : 'Submit'}
      </Button>
    </div>
  );
};