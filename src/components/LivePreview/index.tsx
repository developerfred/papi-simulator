import React, {
	useState,
	useEffect,
	useMemo,
	useRef,
	useContext,
	useReducer,
	useCallback,
	useLayoutEffect,
	useImperativeHandle,
	Suspense,
	createElement,
	type ComponentType,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import * as ts from "typescript";
import type { Network } from "@/lib/types/network";
import { MultiAddress, paseo, roc, wnd } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { createClient } from "polkadot-api";

const ALLOWED_MODULES: Record<string, unknown> = {
	react: React,
	"react-error-boundary": { ErrorBoundary },
	"react/jsx-runtime": {
		jsx: React.createElement,
		jsxs: React.createElement,
	},
	"polkadot-api/ws-provider/web": { getWsProvider },
	"polkadot-api/polkadot-sdk-compat": { withPolkadotSdkCompat },
	"@polkadot-api/descriptors": { paseo, roc, wnd, MultiAddress },	
	"polkadot-api": { createClient },
};

const COMPILER_OPTIONS: ts.CompilerOptions = {
	module: ts.ModuleKind.CommonJS,
	target: ts.ScriptTarget.ES2018,
	jsx: ts.JsxEmit.React,
	strict: false,
	esModuleInterop: true,
	skipLibCheck: true,
	allowSyntheticDefaultImports: true,
	moduleResolution: ts.ModuleResolutionKind.NodeJs,
	resolveJsonModule: true,
	experimentalDecorators: true,
	emitDecoratorMetadata: true,
};

const transformImports = (code: string): string => {
	const importRegex =
		/^import\s+(?:(\*\s+as\s+(\w+))|(?:(?:{([^}]+)})?(?:\s*,\s*\*\s+as\s+(\w+))?(?:\s*,\s*)?(\w+)?)\s+from\s+['"]([^'"]+)['"])/gm;
	return code.replace(
		importRegex,
		(
			match,
			starImport,
			starAlias,
			namedImports,
			namespaceAlias,
			defaultImport,
			modulePath,
		) => {
			if (starImport) {
				return `const ${starAlias} = require('${modulePath}');`;
			}
			const parts = [];
			if (namedImports) {
				const names = namedImports.split(",").map((n: string) => n.trim());
				parts.push(`const { ${names.join(", ")} } = require('${modulePath}');`);
			}
			if (defaultImport) {
				parts.push(
					`const ${defaultImport} = require('${modulePath}').default || require('${modulePath}');`,
				);
			}
			if (namespaceAlias) {
				parts.push(`const ${namespaceAlias} = require('${modulePath}');`);
			}
			return parts.join("\n");
		},
	);
};

const analyzeExports = (exports: Record<string, unknown>): string => {
	if (!exports) return "No exports found";
	const componentChecks = [
		{
			name: "Function Component",
			check: (v: unknown) =>
				typeof v === "function" &&
				(v as { prototype?: unknown }).prototype === undefined,
		},
		{
			name: "Class Component",
			check: (v: unknown) =>
				(v as { prototype?: { isReactComponent?: boolean } })?.prototype
					?.isReactComponent === true,
		},
		{
			name: "Memo Component",
			check: (v: unknown) =>
				(v as { $$typeof?: symbol })?.$$typeof === Symbol.for("react.memo"),
		},
		{
			name: "ForwardRef",
			check: (v: unknown) =>
				(v as { $$typeof?: symbol })?.$$typeof ===
				Symbol.for("react.forward_ref"),
		},
		{
			name: "Lazy Component",
			check: (v: unknown) =>
				(v as { $$typeof?: symbol })?.$$typeof === Symbol.for("react.lazy"),
		},
	];
	try {
		const exportKeys = Object.keys(exports);
		return exportKeys
			.map((key) => {
				const value = exports[key];
				const matchedTypes = componentChecks
					.filter(({ check }) => check(value))
					.map(({ name }) => name);
				return `- ${key}: ${matchedTypes.join(" | ") || "Unknown type"}`;
			})
			.join("\n");
	} catch (error) {
		return `Error analyzing exports: ${error}`;
	}
};


const createModuleEnvironment = (network?: Network) => {
	const exports: Record<string, unknown> = {};


	const global = {
		network,
		networkData: {
			id: network?.id || '',
			name: network?.name || '',
			tokenSymbol: network?.tokenSymbol || '',
			tokenDecimals: network?.tokenDecimals || 0,
			isTest: network?.isTest || false,
			endpoint: network?.endpoint || '',
			explorer: network?.explorer || '',
			faucet: network?.faucet || '',
		},
	};

	return {
		module: { exports, id: "user-component", loaded: true },
		exports,
		global,
		require: (path: string) => {
			if (ALLOWED_MODULES[path]) return ALLOWED_MODULES[path];
			throw new Error(
				`Importing "${path}" is not allowed in the preview environment`,
			);
		},
	};
};

const transpileCode = (code: string) => {
	try {
		const importTransformedCode = transformImports(code);
		const cleanedCode = importTransformedCode
			.replace(/^\s+/gm, "")
			.replace(/\n{2,}/g, "\n")
			.trim();
		const { outputText, diagnostics = [] } = ts.transpileModule(cleanedCode, {
			compilerOptions: COMPILER_OPTIONS,
			reportDiagnostics: true,
		});
		const errors = diagnostics
			.filter((d) => d.category === ts.DiagnosticCategory.Error)
			.map((d) => ({
				message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				line: d.file?.getLineAndCharacterOfPosition(d.start!).line,
			}));
		return { code: outputText, errors, originalCode: cleanedCode };
	} catch (error) {
		console.error("Transpilation failed:", error);
		return {
			code: "",
			errors: [
				{
					message:
						error instanceof Error
							? error.message
							: "Fatal transpilation error",
					line: undefined,
				},
			],
			originalCode: code,
		};
	}
};

const normalizeComponent = (
	exports: Record<string, unknown>,
): ComponentType | null => {
	const isClassComponent = (
		v: unknown,
	): v is { prototype: { isReactComponent: boolean } } =>
		typeof v === "object" &&
		v !== null &&
		"prototype" in v &&
		(v as { prototype: { isReactComponent?: boolean } }).prototype
			.isReactComponent === true;

	const isFunctionComponent = (v: unknown): v is () => React.ReactElement =>
		typeof v === "function" &&
		((v as { prototype?: unknown }).prototype === undefined ||
			(v as { prototype: { render?: () => void } }).prototype.render ===
			undefined);

	const isSpecialReactComponent = (v: unknown): v is { $$typeof: symbol } =>
		typeof v === "object" && v !== null && "$$typeof" in v;

	if (!exports) return null;

	if (exports.default) {
		const defaultExport = exports.default;

		if (isFunctionComponent(defaultExport)) {
			return defaultExport;
		}

		if (isClassComponent(defaultExport)) {
			return defaultExport as ComponentType;
		}

		if (isSpecialReactComponent(defaultExport)) {
			const type = defaultExport.$$typeof.toString();
			if (
				type.includes("react.memo") ||
				type.includes("react.forward_ref") ||
				type.includes("react.lazy")
			) {
				return defaultExport as unknown as ComponentType;
			}
		}
	}

	for (const [, value] of Object.entries(exports)) {
		if (isFunctionComponent(value)) {
			return value;
		}

		if (isClassComponent(value)) {
			return value as unknown as ComponentType;
		}

		if (isSpecialReactComponent(value)) {
			const type = value.$$typeof.toString();
			if (
				type.includes("react.memo") ||
				type.includes("react.forward_ref") ||
				type.includes("react.lazy")
			) {
				return value as unknown as ComponentType;
			}
		}
	}

	return null;
};

// Updated to include network parameter
const evaluateComponent = (code: string, network?: Network) => {
	try {
		const { code: transpiled, errors, originalCode } = transpileCode(code);
		if (errors.length > 0) {
			throw new Error(
				`Compilation errors:\n${errors.map((e) => `${e.line ? `Line ${e.line}: ` : ""}${e.message}`).join("\n")}`,
			);
		}

		const { module, exports, require, global } = createModuleEnvironment(network);
		const reactHooks = {
			useState,
			useEffect,
			useMemo,
			useRef,
			useContext,
			useReducer,
			useCallback,
			useLayoutEffect,
			useImperativeHandle,
		};

		// Inject network data into the global scope
		const networkCode = network ? `
		  // Inject network data from props
		  const __network__ = ${JSON.stringify(network)};
		  
		  // Create helper functions for accessing network data
		  const useNetworkInfo = () => __network__;
		  const getChainToken = () => ({
		    name: __network__.tokenSymbol,
		    decimals: __network__.tokenDecimals,
		    existentialDeposit: BigInt(1),
		    metadataTypes: {}
		  });
		  
		  // Create typedApi mock
		  const typedApi = {
		    tx: {
		      Balances: {
		        transfer_keep_alive: async (params) => {
		          return {
		            getEncodedData: async () => ({
		              asHex: () => "0x" + Array(64).fill('0').join('')
		            })
		          };
		        }
		      }
		    }
		  };
		` : '';

		const evaluationCode = `
      try {
        const { ${Object.keys(reactHooks).join(", ")} } = __hooks__;
        
        // Set up global context
        const window = {
          ...global,
          // Add mock fs functionality for file reading in components
          fs: {
            readFile: async (path, options) => {
              console.log("Mock file reading:", path);
              return "mocked file content";
            }
          }
        };
        
        ${networkCode}
        
        ${transpiled}
        return module.exports;
      } catch(error) {
        throw new Error('Runtime error: ' + error.message + '\\n' + error.stack);
      }
    `;

		const evaluator = new Function(
			"React",
			"exports",
			"module",
			"require",
			"__hooks__",
			"global",
			evaluationCode,
		);

		const result = evaluator(React, exports, module, require, reactHooks, global);
		const component = normalizeComponent(result as Record<string, unknown>);

		if (!component) {
			throw new Error(
				`No valid React component found. Please ensure your code exports a valid React component.\n\nExport analysis:\n${analyzeExports(result as Record<string, unknown>)}\n\nA valid React component can be:\n- A function component: const MyComponent = () => <div>Hello</div>\n- A class component: class MyComponent extends React.Component { ... }\n- Exported as default: export default MyComponent\n- A memo, forwardRef, or lazy component`,
			);
		}
		return { component, originalCode };
	} catch (error) {
		console.error("Component evaluation failed:", error);
		throw error instanceof Error ? error : new Error(String(error));
	}
};

const ErrorFallback: React.FC<{ error: Error; originalCode?: string }> = ({
	error,
	originalCode,
}) => (
	<div
		style={{
			padding: "20px",
			backgroundColor: "rgba(255, 59, 48, 0.05)",
			borderRadius: "12px",
			border: "1px solid rgba(255, 59, 48, 0.2)",
			color: "#333",
		}}
	>
		<h3 style={{ 
			color: "#ff3b30", 
			marginTop: 0,
			marginBottom: "12px",
			fontSize: "18px",
			fontWeight: 600,
		}}>
			Component Error
		</h3>
		<pre
			style={{
				backgroundColor: "#f8f9fa",
				padding: "16px",
				borderRadius: "8px",
				overflowX: "auto",
				margin: "0 0 16px",
				fontSize: "14px",
				lineHeight: "1.5",
				fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
			}}
		>
			<code>{error.message}</code>
		</pre>
		{originalCode && (
			<details style={{ marginTop: "16px" }}>
				<summary style={{ 
					cursor: "pointer",
					color: "#007aff",
					fontWeight: 500,
					padding: "8px 0",
				}}>
					View Original Code
				</summary>
				<pre
					style={{
						backgroundColor: "#f8f9fa",
						padding: "16px",
						borderRadius: "8px",
						maxHeight: "300px",
						overflow: "auto",
						marginTop: "8px",
						fontSize: "14px",
						lineHeight: "1.5",
						fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
					}}
				>
					<code>{originalCode}</code>
				</pre>
			</details>
		)}
		<details style={{ marginTop: "16px" }}>
			<summary style={{ 
				cursor: "pointer",
				color: "#007aff",
				fontWeight: 500,
				padding: "8px 0",
			}}>
				View Stack Trace
			</summary>
			<pre 
				style={{ 
					whiteSpace: "pre-wrap", 
					wordBreak: "break-word",
					backgroundColor: "#f8f9fa",
					padding: "16px",
					borderRadius: "8px",
					marginTop: "8px",
					fontSize: "14px",
					lineHeight: "1.5",
					fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
				}}
			>
				{error.stack}
			</pre>
		</details>
	</div>
);

interface LivePreviewProps {
	code: string;
	width?: string | number;
	height?: string | number;
	fallbackMessage?: string;
	network?: Network;
}

const LivePreview: React.FC<LivePreviewProps> = ({
	code,
	width = "100%",
	height = "auto",
	fallbackMessage = "Loading component...",
	network,  
}) => {
	const [componentData, setComponentData] = useState<{
		Component: ComponentType;
		originalCode?: string;
	} | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(true);

	const networkData = useMemo(() => network, [network]);

	useEffect(() => {
		let isMounted = true;
		setLoading(true);
		const timer = setTimeout(async () => {
			try {
				// Pass network data to evaluateComponent
				const { component, originalCode } = evaluateComponent(code, networkData);
				if (isMounted) {
					setComponentData({ Component: component, originalCode });
					setError(null);
				}
			} catch (err) {
				if (isMounted) setError(err as Error);
			} finally {
				if (isMounted) setLoading(false);
			}
		}, 300);
		return () => {
			isMounted = false;
			clearTimeout(timer);
		};
	}, [code, networkData]);

	const containerStyle: React.CSSProperties = {
		width,
		height,
		border: "1px solid #e0e0e0",
		borderRadius: "12px",
		padding: "20px",
		backgroundColor: "rgba(255, 255, 255, 0.8)",
		backdropFilter: "blur(10px)",
		overflow: "auto",
		position: "relative",
		boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
	};

	return (
		<div style={containerStyle}>
			<ErrorBoundary
				resetKeys={[code, network?.id]}
				FallbackComponent={({ error }) => (
					<ErrorFallback
						error={error}
						originalCode={componentData?.originalCode}
					/>
				)}
			>
				{loading ? (
					<div style={{
						textAlign: "center",
						color: "#666",
						padding: "20px",
						fontFamily: "system-ui, -apple-system, sans-serif",
					}}>
						{fallbackMessage}
					</div>
				) : error ? (
					<ErrorFallback
						error={error}
						originalCode={componentData?.originalCode}
					/>
				) : componentData?.Component ? (
					<Suspense fallback={

						<div style={{
							textAlign: "center",
							color: "#666",
							padding: "20px",
							fontFamily: "system-ui, -apple-system, sans-serif",
						}}>
							{fallbackMessage}
						</div>
					}>
						{createElement(componentData.Component)}
					</Suspense>
				) : null}
			</ErrorBoundary>
		</div>
	);
};

export default LivePreview;