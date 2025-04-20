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
  ComponentType,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import * as ts from "typescript";

const ALLOWED_MODULES: Record<string, unknown> = {
  react: React,
  "react-error-boundary": { ErrorBoundary },
  "react/jsx-runtime": {
    jsx: React.createElement,
    jsxs: React.createElement,
  },
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
        (v.prototype === undefined || v.prototype.render === undefined),
    },
    {
      name: "Class Component",
      check: (v: unknown) => v?.prototype?.isReactComponent,
    },
    {
      name: "Memo Component",
      check: (v: unknown) => v?.$$typeof === Symbol.for("react.memo"),
    },
    {
      name: "ForwardRef",
      check: (v: unknown) => v?.$$typeof === Symbol.for("react.forward_ref"),
    },
    {
      name: "Lazy Component",
      check: (v: unknown) => v?.$$typeof === Symbol.for("react.lazy"),
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

const createModuleEnvironment = () => {
  const exports: Record<string, unknown> = {};
  return {
    module: { exports, id: "user-component", loaded: true },
    exports,
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
    const { outputText, diagnostics } = ts.transpileModule(cleanedCode, {
      compilerOptions: COMPILER_OPTIONS,
      reportDiagnostics: true,
    });
    const errors = diagnostics
      .filter((d) => d.category === ts.DiagnosticCategory.Error)
      .map((d) => ({
        message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
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
        },
      ],
      originalCode: code,
    };
  }
};

const normalizeComponent = (
  exports: Record<string, unknown>,
): ComponentType | null => {
  if (!exports) return null;

  if (exports.default) {
    const defaultExport = exports.default;
    if (typeof defaultExport === "function") {
      if (
        defaultExport.prototype === undefined ||
        defaultExport.prototype.render === undefined
      ) {
        return defaultExport as ComponentType;
      }
      if (defaultExport.prototype?.isReactComponent) {
        return defaultExport as ComponentType;
      }
    }
    if (defaultExport?.$$typeof) {
      const type = defaultExport.$$typeof.toString();
      if (
        type.includes("react.memo") ||
        type.includes("react.forward_ref") ||
        type.includes("react.lazy")
      ) {
        return defaultExport as ComponentType;
      }
    }
  }

  for (const [, value] of Object.entries(exports)) {
    if (typeof value === "function") {
      if (
        value.prototype === undefined ||
        value.prototype.render === undefined
      ) {
        return value as ComponentType;
      }
      if (value.prototype?.isReactComponent) {
        return value as ComponentType;
      }
    }
    if (value?.$$typeof) {
      const type = value.$$typeof.toString();
      if (
        type.includes("react.memo") ||
        type.includes("react.forward_ref") ||
        type.includes("react.lazy")
      ) {
        return value as ComponentType;
      }
    }
  }

  return null;
};

const evaluateComponent = (code: string) => {
  try {
    const { code: transpiled, errors, originalCode } = transpileCode(code);
    if (errors.length > 0) {
      throw new Error(
        `Compilation errors:\n${errors.map((e) => `${e.line ? `Line ${e.line}: ` : ""}${e.message}`).join("\n")}`,
      );
    }
    const { module, exports, require } = createModuleEnvironment();
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
    const evaluationCode = `
      try {
        const { ${Object.keys(reactHooks).join(", ")} } = __hooks__;
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
      evaluationCode,
    );
    const result = evaluator(React, exports, module, require, reactHooks);
    const component = normalizeComponent(result as Record<string, unknown>);
    if (!component) {
      throw new Error(
        `No valid component found. Exports analysis:\n${analyzeExports(result as Record<string, unknown>)}`,
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
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      borderRadius: "8px",
      color: "#333",
    }}
  >
    <h3 style={{ color: "#d32f2f", marginTop: 0 }}>Erro no Componente</h3>
    <pre
      style={{
        backgroundColor: "#f5f5f5",
        padding: "15px",
        borderRadius: "6px",
        overflowX: "auto",
      }}
    >
      <code>{error.message}</code>
    </pre>
    {originalCode && (
      <details>
        <summary>Código Original</summary>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "6px",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          <code>{originalCode}</code>
        </pre>
      </details>
    )}
    <details style={{ marginTop: "15px" }}>
      <summary>Pilha de Erro Completa</summary>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
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
}

const LivePreview: React.FC<LivePreviewProps> = ({
  code,
  width = "100%",
  height = "auto",
  fallbackMessage = "Carregando Componente...",
}) => {
  const [componentData, setComponentData] = useState<{
    Component: ComponentType;
    originalCode?: string;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { component, originalCode } = evaluateComponent(code);
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
  }, [code]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    overflow: "auto",
    position: "relative",
  };

  return (
    <div style={containerStyle}>
      <ErrorBoundary
        resetKeys={[code]}
        FallbackComponent={({ error }) => (
          <ErrorFallback
            error={error}
            originalCode={componentData?.originalCode}
          />
        )}
      >
        {loading ? (
          <div>{fallbackMessage}</div>
        ) : error ? (
          <ErrorFallback
            error={error}
            originalCode={componentData?.originalCode}
          />
        ) : componentData?.Component ? (
          <Suspense fallback={<div>{fallbackMessage}</div>}>
            {createElement(componentData.Component)}
          </Suspense>
        ) : null}
      </ErrorBoundary>
    </div>
  );
};

export default LivePreview;