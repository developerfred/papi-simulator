/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";

export function WasmPreloader() {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		import("@polkadot-api/descriptors")
			.then(() => {
				console.log("WASM descriptors preloaded");
				setLoaded(true);
			})
			.catch((err) => {
				console.error("Failed to preload WASM descriptors:", err);
			});
	}, []);

	return null;
}
