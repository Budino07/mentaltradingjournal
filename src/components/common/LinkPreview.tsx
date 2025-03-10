
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface LinkPreviewProps {
  url: string;
  className?: string;
}

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
}

export const LinkPreview = ({ url, className = "" }: LinkPreviewProps) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Use a proxy service for CORS issues - for demo purposes
        // In production, you'd likely want a backend endpoint to handle this
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (!data.contents) throw new Error("Failed to fetch URL content");
        
        // Parse HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");
        
        // Extract metadata from meta tags
        const metaTags = doc.querySelectorAll("meta");
        const extractedData: Partial<LinkMetadata> = { url };
        
        metaTags.forEach(tag => {
          const property = tag.getAttribute("property") || tag.getAttribute("name");
          const content = tag.getAttribute("content");
          
          if (!property || !content) return;
          
          if (property === "og:title" || property === "twitter:title") {
            extractedData.title = content;
          } else if (property === "og:description" || property === "twitter:description" || property === "description") {
            extractedData.description = content;
          } else if (property === "og:image" || property === "twitter:image") {
            extractedData.image = content;
          } else if (property === "og:site_name") {
            extractedData.siteName = content;
          }
        });
        
        // If no Open Graph title, use document title
        if (!extractedData.title) {
          extractedData.title = doc.querySelector("title")?.textContent || new URL(url).hostname;
        }
        
        // If still no description, use a default
        if (!extractedData.description) {
          extractedData.description = "No description available";
        }
        
        // If no image found, use a placeholder
        if (!extractedData.image) {
          extractedData.image = "/placeholder.svg";
        }
        
        setMetadata(extractedData as LinkMetadata);
      } catch (err) {
        console.error("Error fetching link preview:", err);
        setError(true);
        
        // Create fallback metadata with just the URL
        const domain = new URL(url).hostname;
        setMetadata({
          title: domain,
          description: url,
          image: "/placeholder.svg",
          url
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (url) {
      fetchMetadata();
    }
  }, [url]);

  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Fallback display if there's an error or while loading
  if (loading) {
    return (
      <Card className={`p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer ${className}`}>
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3 mt-1" />
          </div>
        </div>
      </Card>
    );
  }

  if (!metadata) return null;

  return (
    <Card 
      className={`p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer ${className}`} 
      onClick={handleClick}
    >
      <div className="flex gap-4">
        {metadata.image && (
          <div className="h-16 w-16 relative overflow-hidden rounded">
            <img 
              src={metadata.image} 
              alt={metadata.title} 
              className="object-cover h-full w-full"
              onError={(e) => {
                // Replace broken images with placeholder
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-medium line-clamp-1">{metadata.title}</h3>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</p>
          <p className="text-xs text-primary mt-1">{new URL(url).hostname}</p>
        </div>
      </div>
    </Card>
  );
};
