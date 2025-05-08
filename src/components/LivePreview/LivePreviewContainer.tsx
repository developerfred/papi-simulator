import type React from "react";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import type { Network } from "@/lib/types/network";
import LivePreview from "./index";

interface LivePreviewContainerProps {
  code: string;
  network: Network;
  className?: string;
}


const LivePreviewContainer: React.FC<LivePreviewContainerProps> = ({
  code,
  network,
  className = "",
}) => {
  const { getColor } = useTheme();
  const [key, setKey] = useState<number>(0);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setKey(prev => prev + 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [network.id]);

  return (
    <div 
      className={`relative h-full ${className}`}
      style={{
        
        zIndex: "var(--z-index-content)", 
        padding: "12px",        
        width: "100%",
        height: "100%",        
        backgroundColor: getColor("surface"),        
        borderRadius: "8px",        
        boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
        position: "relative"
      }}
    >
      <LivePreview 
        key={key}
        code={code}
        network={network}
        width="100%"
        height="100%"
      />
    </div>
  );
};

export default LivePreviewContainer;