import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const createImmerStore = <T>(
	initialState: T,
	storeName?: string,
	persistOptions?: {
		whitelist?: (keyof T)[];
		blacklist?: (keyof T)[];
	},
) => {
	
	if (!storeName) {
		return create<T>(immer(() => initialState));
	}

	
	const getStorage = () => {
		return {
			...createJSONStorage(() => localStorage),
			partialize: (state: T) => {
				
				if (!persistOptions) return state;

				
				if (persistOptions.whitelist) {
					return Object.fromEntries(
						Object.entries(state).filter(([key]) =>
							persistOptions.whitelist!.includes(key as keyof T),
						),
					);
				}

				
				if (persistOptions.blacklist) {
					return Object.fromEntries(
						Object.entries(state).filter(
							([key]) => !persistOptions.blacklist!.includes(key as keyof T),
						),
					);
				}

				return state;
			},
		};
	};

	
	return create<T>()(
		persist(
			immer(() => initialState),
			{
				name: storeName,
				storage: getStorage(),
			},
		),
	);
};
