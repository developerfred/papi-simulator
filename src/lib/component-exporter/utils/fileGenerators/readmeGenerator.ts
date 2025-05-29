import { ExportOptions } from "../../types/ExportOptions";

export const generateReadme = (
  options: ExportOptions,
  networkName: string,
  networkEndpoint: string,
  isTest: boolean,
  tokenSymbol: string
): string => {
  return `# ${options.componentName}

## Installation
\`\`\`bash
${options.packageManager} install polkadot-${options.componentName.toLowerCase()}
\`\`\`

## Network
- **Name**: ${networkName}
- **Endpoint**: \`${networkEndpoint}\`
- **Token**: ${tokenSymbol}
- **Type**: ${isTest ? 'Testnet' : 'Mainnet'}

## Features
- ✅ Blockchain interaction
- ✅ Error handling
- ✅ TypeScript ${options.includeTypes ? 'included' : 'ready'}`;
};
