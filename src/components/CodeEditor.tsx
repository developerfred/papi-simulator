'use client'

import React, { useRef, useEffect } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'
import { Editor} from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
    code: string
    onChange: (value: string) => void
    disabled?: boolean
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, disabled }) => {
        const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
        const { isDarkTheme } = useTheme()
    
        const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor
        }   

    

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({ readOnly: disabled })
        }
    }, [disabled])

    return (
        <div className="flex-1 overflow-hidden rounded-md border border-gray-700 min-h-[300px]">
            <Editor
                defaultLanguage="typescript"
                value={code}
                theme={isDarkTheme ? 'vs-dark' : 'light'}
                onChange={(value) => onChange(value || '')}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    readOnly: disabled,
                    tabSize: 2,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    automaticLayout: true
                }}
            />
        </div>
    )
}
export default CodeEditor;