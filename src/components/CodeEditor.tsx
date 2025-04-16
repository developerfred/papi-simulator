'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { Editor } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
    code: string
    onChange: (value: string) => void
    disabled?: boolean
    language?: string
    height?: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    code,
    onChange,
    disabled = false,
    language = 'typescript',
    height = '400px'
}) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const { isDarkTheme, getColor } = useTheme()
    const [isEditorReady, setIsEditorReady] = useState(false)

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor
        setIsEditorReady(true)
    }

    
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({ readOnly: disabled })
        }
    }, [disabled])

    
    useEffect(() => {
        if (editorRef.current && code !== editorRef.current.getValue()) {
            editorRef.current.setValue(code)
        }
    }, [code, isEditorReady])

    
    const editorContainerStyle = {
        border: `1px solid ${getColor('border')}`,
        borderRadius: '0.375rem',
        overflow: 'hidden',
        height: height
    }

    
    const LoadingPlaceholder = () => (
        <div
            style={{
                backgroundColor: getColor('surface'),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%'
            }}
        >
            <div className="animate-pulse flex flex-col items-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={getColor('textTertiary')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <span style={{ color: getColor('textSecondary'), marginTop: '8px' }}>Loading editor...</span>
            </div>
        </div>
    )

    return (
        <div style={editorContainerStyle}>
            <Editor
                height="100%"
                defaultLanguage={language}
                value={code}
                theme={isDarkTheme ? 'vs-dark' : 'light'}
                onChange={(value) => onChange(value || '')}
                onMount={handleEditorDidMount}
                loading={<LoadingPlaceholder />}
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    readOnly: disabled,
                    tabSize: 2,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    automaticLayout: true,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',                    
                    folding: true,
                    contextmenu: true,
                    formatOnPaste: true,
                    scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10
                    }
                }}
            />
        </div>
    )
}

export default CodeEditor;