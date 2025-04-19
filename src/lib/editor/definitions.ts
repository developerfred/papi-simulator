/**
 * TypeScript type definitions for Polkadot API integration with Monaco Editor
 */

import {
	NETWORK_DESCRIPTORS,
	type TypeDefinition,
	type SupportedNetwork,
} from "./types";

/**
 * Get the correct descriptor name for a network
 */
export function getNetworkDescriptorName(network: SupportedNetwork): string {
	return NETWORK_DESCRIPTORS[network] || NETWORK_DESCRIPTORS.westend;
}

/**
 * Add a type definition to Monaco's TypeScript compiler
 */
export function addTypeDefinition(
	monaco: typeof import("monaco-editor"),
	definition: TypeDefinition,
): void {
	monaco.languages.typescript.typescriptDefaults.addExtraLib(
		definition.content,
		definition.path,
	);
}

/**
 * Creates the base Polkadot API type definitions
 */
export function createBaseDefinition(): TypeDefinition {
	return {
		path: "ts:polkadot-api.d.ts",
		content: `
    declare module "polkadot-api" {
      export interface JsonRpcProvider {
        (onMessage: (message: string) => void): JsonRpcConnection;
      }
      
      export interface JsonRpcConnection {
        send: (message: string) => void;
        disconnect: () => void;
      }
      
      export function createClient(provider: JsonRpcProvider): PolkadotClient;
      
      export interface PolkadotClient {
        getTypedApi<D extends ChainDefinition>(descriptors: D): TypedApi<D>;
        getUnsafeApi<D>(): UnsafeApi<D>;
        finalizedBlock$: Observable<BlockInfo>;
        bestBlocks$: Observable<BlockInfo[]>;
        submit(transaction: string, at?: string): Promise<TxFinalizedPayload>;
        submitAndWatch(transaction: string, at?: string): Observable<TxBroadcastEvent>;
        getChainSpecData(): Promise<ChainSpecData>;
        getFinalizedBlock(): Promise<BlockInfo>;
        getBestBlocks(): Promise<BlockInfo[]>;
        getBlockBody(hash: string): Promise<string[]>;
        getBlockHeader(hash?: string): Promise<BlockHeader>;
        destroy(): void;
        _request<Reply = any, Params extends Array<any> = any[]>(method: string, params: Params): Promise<Reply>;
      }
      
      export interface BlockInfo {
        hash: string;
        number: number;
        parent: string;
      }
      
      export class Binary {
        static fromBytes(bytes: Uint8Array): Binary;
        static fromHex(hex: string): Binary;
        static fromText(text: string): Binary;
        asBytes(): Uint8Array;
        asHex(): string;
        asText(): string;
      }
      
      export type SS58String = string;
      export type HexString = string;
      
      export function Enum<T extends string, V>(type: T, value: V): { type: T; value: V };
    }
    
    declare module "polkadot-api/ws-provider/web" {
      import { JsonRpcProvider } from "polkadot-api";
      
      export interface WsJsonRpcProvider extends JsonRpcProvider {
        switch: (uri?: string, protocol?: string[]) => void;
        getStatus: () => StatusChange;
      }
      
      export function getWsProvider(
        uri: string,
        protocols?: string | string[],
        onStatusChanged?: (status: StatusChange) => void,
      ): WsJsonRpcProvider;
      
      export function getWsProvider(
        uri: string,
        onStatusChanged?: (status: StatusChange) => void,
      ): WsJsonRpcProvider;
      
      export function getWsProvider(
        endpoints: Array<string | { uri: string; protocol: string[] }>,
        onStatusChanged?: (status: StatusChange) => void,
      ): WsJsonRpcProvider;
    }
    
    declare module "polkadot-api/sm-provider" {
      import { JsonRpcProvider } from "polkadot-api";
      
      export function getSmProvider(chain: Promise<Chain> | Chain): JsonRpcProvider;
    }
    
    declare module "polkadot-api/polkadot-sdk-compat" {
      import { JsonRpcProvider } from "polkadot-api";
      
      export function withPolkadotSdkCompat(provider: JsonRpcProvider): JsonRpcProvider;
    }
    
    declare module "polkadot-api/smoldot" {
      export function start(): SmoldotClient;
      
      interface SmoldotClient {
        addChain(options: { chainSpec: string }): Promise<Chain>;
        terminate(): void;
      }
      
      interface Chain {
        // Chain interface properties would go here
      }
    }
    
    declare module "polkadot-api/smoldot/from-worker" {
      export function startFromWorker(worker: Worker): SmoldotClient;
      
      interface SmoldotClient {
        addChain(options: { chainSpec: string }): Promise<Chain>;
        terminate(): void;
      }
    }
    
    declare module "@polkadot-api/descriptors" {
      export interface ChainDefinition {
        // Chain definition interface properties would go here
      }
      
      export const westend: ChainDefinition;
      export const polkadot: ChainDefinition;
      export const paseo: ChainDefinition;
      export const rococo: ChainDefinition;
      export const kusama: ChainDefinition;
      export const wnd: ChainDefinition;
      export const dot: ChainDefinition;
      export const ksm: ChainDefinition;
      
      export interface MultiAddress {
        Id(address: string): { type: "Id"; value: string };
        Index(index: number): { type: "Index"; value: number };
        Raw(data: Uint8Array): { type: "Raw"; value: Uint8Array };
        Address32(address: Uint8Array): { type: "Address32"; value: Uint8Array };
        Address20(address: Uint8Array): { type: "Address20"; value: Uint8Array };
      }
      
      export const MultiAddress: MultiAddress;
    }
    
    // Declare Observable for RxJS-like types
    interface Observable<T> {
      subscribe(observer: {
        next?: (value: T) => void;
        error?: (err: any) => void;
        complete?: () => void;
      }): { unsubscribe: () => void };
    }
    
    // TypedApi interface
    interface TypedApi<D> {
      query: StorageApi;
      tx: TxApi;
      txFromCallData: TxFromBinary;
      event: EvApi;
      apis: RuntimeCallsApi;
      constants: ConstApi;
      compatibilityToken: Promise<CompatibilityToken>;
    }
    
    // Transaction interface
    interface Transaction {
      sign: (from: PolkadotSigner, txOptions?: TxOptions) => Promise<string>;
      signAndSubmit: (from: PolkadotSigner, txOptions?: TxOptions) => Promise<TxFinalized>;
      signSubmitAndWatch: (from: PolkadotSigner, txOptions?: TxOptions) => Observable<TxEvent>;
      getEncodedData: () => Promise<Binary>;
      getEstimatedFees: (from: Uint8Array | SS58String, txOptions?: TxOptions) => Promise<bigint>;
      decodedCall: any;
    }
    `,
	};
}

/**
 * Creates network-specific type definitions
 */
export function createNetworkDefinition(
	network: SupportedNetwork,
): TypeDefinition {
	const descriptorName = getNetworkDescriptorName(network);

	return {
		path: `ts:${network}-specific.d.ts`,
		content: `
    // Network-specific typings for ${network}
    declare module "@polkadot-api/descriptors" {
      export interface ${descriptorName}Queries {
        System: {
          Account: {
            getValue: (address: string) => Promise<{
              data: {
                free: bigint;
                reserved: bigint;
                frozen: bigint;
              }
            }>;
          };
          Number: {
            getValue: () => Promise<number>;
          };
        };
        Balances: {
          TotalIssuance: {
            getValue: () => Promise<bigint>;
          };
        };
      }
      
      export interface ${descriptorName}Calls {
        Balances: {
          transfer_keep_alive: (params: {
            dest: { type: string; value: any };
            value: bigint;
          }) => Transaction;
          transfer_allow_death: (params: {
            dest: { type: string; value: any };
            value: bigint;
          }) => Transaction;
        };
        System: {
          remark: (params: { remark: Binary }) => Transaction;
        };
      }
    }
    `,
	};
}

/**
 * Creates example code snippets for autocompletion
 */
export function createExamplesDefinition(
	network: SupportedNetwork,
): TypeDefinition {
	const descriptorName = getNetworkDescriptorName(network);

	return {
		path: "ts:polkadot-api-examples.d.ts",
		content: `
    // Example snippets for autocompletion
    
    // Client creation
    import { createClient } from "polkadot-api";
    import { ${descriptorName} } from "@polkadot-api/descriptors";
    import { getWsProvider } from "polkadot-api/ws-provider/web";
    import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
    
    // Connect to a node via WebSocket
    const client = createClient(
      withPolkadotSdkCompat(
        getWsProvider("wss://rpc.${network}.io")
      )
    );
    
    // Get the typed API
    const typedApi = client.getTypedApi(${descriptorName});
    
    // Simple balance transfer
    import { MultiAddress } from "@polkadot-api/descriptors";
    const tx = typedApi.tx.Balances.transfer_keep_alive({
      dest: MultiAddress.Id("recipient-address"),
      value: 1000000000n
    });
    
    // Query account balance
    const accountInfo = await typedApi.query.System.Account.getValue("address");
    const freeBalance = accountInfo.data.free;
    
    // Watch blocks
    client.finalizedBlock$.subscribe({
      next: (block) => {
        console.log("Block:", block.number, block.hash);
      }
    });
    
    // Create from Binary
    const binary = Binary.fromText("Hello PAPI");
    
    // Create a transaction from other pallet
    const remarkTx = typedApi.tx.System.remark({
      remark: Binary.fromText("Some remark")
    });
    `,
	};
}

/**
 * Configure Monaco editor with Polkadot API type definitions
 */
export function configurePolkadotApiTypes(
	monaco: typeof import("monaco-editor"),
	network: SupportedNetwork = "westend",
): void {
	// Add base definitions
	addTypeDefinition(monaco, createBaseDefinition());

	// Add network-specific definitions
	addTypeDefinition(monaco, createNetworkDefinition(network));

	// Add example snippets
	addTypeDefinition(monaco, createExamplesDefinition(network));
}
