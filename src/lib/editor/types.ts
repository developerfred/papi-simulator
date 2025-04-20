/**
 * Supported networks for Polkadot API
 */
export type SupportedNetwork =
	| "westend"
	| "polkadot"
	| "paseo"
	| "rococo"
	| "kusama";

/**
 * Network descriptor mapping
 */
export const NETWORK_DESCRIPTORS: Record<SupportedNetwork, string> = {
	westend: "Wnd",
	polkadot: "Dot",
	paseo: "Paseo",
	rococo: "Roc",
	kusama: "Ksm",
};

/**
 * Type definition to add to Monaco
 */
export interface TypeDefinition {
	path: string;
	content: string;
}

/**
 * Editor configuration options
 */
export interface EditorOptions {
	minimap?: { enabled: boolean };
	scrollBeyondLastLine?: boolean;
	fontSize?: number;
	wordWrap?: "on" | "off";
	readOnly?: boolean;
	tabSize?: number;
	smoothScrolling?: boolean;
	cursorBlinking?: string;
	automaticLayout?: boolean;
	lineNumbers?: "on" | "off";
	renderLineHighlight?: "none" | "line" | "gutter" | "all";
	folding?: boolean;
	contextmenu?: boolean;
	formatOnPaste?: boolean;
	scrollbar?: {
		verticalScrollbarSize?: number;
		horizontalScrollbarSize?: number;
	};
	quickSuggestions?:
		| boolean
		| { other?: boolean; comments?: boolean; strings?: boolean };
	suggestOnTriggerCharacters?: boolean;
	parameterHints?: { enabled: boolean };
	suggest?: {
		showClasses?: boolean;
		showFunctions?: boolean;
		showVariables?: boolean;
		showModules?: boolean;
		showMethods?: boolean;
		showProperties?: boolean;
	};
}

/**
 * Default editor options
 */
export const DEFAULT_EDITOR_OPTIONS: EditorOptions = {
	minimap: { enabled: false },
	scrollBeyondLastLine: false,
	fontSize: 14,
	wordWrap: "on",
	tabSize: 2,
	smoothScrolling: true,
	cursorBlinking: "smooth",
	automaticLayout: true,
	lineNumbers: "on",
	renderLineHighlight: "all" as const,
	folding: true,
	contextmenu: true,
	formatOnPaste: true,
	scrollbar: {
		verticalScrollbarSize: 10,
		horizontalScrollbarSize: 10,
	},
	quickSuggestions: true,
	suggestOnTriggerCharacters: true,
	parameterHints: { enabled: true },
	suggest: {
		showClasses: true,
		showFunctions: true,
		showVariables: true,
		showModules: true,
		showMethods: true,
		showProperties: true,
	},
};

/**
 * Props for the CodeEditor component
 */
export interface CodeEditorProps {
	code: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	language?: string;
	height?: string;
	network?: SupportedNetwork;
}

/**
 * Monaco compiler options
 */
export function getCompilerOptions(monaco: typeof import("monaco-editor")) {
	return {
		target: monaco.languages.typescript.ScriptTarget.ESNext,
		allowNonTsExtensions: true,
		moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
		module: monaco.languages.typescript.ModuleKind.ESNext,
		noEmit: true,
		esModuleInterop: true,
		jsx: monaco.languages.typescript.JsxEmit.React,
		reactNamespace: "React",
		allowJs: true,
		typeRoots: ["node_modules/@types"],
	};
}

// Types for the LivePreview component
export interface LivePreviewOptions {
	/**
	 * Whether to show the preview
	 */
	showPreview?: boolean;

	/**
	 * Width of the preview container
	 */
	width?: string | number;

	/**
	 * Height of the preview container
	 */
	height?: string | number;

	/**
	 * Whether to automatically run the preview on code changes
	 */
	autoRun?: boolean;

	/**
	 * Debounce time in milliseconds to wait before updating the preview
	 */
	debounceTime?: number;

	/**
	 * Additional props to pass to the previewed component
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	componentProps?: Record<string, unknown>;

	/**
	 * Custom error renderer
	 */
	errorRenderer?: (error: Error) => React.ReactNode;

	/**
	 * Libraries to provide to the preview scope
	 */
	scope?: Record<string, unknown>;
}

// Preview component states
export enum PreviewState {
	IDLE = "idle",
	LOADING = "loading",
	SUCCESS = "success",
	ERROR = "error",
}

// Preview error types
export interface CompilationError extends Error {
	type: "compilation";
	lineNumber?: number;
	column?: number;
	snippet?: string;
}

export interface RuntimeError extends Error {
	type: "runtime";
	componentStack?: string;
}

export type PreviewError = CompilationError | RuntimeError;

// Babel transform options specifically for React components
export interface ComponentTransformOptions {
	presets?: string[];
	plugins?: Array<string | [string, Record<string, unknown>]>;
	filename?: string;
	retainLines?: boolean;
	sourceType?: "script" | "module" | "unambiguous";
	sourceMaps?: boolean | "inline" | "both" | "external";
}
