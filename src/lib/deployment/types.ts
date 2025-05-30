export type DeploymentTarget = 'vercel' | 'netlify' | 'github-pages' | 'aws-amplify' | 'firebase' | 'docker';
export type FrameworkType = 'react' | 'next' | 'vite' | 'create-react-app' | 'remix' | 'gatsby';
export type CICDProvider = 'github-actions' | 'gitlab-ci' | 'bitbucket-pipelines';

export interface DeploymentConfig {
  readonly framework: FrameworkType;
  readonly target: DeploymentTarget;
  readonly componentName: string;
  readonly packageName: string;
  readonly buildCommand: string;
  readonly outputDirectory: string;
  readonly nodeVersion: string;
  readonly environmentVariables: ReadonlyArray<{
    readonly key: string;
    readonly value: string;
    readonly isSecret: boolean;
  }>;
}

export interface DeploymentGuide {
  readonly title: string;
  readonly description: string;
  readonly configFiles: ReadonlyArray<ConfigFile>;
  readonly deploymentSteps: ReadonlyArray<string>;
  readonly boilerplateFiles: ReadonlyArray<BoilerplateFile>;
  readonly troubleshooting: ReadonlyArray<{ issue: string; solution: string }>;
}

export interface ConfigFile {
  readonly path: string;
  readonly content: string;
  readonly description: string;
}

export interface BoilerplateFile {
  readonly path: string;
  readonly content: string;
  readonly framework: FrameworkType;
}
