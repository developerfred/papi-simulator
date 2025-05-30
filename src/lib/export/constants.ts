/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { Framework } from '../component-exporter/types/ExportOptions';
import type { ChainConfig, StyleFramework } from './types';

export const SUPPORTED_CHAINS: Readonly<Record<string, ChainConfig>> = {
  polkadot: {
    chainId: 'polkadot',
    descriptorKey: 'dot',
    endpoint: 'wss://polkadot-rpc.dwellir.com',
    alternativeEndpoints: [
      'wss://rpc.dotters.network/polkadot',
      'wss://polkadot.api.onfinality.io/public-ws',
      'wss://polkadot-rpc.subquery.network/public-ws'
    ],
    papiName: 'dot'
  },
  kusama: {
    chainId: 'ksmcc3',
    descriptorKey: 'ksm',
    endpoint: 'wss://kusama-rpc.dwellir.com',
    alternativeEndpoints: [
      'wss://kusama.api.onfinality.io/public-ws',
      'wss://kusama-rpc.subquery.network/public-ws'
    ],
    papiName: 'ksmcc3'
  },
  westend: {
    chainId: 'westend2',
    descriptorKey: 'wnd',
    endpoint: 'wss://westend-rpc.dwellir.com',
    alternativeEndpoints: [
      'wss://westend-rpc.subquery.network/public-ws',
      'wss://westend.api.onfinality.io/public-ws'
    ],
    papiName: 'westend2'
  },
  paseo: {
    chainId: 'paseo',
    descriptorKey: 'paseo',
    endpoint: 'wss://paseo-rpc.dwellir.com',
    alternativeEndpoints: [
      'wss://paseo.api.onfinality.io/public-ws'
    ],
    papiName: 'paseo'
  }
} as const;

export const DEFAULT_DEPENDENCIES: Readonly<Record<string, string>> = {
  'react': '^18.2.0',
  'polkadot-api': '^0.12.0',
  '@polkadot-api/descriptors': '^0.12.0'
} as const;

export const FRAMEWORK_DEPENDENCIES: Readonly<Record<Framework, Readonly<Record<string, string>>>> = {
  react: { 'react-dom': '^18.2.0' },
  next: { 'next': '^14.0.0', 'react-dom': '^18.2.0', '@types/node': '^20.0.0' },
  vite: { 'react-dom': '^18.2.0', 'vite': '^5.0.0', '@vitejs/plugin-react': '^4.2.1' },
  'create-react-app': { 'react-dom': '^18.2.0', 'react-scripts': '^5.0.1' }
} as const;

export const STYLE_DEPENDENCIES: Readonly<Record<StyleFramework, Readonly<Record<string, string>>>> = {
  css: {},
  'styled-components': { 'styled-components': '^6.1.0', '@types/styled-components': '^5.1.26' },
  emotion: { '@emotion/react': '^11.11.0', '@emotion/styled': '^11.11.0' },
  tailwind: { 'tailwindcss': '^3.4.0', 'autoprefixer': '^10.4.16', 'postcss': '^8.4.32' }
} as const;