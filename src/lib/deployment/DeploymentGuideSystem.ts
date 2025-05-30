import type { DeploymentConfig, DeploymentGuide } from './types';
import { DeploymentConfigGenerator } from './generators/DeploymentConfigGenerator';

export class DeploymentGuideSystem {
  static generate(config: DeploymentConfig): DeploymentGuide {
    return new DeploymentConfigGenerator(config).generateGuide();
  }

  static generateZip(guide: DeploymentGuide): Blob {
    const files = [
      ...guide.boilerplateFiles.map(f => ({ name: f.path, content: f.content })),
      ...guide.configFiles.map(f => ({ name: f.path, content: f.content })),
      { name: 'DEPLOYMENT.md', content: this.formatGuideAsMarkdown(guide) }
    ];

    // Create simple text-based "zip" for demo (in production, use JSZip)
    const zipContent = files.map(f => 
      `=== ${f.name} ===\n${f.content}\n\n`
    ).join('');
    
    return new Blob([zipContent], { type: 'text/plain' });
  }

  private static formatGuideAsMarkdown(guide: DeploymentGuide): string {
    return `# ${guide.title}

${guide.description}

## Deployment Steps

${guide.deploymentSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Configuration Files

${guide.configFiles.map(f => `### ${f.path}\n${f.description}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}

## Troubleshooting

${guide.troubleshooting.map(t => `**${t.issue}**: ${t.solution}`).join('\n\n')}

## Next Steps

1. Follow the deployment steps above
2. Test your deployed application
3. Set up monitoring and analytics
4. Configure custom domain (if needed)

For support, visit [Polkadot API Documentation](https://papi.how)
`;
  }
}
