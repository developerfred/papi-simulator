import React, { useState, useEffect } from 'react';
import { Info, Laptop,  Book } from 'lucide-react';

import { Network } from '@/lib/types/network';
import { Example } from '@/lib/types/example';
import { useCodeRunner } from '@/lib/hooks/useCodeRunner';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { NETWORKS, DEFAULT_NETWORK } from '@/lib/constants/networks';
import { DEFAULT_EXAMPLE, findExampleById } from '@/lib/constants/examples';

import CodeEditor from './CodeEditor';
import ConsoleOutput from './ConsoleOutput';
import ExamplesList from './ExamplesList';
import NetworkSelector from './NetworkSelector';
import Documentation from './Documentation';

/**
 * Main playground component that orchestrates the entire application
 */
const Playground: React.FC = () => {
  // Local storage state for persisting preferences
  const [activeTab, setActiveTab] = useLocalStorage<'editor' | 'docs'>('papi-active-tab', 'editor');
  const [selectedNetworkId, setSelectedNetworkId] = useLocalStorage<string>('papi-network', DEFAULT_NETWORK.id);
  const [selectedExampleId, setSelectedExampleId] = useLocalStorage<string>('papi-example', DEFAULT_EXAMPLE.id);

  // Internal state
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(DEFAULT_NETWORK);
  const [selectedExample, setSelectedExample] = useState<Example>(DEFAULT_EXAMPLE);

  // Code runner hook
  const { 
    code, 
    outputs, 
    isRunning, 
    updateCode, 
    setExampleCode, 
    runCode, 
    clearOutput 
  } = useCodeRunner();

  // Set the selected network based on the ID from localStorage
  useEffect(() => {
    const network = NETWORKS[selectedNetworkId] || DEFAULT_NETWORK;
    setSelectedNetwork(network);
  }, [selectedNetworkId]);

  // Set the selected example based on the ID from localStorage
  useEffect(() => {
    const example = findExampleById(selectedExampleId) || DEFAULT_EXAMPLE;
    setSelectedExample(example);
  }, [selectedExampleId]);

  // Update code when example or network changes
  useEffect(() => {
    setExampleCode(selectedExample, selectedNetwork);
  }, [selectedExample, selectedNetwork, setExampleCode]);

  // Handler for changing the network
  const handleNetworkChange = (network: Network) => {
    setSelectedNetwork(network);
    setSelectedNetworkId(network.id);
    setExampleCode(selectedExample, network);
  };

  // Handler for selecting an example
  const handleExampleSelect = (example: Example) => {
    setSelectedExample(example);
    setSelectedExampleId(example.id);
    setExampleCode(example, selectedNetwork);
  };

  // Handler for running the code
  const handleRunCode = () => {
    runCode(selectedExample, selectedNetwork);
  };

  return (
    <div className="flex flex-col h-screen text-gray-800 bg-gray-50">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-700">Polkadot API Playground</h1>
          <div className="text-sm text-gray-500">Learn by doing - Build with PAPI</div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-2 ${
              activeTab === 'editor' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('editor')}
          >
            <Laptop size={16} />
            Editor
          </button>
          <button
            className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-2 ${
              activeTab === 'docs' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('docs')}
          >
            <Book size={16} />
            Documentation
          </button>
        </div>
      </header>

      {activeTab === 'editor' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Examples and Network selection */}
          <div className="w-72 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <ExamplesList
                selectedExampleId={selectedExample.id}
                onSelectExample={handleExampleSelect}
              />
            </div>
            <div className="p-4 border-t border-gray-200">
              <NetworkSelector
                selectedNetwork={selectedNetwork}
                onNetworkChange={handleNetworkChange}
                showTestnetsOnly={true}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Testnet notification */}
            {selectedNetwork.isTest && (
              <div className="p-2 bg-green-50 text-green-800 text-sm flex items-center">
                <Info size={16} className="mr-2" />
                <span>
                  Using {selectedNetwork.name} testnet. Get free test tokens from{' '}
                  <a 
                    href={selectedNetwork.faucet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    the faucet
                  </a>
                </span>
              </div>
            )}

            {/* Code editor */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <CodeEditor
                code={code}
                onChange={updateCode}
                onRun={handleRunCode}
                isRunning={isRunning}
              />
            </div>
            
            {/* Output console */}
            <div className="h-1/3 border-t border-gray-200">
              <ConsoleOutput 
                outputs={outputs}
                onClear={clearOutput}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Documentation tab */
        <Documentation 
          selectedNetwork={selectedNetwork}
          onSelectExample={handleExampleSelect}
        />
      )}
    </div>
  );
};

export default Playground;