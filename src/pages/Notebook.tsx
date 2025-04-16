
import { AppLayout } from "@/components/layout/AppLayout";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

const Notebook = () => {
  // Ensure all fonts are loaded and available
  useEffect(() => {
    // Add font links to document head
    const fontLinks = [
      {
        href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
        rel: "stylesheet"
      },
      {
        href: "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;500;700&display=swap",
        rel: "stylesheet"
      },
      {
        href: "https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap",
        rel: "stylesheet"
      },
      // Add custom font styles for fonts not available in Google Fonts
      {
        type: "text/css",
        innerContent: `
          @font-face {
            font-family: 'Archer';
            src: url('/fonts/Archer-Medium.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Gotham Rounded';
            src: url('/fonts/GothamRounded-Medium.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Ideal Sans';
            src: url('/fonts/IdealSans-Medium.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Verlag';
            src: url('/fonts/Verlag-Book.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `
      }
    ];

    // Create and append style/link elements
    fontLinks.forEach(link => {
      if (link.type === "text/css") {
        // Create style element for custom fonts
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = link.innerContent || '';
        document.head.appendChild(style);
      } else {
        // Create link element for Google Fonts
        const linkElement = document.createElement('link');
        linkElement.rel = link.rel || 'stylesheet';
        linkElement.href = link.href;
        document.head.appendChild(linkElement);
      }
    });

    // Clean up function
    return () => {
      // Remove any dynamically added style/link elements if component unmounts
      const styles = document.querySelectorAll('style[type="text/css"]');
      styles.forEach(style => {
        if (style.innerHTML.includes('@font-face')) {
          style.remove();
        }
      });
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
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
