import { useBottomSheetInternal } from '../contexts/BottomSheetContext';

/**
 * Hook to access bottom sheet methods and state
 * 
 * @example
 * ```tsx
 * const { snapToIndex, expand, close } = useBottomSheet();
 * ```
 */
export const useBottomSheet = () => {
    return useBottomSheetInternal();
};
