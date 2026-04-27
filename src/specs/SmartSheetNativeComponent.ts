import type * as React from 'react';
import type { HostComponent, ViewProps } from 'react-native';
// @ts-ignore - codegenNativeCommands and codegenNativeComponent are available in react-native 0.71+ 
// but root exports were added to types in newer versions.
import { codegenNativeCommands, codegenNativeComponent } from 'react-native';
import type {
    DirectEventHandler,
    Double,
    Int32,
    WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
// Note: Deep imports are currently used as they are required for some Codegen versions, 
// but we've consolidated them here.

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
    contentHeight?: Double;
    footerHeight?: Double;
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
