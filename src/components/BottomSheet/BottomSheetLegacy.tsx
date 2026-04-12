import React, {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useCallback,
    useRef,
    useEffect,
} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Keyboard,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    runOnJS,
    withSpring,
} from 'react-native-reanimated';
import type {
    BottomSheetProps,
    BottomSheetMethods,
} from '../../types';
import {
    KeyboardBehavior,
    KeyboardDismissMode,
} from '../../types';
import { normalizeSnapPoints, getClosestSnapPoint } from '../../utils/snapPoints';
import { SPRING_CONFIG, clamp } from '../../utils/animations';
import { BottomSheetProvider } from '../../contexts/BottomSheetContext';
import { useKeyboardHandler } from '../../hooks/useKeyboardHandler';
import { BottomSheetHandle } from '../BottomSheetHandle';
import { BottomSheetBackdrop } from '../BottomSheetBackdrop';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheetLegacyComponent = forwardRef<BottomSheetMethods, BottomSheetProps>(
    (
        {
            snapPoints,
            index = 0,
            enablePanDownToClose = true,
            animationConfig,
            keyboardBehavior = KeyboardBehavior.INTERACTIVE,
            keyboardDismissMode = KeyboardDismissMode.ON_DRAG,
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
        const normalizedSnapPoints = useMemo(
            () => normalizeSnapPoints(snapPoints),
            [snapPoints]
        );

        const animatedIndex = useSharedValue(index);
        const animatedPosition = useSharedValue(
            SCREEN_HEIGHT - normalizedSnapPoints[index]
        );
        const contextY = useSharedValue(0);
        const currentIndexRef = useRef(index);

        useKeyboardHandler({
            enabled: keyboardBehavior !== KeyboardBehavior.INTERACTIVE,
            behavior: keyboardBehavior,
            animatedPosition,
            snapPoints: normalizedSnapPoints,
            currentIndex: currentIndexRef.current,
        });

        const snapToIndex = useCallback(
            (targetIndex: number) => {
                'worklet';
                const clampedIndex = clamp(targetIndex, -1, normalizedSnapPoints.length - 1);

                if (clampedIndex === -1) {
                    animatedPosition.value = withSpring(
                        SCREEN_HEIGHT,
                        (animationConfig ? { ...SPRING_CONFIG, ...animationConfig } : SPRING_CONFIG) as any,
                        (finished) => {
                            if (finished) {
                                animatedIndex.value = -1;
                                if (onChange) {
                                    runOnJS(onChange)(-1);
                                }
                            }
                        }
                    );
                } else {
                    const targetPosition = SCREEN_HEIGHT - normalizedSnapPoints[clampedIndex];

                    if (onAnimate) {
                        runOnJS(onAnimate)(currentIndexRef.current, clampedIndex);
                    }

                    animatedPosition.value = withSpring(
                        targetPosition,
                        (animationConfig ? { ...SPRING_CONFIG, ...animationConfig } : SPRING_CONFIG) as any,
                        (finished) => {
                            if (finished) {
                                animatedIndex.value = clampedIndex;
                                currentIndexRef.current = clampedIndex;
                                if (onChange) {
                                    runOnJS(onChange)(clampedIndex);
                                }
                            }
                        }
                    );
                }
            },
            [normalizedSnapPoints, animationConfig, onChange, onAnimate, animatedIndex, animatedPosition]
        );

        const snapToPosition = useCallback(
            (position: number) => {
                'worklet';
                const targetIndex = getClosestSnapPoint(position, normalizedSnapPoints);
                snapToIndex(targetIndex);
            },
            [normalizedSnapPoints, snapToIndex]
        );

        useImperativeHandle(
            ref,
            () => ({
                snapToIndex: (targetIndex: number) => {
                    snapToIndex(targetIndex);
                },
                snapToPosition: (position: number) => {
                    snapToPosition(position);
                },
                expand: () => {
                    snapToIndex(normalizedSnapPoints.length - 1);
                },
                collapse: () => {
                    snapToIndex(0);
                },
                close: () => {
                    snapToIndex(-1);
                },
                forceClose: () => {
                    animatedPosition.value = SCREEN_HEIGHT;
                    animatedIndex.value = -1;
                    currentIndexRef.current = -1;
                    if (onChange) {
                        onChange(-1);
                    }
                },
            }),
            [snapToIndex, snapToPosition, normalizedSnapPoints, onChange, animatedIndex, animatedPosition]
        );

        const panGesture = Gesture.Pan()
            .enabled(enableGesture)
            .onStart(() => {
                contextY.value = animatedPosition.value;

                if (keyboardDismissMode === KeyboardDismissMode.ON_DRAG) {
                    runOnJS(Keyboard.dismiss)();
                }
            })
            .onUpdate((event) => {
                const newPosition = contextY.value + event.translationY;
                const minPosition = SCREEN_HEIGHT - normalizedSnapPoints[normalizedSnapPoints.length - 1];
                const maxPosition = enablePanDownToClose
                    ? SCREEN_HEIGHT
                    : SCREEN_HEIGHT - normalizedSnapPoints[0];

                if (newPosition < minPosition) {
                    const resistance = 1 + overDragResistanceFactor;
                    const diff = minPosition - newPosition;
                    animatedPosition.value = minPosition - diff / resistance;
                } else if (newPosition > maxPosition) {
                    const resistance = 1 + overDragResistanceFactor;
                    const diff = newPosition - maxPosition;
                    animatedPosition.value = maxPosition + diff / resistance;
                } else {
                    animatedPosition.value = newPosition;
                }
            })
            .onEnd((event) => {
                const currentPosition = SCREEN_HEIGHT - animatedPosition.value;
                const velocity = event.velocityY;
                let targetIndex = getClosestSnapPoint(currentPosition, normalizedSnapPoints);

                if (Math.abs(velocity) > 500) {
                    if (velocity > 0 && targetIndex > 0) {
                        targetIndex -= 1;
                    } else if (velocity < 0 && targetIndex < normalizedSnapPoints.length - 1) {
                        targetIndex += 1;
                    }
                }

                if (enablePanDownToClose && velocity > 500 && targetIndex === 0) {
                    snapToIndex(-1);
                } else {
                    snapToIndex(targetIndex);
                }
            });

        const animatedSheetStyle = useAnimatedStyle(() => {
            return {
                transform: [{ translateY: animatedPosition.value }],
            };
        });

        const contextValue = useMemo(
            () => ({
                animatedIndex,
                animatedPosition,
                snapToIndex,
                snapToPosition,
                expand: () => snapToIndex(normalizedSnapPoints.length - 1),
                collapse: () => snapToIndex(0),
                close: () => snapToIndex(-1),
            }),
            [animatedIndex, animatedPosition, snapToIndex, snapToPosition, normalizedSnapPoints]
        );

        useEffect(() => {
            snapToIndex(index);
        }, [index, snapToIndex]);

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

        return (
            <BottomSheetProvider value={contextValue}>
                {renderBackdrop}
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            styles.container,
                            {
                                height: SCREEN_HEIGHT,
                            },
                            animatedSheetStyle,
                            style,
                        ]}
                    >
                        <View style={[styles.background, backgroundStyle]}>
                            {renderHandle}
                            <View style={styles.content}>{children}</View>
                        </View>
                    </Animated.View>
                </GestureDetector>
            </BottomSheetProvider>
        );
    }
);

BottomSheetLegacyComponent.displayName = 'BottomSheetLegacy';

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

export const BottomSheetLegacy = BottomSheetLegacyComponent;
