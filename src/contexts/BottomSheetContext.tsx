import { createContext, useContext } from 'react';
import type { BottomSheetContextValue } from '../types';

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

export const BottomSheetProvider = BottomSheetContext.Provider;

/**
 * Hook to access bottom sheet context
 * Must be used within a BottomSheet component
 */
export const useBottomSheetInternal = (): BottomSheetContextValue => {
    const context = useContext(BottomSheetContext);

    if (!context) {
        throw new Error(
            'useBottomSheetInternal must be used within a BottomSheet component'
        );
    }

    return context;
};
