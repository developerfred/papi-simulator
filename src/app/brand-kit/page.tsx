/* eslint-disable @typescript-eslint/ban-ts-comment, react/no-unescaped-entities */
// @ts-nocheck
'use client';

import { useState, useRef, type ComponentType } from 'react';
import { Download, Copy, Check, XCircle, ShieldCheck } from 'lucide-react';


const generateSvgString = (type: 'complete' | 'symbol', theme: 'light' | 'dark'): string => {
    const isDark = theme === 'dark';
    const primaryColor = isDark ? '#FFFFFF' : '#1e293b';
    const secondaryColor = isDark ? '#cbd5e1' : '#64748b';

    if (type === 'symbol') {
        return `<svg viewBox="0 0 130 100" xmlns="http://www.w3.org/2000/svg"><g><path d="M 5 20 L 40 50 L 5 80 Z" fill="#E6007A"/><text x="60" y="80" font-family="Inter, sans-serif" font-size="80" font-weight="800" fill="${primaryColor}">P</text><circle cx="88" cy="50" r="10" fill="#E6007A" /></g></svg>`;
    }

    return `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg"><g id="logomark"><path d="M 5 20 L 40 50 L 5 80 Z" fill="#E6007A"/><text x="60" y="80" font-family="Inter, sans-serif" font-size="80" font-weight="800" fill="${primaryColor}">P</text><circle cx="88" cy="50" r="10" fill="#E6007A" /></g><g id="logotype" transform="translate(170, 0)"><text x="0" y="55" font-family="Inter, sans-serif" font-size="40" font-weight="800" fill="${primaryColor}">PAPI</text><text x="0" y="85" font-family="Inter, sans-serif" font-size="18" font-weight="500" fill="${secondaryColor}" letter-spacing="0.2em">SIMULATOR</text></g></svg>`;
};



type LogoProps = { theme?: 'light' | 'dark' };

const LogoCompleto: React.FC<LogoProps> = ({ theme = 'light' }) => {
    const isDark = theme === 'dark';
    return (
        <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" aria-label={`PAPI Simulator Primary Logo ${isDark ? 'White Version' : ''}`}>
            <g id="logomark"><path d="M 5 20 L 40 50 L 5 80 Z" fill="#E6007A" /><text x="60" y="80" fontFamily="Inter, sans-serif" fontSize="80" fontWeight="800" fill={isDark ? "#FFFFFF" : "#1e293b"}>P</text><circle cx="88" cy="50" r="10" fill="#E6007A" /></g>
            <g id="logotype" transform="translate(170, 0)"><text x="0" y="55" fontFamily="Inter, sans-serif" fontSize="40" fontWeight="800" fill={isDark ? "#FFFFFF" : "#1e293b"}>PAPI</text><text x="0" y="85" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="500" fill={isDark ? "#cbd5e1" : "#64748b"} letterSpacing="0.2em">SIMULATOR</text></g>
        </svg>
    );
};

const Simbolo: React.FC<LogoProps> = ({ theme = 'light' }) => {
    const isDark = theme === 'dark';
    return (
        <svg viewBox="0 0 130 100" xmlns="http://www.w3.org/2000/svg" aria-label={`PAPI Simulator Symbol ${isDark ? 'White Version' : ''}`}>
            <g><path d="M 5 20 L 40 50 L 5 80 Z" fill="#E6007A" /><text x="60" y="80" fontFamily="Inter, sans-serif" fontSize="80" fontWeight="800" fill={isDark ? "#FFFFFF" : "#1e293b"}>P</text><circle cx="88" cy="50" r="10" fill="#E6007A" /></g>
        </svg>
    );
};


interface LogoCardProps {
    title: string;
    LogoComponent: ComponentType<LogoProps>;
    svgContent: string;
    fileName: string;
    isDark?: boolean;
}

const LogoCard: React.FC<LogoCardProps> = ({ title, LogoComponent, svgContent, fileName, isDark = false }) => {
    const [copied, setCopied] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const theme = isDark ? 'dark' : 'light';

    const handleCopy = () => {
        navigator.clipboard.writeText(svgContent.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (format: 'svg' | 'png', size?: number) => {
        let url: string | null = null;
        try {
            if (format === 'svg') {
                const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileName}.svg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else if (format === 'png' && size) {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (!ctx || !canvas) {
                    console.error("Canvas context is not available.");
                    return;
                }
                const img = new Image();
                const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
                url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    // Validate image dimensions before calculations
                    if (img.width > 0 && img.height > 0) {
                        const aspectRatio = img.width / img.height;
                        canvas.width = size;
                        canvas.height = size / aspectRatio;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const pngUrl = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = pngUrl;
                        a.download = `${fileName}_${size}px.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    } else {
                        console.error("Failed to process SVG: Invalid image dimensions (width or height is zero).");
                    }
                };

                img.onerror = () => {
                    console.error("Failed to load SVG image for canvas conversion.");
                };

                img.src = url;
            }
        } catch (error) {
            console.error("An error occurred during the download process:", error);
        } finally {            
            if (url) {
                URL.revokeObjectURL(url);
            }
        }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-800">
            <div className={`p-8 sm:p-12 flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="w-48 h-24"> <LogoComponent theme={theme} /> </div>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => handleDownload('svg')} className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-3 rounded-lg transition-colors"> <Download size={16} /> SVG </button>
                    <button onClick={() => handleDownload('png', 512)} className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-3 rounded-lg transition-colors"> <Download size={16} /> PNG (512px) </button>
                    <button onClick={() => handleDownload('png', 1024)} className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-3 rounded-lg transition-colors"> <Download size={16} /> PNG (1024px) </button>
                    <button onClick={handleCopy} className={`flex items-center gap-2 text-sm ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'} font-medium py-2 px-3 rounded-lg transition-colors`}> {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy SVG'} </button>
                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};


const ColorPalette = () => {
    const colors = [
        { name: 'Polkadot Pink', hex: '#E6007A', text: 'white' }, { name: 'Slate Dark', hex: '#1e293b', text: 'white' },
        { name: 'Slate Medium', hex: '#64748b', text: 'white' }, { name: 'Slate Light', hex: '#f8fafc', text: 'black' },
    ];
    const [copiedHex, setCopiedHex] = useState('');
    const handleCopy = (hex: string) => { navigator.clipboard.writeText(hex); setCopiedHex(hex); setTimeout(() => setCopiedHex(''), 2000); };
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {colors.map(color => (
                <div key={color.name} className="rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div style={{ backgroundColor: color.hex, color: `var(--color-${color.text})` }} className="h-24 sm:h-32 p-4 flex flex-col justify-end"> <h3 className="font-bold text-lg">{color.name}</h3> </div>
                    <div className="p-4 flex justify-between items-center"> <span className="font-mono text-slate-600 dark:text-slate-400">{color.hex}</span> <button onClick={() => handleCopy(color.hex)} title={`Copy ${color.hex}`}>{copiedHex === color.hex ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-slate-400 hover:text-slate-600" />}</button> </div>
                </div>
            ))}
        </div>
    );
};


export default function BrandKitPage() {
    const logoAssets: Omit<LogoCardProps, 'svgContent'>[] = [
        { title: 'Primary Logo', LogoComponent: LogoCompleto, fileName: 'papi_simulator_logo_primary' },
        { title: 'Primary Logo (White Version)', LogoComponent: LogoCompleto, fileName: 'papi_simulator_logo_primary_white', isDark: true },
        { title: 'Symbol (Icon)', LogoComponent: Simbolo, fileName: 'papi_simulator_symbol' },
        { title: 'Symbol (White Version)', LogoComponent: Simbolo, fileName: 'papi_simulator_symbol_white', isDark: true },
    ];

    return (
        <main className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans">
            <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
                <header className="text-center max-w-3xl mx-auto mb-16">
                    <div className="w-48 mx-auto mb-6 text-slate-900 dark:text-white"> <Simbolo theme="light" /> </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">PAPI Simulator Brand Kit</h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400"> Welcome to the PAPI Simulator brand resource hub. Here you'll find our logos, colors, and guidelines to ensure our brand is represented consistently. </p>
                </header>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">Logos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {logoAssets.map(asset => {
                            const theme = asset.isDark ? 'dark' : 'light';
                            const type = asset.title.includes('Symbol') ? 'symbol' : 'complete';
                            return <LogoCard key={asset.fileName} {...asset} svgContent={generateSvgString(type, theme)} />;
                        })}
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">Color Palette</h2>
                    <ColorPalette />
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">Typography</h2>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Inter</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 mb-6">Our visual identity uses the Inter font family, known for its excellent legibility in user interfaces. It's an open-source font and can be obtained for free from Google Fonts.</p>
                        <div className="flex items-baseline gap-x-8 gap-y-4 flex-wrap text-slate-700 dark:text-slate-300"> <div className="font-medium">Regular</div> <div className="font-semibold">SemiBold</div> <div className="font-bold">Bold</div> <div className="font-extrabold">ExtraBold</div> </div>
                        <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors"> Get Inter on Google Fonts </a>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">Usage Guidelines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-4"> <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full"> <ShieldCheck className="text-green-600 dark:text-green-400" size={24} /> </div> <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Do's</h3> </div>
                            <ul className="space-y-3 text-slate-600 dark:text-slate-400 list-disc list-inside"> <li>Use the primary logo whenever space permits.</li> <li>Maintain a clear space around the logo (at least 50% of the logo's height).</li> <li>Use the white version on dark backgrounds to ensure contrast.</li> <li>Always maintain the original proportions of the logo.</li> </ul>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-4"> <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full"> <XCircle className="text-red-600 dark:text-red-400" size={24} /> </div> <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Don'ts</h3> </div>
                            <ul className="space-y-3 text-slate-600 dark:text-slate-400 list-disc list-inside"> <li>Do not distort or alter the logo's proportions.</li> <li>Do not change the logo's colors.</li> <li>Do not add shadows, gradients, or other visual effects.</li> <li>Do not use the logo on backgrounds that compromise its legibility.</li> </ul>
                        </div>
                    </div>
                </section>
            </div>
            <footer className="text-center py-8 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} PAPI Simulator. All rights reserved.</p>
            </footer>
        </main>
    );
}
