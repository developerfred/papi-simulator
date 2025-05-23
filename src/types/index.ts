export interface Network {
  id: string;
  name: string;
  endpoint: string;
  token: string;
  decimals: number;
}

export interface Transaction {
  id: string;
  status: 'idle' | 'pending' | 'success' | 'error';
  hash?: string;
  block?: number;
}

export interface Signer {
  address: string;
  name: string;
  sign: (data: Uint8Array) => Promise<Uint8Array>;
}

export type TransactionStatus = Transaction['status'];
export type NetworkId = Network['id'];
