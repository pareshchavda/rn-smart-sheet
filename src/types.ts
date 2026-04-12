import type { ReactNode, RefObject, ComponentType } from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import type Animated from 'react-native-reanimated';
import type { WithSpringConfig } from 'react-native-reanimated';

/**
 * Animation configuration type
 */
export type AnimationConfig = WithSpringConfig;

/**
 * Snap point can be a percentage string or a number in pixels
 */
export type SnapPoint = string | number;

/**
 * Keyboard behavior modes
 */
export enum KeyboardBehavior {
    /** Sheet extends when keyboard opens */
    EXTEND = 'extend',
    /** Sheet fills available space above keyboard */
    FILL_PARENT = 'fillParent',
    /** Sheet stays in place */
    INTERACTIVE = 'interactive',
}

/**
 * Keyboard dismiss mode
 */
export enum KeyboardDismissMode {
    /** Dismiss keyboard when sheet is dragged */
    ON_DRAG = 'on-drag',
    /** Don't dismiss keyboard */
    NONE = 'none',
}

/**
 * Bottom sheet methods exposed via ref
 */
export interface BottomSheetMethods {
    /**
     * Snap to a specific index
     */
    snapToIndex: (index: number) => void;
    /**
     * Snap to a specific position in pixels
     */
    snapToPosition: (position: number) => void;
    /**
     * Expand to the maximum snap point
     */
    expand: () => void;
    /**
     * Collapse to the minimum snap point
     */
    collapse: () => void;
    /**
     * Close the bottom sheet
     */
    close: () => void;
    /**
     * Force close the bottom sheet (bypass animations)
     */
    forceClose: () => void;
}

/**
 * Bottom sheet props
 */
export interface BottomSheetProps {
    /**
     * Prefer the native Fabric implementation when it is available.
     * Falls back to the JS/Reanimated implementation automatically.
     */
    useNativeDriver?: boolean;
    /**
     * Snap points for the bottom sheet (percentage strings or pixel values)
     */
    snapPoints: SnapPoint[];
    /**
     * Initial snap index (default: 0)
     */
    index?: number;
    /**
     * Enable pan down gesture (default: true)
     */
    enablePanDownToClose?: boolean;
    /**
     * Enable dynamic sizing (default: false)
     */
    enableDynamicSizing?: boolean;
    /**
     * Animation configuration
     */
    animationConfig?: AnimationConfig;
    /**
     * Keyboard behavior (default: INTERACTIVE)
     */
    keyboardBehavior?: KeyboardBehavior;
    /**
     * Keyboard dismiss mode (default: ON_DRAG)
     */
    keyboardDismissMode?: KeyboardDismissMode;
    /**
     * Keyboard blur behavior (default: false)
     */
    keyboardBlurBehavior?: 'none' | 'restore';
    /**
     * Enable handle component (default: true)
     */
    enableHandleComponent?: boolean;
    /**
   * Custom handle component
   */
    handleComponent?: ComponentType<BottomSheetHandleProps>;
    /**
     * Custom backdrop component
     */
    backdropComponent?: ComponentType<BottomSheetBackdropProps> | null;
    /**
     * Background style
     */
    backgroundStyle?: StyleProp<ViewStyle>;
    /**
     * Handle style
     */
    handleStyle?: StyleProp<ViewStyle>;
    /**
     * Handle indicator style
     */
    handleIndicatorStyle?: StyleProp<ViewStyle>;
    /**
     * Container style
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Children components
     */
    children?: ReactNode;
    /**
     * Callback when sheet position changes
     */
    onChange?: (index: number) => void;
    /**
     * Callback when animation starts
     */
    onAnimate?: (fromIndex: number, toIndex: number) => void;
    /**
     * Enable gesture interaction (default: true)
     */
    enableGesture?: boolean;
    /**
     * Over drag resistance factor (default: 0)
     */
    overDragResistanceFactor?: number;
    /**
     * Enable content panning gesture (default: true)
     */
    enableContentPanningGesture?: boolean;
}

/**
 * Bottom sheet backdrop props
 */
export interface BottomSheetBackdropProps {
    /**
     * Animated index
     */
    animatedIndex: Animated.SharedValue<number>;
    /**
     * Animated position
     */
    animatedPosition: Animated.SharedValue<number>;
    /**
     * Backdrop style
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Opacity (default: 0.5)
     */
    opacity?: number;
    /**
     * Enable touch through (default: false)
     */
    enableTouchThrough?: boolean;
    /**
     * Disappears on index (default: -1)
     */
    disappearsOnIndex?: number;
    /**
     * Appears on index (default: 0)
     */
    appearsOnIndex?: number;
    /**
     * Press behavior (default: 'close')
     */
    pressBehavior?: 'none' | 'close' | 'collapse';
}

/**
 * Bottom sheet handle props
 */
export interface BottomSheetHandleProps {
    /**
     * Animated index
     */
    animatedIndex: Animated.SharedValue<number>;
    /**
     * Animated position
     */
    animatedPosition: Animated.SharedValue<number>;
    /**
     * Handle style
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Indicator style
     */
    indicatorStyle?: StyleProp<ViewStyle>;
}

/**
 * Bottom sheet context value
 */
export interface BottomSheetContextValue {
    animatedIndex: Animated.SharedValue<number>;
    animatedPosition: Animated.SharedValue<number>;
    snapToIndex: (index: number) => void;
    snapToPosition: (position: number) => void;
    expand: () => void;
    collapse: () => void;
    close: () => void;
}

/**
 * Bottom sheet scroll view props
 */
export interface BottomSheetScrollViewProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    focusHook?: RefObject<any>;
}

/**
 * Bottom sheet view props
 */
export interface BottomSheetViewProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    focusHook?: RefObject<any>;
}
