/* eslint-disable react-hooks/rules-of-hooks, @typescript-eslint/no-unused-vars,  @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import type React from "react";
import { type ReactNode, useState, useEffect, useCallback, memo, useRef, useMemo, lazy } from "react";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import Link from "next/link";
import { useVersion } from "@/hooks/useVersion";
import { WalletStatus, WalletConnect } from "../wallet/WalletConnect";


const LazyWalletConnect = lazy(() =>
	import("../wallet/WalletConnect").then(module => ({ default: module.WalletConnect }))
);

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
const RESIZE_DEBOUNCE_MS = 100;

const EXTERNAL_LINKS = {
	documentation: "https://papi.how/getting-started/",
	github: "https://github.com/developerfred/papi-simulator",
	polkadot: "https://polkadot.network/",
	docs: "https://papi.how"
} as const;


const DashboardIcon = memo(() => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<rect x="3" y="3" width="7" height="7" />
		<rect x="14" y="3" width="7" height="7" />
		<rect x="14" y="14" width="7" height="7" />
		<rect x="3" y="14" width="7" height="7" />
	</svg>
));

const InfoIcon = memo(() => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="16" x2="12" y2="12" />
		<line x1="12" y1="8" x2="12.01" y2="8" />
	</svg>
));

const MenuIcon = memo(() => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<line x1="3" y1="12" x2="21" y2="12" />
		<line x1="3" y1="6" x2="21" y2="6" />
		<line x1="3" y1="18" x2="21" y2="18" />
	</svg>
));

const CloseIcon = memo(() => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
));

const ExternalIcon = memo(() => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
		<polyline points="15 3 21 3 21 9" />
		<line x1="10" y1="14" x2="21" y2="3" />
	</svg>
));


const LogoIcon = memo(() => {
	const { getNetworkColor } = useTheme();
	const primaryColor = useMemo(() => getNetworkColor("primary"), [getNetworkColor]);

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
				fill={primaryColor}
			/>
			<path d="M11 7h2v6h-2z" fill={primaryColor} />
			<path d="M11 15h2v2h-2z" fill={primaryColor} />
		</svg>
	);
});


const Icon = memo<{
	children: ReactNode;
	size?: number;
	className?: string;
	interactive?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>>(({
	children,
	size = 16,
	className = "",
	interactive = false,
	...props
}) => (
	<span
		className={`inline-flex shrink-0 transition-transform duration-200 ${interactive ? "hover:scale-110 cursor-pointer" : ""
			} ${className}`}
		style={{ width: size, height: size }}
		aria-hidden="true"
		{...props}
	>
		{children}
	</span>
));


const useScrolled = (threshold = SCROLL_THRESHOLD, enabled = true) => {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		if (!enabled) return;

		let timeoutId: NodeJS.Timeout;

		const handleScroll = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				setScrolled(window.scrollY > threshold);
			}, 16); // ~60fps
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("scroll", handleScroll);
		};
	}, [threshold, enabled]);

	return scrolled;
};

// Hook de debounce otimizado
const useDebounce = (callback: () => void, delay: number) => {
	const timeoutRef = useRef<NodeJS.Timeout>();

	return useCallback(() => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(callback, delay);
	}, [callback, delay]);
};

// Formatação de data com cache
const formatBuildTime = (() => {
	const cache = new Map<string, string>();

	return (timeString: string): string => {
		if (cache.has(timeString)) {
			return cache.get(timeString)!;
		}

		try {
			const formatted = new Date(timeString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
			cache.set(timeString, formatted);
			return formatted;
		} catch {
			cache.set(timeString, timeString);
			return timeString;
		}
	};
})();

// FooterLink otimizado
const FooterLink = memo<FooterLinkProps>(({ href, label }) => {
	const { getNetworkColor } = useTheme();
	const primaryColor = useMemo(() => getNetworkColor("primary"), [getNetworkColor]);

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="hover:underline flex items-center transition-all duration-200 hover:translate-y-[-1px] focus:outline-none rounded-sm"
			style={{ color: primaryColor }}
		>
			{label}
			<Icon size={12} className="ml-1">
				<ExternalIcon />
			</Icon>
		</a>
	);
});

// Modal de carteira otimizado
const WalletModal = memo<{
	isOpen: boolean;
	onClose: () => void;
}>(({ isOpen, onClose }) => {
	const { getColor } = useTheme();
	const modalRef = useRef<HTMLDivElement>(null);

	// Early return para não renderizar quando fechado
	if (!isOpen) return null;

	const borderColor = useMemo(() => getColor("border"), [getColor]);

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
				style={{ borderColor }}
			>
				<LazyWalletConnect />
			</div>
		</div>
	);
});

// Navegação móvel otimizada
const MobileNavigation = memo<{
	isOpen: boolean;
	rightContent?: ReactNode;
	showWalletStatus?: boolean;
	onWalletClick: () => void;
	onClose: () => void;
}>(({ isOpen, rightContent, showWalletStatus = true, onWalletClick, onClose }) => {
	const { getColor, getNetworkColor } = useTheme();

	if (!isOpen) return null;

	const surfaceVariantColor = useMemo(() => getColor("surfaceVariant"), [getColor]);
	const primaryColor = useMemo(() => getNetworkColor("primary"), [getNetworkColor]);

	const handleDocumentationClick = useCallback(() => {
		window.open(EXTERNAL_LINKS.documentation, "_blank");
		onClose();
	}, [onClose]);

	const handleWalletClick = useCallback(() => {
		onWalletClick();
		onClose();
	}, [onWalletClick, onClose]);

	return (
		<div
			className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
			onClick={onClose}
		>
			<div
				className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-surfaceVariant p-4 shadow-lg transition-transform duration-300 transform translate-x-0"
				style={{
					backgroundColor: surfaceVariantColor,
					borderLeft: `3px solid ${primaryColor}`,
				}}
				onClick={e => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 hover:scale-110 transition-all"
					aria-label="Close menu"
				>
					<Icon size={24}>
						<CloseIcon />
					</Icon>
				</button>

				<div className="flex flex-col gap-6 mt-16">
					{showWalletStatus && (
						<button
							onClick={handleWalletClick}
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
							icon={<Icon><DashboardIcon /></Icon>}
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
						icon={<Icon><InfoIcon /></Icon>}
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

// Header otimizado
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
	const { getColor } = useTheme();

	const handleDocumentationClick = useCallback(() => {
		window.open(EXTERNAL_LINKS.documentation, "_blank");
	}, []);

	const colors = useMemo(() => ({
		border: getColor("border"),
		background: getColor("background"),
		textSecondary: getColor("textSecondary"),
		textPrimary: getColor("textPrimary")
	}), [getColor]);

	const headerStyle = useMemo(() => ({
		borderColor: colors.border,
		backgroundColor: scrolled ? `${colors.background}EE` : colors.background,
		zIndex: HEADER_Z_INDEX
	}), [colors, scrolled]);

	return (
		<header
			className={`sticky top-0 border-b p-4 transition-all duration-300 ${scrolled ? "shadow-md backdrop-blur-md bg-opacity-90" : ""
				}`}
			style={headerStyle}
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
									style={{ color: colors.textSecondary }}
								>
									{description}
								</p>
							)}
						</div>
					</div>

					{/* Desktop Navigation */}
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
								icon={<Icon><DashboardIcon /></Icon>}
								className="transition-all hover:-translate-y-0.5"
							>
								Dashboard
							</Button>
						</Link>

						<Button
							variant="ghost"
							size="sm"
							onClick={handleDocumentationClick}
							icon={<Icon><InfoIcon /></Icon>}
							className="transition-all hover:-translate-y-0.5"
						>
							Documentation
						</Button>

						<div className="transition-transform hover:scale-110">
							<ThemeToggle />
						</div>
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center gap-2">
						<button
							onClick={onMobileMenuToggle}
							className="p-2 rounded-md transition-all focus:outline-none hover:scale-110"
							style={{ color: colors.textPrimary }}
							aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
							aria-expanded={mobileMenuOpen}
						>
							<Icon size={24} interactive>
								{mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
							</Icon>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
});

// Footer otimizado
const Footer = memo(() => {
	const { getColor, getNetworkColor } = useTheme();
	const { version, gitHash, buildTime } = useVersion();

	const colors = useMemo(() => ({
		border: getColor("border"),
		textTertiary: getColor("textTertiary"),
		surfaceVariant: getColor("surfaceVariant"),
		background: getColor("background"),
		textSecondary: getColor("textSecondary"),
		primary: getNetworkColor("primary")
	}), [getColor, getNetworkColor]);

	const gitCommitUrl = useMemo(() =>
		`${EXTERNAL_LINKS.github}/commit/${gitHash}`,
		[gitHash]
	);

	const formattedBuildTime = useMemo(() =>
		formatBuildTime(buildTime),
		[buildTime]
	);

	return (
		<footer
			className="border-t py-4 px-6 text-sm transition-colors"
			style={{
				borderColor: colors.border,
				color: colors.textTertiary,
				backgroundColor: colors.surfaceVariant,
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
								backgroundColor: colors.primary,
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
								backgroundColor: colors.background,
								color: colors.textSecondary,
								border: `1px solid ${colors.border}`,
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

	// Debounced resize handler
	const debouncedResize = useDebounce(() => {
		if (window.innerWidth >= 768 && mobileMenuOpen) {
			setMobileMenuOpen(false);
		}
	}, RESIZE_DEBOUNCE_MS);

	useEffect(() => {
		window.addEventListener('resize', debouncedResize);
		return () => window.removeEventListener('resize', debouncedResize);
	}, [debouncedResize, mobileMenuOpen]);

	// Body overflow control
	useEffect(() => {
		if (mobileMenuOpen || walletModalOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	}, [mobileMenuOpen, walletModalOpen]);

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
				<div className="container mx-auto p-4 pb-20 md:pb-4">
					{children}
				</div>
			</main>

			<Footer />

			{/* Renderização condicional otimizada */}
			{walletModalOpen && (
				<WalletModal
					isOpen={walletModalOpen}
					onClose={handleWalletModalToggle}
				/>
			)}

			{(mobileMenuOpen && enableMobileMenu) && (
				<MobileNavigation
					isOpen={mobileMenuOpen}
					rightContent={rightContent}
					showWalletStatus={showWalletStatus}
					onWalletClick={handleWalletModalToggle}
					onClose={handleMobileMenuToggle}
				/>
			)}
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
Icon.displayName = 'Icon';
DashboardIcon.displayName = 'DashboardIcon';
InfoIcon.displayName = 'InfoIcon';
MenuIcon.displayName = 'MenuIcon';
CloseIcon.displayName = 'CloseIcon';
ExternalIcon.displayName = 'ExternalIcon';

export default DashboardLayout;