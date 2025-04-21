export function setupGlobalPromiseErrorHandler() {
	if (typeof window !== "undefined") {		
		window.addEventListener("unhandledrejection", (event) => {
			console.error("🔴 Unhandled Promise Rejection:", event.reason);			
			event.preventDefault();						
		});
	}
}


export function safeFetch<T>(promise: Promise<T>): Promise<T | null> {
	return promise.catch((error) => {
		console.error("🔴 Safe promise error:", error);
		return null;
	});
}


export async function safePromise<T>(promise: Promise<T>): Promise<{
	data: T | null;
	error: Error | null;
}> {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		console.error("🔴 Safe promise error:", error);
		return {
			data: null,
			error: error instanceof Error ? error : new Error(String(error)),
		};
	}
}
