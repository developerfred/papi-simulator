import { ExampleFactory } from "./factory";

export class TestComponentExample extends ExampleFactory {
	constructor() {
		super({
			id: "test-component",
			name: "Test Live Preview",
			description: "Componente teste para validar a renderização em tempo real",
			level: "beginner",
			categories: ["test"],
		});
	}

	generateCode(): string {
		return `export default function TestComponent() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <h2>Test Component</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}`;
	}
}
