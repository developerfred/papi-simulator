import type { ExportOptions } from '../types';
import type { Network } from '@/lib/types/network';

export class CodeProcessor {
    private readonly code: string;
    private readonly network: Network;
    private readonly options: ExportOptions;

    constructor(code: string, network: Network, options: ExportOptions) {
        this.code = code;
        this.network = network;
        this.options = options;
    }

    public processCode(): string {
        let processedCode = this.code;

        processedCode = this.removePlaygroundImports(processedCode);
        processedCode = this.addProductionImports(processedCode);
        processedCode = this.addErrorHandling(processedCode);
        processedCode = this.optimizePerformance(processedCode);
        processedCode = this.addPropsInterface(processedCode);

        if (this.options.minifyOutput) {
            processedCode = this.minifyCode(processedCode);
        }

        return processedCode;
    }

    private removePlaygroundImports(code: string): string {
        const playgroundImports = [
            /import.*from ['"]@\/hooks\/useWallet['"];?\n?/g,
            /import.*from ['"]@\/lib\/theme\/ThemeProvider['"];?\n?/g,
            /import.*from ['"]@\/.*['"];?\n?/g
        ];

        return playgroundImports.reduce(
            (processedCode, regex) => processedCode.replace(regex, ''),
            code
        );
    }

    private addProductionImports(code: string): string {
        const imports = [
            "import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';",
            "import { createClient } from 'polkadot-api';",
            `import { ${this.network.descriptorKey} } from '@polkadot-api/descriptors';`,
            "import { getWsProvider } from 'polkadot-api/ws-provider/web';",
            "import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';"
        ];

        if (this.options.includeTypes) {
            imports.push("import type { ComponentProps, ReactNode, FC } from 'react';");
        }

        return imports.join('\n') + '\n\n' + code;
    }

    private addErrorHandling(code: string): string {
        return `${code}

// Production Error Boundary
interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

class ProductionErrorBoundary extends React.Component<
  { readonly children: ReactNode; readonly onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  public constructor(props: { readonly children: ReactNode; readonly onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Component Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '8px',
            color: '#c62828',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <h3 style={{ margin: '0 0 12px' }}>Component Error</h3>
          <p>The Polkadot component encountered an error and couldn't render.</p>
          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', color: '#1976d2' }}>
              Error Details
            </summary>
            <pre style={{ 
              fontSize: '12px', 
              overflow: 'auto', 
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}`;
    }

    private optimizePerformance(code: string): string {
        // Add React.memo and useCallback optimizations
        const componentMatch = code.match(/export default function (\w+)/);
        if (!componentMatch) return code;

        const componentName = componentMatch[1];

        // Wrap component with memo for performance
        code = code.replace(
            `export default function ${componentName}`,
            `const ${componentName}: FC<${componentName}Props> = memo(function ${componentName}`
        );

        // Add export at the end
        code += `\n\nexport default ${componentName};`;

        return code;
    }

    private addPropsInterface(code: string): string {
        const componentMatch = code.match(/(?:const|function) (\w+)/);
        const componentName = componentMatch?.[1] || 'PolkadotComponent';

        const propsInterface = `export interface ${componentName}Props {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onError?: (error: Error) => void;
  readonly onSuccess?: (result: unknown) => void;
  readonly customEndpoint?: string;
  readonly theme?: 'light' | 'dark' | 'auto';
  readonly testId?: string;
  readonly disabled?: boolean;
}

`;

        return propsInterface + code;
    }

    private minifyCode(code: string): string {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/^\s*\/\/.*$/gm, '') // Remove line comments
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .replace(/^\s+/gm, match => match.replace(/\s/g, match.includes('\t') ? '\t' : '  ')); // Normalize indentation
    }

    public calculateMetrics(): { linesOfCode: number; complexity: number } {
        const lines = this.code.split('\n').filter(line => line.trim().length > 0);
        const complexity = (this.code.match(/if|else|for|while|switch|catch|&&|\|\|/g) || []).length;

        return {
            linesOfCode: lines.length,
            complexity
        };
    }
}