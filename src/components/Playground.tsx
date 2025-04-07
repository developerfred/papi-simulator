'use client'

import React, { useState, useEffect } from 'react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { useCodeRunner } from '@/lib/hooks/useCodeRunner'
import CodeEditor from './CodeEditor'
import Console from './Console'
import NetworkSelector from './NetworkSelector'
import ExampleSelector from './ExampleSelector'
import { DEFAULT_NETWORK, NETWORKS} from '@/lib/constants/networks'
import { DEFAULT_EXAMPLE, EXAMPLES} from '@/lib/constants/examples'
import ActionButton from './ui/ActionButton'
import InfoPanel from './infoPanel'
import TutorialPanel from './TutorialPanel'
import DashboardLayout from './layouts/DashboardLayout'
import { Example } from '@/lib/types/example'
import { Network } from '@/lib/types/network'

export default function Playground() {
  // Persistent state for selected network and example
  const [selectedNetworkId, setSelectedNetworkId] = useLocalStorage<string>('selectedNetwork', DEFAULT_NETWORK.id)
  const [selectedExampleId, setSelectedExampleId] = useLocalStorage<string>('selectedExample', DEFAULT_EXAMPLE.id)

  // Derived state
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(DEFAULT_NETWORK)
  const [selectedExample, setSelectedExample] = useState<Example>(DEFAULT_EXAMPLE)

  // Code runner state
  const { code, outputs, isRunning, updateCode, setExampleCode, runCode, clearOutput } = useCodeRunner()

  // Update derived state when localStorage values change
  useEffect(() => {
    const network = NETWORKS[selectedNetworkId] || DEFAULT_NETWORK
    setSelectedNetwork(network)
  }, [selectedNetworkId])

  useEffect(() => {
    const example = EXAMPLES.find(e => e.id === selectedExampleId) || DEFAULT_EXAMPLE
    setSelectedExample(example)
  }, [selectedExampleId])

  // Load example code when example or network changes
  useEffect(() => {
    setExampleCode(selectedExample, selectedNetwork)
  }, [selectedExample, selectedNetwork, setExampleCode])

  // Handle network change
  const handleNetworkChange = (networkId: string) => {
    setSelectedNetworkId(networkId)
  }

  // Handle example change
  const handleExampleChange = (exampleId: string) => {
    setSelectedExampleId(exampleId)
  }

  // Handle code execution
  const handleRunCode = () => {
    runCode(selectedExample, selectedNetwork)
  }

  return (
    <DashboardLayout
      title="Polkadot API Playground"
      description="Learn and experiment with polkadot-api in a sandbox environment"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <NetworkSelector
            networks={Object.values(NETWORKS)}
            selectedNetworkId={selectedNetwork.id}
            onNetworkChange={handleNetworkChange}
          />

          <ExampleSelector
            examples={EXAMPLES}
            selectedExampleId={selectedExample.id}
            onExampleChange={handleExampleChange}
          />

          <InfoPanel network={selectedNetwork} example={selectedExample} />

          <div className="flex gap-2">
            <ActionButton
              onClick={handleRunCode}
              disabled={isRunning}
              isPrimary={true}
              icon="play"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </ActionButton>

            <ActionButton
              onClick={clearOutput}
              disabled={isRunning || outputs.length === 0}
              icon="trash"
            >
              Clear Console
            </ActionButton>
          </div>
        </div>

        {/* Editor and Console */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          <TutorialPanel example={selectedExample} network={selectedNetwork} />

          <CodeEditor
            code={code}
            onChange={updateCode}
            disabled={isRunning}
          />

          <Console outputs={outputs} />
        </div>
      </div>
    </DashboardLayout>
  )
}