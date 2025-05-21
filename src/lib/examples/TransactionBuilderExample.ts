import { ExampleFactory } from "./factory";
import type { Network } from "../types/network";

export class TransactionBuilderExample extends ExampleFactory {
    constructor() {
        super({
            id: "transaction-builder",
            name: "Transaction Builder",
            description: "Complete transaction construction interface with signer selection and status tracking",
            level: "advanced",
            categories: ["transactions", "components"],
            related: ["signer-selector", "transaction-form"]
        });
    }

    generateCode(network: Network): string {
        return `import { TransactionBuilder } from "@/components/TransactionBuilder";
import { ChainProvider } from "@/providers/ChainProvider";
import { SignerProvider } from "@/providers/SignerProvider";

export default function TransactionBuilderDemo() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <ChainProvider>
        <SignerProvider>
          <TransactionBuilder className="rounded-xl shadow-lg" />
        </SignerProvider>
      </ChainProvider>
    </div>
  );
}`;
    }
}