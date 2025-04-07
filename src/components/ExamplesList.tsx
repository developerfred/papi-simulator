import React, { useState } from 'react';
import { Search} from 'lucide-react';
import { Example } from '@/lib/types/example';
import { EXAMPLES } from '@/lib/constants/examples';

interface ExamplesListProps {
    selectedExampleId: string;
    onSelectExample: (example: Example) => void;
}

/**
 * Component that displays a list of available code examples
 */
const ExamplesList: React.FC<ExamplesListProps> = ({
    selectedExampleId,
    onSelectExample,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    // Get unique categories from all examples
    const categories = Array.from(
        new Set(EXAMPLES.flatMap(example => example.categories))
    ).sort();

    // Filter examples based on search term and category
    const filteredExamples = EXAMPLES.filter(example => {
        const matchesSearch = searchTerm === '' ||
            example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            example.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === null ||
            example.categories.includes(categoryFilter);

        return matchesSearch && matchesCategory;
    });

    // Render a badge for the difficulty level
    const renderDifficultyBadge = (level: Example['level']) => {
        const badgeClasses = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`${badgeClasses[level]} px-2 py-0.5 text-xs rounded-full`}>
                {level}
            </span>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Examples</h2>

                {/* Search input */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search examples..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2 mb-2">
                    <button
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${categoryFilter === null
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        onClick={() => setCategoryFilter(null)}
                    >
                        All
                    </button>

                    {categories.map(category => (
                        <button
                            key={category}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${categoryFilter === category
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            onClick={() => setCategoryFilter(
                                categoryFilter === category ? null : category
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Examples list */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {filteredExamples.length === 0 ? (
                        <div className="text-center text-gray-500 p-4">
                            No examples match your search
                        </div>
                    ) : (
                        filteredExamples.map((example) => (
                            <div
                                key={example.id}
                                className={`p-3 rounded-md cursor-pointer transition-colors ${selectedExampleId === example.id
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                                onClick={() => onSelectExample(example)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-gray-800">{example.name}</div>
                                    {renderDifficultyBadge(example.level)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{example.description}</div>
                                <div className="flex gap-1 mt-2">
                                    {example.categories.map(category => (
                                        <span
                                            key={category}
                                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                                        >
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamplesList;