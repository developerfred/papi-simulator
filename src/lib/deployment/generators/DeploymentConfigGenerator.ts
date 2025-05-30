import type { DeploymentConfig, DeploymentGuide } from '../types';
import { FrameworkGenerator } from './FrameworkGenerator';

export class DeploymentConfigGenerator {
  private readonly config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  generateGuide(): DeploymentGuide {
    const generators: Record<string, () => DeploymentGuide> = {
      vercel: () => this.generateVercelGuide(),
      netlify: () => this.generateNetlifyGuide(),
      'github-pages': () => this.generateGitHubPagesGuide(),
      'aws-amplify': () => this.generateAWSGuide(),
      firebase: () => this.generateFirebaseGuide(),
      docker: () => this.generateDockerGuide()
    };

    return generators[this.config.target]?.() || this.generateGenericGuide();
  }

  private generateVercelGuide(): DeploymentGuide {
    return {
      title: `Deploy ${this.config.componentName} to Vercel`,
      description: `Production deployment guide for ${this.config.framework} + Vercel`,
      configFiles: [
        {
          path: 'vercel.json',
          description: 'Vercel deployment configuration',
          content: `// vercel.json
${JSON.stringify({
  version: 2,
  builds: [{ src: 'package.json', use: '@vercel/static-build' }],
  routes: [{ src: '/(.*)', dest: '/index.html' }],
  env: Object.fromEntries(
    this.config.environmentVariables.map(env => [
      env.key,
      env.isSecret ? `@${env.key.toLowerCase()}` : env.value
    ])
  )
}, null, 2)}`
        }
      ],
      deploymentSteps: [
        '1. Install Vercel CLI: npm i -g vercel',
        '2. Login: vercel login',
        '3. Deploy: vercel --prod',
        '4. Configure environment variables in Vercel dashboard'
      ],
      boilerplateFiles: new FrameworkGenerator(this.config).generateBoilerplate(),
      troubleshooting: [
        { issue: 'Build fails with module errors', solution: 'Check dependencies in package.json' },
        { issue: 'WebSocket connections fail', solution: 'Ensure WSS endpoints in production' }
      ]
    };
  }

  private generateNetlifyGuide(): DeploymentGuide {
    return {
      title: `Deploy ${this.config.componentName} to Netlify`,
      description: `Production deployment guide for ${this.config.framework} + Netlify`,
      configFiles: [
        {
          path: 'netlify.toml',
          description: 'Netlify build configuration',
          content: `# netlify.toml
[build]
  publish = "${this.config.outputDirectory}"
  command = "${this.config.buildCommand}"

[build.environment]
  NODE_VERSION = "${this.config.nodeVersion}"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`
        }
      ],
      deploymentSteps: [
        '1. Connect GitHub repository to Netlify',
        '2. Configure build settings in dashboard',
        '3. Set environment variables',
        '4. Deploy automatically on git push'
      ],
      boilerplateFiles: new FrameworkGenerator(this.config).generateBoilerplate(),
      troubleshooting: [
        { issue: '404 on page refresh', solution: 'Add _redirects file for SPA routing' },
        { issue: 'Build timeout', solution: 'Optimize build process and dependencies' }
      ]
    };
  }

  private generateGitHubPagesGuide(): DeploymentGuide {
    return {
      title: `Deploy ${this.config.componentName} to GitHub Pages`,
      description: 'Static deployment with GitHub Actions',
      configFiles: [
        {
          path: '.github/workflows/deploy.yml',
          description: 'GitHub Actions deployment workflow',
          content: `# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '${this.config.nodeVersion}'
          cache: 'npm'
      - run: npm ci
      - run: ${this.config.buildCommand}
        env:
${this.config.environmentVariables.map(env => `          ${env.key}: \${{ secrets.${env.key} }}`).join('\n')}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ${this.config.outputDirectory}
      - uses: actions/deploy-pages@v4`
        }
      ],
      deploymentSteps: [
        '1. Enable GitHub Pages in repository settings',
        '2. Set source to "GitHub Actions"',
        '3. Add secrets for environment variables',
        '4. Push to main branch to trigger deployment'
      ],
      boilerplateFiles: new FrameworkGenerator(this.config).generateBoilerplate(),
      troubleshooting: [
        { issue: 'Workflow permission errors', solution: 'Check repository Actions permissions' },
        { issue: 'Assets not loading', solution: 'Configure base URL for subdirectory' }
      ]
    };
  }

  private generateAWSGuide(): DeploymentGuide {
    return {
      title: `Deploy ${this.config.componentName} to AWS Amplify`,
      description: 'Full-stack deployment with AWS Amplify',
      configFiles: [
        {
          path: 'amplify.yml',
          description: 'AWS Amplify build specification',
          content: `# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - ${this.config.buildCommand}
  artifacts:
    baseDirectory: ${this.config.outputDirectory}
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*`
        }
      ],
      deploymentSteps: [
        '1. Connect repository to AWS Amplify console',
        '2. Configure build settings',
        '3. Set environment variables',
        '4. Deploy with continuous deployment'
      ],
      boilerplateFiles: new FrameworkGenerator(this.config).generateBoilerplate(),
      troubleshooting: [
        { issue: 'Build fails with memory issues', solution: 'Upgrade build instance type' },
        { issue: 'Environment variables not working', solution: 'Check Amplify console configuration' }
      ]
    };
  }

  private generateFirebaseGuide(): DeploymentGuide {
    return {
      title: `Deploy ${this.config.componentName} to Firebase`,
      description: 'Static hosting with Firebase',
      configFiles: [
        {
          path: 'firebase.json',
          description: 'Firebase hosting configuration',
          content: `// firebase.json
${JSON.stringify({
  hosting: {
    public: this.config.outputDirectory,
    ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
    rewrites: [{ source: '**', destination: '/index.html' }]
  }
}, null, 2)}`
        }
      ],
      deploymentSteps: [
        '1. Install Firebase CLI: npm i -g firebase-tools',
        '2. Login: firebase login',
        '3. Initialize: firebase init hosting',
        '4. Deploy: firebase deploy'
      ],
      boilerplateFiles: new FrameworkGenerator(this.config).generateBoilerplate(),
      troubleshooting: [
        { issue: 'Permission denied', solution: 'Check Firebase project permissions' },
        { issue: 'Build files not found', solution: 'Ensure correct public directory' }
      ]
    };
  }

  private generateDockerGuide(): DeploymentGuide {
    return {
      title: `Containerize ${this.config.componentName}`,
      description: 'Docker deployment configuration',
      configFiles: [
        {
          path: 'Dockerfile',
          description: 'Multi-stage Docker build',
          content: `# Dockerfile
FROM node:${this.config.nodeVersion}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN ${this.config.buildCommand}

FROM nginx:alpine
COPY --from=builder /app/${this.config.outputDirectory} /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
        },
        {
          path: 'nginx.conf',
          description: 'Nginx configuration for SPA',
          content: `# nginx.conf
events { worker_connections 1024; }
http {
  include /etc/nginx/mime.types;
  server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
      try_files $uri $uri/ /index.html;
    }
  }
}`
        }
      ],
      deploymentSteps: [
        '1. Build image: docker build -t polkadot-app .',
        '2. Run container: docker run -p 80:80 polkadot-app',
        '3. Push to registry: docker push your-registry/polkadot-app',
        '4. Deploy to orchestrator (K8s, Docker Swarm, etc.)'
      ],
      boilerplateFiles: new FrameworkGenerator(this.config).generateBoilerplate(),
      troubleshooting: [
        { issue: 'Build context too large', solution: 'Add .dockerignore file' },
        { issue: 'Permission issues', solution: 'Use non-root user in container' }
      ]
    };
  }

  private generateGenericGuide(): DeploymentGuide {
    return {
      title: `Deploy ${this.config.componentName}`,
      description: 'Generic deployment guide',
      configFiles: [],
      deploymentSteps: [
        '1. Build project: npm run build',
        '2. Upload build files to your hosting provider',
        '3. Configure server for SPA routing',
        '4. Set environment variables'
      ],
      boilerplateFiles: new FrameworkGenerator(this.config).generateBoilerplate(),
      troubleshooting: [
        { issue: 'General build issues', solution: 'Check logs and dependencies' }
      ]
    };
  }
}