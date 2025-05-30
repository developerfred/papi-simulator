// components/ProgressSteps.tsx - Optimized Version

import React, { memo, useMemo } from "react";
import { TransactionStep } from "../types/transaction.types";

interface ProgressStepsProps {
    steps: TransactionStep[];
}

const STEP_STATUS_CLASSES = {
    completed: 'bg-green-500 text-white',
    active: 'bg-blue-500 text-white',
    error: 'bg-red-500 text-white',
    pending: 'bg-gray-200 text-gray-600'
} as const;

// Individual step component to prevent unnecessary re-renders
const StepItem = memo<{
    step: TransactionStep;
    index: number;
    isLast: boolean;
}>(({ step, index, isLast }) => {
    const statusClass = STEP_STATUS_CLASSES[step.status] || STEP_STATUS_CLASSES.pending;

    return (
        <div className="flex items-center">
            <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${statusClass}
      `}>
                {step.status === 'completed' ? '✓' : index + 1}
            </div>
            <div className="ml-2 min-w-0">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
            </div>
            {!isLast && (
                <div className="flex-1 mx-4 h-px bg-gray-200" />
            )}
        </div>
    );
});

StepItem.displayName = 'StepItem';

export const ProgressSteps: React.FC<ProgressStepsProps> = memo(({ steps }) => {
    // Memoize the rendered steps to prevent unnecessary re-calculations
    const renderedSteps = useMemo(() =>
        steps.map((step, index) => (
            <StepItem
                key={step.id}
                step={step}
                index={index}
                isLast={index === steps.length - 1}
            />
        )),
        [steps]
    );

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {renderedSteps}
            </div>
        </div>
    );
});

ProgressSteps.displayName = 'ProgressSteps';