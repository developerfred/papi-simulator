"use client";

import type { FC, ReactNode } from "react";
import { useChainStore } from "@/store/useChainStore";
import { z } from "zod";


const SizeSchema = z.enum(["sm", "md", "lg"]);
type Size = z.infer<typeof SizeSchema>;


const NetworkStatusPropsSchema = z.object({
    size: SizeSchema.optional().default("md"),
    className: z.string().optional().default("")
});


const DisconnectedPropsSchema = z.object({
    message: z.string()
});


type NetworkStatusProps = z.infer<typeof NetworkStatusPropsSchema>;
type DisconnectedProps = z.infer<typeof DisconnectedPropsSchema>;


const SIZE_CLASSES = {
    sm: "h-4 w-4 text-xs",
    md: "h-5 w-5 text-sm",
    lg: "h-6 w-6 text-base",
} as const;


const NetworkStatus: FC<NetworkStatusProps> & {
    Disconnected: FC<DisconnectedProps>;
} = ({ size = "md", className = "" }) => {
    const { connectionStatus, network } = useChainStore();
    const isConnected = connectionStatus.state === "connected";

    const statusColor = isConnected ? "bg-green-500" : "bg-orange-500";

    return (
        <div className={`flex items-center ${className}`}>
            <div className={`relative ${SIZE_CLASSES[size]} mr-1.5`}>
                <div className={`absolute rounded-full ${statusColor} h-full w-full opacity-20 animate-pulse`} />
                <div className={`absolute rounded-full ${statusColor} h-2/5 w-2/5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
            </div>
            <span className={SIZE_CLASSES[size]}>
                {isConnected ? network.name : "Not Connected"}
            </span>
        </div>
    );
};

// Sub-componente para estado desconectado
NetworkStatus.Disconnected = ({ message }: DisconnectedProps) => (
    <div className="p-8 text-center">
        <div className="mb-4 text-orange-500">
            <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto"
                aria-label="Disconnected Network Alert"
            >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Not Connected to Blockchain</h3>
        <p className="text-theme-secondary mb-4">{message}</p>
    </div>
);

// Exportar como componente nomeado e default para maior flexibilidade
export { NetworkStatus };
export default NetworkStatus;