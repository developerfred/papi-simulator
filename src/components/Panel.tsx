'use client'

import React from 'react'
import { Network } from '@/lib/types/network'
import { Example } from '@/lib/types/example'
import { ACCOUNT_LIST } from '@/lib/constants/accounts'
import { useTheme } from '@/lib/theme/ThemeProvider'
import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import NetworkBadge from '@/components/ui/NetworkBadge'
import Badge from '@/components/ui/Badge'

interface InfoPanelProps {
  network: Network
  example: Example
}

interface InfoRowProps {
  label: string
  value: React.ReactNode
}

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  networkColor: string
}

const ExternalLinkIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const InfoRow = ({ label, value }: InfoRowProps) => {
  const { getColor } = useTheme()
  return (
    <div className="flex justify-between items-center">
      <span style={{ color: getColor('textSecondary') }}>{label}:</span>
      <div className="text-right">{value}</div>
    </div>
  )
}

const ExternalLink = ({ networkColor, children, ...props }: ExternalLinkProps) => (
  <a
    {...props}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:underline truncate max-w-32 inline-flex items-center"
    style={{ color: networkColor }}
  >
    {children}
    <ExternalLinkIcon />
  </a>
)

const NetworkInfo = ({ network }: { network: Network }) => {
  const { getNetworkColor, getColor } = useTheme()
  const networkColor = getNetworkColor('primary')

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <NetworkBadge network={network} />
        <h3 className="text-sm font-medium">{network.name}</h3>
      </div>

      <div className="text-xs space-y-2">
        <InfoRow
          label="Token"
          value={`${network.tokenSymbol} (${network.tokenDecimals} decimals)`}
        />

        <InfoRow
          label="Explorer"
          value={
            <ExternalLink
              href={network.explorer}
              networkColor={networkColor}
            >
              {network.explorer.replace(/^https?:\/\//, '')}
            </ExternalLink>
          }
        />

        <InfoRow
          label="Faucet"
          value={
            <ExternalLink
              href={network.faucet}
              networkColor={networkColor}
            >
              Get tokens
            </ExternalLink>
          }
        />
      </div>

      <div
        className="mt-3 p-2 rounded-md text-xs flex items-center space-x-2"
        style={{ backgroundColor: `${networkColor}10` }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={networkColor} strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span style={{ color: getColor('textSecondary') }}>
          Connect to {network.endpoint} to interact with the {network.name} testnet
        </span>
      </div>
    </div>
  )
}

const TestAccounts = () => {
  const { getColor } = useTheme()

  return (
    <div className="space-y-3">
      <p className="text-xs mb-3" style={{ color: getColor('textSecondary') }}>
        These well-known accounts have funds on testnets:
      </p>

      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
        {ACCOUNT_LIST.map((account) => (
          <div
            key={account.address}
            className="text-xs rounded p-2.5"
            style={{
              backgroundColor: getColor('surfaceVariant'),
              border: `1px solid ${getColor('border')}`
            }}
          >
            <div className="flex justify-between items-center">
              <div className="font-medium">{account.name}</div>
              <Badge size="sm" variant="default">{account.description}</Badge>
            </div>
            <div
              className="mt-1.5 font-mono text-2xs break-all p-1.5 rounded"
              style={{
                backgroundColor: getColor('surface'),
                color: getColor('textSecondary')
              }}
            >
              {account.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InfoPanel({ network }: InfoPanelProps) {
  const tabs = React.useMemo(() => [
    {
      id: 'network',
      label: 'Network Info',
      content: <NetworkInfo network={network} />
    },
    {
      id: 'accounts',
      label: 'Test Accounts',
      content: <TestAccounts />
    }
  ], [network])

  return (
    <Card className="overflow-hidden">
      <Tabs
        tabs={tabs}
        variant="boxed"
        networkColored
      />
    </Card>
  )
}