'use client'

import React, { useState, useEffect } from 'react'
import { Example } from '@/lib/types/example'
import { useTheme } from '@/lib/theme/ThemeProvider'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'

interface ExampleSelectorProps {
    examples: Example[]
    selectedExampleId: string
    onExampleChange: (exampleId: string) => void
}

export default function ExampleSelector({
    examples,
    selectedExampleId,
    onExampleChange
}: ExampleSelectorProps) {
    const [filter, setFilter] = useState<string>('')
    const [filteredExamples, setFilteredExamples] = useState<Example[]>(examples)
    const { getColor } = useTheme();

    useEffect(() => {
        if (!filter) {
            setFilteredExamples(examples)
            return
        }

        const lowercaseFilter = filter.toLowerCase()
        setFilteredExamples(
            examples.filter(example =>
                example.name.toLowerCase().includes(lowercaseFilter) ||
                example.description.toLowerCase().includes(lowercaseFilter) ||
                example.categories.some(category =>
                    category.toLowerCase().includes(lowercaseFilter)
                )
            )
        )
    }, [filter, examples])

    
    const beginnerExamples = filteredExamples.filter(ex => ex.level === 'beginner')
    const intermediateExamples = filteredExamples.filter(ex => ex.level === 'intermediate')
    const advancedExamples = filteredExamples.filter(ex => ex.level === 'advanced')

    
    const SearchIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );

    
    const ClearIcon = () => (
        <button
            onClick={() => setFilter('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:opacity-75 p-1 rounded-full"
            style={{ color: getColor('textTertiary') }}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    );

    return (
        <Card className="space-y-3">
            <h2 className="text-sm font-medium mb-1">Select Example</h2>

            
            <Input
                placeholder="Search examples..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                size="sm"
                fullWidth
                leftIcon={<SearchIcon />}
                rightIcon={filter ? <ClearIcon /> : undefined}
            />

            
            <div className="border rounded-md max-h-[280px] overflow-y-auto" style={{ borderColor: getColor('border') }}>
                {filteredExamples.length === 0 ? (
                    <div className="p-4 text-center text-sm" style={{ color: getColor('textTertiary') }}>
                        No examples match your search
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: getColor('divider') }}>
                        
                        {beginnerExamples.length > 0 && (
                            <ExampleGroup
                                title="Beginner"
                                examples={beginnerExamples}
                                selectedExampleId={selectedExampleId}
                                onExampleChange={onExampleChange}
                            />
                        )}

                        
                        {intermediateExamples.length > 0 && (
                            <ExampleGroup
                                title="Intermediate"
                                examples={intermediateExamples}
                                selectedExampleId={selectedExampleId}
                                onExampleChange={onExampleChange}
                            />
                        )}

                        
                        {advancedExamples.length > 0 && (
                            <ExampleGroup
                                title="Advanced"
                                examples={advancedExamples}
                                selectedExampleId={selectedExampleId}
                                onExampleChange={onExampleChange}
                            />
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}

interface ExampleGroupProps {
    title: string
    examples: Example[]
    selectedExampleId: string
    onExampleChange: (exampleId: string) => void
}

function ExampleGroup({
    title,
    examples,
    selectedExampleId,
    onExampleChange
}: ExampleGroupProps) {
    const { getColor, getNetworkColor } = useTheme();

    
    const getLevelVariant = (level: string): 'success' | 'warning' | 'error' => {
        switch (level) {
            case 'beginner': return 'success';
            case 'intermediate': return 'warning';
            case 'advanced': return 'error';
            default: return 'success';
        }
    };

    return (
        <div>
            <div
                className="px-3 py-2 text-xs font-medium"
                style={{ backgroundColor: getColor('surfaceVariant') }}
            >
                {title}
            </div>
            <div className="divide-y" style={{ borderColor: getColor('divider') }}>
                {examples.map(example => {
                    const isSelected = selectedExampleId === example.id;

                    return (
                        <button
                            key={example.id}
                            onClick={() => onExampleChange(example.id)}
                            className="w-full px-3 py-2.5 text-left hover:brightness-95 transition-all"
                            style={{
                                backgroundColor: isSelected
                                    ? `${getNetworkColor('primary')}10` // Hex opacity
                                    : 'transparent',
                                borderLeft: isSelected
                                    ? `3px solid ${getNetworkColor('primary')}`
                                    : '3px solid transparent'
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <span
                                    className="font-medium text-sm"
                                    style={{
                                        color: isSelected
                                            ? getNetworkColor('primary')
                                            : getColor('textPrimary')
                                    }}
                                >
                                    {example.name}
                                </span>

                                <Badge
                                    variant={getLevelVariant(example.level)}
                                    size="sm"
                                    rounded
                                >
                                    {example.level}
                                </Badge>
                            </div>

                            <p
                                className="text-xs mt-1"
                                style={{ color: getColor('textSecondary') }}
                            >
                                {example.description}
                            </p>

                            <div className="flex flex-wrap gap-1 mt-2">
                                {example.categories.map(category => (
                                    <Badge
                                        key={category}
                                        size="sm"
                                    >
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}