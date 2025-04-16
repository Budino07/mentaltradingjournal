
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

    // Add custom fonts that aren't available through Google Fonts
    const customFontsStyle = document.createElement('style');
    customFontsStyle.textContent = `
      @font-face {
        font-family: 'Archer';
        src: url('https://use.typekit.net/af/3627af/00000000000000007735a075/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Gotham Rounded';
        src: url('https://use.typekit.net/af/a9b802/00000000000000007735a60b/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Ideal Sans';
        src: url('https://use.typekit.net/af/cda208/00000000000000007735a686/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Verlag';
        src: url('https://use.typekit.net/af/494bd9/00000000000000007735faa5/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(customFontsStyle);

    // Clean up function
    return () => {
      // Remove any dynamically added style/link elements if component unmounts
      const styles = document.querySelectorAll('style[type="text/css"]');
      styles.forEach(style => {
        if (style.innerHTML.includes('@font-face')) {
          style.remove();
        }
      });
      document.head.removeChild(customFontsStyle);
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
