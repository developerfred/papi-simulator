/* eslint-disable */
// @ts-nocheck
import type { Network } from "@/lib/types/network";
import type { ExportOptions, ExportedComponent, ExportMetrics } from "./types";
import {
  removePlaygroundImports,
  addExternalImports,
  wrapWithProperExport,
  generatePropsInterface,
} from "./utils/codeProcessing";
import { extractDependencies, getDevDependencies } from "./utils/dependencyUtils";
import { generatePackageJson } from "./utils/fileGenerators/packageJsonGenerator";
import { generateReadme } from "./utils/fileGenerators/readmeGenerator";
import { generateSetupInstructions } from "./utils/fileGenerators/setupInstructionsGenerator";
import { generateTypeDefinitions } from "./utils/fileGenerators/typeDefinitionsGenerator";
import { extractStyles } from "./utils/styleUtils";
import { ComponentErrorBoundary } from "./errors/ErrorBoundary";

/**
 * Component Exporter
 * 
 * Exports React components with comprehensive project setup,
 * optimized for different network configurations and deployment targets.
 */
export class ComponentExporter {
  private readonly network: Network;
  private readonly originalCode: string;
  private readonly metrics: ExportMetrics;

  constructor(network: Network, originalCode: string) {
    this.network = network;
    this.originalCode = originalCode;
    this.metrics = this.calculateMetrics();
  }

  /**
   * 📦 Export complete component package
   * 
   * Generates all necessary files for a production-ready component:
   * - Processed component code with error boundaries
   * - Package.json with network-specific dependencies
   * - README with setup instructions
   * - Type definitions (optional)
   * - CSS styles (optional)
   * 
   * @param options Export configuration options
   * @returns Complete exportable component package
   */
  async exportComponent(options: ExportOptions): Promise<ExportedComponent> {
    const startTime = performance.now();

    try {
      // 🔍 Analyze dependencies
      const dependencies = extractDependencies(this.originalCode);
      const devDependencies = getDevDependencies(options);

      // ⚡ Process and enhance component code
      const processedCode = this.processCode(options);
      const safeComponentCode = this.addErrorHandling(processedCode, options.componentName);

      // 📝 Generate supporting files
      const packageJson = generatePackageJson(
        options,
        dependencies,
        devDependencies,
        this.network.name
      );

      const readme = generateReadme(
        options,
        this.network.name,
        this.network.endpoint,
        this.network.isTest,
        this.network.tokenSymbol
      );

      const setupInstructions = generateSetupInstructions(
        options,
        options.componentName,
        this.network.name,
        this.network.endpoint
      );

      // 🎯 Optional enhancements
      const types = options.includeTypes
        ? generateTypeDefinitions(options.componentName)
        : undefined;

      const styles = options.includeStyles
        ? extractStyles()
        : undefined;

      const exportTime = performance.now() - startTime;

      // 📊 Log export metrics for debugging
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚀 Component Export Complete`);
        console.log(`📦 Component: ${options.componentName}`);
        console.log(`🌐 Network: ${this.network.name}`);
        console.log(`⏱️ Export Time: ${exportTime.toFixed(2)}ms`);
        console.log(`📏 Lines of Code: ${this.metrics.linesOfCode}`);
        console.log(`📦 Dependencies: ${this.metrics.dependencies}`);
        console.log(`📊 Bundle Size: ~${(this.metrics.bundleSize / 1024).toFixed(1)}KB`);
        console.groupEnd();
      }

      return {
        componentCode: safeComponentCode,
        packageJson,
        readme,
        setupInstructions,
        dependencies,
        devDependencies,
        types,
        styles,
        metadata: {
          exportTime,
          network: this.network.name,
          metrics: this.metrics,
          timestamp: new Date().toISOString(),
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown export error';

      console.error('❌ Component Export Failed:', {
        component: options.componentName,
        network: this.network.name,
        error: errorMessage,
      });

      throw new Error(`Failed to export component "${options.componentName}": ${errorMessage}`);
    }
  }

  /**
   * ⚙️ Process component code for export
   * 
   * Applies transformations:
   * - Removes playground-specific imports
   * - Adds network-specific external imports
   * - Wraps with proper export structure
   * - Generates TypeScript interfaces
   */
  private processCode(options: ExportOptions): string {
    let code = this.originalCode;

    // 🧹 Clean up playground imports
    code = removePlaygroundImports(code);

    // 🔗 Add network-specific imports
    code = addExternalImports(code, options, this.network);

    // 📦 Wrap with proper export structure
    code = wrapWithProperExport(code, options, generatePropsInterface);

    // 💬 Add helpful comments for developers
    const header = this.generateCodeHeader(options);

    return `${header}\n\n${code}`;
  }

  /**
   * 🛡️ Add comprehensive error handling
   * 
   * Wraps component with error boundary and provides
   * graceful fallback for production environments
   */
  private addErrorHandling(code: string, componentName: string): string {
    const errorBoundaryImplementation = ComponentErrorBoundary.toString();

    const safeComponentWrapper = `
/**
 * 🛡️ Safe ${componentName} Component
 * 
 * Wrapped with error boundary for production reliability.
 * Falls back gracefully if component encounters runtime errors.
 */
const Safe${componentName} = (props: ${componentName}Props) => (
  <ComponentErrorBoundary
    fallback={
      <div className="p-6 bg-theme-surface border border-theme rounded-lg text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-theme-primary font-semibold mb-2">
          Component Error
        </h3>
        <p className="text-theme-secondary text-sm">
          The ${componentName} component encountered an error. 
          Please check the console for details.
        </p>
      </div>
    }
  >
    <${componentName} {...props} />
  </ComponentErrorBoundary>
);

// Export both safe and original versions
export { Safe${componentName} as default, ${componentName} };`;

    return `${code}\n\n${errorBoundaryImplementation}\n${safeComponentWrapper}`;
  }

  /**
   * 📊 Calculate comprehensive export metrics
   * 
   * Analyzes code complexity, dependencies, and estimated bundle impact
   */
  calculateMetrics(): ExportMetrics {
    const linesOfCode = this.originalCode.split('\n').filter(line =>
      line.trim() && !line.trim().startsWith('//')
    ).length;

    const dependencies = Object.keys(extractDependencies(this.originalCode)).length;
    const bundleSize = this.estimateBundleSize();
    const typeComplexity = this.calculateTypeComplexity();

    return {
      linesOfCode,
      bundleSize,
      dependencies,
      typeComplexity,
      codeQuality: this.assessCodeQuality(),
      performanceScore: this.calculatePerformanceScore(),
    };
  }

  /**
   * 📏 Estimate bundle size impact
   * 
   * Provides rough estimation based on code length,
   * dependencies, and complexity patterns
   */
  private estimateBundleSize(): number {
    const baseSize = 15000; // Base React app size
    const codeSize = this.originalCode.length * 0.7;
    const dependencyOverhead = this.countImports() * 2000;

    return Math.floor(baseSize + codeSize + dependencyOverhead);
  }

  /**
   * 🧮 Calculate TypeScript complexity score
   * 
   * Measures type definition complexity for better
   * maintainability assessment
   */
  private calculateTypeComplexity(): number {
    const patterns = [
      /interface \w+/g,      // Interface definitions
      /type \w+/g,           // Type aliases
      /useState</g,          // State hooks
      /useEffect</g,         // Effect hooks
      /useMemo</g,           // Memoization
      /useCallback</g,       // Callback memoization
      /React\.FC</g,         // Functional components
      /\w+\[\]/g,           // Array types
    ];

    return patterns.reduce((complexity, regex) =>
      complexity + (this.originalCode.match(regex)?.length || 0), 1
    );
  }

  /**
   * ✅ Assess overall code quality
   * 
   * Evaluates code patterns and best practices
   */
  private assessCodeQuality(): number {
    let score = 100;

    // Deduct points for potential issues
    if (this.originalCode.includes('any')) score -= 10;
    if (this.originalCode.includes('console.log')) score -= 5;
    if (!this.originalCode.includes('React.memo') && this.originalCode.length > 1000) score -= 10;
    if (!this.originalCode.includes('useCallback') && this.originalCode.includes('onClick')) score -= 5;

    // Add points for good practices
    if (this.originalCode.includes('PropTypes')) score += 5;
    if (this.originalCode.includes('defaultProps')) score += 5;
    if (this.originalCode.includes('React.memo')) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * ⚡ Calculate performance score
   * 
   * Estimates component performance based on
   * complexity and optimization patterns
   */
  private calculatePerformanceScore(): number {
    const hasOptimizations = [
      'React.memo',
      'useCallback',
      'useMemo',
      'useRef'
    ].some(pattern => this.originalCode.includes(pattern));

    const hasExpensiveOperations = [
      '.map(',
      '.filter(',
      '.reduce(',
      'JSON.parse',
      'JSON.stringify'
    ].some(pattern => this.originalCode.includes(pattern));

    let score = 80;
    if (hasOptimizations) score += 15;
    if (hasExpensiveOperations && !hasOptimizations) score -= 20;
    if (this.originalCode.length > 2000) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 📥 Count import statements
   */
  private countImports(): number {
    return (this.originalCode.match(/^import /gm) || []).length;
  }

  /**
   * 📝 Generate informative code header
   */
  private generateCodeHeader(options: ExportOptions): string {
    const networkEmoji = this.getNetworkEmoji();

    return `/**
 * ${networkEmoji} ${options.componentName}
 * 
 * Auto-generated component for ${this.network.name} network
 * 
 * 📊 Metrics:
 * - Lines of Code: ${this.metrics.linesOfCode}
 * - Dependencies: ${this.metrics.dependencies}
 * - Bundle Size: ~${(this.metrics.bundleSize / 1024).toFixed(1)}KB
 * - Type Complexity: ${this.metrics.typeComplexity}
 * 
 * 🌐 Network: ${this.network.name}
 * 🔗 Endpoint: ${this.network.endpoint}
 * 💰 Token: ${this.network.tokenSymbol}
 * 
 * Generated on ${new Date().toLocaleString()}
 */`;
  }

  /**
   * 🎨 Get network-specific emoji
   */
  private getNetworkEmoji(): string {
    const networkEmojis: Record<string, string> = {
      polkadot: '🔴',
      kusama: '🟡',
      westend: '🔵',
      paseo: '🟠',
      rococo: '🟣',
      acala: '🔥',
      moonbeam: '🌙',
      astar: '⭐',
    };

    return networkEmojis[this.network.name.toLowerCase()] || '🌐';
  }

  /**
   * 📈 Get export summary for UI display
   */
  getExportSummary(): {
    network: string;
    metrics: ExportMetrics;
    emoji: string;
    status: 'ready' | 'processing' | 'error';
  } {
    return {
      network: this.network.name,
      metrics: this.metrics,
      emoji: this.getNetworkEmoji(),
      status: 'ready',
    };
  }
}