import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
    type NativeSyntheticEvent,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
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
import { isNativeSheetViewAvailable } from '../../utils/native';
import { BottomSheetLegacy } from './BottomSheetLegacy';

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
            useNativeDriver = true,
        },
        ref
    ) => {
        const legacyRef = useRef<BottomSheetMethods>(null);
        const nativeRef = useRef<React.ElementRef<typeof NativeSmartSheetView>>(null);
        const animatedIndex = useSharedValue(index);
        const animatedPosition = useSharedValue(SCREEN_HEIGHT);
        const currentIndexRef = useRef(index);

        const normalizedSnapPoints = useMemo(
            () => normalizeSnapPoints(snapPoints),
            [snapPoints]
        );

        const shouldUseNativeDriver = useMemo(
            () => useNativeDriver && isNativeSheetViewAvailable(),
            [useNativeDriver]
        );

        useEffect(() => {
            animatedPosition.value =
                index >= 0 && normalizedSnapPoints[index] != null
                    ? SCREEN_HEIGHT - normalizedSnapPoints[index]
                    : SCREEN_HEIGHT;
        }, [animatedPosition, index, normalizedSnapPoints]);

        const snapToIndex = useCallback((targetIndex: number) => {
            if (shouldUseNativeDriver && nativeRef.current) {
                Commands.snapToIndex(nativeRef.current, targetIndex);
                return;
            }

            legacyRef.current?.snapToIndex(targetIndex);
        }, [shouldUseNativeDriver]);

        const snapToPosition = useCallback((position: number) => {
            if (shouldUseNativeDriver && nativeRef.current) {
                Commands.snapToPosition(nativeRef.current, position);
                return;
            }

            legacyRef.current?.snapToPosition(position);
        }, [shouldUseNativeDriver]);

        const expand = useCallback(() => {
            if (shouldUseNativeDriver && nativeRef.current) {
                Commands.expand(nativeRef.current);
                return;
            }

            legacyRef.current?.expand();
        }, [shouldUseNativeDriver]);

        const collapse = useCallback(() => {
            if (shouldUseNativeDriver && nativeRef.current) {
                Commands.collapse(nativeRef.current);
                return;
            }

            legacyRef.current?.collapse();
        }, [shouldUseNativeDriver]);

        const close = useCallback(() => {
            if (shouldUseNativeDriver && nativeRef.current) {
                Commands.close(nativeRef.current);
                return;
            }

            legacyRef.current?.close();
        }, [shouldUseNativeDriver]);

        const forceClose = useCallback(() => {
            if (shouldUseNativeDriver && nativeRef.current) {
                Commands.forceClose(nativeRef.current);
                return;
            }

            legacyRef.current?.forceClose();
        }, [shouldUseNativeDriver]);

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
                animatedIndex.value = nextIndex;
                animatedPosition.value = event.nativeEvent.position;
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
                animatedPosition.value = event.nativeEvent.position;
            },
            [animatedPosition]
        );

        if (!shouldUseNativeDriver) {
            return (
                <BottomSheetLegacy
                    ref={legacyRef}
                    snapPoints={snapPoints}
                    index={index}
                    enablePanDownToClose={enablePanDownToClose}
                    animationConfig={animationConfig}
                    keyboardBehavior={keyboardBehavior}
                    keyboardDismissMode={keyboardDismissMode}
                    enableHandleComponent={enableHandleComponent}
                    handleComponent={CustomHandle}
                    backdropComponent={CustomBackdrop}
                    backgroundStyle={backgroundStyle}
                    handleStyle={handleStyle}
                    handleIndicatorStyle={handleIndicatorStyle}
                    style={style}
                    onChange={onChange}
                    onAnimate={onAnimate}
                    enableGesture={enableGesture}
                    overDragResistanceFactor={overDragResistanceFactor}
                    useNativeDriver={useNativeDriver}
                >
                    {children}
                </BottomSheetLegacy>
            );
        }

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
                    keyboardBehavior={keyboardBehavior}
                    keyboardDismissMode={keyboardDismissMode}
                    springConfig={animationConfig}
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
