/**
 * Type definitions for the Monaco editor
 */



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
	renderLineHighlight?: string;
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
	renderLineHighlight: "all",
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
