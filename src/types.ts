import type { ReactNode, RefObject, ComponentType } from 'react';
import { Animated, type ViewStyle, type StyleProp } from 'react-native';

export type WithSpringConfig = Record<string, any>;

export type AnimationConfig = WithSpringConfig;

export type SnapPoint = string | number;

export enum KeyboardBehavior {
    EXTEND = 'extend',
    FILL_PARENT = 'fillParent',
    INTERACTIVE = 'interactive',
}

export enum KeyboardDismissMode {
    ON_DRAG = 'on-drag',
    NONE = 'none',
}

export interface BottomSheetMethods {
    snapToIndex: (index: number) => void;
    snapToPosition: (position: number) => void;
    expand: () => void;
    collapse: () => void;
    close: () => void;
    forceClose: () => void;
}

export interface BottomSheetProps {
    useNativeDriver?: boolean;
    snapPoints?: SnapPoint[];
    index?: number;
    enablePanDownToClose?: boolean;
    enableDynamicSizing?: boolean;
    maxDynamicContentSize?: number;
    animationConfig?: AnimationConfig;
    keyboardBehavior?: KeyboardBehavior;
    keyboardDismissMode?: KeyboardDismissMode;
    keyboardBlurBehavior?: 'none' | 'restore';
    keyboardOffset?: number;
    topInset?: number;
    bottomInset?: number;
    enableHandleComponent?: boolean;
    handleComponent?: ComponentType<BottomSheetHandleProps>;
    backdropComponent?: ComponentType<BottomSheetBackdropProps> | null;
    backgroundStyle?: StyleProp<ViewStyle>;
    handleStyle?: StyleProp<ViewStyle>;
    handleIndicatorStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    children?: ReactNode;
    onChange?: (index: number) => void;
    onAnimate?: (fromIndex: number, toIndex: number) => void;
    enableGesture?: boolean;
    overDragResistanceFactor?: number;
    enableContentPanningGesture?: boolean;
}

export interface BottomSheetBackdropProps {
    animatedIndex: Animated.Value;
    animatedPosition: Animated.Value;
    index?: number;
    style?: StyleProp<ViewStyle>;
    opacity?: number;
    enableTouchThrough?: boolean;
    disappearsOnIndex?: number;
    appearsOnIndex?: number;
    pressBehavior?: 'none' | 'close' | 'collapse';
    onPress?: () => void;
}

export interface BottomSheetHandleProps {
    animatedIndex: Animated.Value;
    animatedPosition: Animated.Value;
    style?: StyleProp<ViewStyle>;
    indicatorStyle?: StyleProp<ViewStyle>;
}

export interface BottomSheetContextValue {
    animatedIndex: Animated.Value;
    animatedPosition: Animated.Value;
    snapToIndex: (index: number) => void;
    snapToPosition: (position: number) => void;
    expand: () => void;
    collapse: () => void;
    close: () => void;
    resolvedSnapPoints: number[];
}

export interface BottomSheetScrollViewProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    focusHook?: RefObject<any>;
}

export interface BottomSheetViewProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    focusHook?: RefObject<any>;
}
export interface BottomSheetModalProps extends BottomSheetProps {
    name?: string;
}

export interface BottomSheetModalProviderProps {
    children: ReactNode;
}
