import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    View,
    type NativeSyntheticEvent,
} from 'react-native';
import type { BottomSheetMethods, BottomSheetProps } from '../../types';
import { BottomSheetProvider } from '../../contexts/BottomSheetContext';
import { normalizeSnapPoints } from '../../utils/snapPoints';
import { BottomSheetBackdrop } from '../BottomSheetBackdrop';
import { BottomSheetHandle } from '../BottomSheetHandle';
import NativeSmartSheetView, {
    Commands,
    type SheetAnimateEvent,
    type SheetChangeEvent,
    type SheetPositionEvent,
} from '../../specs/SmartSheetNativeComponent';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheetComponent = forwardRef<BottomSheetMethods, BottomSheetProps>(
    (
        {
            snapPoints,
            index = 0,
            enablePanDownToClose = true,
            animationConfig,
            keyboardBehavior,
            keyboardDismissMode,
            enableHandleComponent = true,
            handleComponent: CustomHandle,
            backdropComponent: CustomBackdrop,
            backgroundStyle,
            handleStyle,
            handleIndicatorStyle,
            style,
            children,
            onChange,
            onAnimate,
            enableGesture = true,
            overDragResistanceFactor = 0,
        },
        ref
    ) => {
        const nativeRef = useRef<React.ElementRef<typeof NativeSmartSheetView>>(null);
        
        // Using RN's Animated instead of Reanimated
        const animatedIndex = useRef(new Animated.Value(index)).current;
        const animatedPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
        
        const currentIndexRef = useRef(index);

        const normalizedSnapPoints = useMemo(
            () => normalizeSnapPoints(snapPoints),
            [snapPoints]
        );

        useEffect(() => {
            if (index >= 0 && normalizedSnapPoints[index] != null) {
                animatedPosition.setValue(SCREEN_HEIGHT - normalizedSnapPoints[index]);
                animatedIndex.setValue(index);
            } else {
                animatedPosition.setValue(SCREEN_HEIGHT);
                animatedIndex.setValue(-1);
            }
        }, [index, normalizedSnapPoints, animatedPosition, animatedIndex]);

        const snapToIndex = useCallback((targetIndex: number) => {
            if (nativeRef.current) {
                Commands.snapToIndex(nativeRef.current, targetIndex);
            }
        }, []);

        const snapToPosition = useCallback((position: number) => {
            if (nativeRef.current) {
                Commands.snapToPosition(nativeRef.current, position);
            }
        }, []);

        const expand = useCallback(() => {
            if (nativeRef.current) {
                Commands.expand(nativeRef.current);
            }
        }, []);

        const collapse = useCallback(() => {
            if (nativeRef.current) {
                Commands.collapse(nativeRef.current);
            }
        }, []);

        const close = useCallback(() => {
            if (nativeRef.current) {
                Commands.close(nativeRef.current);
            }
        }, []);

        const forceClose = useCallback(() => {
            if (nativeRef.current) {
                Commands.forceClose(nativeRef.current);
            }
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                snapToIndex,
                snapToPosition,
                expand,
                collapse,
                close,
                forceClose,
            }),
            [snapToIndex, snapToPosition, expand, collapse, close, forceClose]
        );

        const contextValue = useMemo(
            () => ({
                animatedIndex,
                animatedPosition,
                snapToIndex,
                snapToPosition,
                expand,
                collapse,
                close,
            }),
            [animatedIndex, animatedPosition, snapToIndex, snapToPosition, expand, collapse, close]
        );

        const HandleComponent = CustomHandle || BottomSheetHandle;
        const renderHandle = enableHandleComponent && (
            <HandleComponent
                animatedIndex={animatedIndex}
                animatedPosition={animatedPosition}
                style={handleStyle}
                indicatorStyle={handleIndicatorStyle}
            />
        );

        const BackdropComponent = CustomBackdrop === null ? null : CustomBackdrop || BottomSheetBackdrop;
        const renderBackdrop = BackdropComponent && (
            <BackdropComponent
                animatedIndex={animatedIndex}
                animatedPosition={animatedPosition}
            />
        );

        const handleSheetChange = useCallback(
            (event: NativeSyntheticEvent<SheetChangeEvent>) => {
                const nextIndex = event.nativeEvent.index;
                animatedIndex.setValue(nextIndex);
                animatedPosition.setValue(event.nativeEvent.position);
                currentIndexRef.current = nextIndex;
                onChange?.(nextIndex);
            },
            [animatedIndex, animatedPosition, onChange]
        );

        const handleSheetAnimate = useCallback(
            (event: NativeSyntheticEvent<SheetAnimateEvent>) => {
                const { fromIndex, toIndex } = event.nativeEvent;
                currentIndexRef.current = toIndex;
                onAnimate?.(fromIndex, toIndex);
            },
            [onAnimate]
        );

        const handlePositionChange = useCallback(
            (event: NativeSyntheticEvent<SheetPositionEvent>) => {
                animatedPosition.setValue(event.nativeEvent.position);
            },
            [animatedPosition]
        );

        return (
            <BottomSheetProvider value={contextValue}>
                {renderBackdrop}
                <NativeSmartSheetView
                    ref={nativeRef}
                    style={[
                        styles.container,
                        {
                            height: SCREEN_HEIGHT,
                        },
                        style,
                    ]}
                    snapPoints={normalizedSnapPoints}
                    initialIndex={index}
                    enablePanDownToClose={enablePanDownToClose}
                    enableGesture={enableGesture}
                    overDragResistanceFactor={overDragResistanceFactor}
                    keyboardBehavior={keyboardBehavior as any}
                    keyboardDismissMode={keyboardDismissMode as any}
                    springConfig={animationConfig as any}
                    onSheetChange={handleSheetChange}
                    onSheetAnimate={handleSheetAnimate}
                    onSheetPositionChange={handlePositionChange}
                >
                    <View style={[styles.background, backgroundStyle]}>
                        {renderHandle}
                        <View style={styles.content}>{children}</View>
                    </View>
                </NativeSmartSheetView>
            </BottomSheetProvider>
        );
    }
);

BottomSheetComponent.displayName = 'BottomSheet';

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    background: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    content: {
        flex: 1,
    },
});

export const BottomSheet = BottomSheetComponent;
