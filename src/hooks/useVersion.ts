import { useState, useEffect } from "react";

interface VersionInfo {
  version: string;
  gitHash: string;
  gitBranch: string;
  buildTime: string;
  environment: string;
}

export function useVersion(): VersionInfo {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: process.env.NEXT_PUBLIC_VERSION || "0.0.0",
    gitHash: process.env.NEXT_PUBLIC_GIT_HASH || "unknown",
    gitBranch: "main",
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });

  useEffect(() => {
    // Try to load version.json file for more detailed info
    const loadVersionInfo = async () => {
      try {
        const response = await fetch("/version.json");
        if (response.ok) {
          const data = await response.json();
          setVersionInfo(data);
        }
      } catch (error) {
        console.warn("Failed to load version info:", error);
      }
    };

    loadVersionInfo();
  }, []);

  return versionInfo;
}