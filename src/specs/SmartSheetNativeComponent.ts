import type * as React from 'react';
import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
    DirectEventHandler,
    Double,
    Int32,
    WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

export const COMPONENT_NAME = 'RNSmartSheetView';

export type SheetChangeEvent = Readonly<{
    index: Int32;
    position: Double;
}>;

export type SheetAnimateEvent = Readonly<{
    fromIndex: Int32;
    toIndex: Int32;
}>;

export type SheetPositionEvent = Readonly<{
    position: Double;
}>;

export type SpringConfig = Readonly<{
    damping?: Double;
    stiffness?: Double;
    mass?: Double;
    velocity?: Double;
    overshootClamping?: boolean;
    restDisplacementThreshold?: Double;
    restSpeedThreshold?: Double;
}>;

export interface NativeProps extends ViewProps {
    snapPoints: ReadonlyArray<Double>;
    initialIndex?: WithDefault<Int32, 0>;
    enablePanDownToClose?: WithDefault<boolean, true>;
    enableGesture?: WithDefault<boolean, true>;
    overDragResistanceFactor?: WithDefault<Double, 0>;
    enableDynamicSizing?: WithDefault<boolean, false>;
    keyboardBehavior?: WithDefault<string, 'interactive'>;
    keyboardDismissMode?: WithDefault<string, 'on-drag'>;
    springConfig?: SpringConfig;
    onSheetChange?: DirectEventHandler<SheetChangeEvent>;
    onSheetAnimate?: DirectEventHandler<SheetAnimateEvent>;
    onSheetPositionChange?: DirectEventHandler<SheetPositionEvent>;
}

interface NativeCommands {
    snapToIndex: (
        viewRef: React.ElementRef<HostComponent<NativeProps>>,
        index: Int32
    ) => void;
    snapToPosition: (
        viewRef: React.ElementRef<HostComponent<NativeProps>>,
        position: Double
    ) => void;
    expand: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
    collapse: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
    close: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
    forceClose: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
    supportedCommands: [
        'snapToIndex',
        'snapToPosition',
        'expand',
        'collapse',
        'close',
        'forceClose',
    ],
});

export default codegenNativeComponent<NativeProps>('RNSmartSheetView');
