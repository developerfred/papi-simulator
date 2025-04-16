'use client'

import React, { useState, useEffect } from 'react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { useCodeRunner } from '@/lib/hooks/useCodeRunner'
import { useTheme } from '@/lib/theme/ThemeProvider'
import CodeEditor from './CodeEditor'
import Console from './Console'
import NetworkSelector from './NetworkSelector'
import ExampleSelector from './ExampleSelector'
import { DEFAULT_NETWORK, NETWORKS } from '@/lib/constants/networks'
import { DEFAULT_EXAMPLE, EXAMPLES } from '@/lib/constants/examples'
import ActionButton from './ui/ActionButton'
import InfoPanel from './infoPanel'
import TutorialPanel from './TutorialPanel'
import DashboardLayout from './layouts/DashboardLayout'
import ContentLayout from './layouts/ContentLayout'
import { Example } from '@/lib/types/example'
import { Network } from '@/lib/types/network'
import NetworkBadge from './ui/NetworkBadge'
import Card from './ui/Card'
import Badge from './ui/Badge'

export default function Playground() {
  const { isDarkTheme, isLoaded, currentNetworkId, setCurrentNetworkId } = useTheme()

  
  const [selectedNetworkId, setSelectedNetworkId] = useLocalStorage<string>('selectedNetwork', DEFAULT_NETWORK.id)
  const [selectedExampleId, setSelectedExampleId] = useLocalStorage<string>('selectedExample', DEFAULT_EXAMPLE.id)

  
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(DEFAULT_NETWORK)
  const [selectedExample, setSelectedExample] = useState<Example>(DEFAULT_EXAMPLE)

  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  
  const { code, outputs, isRunning, updateCode, setExampleCode, runCode, clearOutput } = useCodeRunner()

  
  useEffect(() => {
    const checkMobile = () => {
      setSidebarCollapsed(window.innerWidth < 1024)
    }

    checkMobile() 
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  
  useEffect(() => {
    const network = NETWORKS[selectedNetworkId] || DEFAULT_NETWORK
    setSelectedNetwork(network)
    setCurrentNetworkId(selectedNetworkId)
  }, [selectedNetworkId, setCurrentNetworkId])

  
  useEffect(() => {
    const example = EXAMPLES.find(e => e.id === selectedExampleId) || DEFAULT_EXAMPLE
    setSelectedExample(example)
  }, [selectedExampleId])

  
  useEffect(() => {
    if (selectedExample && selectedNetwork) {
      setExampleCode(selectedExample, selectedNetwork)
    }
  }, [selectedExample, selectedNetwork, setExampleCode])

  
  const getNetworkColor = () => {
    const networkId = NETWORKS[currentNetworkId]?.id as keyof typeof colorMap;

    const colorMap = {
      'polkadot': '#E6007A',
      'westend': '#46DDD2',
      'paseo': '#FF7B00',
      'rococo': '#7D42BC'
    }

    return colorMap[networkId] || colorMap['polkadot']
  }

  
  const getDifficultyColor = (level: 'beginner' | 'intermediate' | 'advanced') => {
    const colorMap = {
      'beginner': '#22C55E',
      'intermediate': '#F59E0B',
      'advanced': '#EF4444'
    }
    return colorMap[level] || colorMap['beginner']
  }

  
  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <span>Loading Polkadot API Playground...</span>
          <span className="text-xs mt-1 opacity-70">Preparing your development environment</span>
        </div>
      </div>
    );
  }

  
  const SidebarContent = () => (
    <div className="flex flex-col gap-4">
      <NetworkSelector
        networks={Object.values(NETWORKS)}
        selectedNetworkId={selectedNetwork.id}
        onNetworkChange={setSelectedNetworkId}
      />

      <ExampleSelector
        examples={EXAMPLES}
        selectedExampleId={selectedExample.id}
        onExampleChange={setSelectedExampleId}
      />

      <InfoPanel network={selectedNetwork} example={selectedExample} />

      <Card>
        <div className="flex flex-col gap-3">
          <ActionButton
            onClick={() => runCode(selectedExample, selectedNetwork)}
            disabled={isRunning}
            isPrimary={true}
            icon="play"
            fullWidth
            size="lg"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </ActionButton>

          <ActionButton
            onClick={clearOutput}
            disabled={isRunning || outputs.length === 0}
            icon="trash"
            fullWidth
            size="md"
          >
            Clear Console
          </ActionButton>

          <div className="flex items-center justify-center mt-2 text-xs" style={{
            color: isDarkTheme ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
          }}>
            <span>Example difficulty: </span>
            <span className="ml-1 font-medium" style={{
              color: getDifficultyColor(selectedExample.level)
            }}>
              {selectedExample.level.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )

  
  const NetworkIndicator = () => (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 opacity-80" style={{
      background: `linear-gradient(90deg, ${getNetworkColor()} 0%, rgba(255,255,255,0) 100%)`
    }} />
  )

  
  const SidebarToggle = () => (
    <div className="fixed bottom-6 right-6 lg:hidden z-30">
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="p-3 rounded-full shadow-lg animate-pulse-slow"
        style={{
          backgroundColor: getNetworkColor(),
          color: 'white'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sidebarCollapsed ? (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          )}
        </svg>
      </button>
    </div>
  )

  
  const MainContent = () => (
    <div className="flex flex-col gap-4 h-full">
      <TutorialPanel example={selectedExample} network={selectedNetwork} />

      <Card className="flex-1" header={
        <div className="flex justify-between items-center">
          <div className="font-medium flex items-center">
            <span>Code Editor</span>
            <Badge variant="default" className="ml-2">
              TypeScript
            </Badge>
          </div>
          <div className="text-xs px-2 py-1 rounded flex items-center" style={{
            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
          }}>
            <NetworkBadge network={selectedNetwork} size="sm" showName={false} className="mr-2" />
            {selectedExample.name}
          </div>
        </div>
      }>
        <div className="-m-4">
          <CodeEditor
            code={code}
            onChange={updateCode}
            disabled={isRunning}
            height="400px"
          />
        </div>
      </Card>

      <Console
        outputs={outputs}
        onClear={clearOutput}
      />
    </div>
  )

  
  if (window.innerWidth < 1024) {
    return (
      <>
        <NetworkIndicator />
        <DashboardLayout
          title="Polkadot API Playground"
          description="Learn and experiment with polkadot-api"
          rightContent={<NetworkBadge network={selectedNetwork} />}
        >
          {sidebarCollapsed ? (
            <MainContent />
          ) : (
            <SidebarContent />
          )}

          <SidebarToggle />
        </DashboardLayout>
      </>
    )
  }

  
  return (
    <>
      <NetworkIndicator />
      <DashboardLayout
        title="Polkadot API Playground"
        description="Learn and experiment with polkadot-api in a sandbox environment"
        rightContent={<NetworkBadge network={selectedNetwork} />}
      >
        <ContentLayout
          sidebar={<SidebarContent />}
          sidebarWidth="narrow"
        >
          <MainContent />
        </ContentLayout>
      </DashboardLayout>
    </>
  )
}