
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface LinkPreviewProps {
  url: string;
}

export const LinkPreview = ({ url }: LinkPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState<{
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
  }>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setIsLoading(true);
        
        // Simple domain extraction
        const domain = new URL(url).hostname.replace("www.", "");
        
        // In a production app, you'd use a proper API to fetch metadata
        // For this demo, we'll simulate a response with some basic data
        // based on the URL domain
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simple preview data based on domain
        let previewInfo = {
          title: url,
          description: "Visit this link for more information",
          domain
        };
        
        // For certain domains, we can provide more specific preview data
        if (domain.includes("tradingview.com")) {
          previewInfo = {
            title: "TradingView Chart",
            description: "Interactive price charts and market analysis",
            image: "https://static.tradingview.com/static/images/logo-preview.png",
            domain
          };
        } else if (domain.includes("twitter.com") || domain.includes("x.com")) {
          previewInfo = {
            title: "Twitter Post",
            description: "View this tweet on Twitter",
            image: "https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc727a.png",
            domain: "twitter.com"
          };
        }
        
        setPreviewData(previewInfo);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch link preview:", err);
        setError(true);
        setIsLoading(false);
      }
    };

    if (url) {
      fetchPreview();
    }
  }, [url]);

  if (error) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-primary hover:underline flex items-center gap-1"
      >
        {url} <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  return (
    <div className="my-2">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="no-underline block w-full"
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm border border-border/50">
          {isLoading ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row">
              {previewData.image && (
                <div className="md:w-1/4 shrink-0">
                  <div className="relative aspect-video md:aspect-square w-full bg-muted/20">
                    <img 
                      src={previewData.image} 
                      alt={previewData.title || "Link preview"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="p-3 flex-1">
                <p className="text-sm font-medium line-clamp-1">{previewData.title}</p>
                {previewData.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {previewData.description}
                  </p>
                )}
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {previewData.domain}
                </div>
              </div>
            </div>
          )}
        </Card>
      </a>
    </div>
  );
};
