interface Window {
    injectedWeb3?: Record<string, {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        enable: (originName: string) => Promise<any>;
        version: string;
    }>;
}