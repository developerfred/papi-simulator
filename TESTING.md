# Polkadot API Playground Documentation

## Overview

The Polkadot API Playground is an interactive web application designed for developers to learn, test, and experiment with the Polkadot API (PAPI) library. This playground provides a user-friendly interface for interacting with Polkadot and its test networks through a code editor, console output, and pre-built examples.

## Key Features

- **Multi-Network Support**: Connect to different Polkadot networks (Polkadot, Westend, Paseo, Rococo)
- **Interactive Code Editor**: Write and edit TypeScript/JavaScript code with syntax highlighting
- **Pre-built Examples**: Learn from curated examples covering common blockchain operations
- **Live Console Output**: View execution results in real-time
- **Dark/Light Theme Switching**: Choose your preferred UI theme
- **Responsive Design**: Use on desktop or mobile devices

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/developerfred/papi-simulator.git
cd papi-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Project Structure

The project is built with Next.js and follows a well-organized structure:

```
/src
  /app                  # Next.js App Router pages
  /components           # React components
    /common             # Shared utility components
    /layouts            # Layout components
    /LivePreview        # Component preview functionality
    /Playground         # Main playground components
    /ui                 # UI components (buttons, cards, etc.)
  /lib                  # Utilities and business logic
    /constants          # Application constants
    /editor             # Code editor configuration
    /examples           # Example code templates
    /hooks              # React hooks
    /simulation         # Code execution simulation
    /theme              # Theme configuration
    /types              # TypeScript type definitions
    /utils              # Utility functions
```

## Using the Playground

### Selecting a Network

1. Choose a network from the Network Selector panel:
   - **Westend**: Test network with similar parameters to Polkadot
   - **Paseo**: Testing network for parachains   
   - **Polkadot**: Main production network

Each network has its own token symbol, endpoint, and parameter configuration.

### Choosing an Example

The playground includes several pre-built examples:

1. **Simple Transfer**: Create a basic balance transfer between accounts
2. **Query Balance**: Check an account's balance and format it for display
3. **Watch Blocks**: Subscribe to finalized blocks and monitor the chain
4. **Network Dashboard**: Interactive component showing network details
5. **Test Component**: Simple React component for testing the live preview

Select an example to load its code into the editor.

### Running Code

1. After selecting a network and example (or writing your own code):
2. Click the "Run Code" button
3. View the simulated execution output in the Console panel
4. For React components, toggle "Live Preview" to see rendered output

### Testing Interactive Components

The playground supports React component rendering in the "Live Preview" mode:

1. Select a component example like "Network Dashboard" or "Test Component"
2. Toggle the editor to "Live Preview" mode
3. Make changes to the component code and see them rendered in real-time

## Features In-Depth

### Code Editor

The code editor is powered by Monaco Editor (the same engine as VS Code) and provides:

- Syntax highlighting for TypeScript/JavaScript
- Auto-completion for Polkadot API functions
- Error checking and linting
- Keyboard shortcuts for common operations

Configuration options for the editor can be found in `src/lib/editor/types.ts`.

### Console Output

The console displays simulated execution results including:

- Log messages (`console.log()` output)
- Warnings (`console.warn()` output)
- Errors (`console.error()` output)
- Execution status and timing information

Each message is timestamped and color-coded based on its type.

### Network Configuration

Network endpoints and parameters are defined in `src/lib/constants/networks.ts`. Each network includes:

- **ID**: Unique identifier for the network
- **Name**: Display name
- **Endpoint**: WebSocket RPC endpoint for connection
- **Faucet**: URL to get test tokens
- **Explorer**: Block explorer URL
- **Token Symbol**: The network's native token
- **Token Decimals**: Decimal places for the token

### Examples System

Examples are organized using a factory pattern in `src/lib/examples/`:

- **BaseExampleFactory**: Abstract base class for creating examples
- **Example Implementations**: Individual classes extending the base factory
- **ExampleRegistry**: Central registry managing all available examples

To add a new example, create a new class extending `ExampleFactory` and register it with the example registry.

## Testing

The project includes several testing capabilities:

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

### Test Types

- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test interactions between components
- **E2E Tests**: Test full workflows from UI interactions to simulated results

## Troubleshooting

### Common Issues

1. **Connection errors**: Ensure you have internet access and the selected network is available
2. **Code execution errors**: Check console output for detailed error messages
3. **UI layout issues**: Try refreshing or toggling between desktop/mobile views

### Getting Help

If you encounter issues not covered in this documentation:

1. Check the [GitHub Issues](https://github.com/developerfred/papi-simulator/issues) for similar problems
2. Join the [Polkadot Discord](https://discord.gg/polkadot) and ask in the development channels
3. Review the [Polkadot-API Documentation](https://papi.how/) for reference

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests to ensure everything works (`npm test`)
5. Commit your changes (`git commit -m 'Add my feature'`)
6. Push to your branch (`git push origin feature/my-feature`)
7. Create a new Pull Request

### Coding Standards

- Follow TypeScript best practices and type all functions/components
- Use functional components with hooks for React code
- Document new features thoroughly
- Write tests for any new functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Advanced Topics

### Adding Custom Networks

To add custom networks to the playground:

1. Edit `src/lib/constants/networks.ts` and add your network configuration
2. Generate the necessary descriptors using the Polkadot-API CLI:
   ```bash
   npx papi add <your-network-key> -w wss://your-network-endpoint
   npx papi generate
   ```
3. Import the generated descriptors in your code

### Creating Custom Examples

To create a new example:

1. Create a new file in `src/lib/examples/` extending the `ExampleFactory` class
2. Implement the `generateCode` method to return code specific to your example
3. Register your example in `src/lib/examples/index.ts`

Example:

```typescript
// src/lib/examples/MyCustomExample.ts
import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class MyCustomExample extends ExampleFactory {
  constructor() {
    super({
      id: "my-custom-example",
      name: "My Custom Example",
      description: "Description of what this example does",
      level: "beginner", // or "intermediate" or "advanced"
      categories: ["category1", "category2"],
    });
  }

  generateCode(network: Network): string {
    return `// Custom example code for ${network.name}
// Your code here
`;
  }
}

// Then register in src/lib/examples/index.ts
import { MyCustomExample } from "./MyCustomExample";
exampleRegistry.register(new MyCustomExample());
```

### Working with the Live Preview

The Live Preview feature renders React components in real-time. Understanding its limitations is important:

- Supported libraries include React core and some specific UI libraries
- Component props are limited to primitive types and basic objects
- External data fetching requires mocking or simulation
- State is reset when code changes

For more advanced component testing, consider using Storybook alongside the playground.

### Theme Customization

The application uses a theme provider in `src/lib/theme/ThemeProvider.tsx`. To customize:

1. Edit the color constants in `src/lib/theme/themeConstants.ts`
2. Update the CSS variables in `src/app/globals.css` for consistent styling
3. Network-specific colors are defined in the `NETWORK_COLORS` constant

## API Reference

The playground interacts with the Polkadot API through several abstraction layers:

### Core Client

```typescript
// Creating a client connection
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const client = createClient(
  getWsProvider("wss://endpoint.example.com")
);
```

### Typed API

```typescript
// Getting a typed API for a specific chain
import { chainDescriptor } from "@polkadot-api/descriptors";

const typedApi = client.getTypedApi(chainDescriptor);
```

### Storage Queries

```typescript
// Query chain storage
const value = await typedApi.query.System.Account.getValue("address");
```

### Transactions

```typescript
// Create a transaction
const tx = typedApi.tx.Balances.transfer_keep_alive({
  dest: MultiAddress.Id("recipient-address"),
  value: 1_000_000_000n
});

// Get encoded data for simulation
const encodedData = await tx.getEncodedData();

// In a real application, sign and submit:
// const result = await tx.signAndSubmit(signer);
```

### Events

```typescript
// Subscribe to events
typedApi.event.Balances.Transfer.watch().subscribe(event => {
  console.log("Transfer detected:", event);
});
```

For the complete API reference, see the [official Polkadot-API Documentation](https://papi.how/).