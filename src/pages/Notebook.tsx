
import { AppLayout } from "@/components/layout/AppLayout";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { ThemeProvider } from "next-themes";
import { Helmet } from "react-helmet";

const Notebook = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Slab:wght@400;500;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
        {/* Custom fonts that need to be hosted somewhere */}
        <style>
          {`
            @font-face {
              font-family: 'Archer';
              src: url('https://assets.lovable.app/fonts/archer-medium.woff2') format('woff2');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Gotham Rounded';
              src: url('https://assets.lovable.app/fonts/gotham-rounded-medium.woff2') format('woff2');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Ideal Sans';
              src: url('https://assets.lovable.app/fonts/ideal-sans-medium.woff2') format('woff2');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Verlag';
              src: url('https://assets.lovable.app/fonts/verlag-book.woff2') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
          `}
        </style>
      </Helmet>
      <AppLayout>
        <SubscriptionGuard>
          <div className="h-[calc(100vh-4rem)] overflow-hidden">
            <NotebookContent />
          </div>
        </SubscriptionGuard>
      </AppLayout>
    </ThemeProvider>
  );
};

export default Notebook;
