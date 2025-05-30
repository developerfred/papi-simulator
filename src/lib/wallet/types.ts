import { z } from "zod";

export const WalletAccountSchema = z.object({
  address: z.string(),
  name: z.string().optional(),
  type: z.enum(["sr25519", "ed25519", "ecdsa"]).optional(),
  genesisHash: z.string().optional(),
});

export const WalletExtensionSchema = z.object({
  name: z.string(),
  version: z.string(),
  accounts: z.array(WalletAccountSchema),
  signer: z.object({
    signPayload: z.function(),
    signRaw: z.function().optional(),
  }),
});

export const WalletConnectionStatusSchema = z.enum([
  "disconnected",
  "connecting", 
  "connected",
  "error"
]);

export const WalletStateSchema = z.object({
  selectedWallet: z.string().nullable(),
  selectedAccount: WalletAccountSchema.nullable(),
  availableWallets: z.array(z.string()),
  connectedWallets: z.record(WalletExtensionSchema),
  connectionStatus: WalletConnectionStatusSchema,
  error: z.string().nullable(),
});

export type WalletAccount = z.infer<typeof WalletAccountSchema>;
export type WalletExtension = z.infer<typeof WalletExtensionSchema>;
export type WalletConnectionStatus = z.infer<typeof WalletConnectionStatusSchema>;
export type WalletState = z.infer<typeof WalletStateSchema>;

export interface WalletMetadata {
  id: string;
  name: string;
  icon: string;
  installUrl: string;
  platforms: ("browser" | "mobile")[];
}
