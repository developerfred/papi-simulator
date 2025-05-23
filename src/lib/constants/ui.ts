export const UI_CLASSES = {
  input: "w-full p-2 border rounded-md bg-surface",
  label: "block text-sm font-medium mb-1",
  textarea: "w-full p-2 border rounded-md bg-surface font-mono text-sm",
  select: "w-full p-2 border rounded-md bg-surface",
  error: "p-2 rounded bg-red-100 text-red-600 text-sm",
  card: "p-4 hover:shadow-md transition-shadow",
  badge: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
} as const;

export const STATUS_CONFIG = {
  idle: { color: "#9ca3af", label: "Not Started", progress: 0 },
  preparing: { color: "#6366f1", label: "Preparing", progress: 15 },
  signed: { color: "#8b5cf6", label: "Signed", progress: 35 },
  broadcasting: { color: "#3b82f6", label: "Broadcasting", progress: 50 },
  inBlock: { color: "#0ea5e9", label: "In Block", progress: 75 },
  finalized: { color: "#10b981", label: "Finalized", progress: 100 },
  error: { color: "#ef4444", label: "Error", progress: 100 },
} as const;

