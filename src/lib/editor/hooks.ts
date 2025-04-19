/**
 * Custom hooks for Monaco editor integration
 */
import { useEffect, useState, useRef } from "react";
import type * as monaco from "monaco-editor";
import { useMonaco } from "@monaco-editor/react";
import { configurePolkadotApiTypes } from "./definitions";
import { getCompilerOptions, SupportedNetwork } from "./types";

/**
 * Hook to configure Monaco with TypeScript support for Polkadot API
 * @param network The selected network
 * @returns Whether Monaco has been configured
 */
export function useMonacoConfiguration(
	network: SupportedNetwork = "westend",
): boolean {
	const monaco = useMonaco();
	const [isConfigured, setIsConfigured] = useState(false);
	const previousNetwork = useRef<SupportedNetwork>(network);

	useEffect(() => {
		if (monaco) {
			monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
				getCompilerOptions(monaco),
			);

			monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
				noSemanticValidation: false,
				noSyntaxValidation: false,
			});

			configurePolkadotApiTypes(monaco, network);

			setIsConfigured(true);
		}
	}, [monaco, network]);

	// Update definitions when network changes
	useEffect(() => {
		if (monaco && isConfigured && network !== previousNetwork.current) {
			configurePolkadotApiTypes(monaco, network);
			previousNetwork.current = network;
		}
	}, [monaco, network, isConfigured]);

	return isConfigured;
}

/**
 * Hook to handle editor mount and value syncing
 * @param code Current code value
 * @param onChange Code change handler
 * @param disabled Whether editor is disabled
 * @returns Editor reference and status
 */
export function useEditorInstance(
	code: string,
	onChange: (value: string) => void,
	disabled: boolean = false,
) {
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const [isEditorReady, setIsEditorReady] = useState(false);

	// Handle editor mount
	const handleEditorDidMount = (
		editor: monaco.editor.IStandaloneCodeEditor,
	) => {
		editorRef.current = editor;
		setIsEditorReady(true);
	};

	// Update readonly state when disabled prop changes
	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.updateOptions({ readOnly: disabled });
		}
	}, [disabled]);

	// Sync editor value with code prop
	useEffect(() => {
		if (
			editorRef.current &&
			isEditorReady &&
			code !== editorRef.current.getValue()
		) {
			editorRef.current.setValue(code);
		}
	}, [code, isEditorReady]);

	return {
		editorRef,
		isEditorReady,
		handleEditorDidMount,
	};
}

/**
 * Hook for managing mounted state with SSR compatibility
 * @returns Whether component is mounted in the browser
 */
export function useMountedState(): boolean {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	return isMounted;
}
