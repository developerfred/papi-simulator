export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
    'beginner': '#22C55E',
    'intermediate': '#F59E0B',
    'advanced': '#EF4444'
};