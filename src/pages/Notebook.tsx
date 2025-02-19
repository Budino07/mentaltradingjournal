
import { AppLayout } from "@/components/layout/AppLayout";
import { NotebookContent } from "@/components/notebook/NotebookContent";

const Notebook = () => {
  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)]">
        <NotebookContent />
      </div>
    </AppLayout>
  );
};

export default Notebook;
