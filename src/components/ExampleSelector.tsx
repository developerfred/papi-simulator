'use client'

import React, { useState, useEffect } from 'react'
import { Example } from '@/lib/types/example'

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

   {/*
    const exampleCategories = Array.from(
        new Set(examples.flatMap(example => example.categories))
    ).sort() */}

    
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

    // Group examples by level
    const beginnerExamples = filteredExamples.filter(ex => ex.level === 'beginner')
    const intermediateExamples = filteredExamples.filter(ex => ex.level === 'intermediate')
    const advancedExamples = filteredExamples.filter(ex => ex.level === 'advanced')

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">
                Select Example
            </label>

            {/* Search input */}
            <div className="relative">
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search examples..."
                    className="w-full py-2 px-3 bg-transparent border border-gray-700 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {filter && (
                    <button
                        onClick={() => setFilter('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Examples list */}
            <div className="border border-gray-700 rounded-md max-h-[300px] overflow-y-auto">
                {filteredExamples.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">
                        No examples match your search
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {/* Beginner examples */}
                        {beginnerExamples.length > 0 && (
                            <ExampleGroup
                                title="Beginner"
                                examples={beginnerExamples}
                                selectedExampleId={selectedExampleId}
                                onExampleChange={onExampleChange}
                            />
                        )}

                        {/* Intermediate examples */}
                        {intermediateExamples.length > 0 && (
                            <ExampleGroup
                                title="Intermediate"
                                examples={intermediateExamples}
                                selectedExampleId={selectedExampleId}
                                onExampleChange={onExampleChange}
                            />
                        )}

                        {/* Advanced examples */}
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
        </div>
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
    return (
        <div>
            <div className="px-3 py-2 bg-gray-800 text-xs font-medium">
                {title}
            </div>
            <div className="divide-y divide-gray-800">
                {examples.map(example => (
                    <button
                        key={example.id}
                        onClick={() => onExampleChange(example.id)}
                        className={`
              w-full px-3 py-2 text-left hover:bg-gray-800 transition-colors
              ${selectedExampleId === example.id ? 'bg-gray-800' : ''}
            `}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{example.name}</span>
                            <div className="flex gap-1">
                                {example.categories.map(category => (
                                    <span
                                        key={category}
                                        className="bg-gray-700 text-xs px-1.5 py-0.5 rounded"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {example.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}