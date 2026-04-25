// Main component
export { BottomSheet } from './components/BottomSheet';
export { BottomSheetModal } from './components/BottomSheetModal/BottomSheetModal';
export { BottomSheetModalProvider } from './components/BottomSheetModalProvider/BottomSheetModalProvider';

// Child components
export { BottomSheetView } from './components/BottomSheetView';
export { BottomSheetScrollView } from './components/BottomSheetScrollView';
export { BottomSheetBackdrop } from './components/BottomSheetBackdrop';
export { BottomSheetHandle } from './components/BottomSheetHandle';

// Hooks
export { useBottomSheet } from './hooks/useBottomSheet';

// Types
export type {
    BottomSheetProps,
    BottomSheetMethods,
    BottomSheetModalProps,
    BottomSheetModalProviderProps,
    BottomSheetBackdropProps,
    BottomSheetHandleProps,
    BottomSheetScrollViewProps,
    BottomSheetViewProps,
    AnimationConfig,
    SnapPoint,
} from './types';

export { KeyboardBehavior, KeyboardDismissMode } from './types';
