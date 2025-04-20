"use client";

import React, { useState } from "react";
import { Example } from "@/lib/types/example";
import { Network } from "@/lib/types/network";
import { useTheme } from "@/lib/theme/ThemeProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import NetworkBadge from "@/components/ui/NetworkBadge";

interface TutorialPanelProps {
	example: Example;
	network: Network;
}

export default function TutorialPanel({
	example,
	network,
}: TutorialPanelProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { getColor, getNetworkColor } = useTheme();

	const getTutorialContent = () => {
		const ExternalLink = ({
			href,
			children,
		}: { href: string; children: React.ReactNode }) => (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center hover:underline"
				style={{ color: getNetworkColor("primary") }}
			>
				{children}
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					className="ml-1"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
					<polyline points="15 3 21 3 21 9"></polyline>
					<line x1="10" y1="14" x2="21" y2="3"></line>
				</svg>
			</a>
		);

		switch (example.id) {
			case "simple-transfer":
				return (
					<>
						<div className="flex items-center space-x-2 mb-3">
							<NetworkBadge network={network} size="sm" />
							<h3 className="text-lg font-semibold">
								Simple Transfer Tutorial
							</h3>
						</div>

						<p className="mb-3">
							This example demonstrates how to create a basic balance transfer
							transaction on {network.name}.
						</p>

						<div className="bg-gradient-to-r from-violet-500 to-purple-500 my-4 h-1 w-16 rounded"></div>

						<h4 className="font-medium mt-4 mb-1">Key Concepts:</h4>
						<ul className="list-disc list-inside space-y-1 mb-3">
							<li>Creating a client connection to {network.name}</li>
							<li>Using MultiAddress to specify the recipient</li>
							<li>
								Converting token amounts considering {network.tokenDecimals}{" "}
								decimals
							</li>
							<li>Encoding transaction data for later signing</li>
						</ul>

						<div
							className="p-3 my-3 rounded"
							style={{ backgroundColor: getColor("surfaceVariant") }}
						>
							<p className="text-sm mb-0">
								In a real application, you would need to add a signer to submit
								this transaction. This playground simulates the execution to
								show you the expected output.
							</p>
						</div>

						<div className="mt-4">
							<ExternalLink href="https://papi.how/typed/tx">
								Learn more about transactions in the documentation
							</ExternalLink>
						</div>
					</>
				);

			case "query-balance":
				return (
					<>
						<div className="flex items-center space-x-2 mb-3">
							<NetworkBadge network={network} size="sm" />
							<h3 className="text-lg font-semibold">Query Balance Tutorial</h3>
						</div>

						<p className="mb-3">
							This example shows how to query an account&apos;s balance on{" "}
							{network.name}.
						</p>

						<div className="bg-gradient-to-r from-violet-500 to-purple-500 my-4 h-1 w-16 rounded"></div>

						<h4 className="font-medium mt-4 mb-1">Key Concepts:</h4>
						<ul className="list-disc list-inside space-y-1 mb-3">
							<li>Connecting to {network.name} using WebSocket</li>
							<li>Using the System.Account storage query</li>
							<li>Reading and formatting account balance data</li>
							<li>
								Converting from chain units (
								{Math.pow(10, network.tokenDecimals)} = 1 {network.tokenSymbol})
							</li>
						</ul>

						<div
							className="p-3 my-3 rounded"
							style={{ backgroundColor: getColor("surfaceVariant") }}
						>
							<p className="text-sm mb-0">
								Try modifying the example to check different accounts, such as
								those listed in the Accounts tab.
							</p>
						</div>

						<div className="mt-4">
							<ExternalLink href="https://papi.how/typed/queries">
								Learn more about storage queries in the documentation
							</ExternalLink>
						</div>
					</>
				);

			case "watch-blocks":
				return (
					<>
						<div className="flex items-center space-x-2 mb-3">
							<NetworkBadge network={network} size="sm" />
							<h3 className="text-lg font-semibold">Watch Blocks Tutorial</h3>
						</div>

						<p className="mb-3">
							This example demonstrates how to subscribe to finalized blocks on{" "}
							{network.name}.
						</p>

						<div className="bg-gradient-to-r from-violet-500 to-purple-500 my-4 h-1 w-16 rounded"></div>

						<h4 className="font-medium mt-4 mb-1">Key Concepts:</h4>
						<ul className="list-disc list-inside space-y-1 mb-3">
							<li>Creating an Observable subscription to finalized blocks</li>
							<li>Processing block data as it arrives</li>
							<li>Proper subscription lifecycle management</li>
							<li>Accessing block metadata (number, hash, parent)</li>
						</ul>

						<div
							className="p-3 my-3 rounded"
							style={{ backgroundColor: getColor("surfaceVariant") }}
						>
							<p className="text-sm mb-0">
								In a production application, you would handle subscription
								errors and cleanup when your component unmounts or when you no
								longer need the subscription.
							</p>
						</div>

						<div className="mt-4">
							<ExternalLink href="https://papi.how/client">
								Learn more about the Polkadot Client in the documentation
							</ExternalLink>
						</div>
					</>
				);

			default:
				return (
					<>
						<div className="flex items-center space-x-2 mb-3">
							<NetworkBadge network={network} size="sm" />
							<h3 className="text-lg font-semibold">{example.name}</h3>
						</div>

						<p className="mb-3">{example.description}</p>

						<div className="bg-gradient-to-r from-violet-500 to-purple-500 my-4 h-1 w-16 rounded"></div>

						<p className="text-sm">
							This example demonstrates how to use polkadot-api to interact with{" "}
							{network.name}. Experiment by modifying the code and running it to
							see the results.
						</p>
					</>
				);
		}
	};

	const InfoIcon = () => (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="12" y1="16" x2="12" y2="12"></line>
			<line x1="12" y1="8" x2="12.01" y2="8"></line>
		</svg>
	);

	const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	);

	const tutorialHeader = (
		<button
			onClick={() => setIsOpen(!isOpen)}
			className="flex items-center justify-between w-full py-3 px-1"
		>
			<div className="flex items-center">
				<div className="mr-2">
					<InfoIcon />
				</div>
				<span className="font-medium">Tutorial: {example.name}</span>
			</div>
			<ChevronIcon isOpen={isOpen} />
		</button>
	);

	return (
		<Card
			header={tutorialHeader}
			className="mb-4 transition-all duration-300"
			elevation={isOpen ? "level2" : "level1"}
		>
			{isOpen && (
				<div className="animate-fadeIn">
					{getTutorialContent()}

					<div
						className="flex justify-end mt-6 pt-3"
						style={{ borderTop: `1px solid ${getColor("divider")}` }}
					>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsOpen(false)}
							icon={
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							}
						>
							Close Tutorial
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
}
