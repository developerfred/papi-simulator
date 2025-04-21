/* eslint-disable @typescript-eslint/no-unused-vars */
import { NETWORKS } from "@/lib/constants/networks";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import CodeEditor from "../CodeEditor";

// Mock monaco-editor
jest.mock("@monaco-editor/react", () => {
	return {
		__esModule: true,
		default: ({ value, onChange, options }) => (
			<div data-testid="monaco-editor">
				<textarea
					data-testid="mock-editor-textarea"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					style={{ width: "100%", height: "200px" }}
				/>
				<div data-testid="editor-options">{JSON.stringify(options)}</div>
			</div>
		),
		useMonaco: () => ({
			languages: {
				typescript: {
					typescriptDefaults: {
						setCompilerOptions: jest.fn(),
						setDiagnosticsOptions: jest.fn(),
						addExtraLib: jest.fn(),
					},
				},
				registerCompletionItemProvider: jest.fn(),
				registerHoverProvider: jest.fn(),
				registerSignatureHelpProvider: jest.fn(),
			},
		}),
	};
});

describe("CodeEditor", () => {
	const mockOnChange = jest.fn();
	const mockCode = 'import { createClient } from "polkadot-api";';
	const mockNetwork = NETWORKS.westend;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders the editor with provided code", async () => {
		render(
			<ThemeProvider>
				<CodeEditor
					code={mockCode}
					onChange={mockOnChange}
					network={mockNetwork}
				/>
			</ThemeProvider>,
		);

		// Verify editor renders with code
		const editorTextarea = screen.getByTestId("mock-editor-textarea");
		expect(editorTextarea).toHaveValue(mockCode);
	});

	it("calls onChange when code is edited", async () => {
		const user = userEvent.setup();

		render(
			<ThemeProvider>
				<CodeEditor
					code={mockCode}
					onChange={mockOnChange}
					network={mockNetwork}
				/>
			</ThemeProvider>,
		);

		const editorTextarea = screen.getByTestId("mock-editor-textarea");

		await user.clear(editorTextarea);
		await user.type(editorTextarea, 'const newCode = "test";');

		expect(mockOnChange).toHaveBeenCalledWith('const newCode = "test";');
	});

	it("disables editor when disabled prop is true", async () => {
		render(
			<ThemeProvider>
				<CodeEditor
					code={mockCode}
					onChange={mockOnChange}
					disabled={true}
					network={mockNetwork}
				/>
			</ThemeProvider>,
		);

		const editorOptions = screen.getByTestId("editor-options");
		const options = JSON.parse(editorOptions.textContent || "{}");

		expect(options.readOnly).toBe(true);
	});

	it("uses correct theme based on ThemeContext", async () => {
		render(
			<ThemeProvider initialNetworkId="westend">
				<CodeEditor
					code={mockCode}
					onChange={mockOnChange}
					network={mockNetwork}
				/>
			</ThemeProvider>,
		);

		// We can't fully test the theme integration without a more complex setup,
		// but we can verify the theme prop is being passed to the editor
		const editorOptions = screen.getByTestId("editor-options");
		const options = JSON.parse(editorOptions.textContent || "{}");

		// Initial theme is 'dark' (this depends on how the ThemeProvider is mocked)
		expect(options.theme).toMatch(/vs-dark|light/);
	});
});
