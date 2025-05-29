export interface ExportedComponent {
    componentCode: string;
    packageJson: string;
    readme: string;
    setupInstructions: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    types?: string;
    styles?: string;
}