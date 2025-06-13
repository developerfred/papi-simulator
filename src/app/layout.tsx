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
	metadataBase: new URL("https://papi-simulator.aipop.fun"),
	title: "PAPI Simulator: Just Ship It.",
	description: "The React Playground for Polkadot. Build, test, and launch dApps instantly with zero-config, community templates, and production-ready exports.",
	icons: {
		icon: '/favicon.svg',
	},
	openGraph: {
		title: "PAPI Simulator: Just Ship It.",
		description: "The React Playground for Polkadot.",
		url: "https://papi-simulator.aipop.fun",
		siteName: "PAPI Simulator",
		images: [
			{
				url: "/og-image-en.svg", 
				width: 1200,
				height: 630,
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "PAPI Simulator: Just Ship It.",
		description: "The React Playground for Polkadot.",
		images: ["/og-image-en.svg"], 
	},
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
