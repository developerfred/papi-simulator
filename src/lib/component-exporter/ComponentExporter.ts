import { Network } from "@/lib/types/network";
import { ExportOptions, ExportedComponent, ExportMetrics } from "./types";
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

export class ComponentExporter {
  constructor(
    private network: Network,
    private originalCode: string
  ) {}

  async exportComponent(options: ExportOptions): Promise<ExportedComponent> {
    const dependencies = extractDependencies(this.originalCode);
    const devDependencies = getDevDependencies(options);
    
    const processedCode = this.processCode(options);
    const safeComponentCode = this.addErrorHandling(processedCode, options.componentName);

    return {
      componentCode: safeComponentCode,
      packageJson: generatePackageJson(
        options,
        dependencies,
        devDependencies,
        this.network.name
      ),
      readme: generateReadme(
        options,
        this.network.name,
        this.network.endpoint,
        this.network.isTest,
        this.network.tokenSymbol
      ),
      setupInstructions: generateSetupInstructions(
        options,
        options.componentName,
        this.network.name,
        this.network.endpoint
      ),
      dependencies,
      devDependencies,
      types: options.includeTypes 
        ? generateTypeDefinitions(options.componentName) 
        : undefined,
      styles: options.includeStyles 
        ? extractStyles() 
        : undefined,
    };
  }

  private processCode(options: ExportOptions): string {
    let code = removePlaygroundImports(this.originalCode);
    code = addExternalImports(code, options, this.network);
    return wrapWithProperExport(code, options, generatePropsInterface);
  }

  private addErrorHandling(code: string, componentName: string): string {
    const errorBoundaryCode = `
const SafeComponent = (props: ${componentName}Props) => (
  <ComponentErrorBoundary>
    <${componentName} {...props} />
  </ComponentErrorBoundary>
);`;

    return `${code}\n\n${ComponentErrorBoundary.toString()}\n${errorBoundaryCode}`;
  }

  calculateMetrics(): ExportMetrics {
    const linesOfCode = this.originalCode.split('\n').length;
    const dependencies = Object.keys(extractDependencies(this.originalCode)).length;
    
    return {
      linesOfCode,
      bundleSize: this.estimateBundleSize(),
      dependencies,
      typeComplexity: this.calculateTypeComplexity(),
    };
  }

  private estimateBundleSize(): number {
    return Math.floor(15000 + this.originalCode.length * 0.7);
  }

  private calculateTypeComplexity(): number {
    const patterns = [/interface \w+/g, /type \w+/g, /useState</g];
    return patterns.reduce((acc, regex) => 
      acc + (this.originalCode.match(regex)?.length || 0), 1);
  }
}
