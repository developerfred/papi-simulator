import Spinner from "@/components/ui/Spinner";
import React from "react";

export default function LoadingState() {
	return (
		<div className="h-screen w-screen flex items-center justify-center">
			<Spinner size="lg" className="mr-2" />
			<div className="flex flex-col items-center">
				<span>Loading Polkadot API Playground...</span>
				<span className="text-xs mt-1 opacity-70">
					Preparing your development environment
				</span>
			</div>
		</div>
	);
}
