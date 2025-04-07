'use client'

import React, { useRef, useEffect } from 'react'
import { ConsoleOutput } from '@/lib/types/example'
import classNames from 'classnames'

interface ConsoleProps {
  outputs: ConsoleOutput[]
}

export default function Console({ outputs }: ConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when new outputs are added
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [outputs])

  // Format timestamp to readable time
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="flex flex-col h-1/2 min-h-[200px]">
      <div className="flex justify-between items-center bg-gray-800 p-2 rounded-t-md">
        <h3 className="text-sm font-medium">Console Output</h3>
        <span className="text-xs opacity-70">{outputs.length} messages</span>
      </div>
      
      <div 
        ref={consoleRef}
        className="flex-1 bg-gray-900 text-gray-200 font-mono text-sm p-2 overflow-y-auto rounded-b-md"
      >
        {outputs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Run code to see output here
          </div>
        ) : (
          <div className="space-y-1">
            {outputs.map((output, index) => (
              <div 
                key={index}
                className={classNames(
                  'py-1 border-b border-gray-800 last:border-b-0',
                  {
                    'text-red-400': output.type === 'error',
                    'text-yellow-400': output.type === 'warning',
                    'text-green-400': output.type === 'log' && output.content.includes('Success'),
                  }
                )}
              >
                <span className="text-xs text-gray-500 mr-2">[{formatTimestamp(output.timestamp)}]</span>
                <span className="whitespace-pre-wrap">{output.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}