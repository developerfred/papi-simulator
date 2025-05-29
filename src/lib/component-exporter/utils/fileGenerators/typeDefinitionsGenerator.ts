import { ExportOptions } from "../../types/ExportOptions";

export const generateTypeDefinitions = (
  componentName: string
): string => {
  return `import { FC } from 'react';

export interface ${componentName}Props {
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
  customEndpoint?: string;
}

export const ${componentName}: FC<${componentName}Props>;
export const SafeComponent: FC<${componentName}Props>;`;
};
