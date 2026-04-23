import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Animated,
    Keyboard,
    PanResponder,
    Platform,
    StyleSheet,
    View,
    useWindowDimensions,
    type LayoutChangeEvent,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import type { BottomSheetMethods, BottomSheetProps } from '../../types';
import { BottomSheetProvider } from '../../contexts/BottomSheetContext';
import { getClosestSnapPoint, normalizeSnapPoints } from '../../utils/snapPoints';
import { BottomSheetBackdrop } from '../BottomSheetBackdrop';
import { BottomSheetHandle } from '../BottomSheetHandle';
import RNSmartSheetView, { Commands } from '../../specs/SmartSheetNativeComponent';
import { normalizeSnapPoint } from '../../utils/snapPoints';

const DEFAULT_ANIMATION_CONFIG = {
    damping: 30,
    stiffness: 260,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.5,
    restSpeedThreshold: 0.5,
};

const DRAG_VELOCITY_THRESHOLD = 1200;
const DRAG_CLOSE_RATIO = 0.6;

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

const dedupeAndSort = (values: number[]): number[] => {
    return Array.from(new Set(values.map((value) => Math.round(value)))).sort((a, b) => a - b);
};

const BottomSheetComponent = forwardRef<BottomSheetMethods, BottomSheetProps>(
    (
        {
            useNativeDriver = true,
            snapPoints = [],
            index = 0,
            enablePanDownToClose = true,
            enableDynamicSizing = false,
            maxDynamicContentSize,
            animationConfig,
            keyboardBehavior,
            keyboardDismissMode,
            keyboardBlurBehavior = 'none',
            keyboardOffset = 0,
            topInset = 0,
            bottomInset = 0,
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
        const { height: windowHeight } = useWindowDimensions();
        const animatedIndex = useRef(new Animated.Value(index)).current;
        const animatedPosition = useRef(new Animated.Value(0)).current;
        const currentIndexRef = useRef(index);
        const currentPositionRef = useRef(0);
        const dragStartPositionRef = useRef(0);
        const restoreIndexAfterKeyboardRef = useRef<number | null>(null);
        const hasMountedRef = useRef(false);
        const [contentHeight, setContentHeight] = useState(0);
        const [handleHeight, setHandleHeight] = useState(24);
        const [keyboardHeight, setKeyboardHeight] = useState(0);

        const normalizedBaseSnapPoints = useMemo(
            () => normalizeSnapPoints(snapPoints).filter((value) => value > 0),
            [snapPoints]
        );

        const availableHeight = useMemo(() => {
            const keyboardInset =
                keyboardBehavior === 'extend' || keyboardBehavior === 'fillParent'
                    ? Math.max(0, keyboardHeight - keyboardOffset)
                    : 0;

            return Math.max(0, windowHeight - topInset - bottomInset - keyboardInset);
        }, [bottomInset, keyboardBehavior, keyboardHeight, keyboardOffset, topInset, windowHeight]);

        const dynamicSnapPoint = useMemo(() => {
            if (!enableDynamicSizing) {
                return null;
            }

            const measuredHeight = contentHeight + (enableHandleComponent ? handleHeight : 0);
            if (measuredHeight <= 0) {
                return null;
            }

            const maxHeight = maxDynamicContentSize ?? availableHeight;
            return clamp(measuredHeight, 0, maxHeight);
        }, [
            availableHeight,
            contentHeight,
            enableDynamicSizing,
            enableHandleComponent,
            handleHeight,
            maxDynamicContentSize,
        ]);

        const resolvedSnapPoints = useMemo(() => {
            const clampedBase = normalizedBaseSnapPoints
                .map((value) => clamp(value, 0, availableHeight))
                .filter((value) => value > 0);

            const nextSnapPoints = dynamicSnapPoint == null
                ? clampedBase
                : [...clampedBase, dynamicSnapPoint];

            return dedupeAndSort(nextSnapPoints);
        }, [availableHeight, dynamicSnapPoint, normalizedBaseSnapPoints]);

        const maxSheetHeight = useMemo(
            () => resolvedSnapPoints[resolvedSnapPoints.length - 1] ?? 0,
            [resolvedSnapPoints]
        );

        const closedPosition = maxSheetHeight;
        const minOpenPosition = 0;

        const contentContainerStyle = useMemo<StyleProp<ViewStyle>>(
            () => [
                styles.content,
                enableDynamicSizing ? styles.contentDynamic : styles.contentFill,
                keyboardBehavior === 'interactive' && keyboardHeight > 0
                    ? { paddingBottom: Math.max(0, keyboardHeight - keyboardOffset) }
                    : null,
            ],
            [enableDynamicSizing, keyboardBehavior, keyboardHeight, keyboardOffset]
        );

        useEffect(() => {
            const listenerId = animatedPosition.addListener(({ value }) => {
                currentPositionRef.current = value;
            });

            return () => {
                animatedPosition.removeListener(listenerId);
            };
        }, [animatedPosition]);

        useEffect(() => {
            const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
                setKeyboardHeight(event.endCoordinates.height);
            });
            const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardHeight(0);
            });

            return () => {
                showSubscription.remove();
                hideSubscription.remove();
            };
        }, []);

        const getPositionForIndex = useCallback((targetIndex: number): number => {
            if (targetIndex < 0 || resolvedSnapPoints[targetIndex] == null) {
                return closedPosition;
            }

            return maxSheetHeight - resolvedSnapPoints[targetIndex];
        }, [closedPosition, maxSheetHeight, resolvedSnapPoints]);

        const finishAtIndex = useCallback((targetIndex: number, position: number) => {
            currentIndexRef.current = targetIndex;
            animatedIndex.setValue(targetIndex);
            animatedPosition.setValue(position);
            onChange?.(targetIndex);
        }, [animatedIndex, animatedPosition, onChange]);

        const animateToIndex = useCallback((
            targetIndex: number,
            animated: boolean = true
        ) => {
            const clampedIndex = clamp(targetIndex, -1, resolvedSnapPoints.length - 1);
            const nextPosition = getPositionForIndex(clampedIndex);
            const fromIndex = currentIndexRef.current;

            animatedPosition.stopAnimation();

            if (!animated || !useNativeDriver) {
                finishAtIndex(clampedIndex, nextPosition);
                return;
            }

            if (fromIndex !== clampedIndex) {
                onAnimate?.(fromIndex, clampedIndex);
            }

            Animated.spring(animatedPosition, {
                toValue: nextPosition,
                useNativeDriver: true,
                ...DEFAULT_ANIMATION_CONFIG,
                ...animationConfig,
            }).start(({ finished }) => {
                if (finished) {
                    finishAtIndex(clampedIndex, nextPosition);
                }
            });
        }, [
            animationConfig,
            animatedPosition,
            finishAtIndex,
            getPositionForIndex,
            onAnimate,
            resolvedSnapPoints.length,
            useNativeDriver,
        ]);

        const nativeViewRef = useRef<any>(null);

        const snapToIndex = useCallback((targetIndex: number) => {
            console.log('BottomSheet: snapToIndex() called with index:', targetIndex);
            if ((Platform.OS === 'android' || Platform.OS === 'ios') && nativeViewRef.current) {
                console.log('BottomSheet: sending snapToIndex to native');
                Commands.snapToIndex(nativeViewRef.current, targetIndex);
                return;
            }
            animateToIndex(targetIndex, true);
        }, [animateToIndex]);

        const snapToPosition = useCallback((position: number) => {
            if ((Platform.OS === 'android' || Platform.OS === 'ios') && nativeViewRef.current) {
                Commands.snapToPosition(nativeViewRef.current, position);
                return;
            }
            if (resolvedSnapPoints.length === 0) {
                return;
            }

            const targetIndex = getClosestSnapPoint(position, resolvedSnapPoints);
            animateToIndex(targetIndex, true);
        }, [animateToIndex, resolvedSnapPoints]);

        const expand = useCallback(() => {
            console.log('BottomSheet: expand() called, index is:', index);
            if ((Platform.OS === 'android' || Platform.OS === 'ios') && nativeViewRef.current) {
                console.log('BottomSheet: sending expand to native');
                Commands.expand(nativeViewRef.current);
                return;
            }
            animateToIndex(resolvedSnapPoints.length - 1, true);
        }, [animateToIndex, index, resolvedSnapPoints.length]);

        const collapse = useCallback(() => {
            if ((Platform.OS === 'android' || Platform.OS === 'ios') && nativeViewRef.current) {
                Commands.collapse(nativeViewRef.current);
                return;
            }
            animateToIndex(0, true);
        }, [animateToIndex]);

        const close = useCallback(() => {
            console.log('BottomSheet: close() called');
            if ((Platform.OS === 'android' || Platform.OS === 'ios') && nativeViewRef.current) {
                console.log('BottomSheet: sending close to native');
                Commands.close(nativeViewRef.current);
                return;
            }
            animateToIndex(-1, true);
        }, [animateToIndex]);

        const forceClose = useCallback(() => {
            if ((Platform.OS === 'android' || Platform.OS === 'ios') && nativeViewRef.current) {
                Commands.forceClose(nativeViewRef.current);
                return;
            }
            animatedPosition.stopAnimation();
            finishAtIndex(-1, closedPosition);
        }, [animatedPosition, closedPosition, finishAtIndex]);

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

        const handleBackdropPress = useCallback(() => {
            if (currentIndexRef.current < 0) {
                return;
            }

            close();
        }, [close]);

        const HandleComponent = CustomHandle || BottomSheetHandle;
        const renderHandle = enableHandleComponent && (
            <View
                onLayout={(event) => {
                    setHandleHeight(event.nativeEvent.layout.height);
                }}
            >
                <HandleComponent
                    animatedIndex={animatedIndex}
                    animatedPosition={animatedPosition}
                    style={handleStyle}
                    indicatorStyle={handleIndicatorStyle}
                />
            </View>
        );

        const BackdropComponent = CustomBackdrop === null ? null : CustomBackdrop || BottomSheetBackdrop;
        const renderBackdrop = BackdropComponent && (
            <BackdropComponent
                animatedIndex={animatedIndex}
                animatedPosition={animatedPosition}
                index={currentIndexRef.current}
                onPress={handleBackdropPress}
            />
        );

        const panResponder = useMemo(
            () => PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    if (!enableGesture) {
                        return false;
                    }

                    return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
                },
                onPanResponderGrant: () => {
                    dragStartPositionRef.current = currentPositionRef.current;

                    if (keyboardDismissMode === 'on-drag') {
                        Keyboard.dismiss();
                    }
                },
                onPanResponderMove: (_, gestureState) => {
                    const nextPosition = dragStartPositionRef.current + gestureState.dy;
                    const lowerBound = enablePanDownToClose
                        ? closedPosition
                        : getPositionForIndex(0);

                    let clampedPosition = nextPosition;
                    if (nextPosition < minOpenPosition) {
                        const overdrag = Math.abs(nextPosition - minOpenPosition);
                        clampedPosition = minOpenPosition - overdrag / (1 + overDragResistanceFactor);
                    } else if (nextPosition > lowerBound) {
                        const overdrag = nextPosition - lowerBound;
                        clampedPosition = lowerBound + overdrag / (1 + overDragResistanceFactor);
                    }

                    animatedPosition.setValue(clampedPosition);
                },
                onPanResponderRelease: (_, gestureState) => {
                    const currentHeight = maxSheetHeight - currentPositionRef.current;
                    const minSnapPoint = resolvedSnapPoints[0] ?? 0;
                    const targetIndex = resolvedSnapPoints.length > 0
                        ? getClosestSnapPoint(currentHeight, resolvedSnapPoints)
                        : -1;

                    if (
                        enablePanDownToClose &&
                        (gestureState.vy > 1.2 ||
                            currentHeight < minSnapPoint * DRAG_CLOSE_RATIO)
                    ) {
                        animateToIndex(-1, true);
                        return;
                    }

                    if (Math.abs(gestureState.vy) > DRAG_VELOCITY_THRESHOLD / 1000) {
                        if (gestureState.vy < 0 && targetIndex < resolvedSnapPoints.length - 1) {
                            animateToIndex(targetIndex + 1, true);
                            return;
                        }

                        if (gestureState.vy > 0 && targetIndex > 0) {
                            animateToIndex(targetIndex - 1, true);
                            return;
                        }
                    }

                    animateToIndex(targetIndex, true);
                },
            }),
            [
                animateToIndex,
                closedPosition,
                enableGesture,
                enablePanDownToClose,
                getPositionForIndex,
                keyboardDismissMode,
                maxSheetHeight,
                minOpenPosition,
                overDragResistanceFactor,
                resolvedSnapPoints,
            ]
        );

        useEffect(() => {
            if (keyboardHeight > 0) {
                if (
                    keyboardBlurBehavior === 'restore' &&
                    restoreIndexAfterKeyboardRef.current == null
                ) {
                    restoreIndexAfterKeyboardRef.current = currentIndexRef.current;
                }

                if (
                    (keyboardBehavior === 'extend' || keyboardBehavior === 'fillParent') &&
                    currentIndexRef.current >= 0
                ) {
                    animateToIndex(resolvedSnapPoints.length - 1, true);
                }

                return;
            }

            if (
                keyboardBlurBehavior === 'restore' &&
                restoreIndexAfterKeyboardRef.current != null
            ) {
                animateToIndex(restoreIndexAfterKeyboardRef.current, true);
                restoreIndexAfterKeyboardRef.current = null;
            }
        }, [
            animateToIndex,
            keyboardBehavior,
            keyboardBlurBehavior,
            keyboardHeight,
            resolvedSnapPoints.length,
        ]);

        useEffect(() => {
            if (maxSheetHeight <= 0) {
                animatedPosition.setValue(0);
                animatedIndex.setValue(-1);
                return;
            }

            const targetIndex = clamp(index, -1, resolvedSnapPoints.length - 1);
            animateToIndex(targetIndex, hasMountedRef.current);
            hasMountedRef.current = true;
        }, [
            animateToIndex,
            animatedIndex,
            animatedPosition,
            index,
            maxSheetHeight,
            resolvedSnapPoints.length,
        ]);

        const handleContentLayout = useCallback(
            (event: LayoutChangeEvent) => {
                const nextHeight = event.nativeEvent.layout.height;
                if (Math.abs(nextHeight - contentHeight) > 1) {
                    setContentHeight(nextHeight);
                }
            },
            [contentHeight]
        );

        const handleNativeChange = useCallback((event: any) => {
            const { index: nextIndex, position } = event.nativeEvent;
            currentIndexRef.current = nextIndex;
            animatedIndex.setValue(nextIndex);
            animatedPosition.setValue(position);
            onChange?.(nextIndex);
        }, [animatedIndex, animatedPosition, onChange]);

        const handleNativePositionChange = useCallback((event: any) => {
            const { position } = event.nativeEvent;
            animatedPosition.setValue(position);
        }, [animatedPosition]);

        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            const nativeSnapPoints = resolvedSnapPoints.map(point => 
                typeof point === 'number' ? point : normalizeSnapPoint(point)
            );

            return (
                <BottomSheetProvider value={contextValue}>
                    {renderBackdrop}
                    <RNSmartSheetView
                        ref={nativeViewRef}
                        style={[styles.container, style]}
                        pointerEvents={index === -1 ? 'none' : 'box-none'}
                        snapPoints={nativeSnapPoints}
                        initialIndex={index}
                        enablePanDownToClose={enablePanDownToClose}
                        enableGesture={enableGesture}
                        enableDynamicSizing={enableDynamicSizing}
                        keyboardBehavior={keyboardBehavior}
                        keyboardDismissMode={keyboardDismissMode}
                        onSheetChange={handleNativeChange}
                        onSheetPositionChange={handleNativePositionChange}
                    >
                        <View style={backgroundStyle}>
                            {renderHandle}
                            <View style={contentContainerStyle}>
                                {children}
                            </View>
                        </View>
                    </RNSmartSheetView>
                </BottomSheetProvider>
            );
        }

        return (
            <BottomSheetProvider value={contextValue}>
                {renderBackdrop}
                <View pointerEvents="box-none" style={styles.container}>
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[
                            styles.sheet,
                            style,
                            {
                                height: Math.max(1, maxSheetHeight),
                                transform: [{ translateY: animatedPosition }],
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.background,
                                backgroundStyle,
                                { maxHeight: availableHeight || windowHeight },
                            ]}
                        >
                        {renderHandle}
                            <View onLayout={handleContentLayout} style={contentContainerStyle}>
                                {children}
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </BottomSheetProvider>
        );
    }
);

BottomSheetComponent.displayName = 'BottomSheet';

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        zIndex: 999,
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    background: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            }
        })
    },
    content: {
        minHeight: 1,
    },
    contentFill: {
        flex: 1,
    },
    contentDynamic: {
        flexGrow: 0,
        flexShrink: 1,
    },
});

export const BottomSheet = BottomSheetComponent;
