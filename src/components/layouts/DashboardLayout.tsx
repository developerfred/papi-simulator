"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import React, { type ReactNode, useState, useEffect } from "react";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import Link from "next/link";
import { useVersion } from "@/hooks/useVersion";

interface DashboardLayoutProps {
	children: ReactNode;
	title: string;
	description?: string;
	rightContent?: ReactNode;
}

export default function DashboardLayout({
	children,
	title,
	description,
	rightContent,
}: DashboardLayoutProps) {
	const { getColor, getNetworkColor } = useTheme();
	const { version, gitHash, buildTime } = useVersion();
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const headerClasses = `sticky top-0 z-10 border-b p-4 transition-all duration-200  z-1001 ${scrolled ? "shadow-sm backdrop-blur-md bg-opacity-90" : ""
		}`;

	
	const LogoIcon = () => (
		<svg
			width="28"
			height="28"
			className="mr-3"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
				fill={getNetworkColor("primary")}
			/>
			<path d="M11 7h2v6h-2z" fill={getNetworkColor("primary")} />
			<path d="M11 15h2v2h-2z" fill={getNetworkColor("primary")} />
		</svg>
	);

	const DashboardIcon = () => (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="3" width="7" height="7"></rect>
			<rect x="14" y="3" width="7" height="7"></rect>
			<rect x="14" y="14" width="7" height="7"></rect>
			<rect x="3" y="14" width="7" height="7"></rect>
		</svg>
	);

	const InfoIcon = () => (
		<svg
			width="16"
			height="16"
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

	const MenuIcon = () => (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="3" y1="12" x2="21" y2="12"></line>
			<line x1="3" y1="6" x2="21" y2="6"></line>
			<line x1="3" y1="18" x2="21" y2="18"></line>
		</svg>
	);

	const CloseIcon = () => (
		<svg
			width="24"
			height="24"
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
	);

	const formatBuildTime = (timeString: string) => {
		try {
			const date = new Date(timeString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return timeString;
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-[var(--background)]">
			{/* Header */}
			<header
				className={headerClasses}
				style={{
					borderColor: getColor("border"),
					backgroundColor: scrolled
						? `${getColor("background")}DD`
						: getColor("background"),
				}}
			>
				<div className="container mx-auto">
					<div className="flex justify-between items-center">
						{/* Logo and title section */}
						<div className="flex items-center">
							<LogoIcon />
							<div>
								<h1 className="text-xl md:text-2xl font-bold leading-tight">
									{title}
								</h1>
								{description && (
									<p
										className="text-xs md:text-sm opacity-70 mt-0.5"
										style={{ color: getColor("textSecondary") }}
									>
										{description}
									</p>
								)}
							</div>
						</div>

						{/* Desktop navigation */}
						<div className="hidden md:flex items-center gap-4">
							{rightContent && <div className="mr-2">{rightContent}</div>}
							<Link href="/dashboard">
								<Button variant="ghost" size="sm" icon={<DashboardIcon />}>
									Dashboard
								</Button>
							</Link>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									window.open("https://papi.how/getting-started/", "_blank")
								}
								icon={<InfoIcon />}
							>
								Documentation
							</Button>
							<ThemeToggle />
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden flex items-center">
							<Link href="/dashboard">
								<Button variant="ghost" size="sm" icon={<DashboardIcon />}>
									Dashboard
								</Button>
							</Link>
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="p-2 rounded-md transition-colors"
								style={{ color: getColor("textPrimary") }}
								aria-label="Toggle menu"
							>
								{mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
							</button>
						</div>
					</div>

					{/* Mobile navigation */}
					{mobileMenuOpen && (
						<div
							className="md:hidden mt-4 py-3 px-4 rounded-lg animate-fadeIn"
							style={{
								backgroundColor: getColor("surfaceVariant"),
								borderLeft: `3px solid ${getNetworkColor("primary")}`,
							}}
						>
							<div className="flex flex-col gap-4">
								{rightContent && (
									<div className="self-center">{rightContent}</div>
								)}
								<Button
									variant="ghost"
									size="sm"
									fullWidth
									onClick={() =>
										window.open("https://papi.how/getting-started/", "_blank")
									}
									icon={<InfoIcon />}
								>
									Documentation
								</Button>
								<div className="flex justify-center">
									<ThemeToggle />
								</div>
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 overflow-auto">
				<div className="container mx-auto p-4">{children}</div>
			</main>

			{/* Footer */}
			<footer
				className="border-t py-4 px-6 text-sm"
				style={{
					borderColor: getColor("border"),
					color: getColor("textTertiary"),
					backgroundColor: getColor("surfaceVariant"),
				}}
			>
				<div className="container mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Footer left section */}
						<div className="flex flex-col md:flex-row md:items-center gap-2">
							<div className="flex items-center">
								<span className="mr-2 font-medium">
									Polkadot API Playground
								</span>
								<span
									className="px-1.5 py-0.5 text-xs rounded-full mr-2"
									style={{
										backgroundColor: getNetworkColor("primary"),
										color: "#FFFFFF",
									}}
								>
									v{version}
								</span>
								<a
									href={`https://github.com/developerfred/papi-simulator/commit/${gitHash}`}
									target="_blank"
									rel="noopener noreferrer"
									className="px-1.5 py-0.5 text-xs rounded font-mono hover:underline"
									style={{
										backgroundColor: getColor("background"),
										color: getColor("textSecondary"),
										border: `1px solid ${getColor("border")}`,
									}}
									title={`Built at ${formatBuildTime(buildTime)}`}
								>
									#{gitHash}
								</a>
							</div>
							<span className="hidden md:inline mx-2">•</span>
							<span className="text-xs">
								Built with <span className="text-rose-500">❤</span> for the
								Polkadot ecosystem
							</span>
						</div>

						{/* Footer right section */}
						<div className="flex gap-6 justify-start md:justify-end mt-3 md:mt-0">
							<FooterLink
								href="https://github.com/developerfred/papi-simulator"
								label="GitHub"
							/>
							<FooterLink href="https://polkadot.network/" label="Polkadot" />
							<FooterLink href="https://papi.how" label="Documentation" />
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

interface FooterLinkProps {
	href: string;
	label: string;
}

function FooterLink({ href, label }: FooterLinkProps) {
	const { getNetworkColor } = useTheme();

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="hover:underline flex items-center transition-all duration-200 hover:translate-y-[-1px]"
			style={{ color: getNetworkColor("primary") }}
		>
			{label}
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
}