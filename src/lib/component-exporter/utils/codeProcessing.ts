import { ExportOptions } from "../types/ExportOptions";
import { Network } from "@/lib/types/network";

const PLAYGROUND_IMPORTS = [
  /import.*from ['"]@\/hooks\/useWallet['"];?\n?/g,
  /import.*from ['"]@\/lib\/theme\/ThemeProvider['"];?\n?/g,
];

export const removePlaygroundImports = (code: string): string => {
  return PLAYGROUND_IMPORTS.reduce(
    (acc, regex) => acc.replace(regex, ""), 
    code
  );
};

export const addExternalImports = (
  code: string, 
  options: ExportOptions, 
  network: Network
): string => {
  const imports = [
    "import React, { useState, useEffect, useCallback, useMemo } from 'react';",
    "import { createClient } from 'polkadot-api';",
    `import { ${network.descriptorKey} } from '@polkadot-api/descriptors';`,
    "import { getWsProvider } from 'polkadot-api/ws-provider/web';",
    "import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';",
  ];

  if (options.includeTypes) {
    imports.push("import type { ComponentProps, ReactNode } from 'react';");
  }

  return `${imports.join('\n')}\n\n${code}`;
};

export const wrapWithProperExport = (
  code: string, 
  options: ExportOptions,
  generatePropsInterface: (name: string) => string
): string => {
  const componentMatch = code.match(/export default function (\w+)/);
  const actualName = componentMatch?.[1] || 'ExportedComponent';

  let processedCode = code;
  
  if (options.componentName !== actualName) {
    processedCode = processedCode.replace(
      `export default function ${actualName}`,
      `export default function ${options.componentName}`
    );
  }

  if (options.includeTypes) {
    processedCode = `${generatePropsInterface(options.componentName)}\n\n${processedCode}`;
  }

  return processedCode;
};

export const generatePropsInterface = (componentName: string): string => {
  return `export interface ${componentName}Props {
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
  onSuccess?: (result: any) => void;
  customEndpoint?: string;
  theme?: 'light' | 'dark' | 'auto';
}`;
};
