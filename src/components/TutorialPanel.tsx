'use client'

import React, { useState } from 'react'
import { Example } from '@/lib/types/example'
import { Network } from '@/lib/types/network'
import ActionButton from './ui/ActionButton'

interface TutorialPanelProps {
    example: Example
    network: Network
}

export default function TutorialPanel({ example, network }: TutorialPanelProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Create a tutorial content based on the example and network
    const getTutorialContent = () => {
        switch (example.id) {
            case 'simple-transfer':
                return (
                    <>
                        <h3 className="text-lg font-semibold mb-2">Simple Transfer Tutorial</h3>
                        <p className="mb-3">
                            This example demonstrates how to create a basic balance transfer transaction on {network.name}.
                        </p>
                        <h4 className="font-medium mt-4 mb-1">Key Concepts:</h4>
                        <ul className="list-disc list-inside space-y-1 mb-3">
                            <li>Creating a client connection to {network.name}</li>
                            <li>Using MultiAddress to specify the recipient</li>
                            <li>Converting token amounts considering {network.tokenDecimals} decimals</li>
                            <li>Encoding transaction data for later signing</li>
                        </ul>
                        <p className="text-sm mb-2">
                            In a real application, you would need to add a signer to submit this transaction.
                            This playground simulates the execution to show you the expected output.
                        </p>
                        <a
                            href="https://polkadot-api.github.io/typed/tx"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:underline text-sm"
                        >
                            Learn more about transactions in the documentation →
                        </a>
                    </>
                )

            case 'query-balance':
                return (
                    <>
                        <h3 className="text-lg font-semibold mb-2">Query Balance Tutorial</h3>
                        <p className="mb-3">
                            This example shows how to query an account`&apos;`s balance on {network.name}.
                        </p>
                        <h4 className="font-medium mt-4 mb-1">Key Concepts:</h4>
                        <ul className="list-disc list-inside space-y-1 mb-3">
                            <li>Connecting to {network.name} using WebSocket</li>
                            <li>Using the System.Account storage query</li>
                            <li>Reading and formatting account balance data</li>
                            <li>Converting from chain units ({Math.pow(10, network.tokenDecimals)} = 1 {network.tokenSymbol})</li>
                        </ul>
                        <p className="text-sm mb-2">
                            Try modifying the example to check different accounts, such as those listed in the Accounts tab.
                        </p>
                        <a
                            href="https://polkadot-api.github.io/typed/queries"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:underline text-sm"
                        >
                            Learn more about storage queries in the documentation →
                        </a>
                    </>
                )

            case 'watch-blocks':
                return (
                    <>
                        <h3 className="text-lg font-semibold mb-2">Watch Blocks Tutorial</h3>
                        <p className="mb-3">
                            This example demonstrates how to subscribe to finalized blocks on {network.name}.
                        </p>
                        <h4 className="font-medium mt-4 mb-1">Key Concepts:</h4>
                        <ul className="list-disc list-inside space-y-1 mb-3">
                            <li>Creating an Observable subscription to finalized blocks</li>
                            <li>Processing block data as it arrives</li>
                            <li>Proper subscription lifecycle management</li>
                            <li>Accessing block metadata (number, hash, parent)</li>
                        </ul>
                        <p className="text-sm mb-2">
                            In a production application, you would handle subscription errors and cleanup
                            when your component unmounts or when you no longer need the subscription.
                        </p>
                        <a
                            href="https://polkadot-api.github.io/client"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:underline text-sm"
                        >
                            Learn more about the PolkadotClient in the documentation →
                        </a>
                    </>
                )

            default:
                return (
                    <>
                        <h3 className="text-lg font-semibold mb-2">{example.name}</h3>
                        <p className="mb-3">{example.description}</p>
                        <p className="text-sm">
                            This example demonstrates how to use polkadot-api to interact with {network.name}.
                            Experiment by modifying the code and running it to see the results.
                        </p>
                    </>
                )
        }
    }

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center">
                    <div className="mr-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </div>
                    <span>Tutorial: {example.name}</span>
                </div>
                <div>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="mt-2 p-4 border border-gray-700 rounded-md bg-gray-900">
                    {getTutorialContent()}

                    <div className="flex mt-4 pt-3 border-t border-gray-700">
                        <ActionButton
                            onClick={() => setIsOpen(false)}
                            icon="trash"
                        >
                            Close Tutorial
                        </ActionButton>
                    </div>
                </div>
            )}
        </div>
    )
}