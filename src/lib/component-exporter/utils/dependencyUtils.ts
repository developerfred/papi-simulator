import { ExportOptions } from "../types/ExportOptions";

export const extractDependencies = (code: string): Record<string, string> => {
  const baseDeps: Record<string, string> = {
    'react': '^18.0.0',
    'polkadot-api': '^0.12.0',
    '@polkadot-api/descriptors': '^0.12.0',
  };

  return code.includes('useWallet')
    ? { ...baseDeps, '@polkadot/extension-dapp': '^0.46.0' }
    : baseDeps;
};

export const getDevDependencies = (options: ExportOptions): Record<string, string> => {
  const devDeps: Record<string, string> = {};

  if (options.includeTypes) {
    devDeps['@types/react'] = '^18.0.0';
    devDeps['typescript'] = '^5.0.0';
  }

  if (options.framework === 'next') {
    devDeps['next'] = '^14.0.0';
  } else if (options.framework === 'vite') {
    devDeps['vite'] = '^5.0.0';
    devDeps['@vitejs/plugin-react'] = '^4.0.0';
  }

  return devDeps;
};
