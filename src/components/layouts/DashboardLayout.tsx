"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import React, { type ReactNode, useState, useEffect, useCallback, memo, useRef } from "react";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import Link from "next/link";
import { useVersion } from "@/hooks/useVersion";
import { WalletStatus, WalletConnect } from "../wallet/WalletConnect";

interface DashboardLayoutProps {
	children: ReactNode;
	title: string;
	description?: string;
	rightContent?: ReactNode;
	className?: string;
	showScrollEffects?: boolean;
	enableMobileMenu?: boolean;
	showWalletStatus?: boolean;
}

interface FooterLinkProps {
	href: string;
	label: string;
}

const SCROLL_THRESHOLD = 10;
const HEADER_Z_INDEX = 1001;

const EXTERNAL_LINKS = {
	documentation: "https://papi.how/getting-started/",
	github: "https://github.com/developerfred/papi-simulator",
	polkadot: "https://polkadot.network/",
	docs: "https://papi.how"
} as const;

const ICONS = {
	dashboard: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="3" y="3" width="7" height="7" />
			<rect x="14" y="3" width="7" height="7" />
			<rect x="14" y="14" width="7" height="7" />
			<rect x="3" y="14" width="7" height="7" />
		</svg>
	),
	info: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="16" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12.01" y2="8" />
		</svg>
	),
	menu: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<line x1="3" y1="12" x2="21" y2="12" />
			<line x1="3" y1="6" x2="21" y2="6" />
			<line x1="3" y1="18" x2="21" y2="18" />
		</svg>
	),
	close: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
	external: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<polyline points="15 3 21 3 21 9" />
			<line x1="10" y1="14" x2="21" y2="3" />
		</svg>
	),
} as const;

// Componentes reutilizáveis
const LogoIcon = memo(() => {
	const { getNetworkColor } = useTheme();

	return (
		<svg
			width="28"
			height="28"
			className="mr-3 shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
				fill={getNetworkColor("primary")}
			/>
			<path d="M11 7h2v6h-2z" fill={getNetworkColor("primary")} />
			<path d="M11 15h2v2h-2z" fill={getNetworkColor("primary")} />
		</svg>
	);
});

const Icon = ({
	icon,
	size = 16,
	className = "",
	interactive = false,
	...props
}: {
	icon: ReactNode;
	size?: number;
	className?: string;
	interactive?: boolean;
} & React.HTMLAttributes<HTMLElement>) => (
	<span
		className={`inline-flex shrink-0 transition-transform duration-200 ${interactive ? "hover:scale-110 cursor-pointer" : ""
			} ${className}`}
		style={{ width: size, height: size }}
		aria-hidden="true"
		{...props}
	>
		{icon}
	</span>
);

// Hook otimizado de scroll
const useScrolled = (threshold = SCROLL_THRESHOLD, enabled = true) => {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		if (!enabled) return;

		const handleScroll = () => {
			setScrolled(window.scrollY > threshold);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [threshold, enabled]);

	return scrolled;
};

// Formatação de data otimizada
const formatBuildTime = (timeString: string): string => {
	try {
		return new Date(timeString).toLocaleDateString('en-US', {
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


const FooterLink = memo<FooterLinkProps>(({ href, label }) => {
	const { getNetworkColor } = useTheme();

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="hover:underline flex items-center transition-all duration-200 hover:translate-y-[-1px] focus:outline-none rounded-sm"
			style={{ color: getNetworkColor("primary") }}
		>
			{label}
			<Icon icon={ICONS.external} size={12} className="ml-1" />
		</a>
	);
});


const WalletModal = memo<{
	isOpen: boolean;
	onClose: () => void;
}>(({ isOpen, onClose }) => {
	if (!isOpen) return null;
	const { getColor } = useTheme();
	const modalRef = useRef<HTMLDivElement>(null);

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div
				ref={modalRef}
				className="relative z-10 w-full max-w-md mx-4 rounded-lg shadow-xl transition-all duration-300 scale-95 animate-scaleIn"
				style={{
					borderColor: getColor("border"),
				}}
			>	
				<WalletConnect />
			</div>
		</div>
	);
});

// Componente de navegação móvel
const MobileNavigation = memo<{
	isOpen: boolean;
	rightContent?: ReactNode;
	showWalletStatus?: boolean;
	onWalletClick: () => void;
	onClose: () => void;
}>(({ isOpen, rightContent, showWalletStatus = true, onWalletClick, onClose }) => {
	const { getColor, getNetworkColor } = useTheme();

	if (!isOpen) return null;

	const handleDocumentationClick = () => {
		window.open(EXTERNAL_LINKS.documentation, "_blank");
		onClose();
	};

	return (
		<div
			className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
			onClick={onClose}
		>
			<div
				className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-surfaceVariant p-4 shadow-lg transition-transform duration-300 transform translate-x-0"
				style={{
					backgroundColor: getColor("surfaceVariant"),
					borderLeft: `3px solid ${getNetworkColor("primary")}`,
				}}
				onClick={e => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 hover:scale-110 transition-all"
				>
					<Icon icon={ICONS.close} size={24} />
				</button>

				<div className="flex flex-col gap-6 mt-16">
					{showWalletStatus && (
						<button
							onClick={() => {
								onWalletClick();
								onClose();
							}}
							className="flex items-center justify-center transition-transform hover:scale-[1.02]"
						>
							<WalletStatus />
						</button>
					)}

					{rightContent && (
						<div className="self-center transition-transform hover:scale-[1.02]">
							{rightContent}
						</div>
					)}

					<Link href="/dashboard" onClick={onClose}>
						<Button
							variant="ghost"
							size="lg"
							fullWidth
							icon={<Icon icon={ICONS.dashboard} />}
							className="transition-all hover:translate-x-1"
						>
							Dashboard
						</Button>
					</Link>

					<Button
						variant="ghost"
						size="lg"
						fullWidth
						onClick={handleDocumentationClick}
						icon={<Icon icon={ICONS.info} />}
						className="transition-all hover:translate-x-1"
					>
						Documentation
					</Button>

					<div className="flex justify-center mt-4 transition-transform hover:scale-110">
						<ThemeToggle />
					</div>
				</div>
			</div>
		</div>
	);
});

// Componente de cabeçalho otimizado
const Header = memo<{
	title: string;
	description?: string;
	rightContent?: ReactNode;
	scrolled: boolean;
	mobileMenuOpen: boolean;
	showWalletStatus?: boolean;
	onMobileMenuToggle: () => void;
	onWalletClick: () => void;
}>(({
	title,
	description,
	rightContent,
	scrolled,
	mobileMenuOpen,
	showWalletStatus = true,
	onMobileMenuToggle,
	onWalletClick
}) => {
	const { getColor, getNetworkColor } = useTheme();

	const handleDocumentationClick = () => {
		window.open(EXTERNAL_LINKS.documentation, "_blank");
	};

	return (
		<header
			className={`sticky top-0 border-b p-4 transition-all duration-300 ${scrolled ? "shadow-md backdrop-blur-md bg-opacity-90" : ""
				}`}
			style={{
				borderColor: getColor("border"),
				backgroundColor: scrolled ? `${getColor("background")}EE` : getColor("background"),
				zIndex: HEADER_Z_INDEX
			}}
		>
			<div className="container mx-auto">
				<div className="flex justify-between items-center">
					<div className="flex items-center min-w-0 flex-1">
						<LogoIcon />
						<div className="min-w-0">
							<h1 className="text-xl md:text-2xl font-bold leading-tight truncate">
								{title}
							</h1>
							{description && (
								<p
									className="text-xs md:text-sm opacity-70 mt-0.5 truncate transition-colors"
									style={{ color: getColor("textSecondary") }}
								>
									{description}
								</p>
							)}
						</div>
					</div>

					<div className="hidden md:flex items-center gap-3">
						{showWalletStatus && (
							<button
								onClick={onWalletClick}
								className="transition-transform hover:scale-[1.02]"
							>
								<WalletStatus />
							</button>
						)}

						{rightContent && (
							<div className="transition-transform hover:scale-[1.02]">
								{rightContent}
							</div>
						)}

						<Link href="/dashboard">
							<Button
								variant="ghost"
								size="sm"
								icon={<Icon icon={ICONS.dashboard} />}
								className="transition-all hover:-translate-y-0.5"
							>
								Dashboard
							</Button>
						</Link>

						<Button
							variant="ghost"
							size="sm"
							onClick={handleDocumentationClick}
							icon={<Icon icon={ICONS.info} />}
							className="transition-all hover:-translate-y-0.5"
						>
							Documentation
						</Button>

						<div className="transition-transform hover:scale-110">
							<ThemeToggle />
						</div>
					</div>

					<div className="md:hidden flex items-center gap-2">
						<button
							onClick={onMobileMenuToggle}
							className="p-2 rounded-md transition-all focus:outline-none hover:scale-110"
							style={{
								color: getColor("textPrimary"),
							}}
							aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
							aria-expanded={mobileMenuOpen}
						>
							<Icon
								icon={mobileMenuOpen ? ICONS.close : ICONS.menu}
								size={24}
								interactive
							/>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
});

// Componente de rodapé otimizado
const Footer = memo(() => {
	const { getColor, getNetworkColor } = useTheme();
	const { version, gitHash, buildTime } = useVersion();

	const gitCommitUrl = `${EXTERNAL_LINKS.github}/commit/${gitHash}`;
	const formattedBuildTime = formatBuildTime(buildTime);

	return (
		<footer
			className="border-t py-4 px-6 text-sm transition-colors"
			style={{
				borderColor: getColor("border"),
				color: getColor("textTertiary"),
				backgroundColor: getColor("surfaceVariant"),
			}}
		>
			<div className="container mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="flex flex-wrap items-center justify-center gap-2">
						<span className="font-medium whitespace-nowrap">
							Polkadot API Playground
						</span>
						<span
							className="px-1.5 py-0.5 text-xs rounded-full transition-colors"
							style={{
								backgroundColor: getNetworkColor("primary"),
								color: "#FFFFFF",
							}}
						>
							v{version}
						</span>
						<a
							href={gitCommitUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="px-1.5 py-0.5 text-xs rounded font-mono hover:underline transition-all"
							style={{
								backgroundColor: getColor("background"),
								color: getColor("textSecondary"),
								border: `1px solid ${getColor("border")}`,
							}}
							title={`Built at ${formattedBuildTime}`}
						>
							#{gitHash}
						</a>
						<span className="text-xs hidden md:inline">
							Built with <span className="text-rose-500">❤</span> for Polkadot
						</span>
					</div>

					<div className="flex gap-6">
						<FooterLink href={EXTERNAL_LINKS.github} label="GitHub" />
						<FooterLink href={EXTERNAL_LINKS.polkadot} label="Polkadot" />
						<FooterLink href={EXTERNAL_LINKS.docs} label="Documentation" />
					</div>
				</div>
			</div>
		</footer>
	);
});

// Componente principal otimizado
const DashboardLayout = memo<DashboardLayoutProps>(({
	children,
	title,
	description,
	rightContent,
	className = "",
	showScrollEffects = true,
	enableMobileMenu = true,
	showWalletStatus = true
}) => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [walletModalOpen, setWalletModalOpen] = useState(false);
	const scrolled = useScrolled(SCROLL_THRESHOLD, showScrollEffects);

	const handleMobileMenuToggle = useCallback(() => {
		setMobileMenuOpen(prev => !prev);
	}, []);

	const handleWalletModalToggle = useCallback(() => {
		setWalletModalOpen(prev => !prev);
	}, []);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768 && mobileMenuOpen) {
				setMobileMenuOpen(false);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [mobileMenuOpen]);

	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	}, [mobileMenuOpen]);

	return (
		<div className={`flex flex-col min-h-screen bg-background ${className}`}>
			<Header
				title={title}
				description={description}
				rightContent={rightContent}
				scrolled={scrolled}
				mobileMenuOpen={mobileMenuOpen}
				showWalletStatus={showWalletStatus}
				onMobileMenuToggle={handleMobileMenuToggle}
				onWalletClick={handleWalletModalToggle}
			/>

			<main className="flex-1 overflow-auto transition-all duration-300">
				<div className="container mx-auto p-4 pb-20 md:pb-4">{children}</div>
			</main>

			<Footer />

			<WalletModal
				isOpen={walletModalOpen}
				onClose={handleWalletModalToggle}
			/>

			<MobileNavigation
				isOpen={mobileMenuOpen && enableMobileMenu}
				rightContent={rightContent}
				showWalletStatus={showWalletStatus}
				onWalletClick={handleWalletModalToggle}
				onClose={handleMobileMenuToggle}
			/>
		</div>
	);
});

// Display names para debugging
LogoIcon.displayName = 'LogoIcon';
FooterLink.displayName = 'FooterLink';
WalletModal.displayName = 'WalletModal';
MobileNavigation.displayName = 'MobileNavigation';
Header.displayName = 'Header';
Footer.displayName = 'Footer';
DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;