# Community Template - PAPI Simulator

## Overview

Welcome to the PAPI Simulator Community Template! This initiative enables developers to share, discover, and contribute interactive Polkadot API examples and components. By establishing a standardized template system, we create a collaborative ecosystem where developers can learn from each other and build upon existing work.

## 🎯 Goals

- **Knowledge Sharing**: Enable developers to share their Polkadot-API expertise through interactive examples
- **Standardization**: Provide consistent templates and patterns for high-quality contributions
- **Collaboration**: Foster a community-driven approach to expanding the PAPI Simulator
- **Learning**: Create a rich repository of real-world examples for developers at all levels

## 🏗️ Template Structure

### Example Factory Pattern

All community templates should follow the established `ExampleFactory` pattern:

```typescript
import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class YourExampleName extends ExampleFactory {
  constructor() {
    super({
      id: "your-example-id",
      name: "Your Example Name",
      description: "Brief description of what your example does",
      level: "beginner" | "intermediate" | "advanced",
      categories: ["relevant", "categories", "here"],
    });
  }

  generateCode(network: Network): string {
    return `// Your example code here
${this.getImports(network)}
${this.getClientSetup(network)}

// Your implementation...`;
  }
}
```

### Template Categories

Examples should be categorized appropriately:

- **`transactions`** - Transfer operations, transaction building
- **`balances`** - Account balance queries and operations
- **`storage`** - Chain state and storage queries
- **`queries`** - General blockchain queries
- **`blocks`** - Block-related operations
- **`events`** - Event subscriptions and handling
- **`subscriptions`** - Real-time data subscriptions
- **`wallets`** - Wallet integration examples
- **`components`** - React components for UI
- **`react`** - React-specific implementations
- **`compatibility`** - Cross-chain or compatibility examples

### Difficulty Levels

Choose the appropriate difficulty level:

- **`beginner`** - Simple operations, single API calls, minimal setup
- **`intermediate`** - Multiple operations, state management, error handling
- **`advanced`** - Complex workflows, advanced patterns, performance optimizations

## 📝 Contribution Guidelines

### 1. Template Requirements

#### Code Quality
- **TypeScript**: All examples must be written in TypeScript with proper typing
- **Error Handling**: Include comprehensive error handling and user feedback
- **Documentation**: Add clear comments explaining complex operations
- **Consistency**: Follow the established coding patterns and style

#### User Experience
- **Responsive Design**: Ensure components work on desktop and mobile
- **Accessibility**: Follow web accessibility standards
- **Loading States**: Show appropriate loading indicators
- **Error States**: Provide clear error messages and recovery options

#### Network Support
- **Multi-Network**: Examples should work across all supported networks
- **Network-Specific**: Handle network-specific configurations properly
- **Test Networks**: Prioritize testnet usage for safety

### 2. Example Types

#### Simple Examples
Basic operations that demonstrate a single concept:
```typescript
// Query account balance
// Subscribe to blocks
// Basic transfers
```

#### Interactive Components
Full React components with user interaction:
```typescript
// Wallet connection interfaces
// Transaction builders
// Real-time dashboards
```

#### Advanced Workflows
Complex multi-step operations:
```typescript
// Multi-signature workflows
// Staking operations
// Governance participation
```

### 3. File Structure

```
src/lib/examples/
├── YourExampleName.ts          # Main example factory
├── components/                 # React components (if applicable)
│   └── YourComponent.tsx
├── utils/                      # Utility functions
│   └── yourUtils.ts
└── __tests__/                  # Tests (optional but recommended)
    └── YourExampleName.test.ts
```

## 🚀 Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/developerfred/papi-simulator.git
cd papi-simulator
npm install
```

### 2. Create Your Example

1. Create a new file in `src/lib/examples/`
2. Extend the `ExampleFactory` class
3. Implement the `generateCode` method
4. Add your example to the registry

### 3. Register Your Example

Add your example to `src/lib/examples/index.ts`:

```typescript
import { YourExampleName } from "./YourExampleName";

exampleRegistry.registerMany([
  // ... existing examples
  new YourExampleName(),
]);
```

### 4. Test Your Example

```bash
npm run dev
```

Navigate to your example in the playground and verify it works correctly.

## 🔧 Template Examples

### Basic Query Example

```typescript
export class CustomQueryExample extends ExampleFactory {
  constructor() {
    super({
      id: "custom-query",
      name: "Custom Chain Query",
      description: "Query custom chain state",
      level: "beginner",
      categories: ["queries", "storage"],
    });
  }

  generateCode(network: Network): string {
    return `// Custom chain query example
${this.getImports(network)}
${this.getClientSetup(network)}

const queryChainState = async () => {
  try {
    // Your query implementation
    console.log("Querying chain state...");
  } catch (error) {
    console.error("Query failed:", error);
  }
};

queryChainState();`;
  }
}
```

### React Component Example

```typescript
export class InteractiveComponentExample extends ExampleFactory {
  constructor() {
    super({
      id: "interactive-component",
      name: "Interactive Component",
      description: "React component with user interaction",
      level: "intermediate",
      categories: ["components", "react", "wallets"],
    });
  }

  generateCode(network: Network): string {
    return `// Interactive React component
${this.getImports(network)}

export default function InteractiveComponent() {
  const [state, setState] = useState(null);
  
  // Component implementation...
  
  return (
    <div style={{ /* styles */ }}>
      {/* Component JSX */}
    </div>
  );
}`;
  }
}
```

## 🎨 UI/UX Guidelines

### Design Principles

1. **Consistency**: Follow the existing design patterns and color schemes
2. **Simplicity**: Keep interfaces clean and focused
3. **Responsiveness**: Ensure components work on all screen sizes
4. **Accessibility**: Include proper ARIA labels and keyboard navigation

### Styling Approach

Use inline styles for consistency with existing examples:

```typescript
const containerStyle = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: 'var(--surface, #fff)',
  color: 'var(--text-primary, #000)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
};
```

### Component Structure

```typescript
return (
  <div style={containerStyle}>
    {/* Header with network branding */}
    <div style={headerStyle}>
      <h2>Component Title</h2>
      <p>Component description</p>
    </div>
    
    {/* Main content */}
    <div style={contentStyle}>
      {/* Your component content */}
    </div>
    
    {/* Footer with status/results */}
    {result && (
      <div style={resultStyle}>
        {/* Results display */}
      </div>
    )}
  </div>
);
```

## 🔒 Security Considerations

### Wallet Integration

- **Never store private keys**: Use wallet extensions for signing
- **Validate addresses**: Always validate recipient addresses
- **Test networks first**: Encourage testnet usage
- **Clear warnings**: Display clear warnings for mainnet operations

### Transaction Safety

```typescript
// Example safety checks
if (!recipient || !amount) {
  setError('Please fill in all fields');
  return;
}

const numAmount = parseFloat(amount);
if (isNaN(numAmount) || numAmount <= 0) {
  throw new Error('Please enter a valid amount');
}
```

## 📖 Documentation Standards

### Code Comments

```typescript
// Main component description
export default function ComponentName() {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  
  // Effect for initialization
  useEffect(() => {
    // Initialize component
  }, []);
  
  // Handler for user actions
  const handleSubmit = async () => {
    // Implementation with error handling
  };
}
```

### Example Description

Provide clear descriptions that explain:
- What the example does
- When to use it
- Key concepts demonstrated
- Prerequisites or setup required

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] Works on all supported networks
- [ ] Handles loading states properly
- [ ] Displays errors clearly
- [ ] Responsive design works
- [ ] Accessibility features function
- [ ] Console output is helpful
- [ ] Links to block explorers work

### Automated Testing (Optional)

```typescript
// Example test structure
describe('YourExampleName', () => {
  it('should generate valid code', () => {
    const example = new YourExampleName();
    const code = example.generateCode(mockNetwork);
    expect(code).toContain('expected content');
  });
});
```

## 🚀 Submission Process

### 1. Create Pull Request

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-example-name`
3. Commit your changes: `git commit -m "Add YourExampleName"`
4. Push to the branch: `git push origin feature/your-example-name`
5. Open a Pull Request

### 2. PR Template

```markdown
## Description
Brief description of your example and what it demonstrates.

## Type of Change
- [ ] New example
- [ ] Enhancement to existing example
- [ ] Bug fix
- [ ] Documentation update

## Testing
- [ ] Tested on all supported networks
- [ ] Verified responsive design
- [ ] Checked accessibility
- [ ] Manual testing completed

## Screenshots
Include screenshots of your example in action.

## Additional Notes
Any additional information about your contribution.
```

### 3. Review Process

1. **Automated Checks**: Ensure builds pass and no linting errors
2. **Code Review**: Maintainers will review code quality and patterns
3. **Testing**: Verify functionality across networks
4. **Documentation**: Check that documentation is clear and complete

## 🎉 Recognition

### Contributors

Contributors will be recognized in:
- Repository README
- Example metadata
- Community announcements

### Feature Examples

Outstanding examples may be:
- Featured in documentation
- Used in tutorials
- Promoted on social media

## 🆘 Support

### Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs or request features via GitHub Issues
- **Forum**: Join the conversation on [Polkadot Forum](https://forum.polkadot.network/t/introducing-papi-interactive-console-playground/12425)

### Resources

- [Polkadot-API Documentation](https://papi.how/)
- [Polkadot Developer Portal](https://polkadot.network/developers/)
- [Substrate Documentation](https://docs.substrate.io/)

## 🔮 Future Roadmap

### Planned Features

- **Template Marketplace**: Browseable collection of community templates
- **Example Rating System**: Community voting on example quality
- **Advanced Search**: Filter examples by complexity, use case, etc.
- **Integration Examples**: Templates for common dApp patterns
- **Video Tutorials**: Walkthrough videos for complex examples

### Community Initiatives

- **Monthly Challenges**: Themed example creation contests
- **Expert Reviews**: Code reviews by ecosystem experts
- **Workshop Series**: Live coding sessions with community

---

## 📄 License

All community contributions are subject to the same MIT License as the main project.

## 🙏 Acknowledgments

Thank you to all contributors who help make the PAPI Simulator a valuable resource for the Polkadot developer community!

---

**Ready to contribute?** Start by exploring existing examples, then create your own following these guidelines. We can't wait to see what you build! 🚀