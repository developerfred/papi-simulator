import { ExportOptions } from "../../types/ExportOptions";

const getFrameworkInstructions = (
  options: ExportOptions, 
  componentName: string
): string => {
  switch (options.framework) {
    case 'next':
      return `// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  }
};`;
    case 'vite':
      return `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' },
  optimizeDeps: { include: ['polkadot-api'] }
});`;
    default:
      return `// App.js
import ${componentName} from 'polkadot-${componentName.toLowerCase()}';

function App() {
  return <${componentName} />;
}`;
  }
};

export const generateSetupInstructions = (
  options: ExportOptions,
  componentName: string,
  networkName: string,
  networkEndpoint: string
): string => {
  return `# Setup for ${componentName}
${getFrameworkInstructions(options, componentName)}

## Connecting to ${networkName}
Endpoint: \`${networkEndpoint}\``;
};
