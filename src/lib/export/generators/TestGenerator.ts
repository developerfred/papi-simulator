import type { ExportOptions } from '../types';

export class TestGenerator {
  static generate(options: ExportOptions): string {
    return `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${options.componentName} from '../src/index';

// Mock polkadot-api
jest.mock('polkadot-api', () => ({
  createClient: jest.fn(() => ({
    getTypedApi: jest.fn(() => ({
      query: {
        System: {
          Account: {
            getValue: jest.fn(() => Promise.resolve({
              data: { free: 1000000000000n, reserved: 0n }
            }))
          }
        }
      }
    })),
    destroy: jest.fn()
  }))
}));

jest.mock('polkadot-api/ws-provider/web', () => ({
  getWsProvider: jest.fn(() => ({}))
}));

jest.mock('polkadot-api/polkadot-sdk-compat', () => ({
  withPolkadotSdkCompat: jest.fn((provider) => provider)
}));

describe('${options.componentName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<${options.componentName} />);
    expect(screen.getByTestId('${options.componentName.toLowerCase()}')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<${options.componentName} className="custom-class" />);
    const component = screen.getByTestId('${options.componentName.toLowerCase()}');
    expect(component).toHaveClass('custom-class');
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<${options.componentName} style={customStyle} />);
    const component = screen.getByTestId('${options.componentName.toLowerCase()}');
    expect(component).toHaveStyle('background-color: red');
  });

  it('calls onError when an error occurs', async () => {
    const onError = jest.fn();
    const errorMessage = 'Test error';
    
    const mockCreateClient = require('polkadot-api').createClient;
    mockCreateClient.mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    render(<${options.componentName} onError={onError} />);
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('calls onSuccess when operation succeeds', async () => {
    const onSuccess = jest.fn();
    
    render(<${options.componentName} onSuccess={onSuccess} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('can be disabled', () => {
    render(<${options.componentName} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('supports custom endpoint', () => {
    const customEndpoint = 'wss://custom-endpoint.com';
    render(<${options.componentName} customEndpoint={customEndpoint} />);
    
    const mockGetWsProvider = require('polkadot-api/ws-provider/web').getWsProvider;
    expect(mockGetWsProvider).toHaveBeenCalledWith(customEndpoint);
  });

  it('handles theme changes', () => {
    const { rerender } = render(<${options.componentName} theme="light" />);
    let component = screen.getByTestId('${options.componentName.toLowerCase()}');
    expect(component).toHaveClass('theme-light');
    
    rerender(<${options.componentName} theme="dark" />);
    component = screen.getByTestId('${options.componentName.toLowerCase()}');
    expect(component).toHaveClass('theme-dark');
  });
});`;
  }

  static generateJestConfig(): string {
    return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testMatch: ['<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)'],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/index.tsx'
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  },
  transform: { '^.+\\\\.(ts|tsx)$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};`;
  }

  static generateSetupTests(): string {
    return `import '@testing-library/jest-dom';

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
})) as any;

// Mock crypto for polkadot-api
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn(() => new Uint8Array(32)),
    subtle: {
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
      importKey: jest.fn(() => Promise.resolve({})),
      sign: jest.fn(() => Promise.resolve(new ArrayBuffer(64)))
    }
  }
});

// Silence console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});`;
  }
}
