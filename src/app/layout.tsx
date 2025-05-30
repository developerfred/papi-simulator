import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { Suspense } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import { PolkadotProvider } from "@/components/PolkadotProvider";
import { WasmPreloader } from "@/components/WasmPreloader";
import { WalletProvider } from "../../src/providers/WalletProvider";
import { CryptoSetup } from '@/blockchain/CryptoSetup';
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Polkadot API Playground",
	description: "Polkadot API Playground by @codingsh",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<CryptoSetup showDebugInfo={process.env.NODE_ENV === 'development'}>
				<WasmPreloader />
				<PolkadotProvider>
					<WalletProvider>
					<Suspense fallback={<LoadingIndicator />}>
						<ThemeProvider>{children}</ThemeProvider>
					</Suspense>
					</WalletProvider>
				</PolkadotProvider>
				</CryptoSetup>
				<Analytics/>
			</body>
		</html>
	);
}
