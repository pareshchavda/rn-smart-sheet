import React, { forwardRef, useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated';
import type { BottomSheetScrollViewProps } from '../../types';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const BottomSheetScrollViewComponent = forwardRef<
    ScrollView,
    BottomSheetScrollViewProps
>(({ children, style, contentContainerStyle }, ref) => {
    const scrollY = useSharedValue(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Create a native gesture for the scroll view
    const gesture = Gesture.Native();

    return (
        <GestureDetector gesture={gesture}>
            <AnimatedScrollView
                ref={ref || scrollViewRef}
                style={[styles.container, style]}
                contentContainerStyle={contentContainerStyle}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                bounces={true}
                showsVerticalScrollIndicator={true}
            >
                {children}
            </AnimatedScrollView>
        </GestureDetector>
    );
});

BottomSheetScrollViewComponent.displayName = 'BottomSheetScrollView';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export const BottomSheetScrollView = BottomSheetScrollViewComponent;
