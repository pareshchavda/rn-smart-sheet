import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useBottomSheetInternal } from '../BottomSheet/BottomSheet';
import type { BottomSheetScrollViewProps } from '../../types';

const BottomSheetScrollViewComponent = forwardRef<
    ScrollView,
    BottomSheetScrollViewProps
>(({ children, style, contentContainerStyle, ...rest }, ref) => {
    const { keyboardDismissMode, animatedIndex, resolvedSnapPoints } = useBottomSheetInternal();
    const [scrollEnabled, setScrollEnabled] = React.useState(false);
    const lastOffsetY = React.useRef(0);

    React.useEffect(() => {
        const maxIndex = resolvedSnapPoints.length - 1;
        
        const listenerId = animatedIndex.addListener(({ value }) => {
            const isAtMax = Math.abs(value - maxIndex) < 0.01;
            setScrollEnabled(isAtMax);
        });

        const initialValue = (animatedIndex as any)._value;
        if (typeof initialValue === 'number') {
            setScrollEnabled(Math.abs(initialValue - maxIndex) < 0.01);
        }

        return () => {
            animatedIndex.removeListener(listenerId);
        };
    }, [animatedIndex, resolvedSnapPoints]);

    const handleScroll = React.useCallback((event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY <= 0 && lastOffsetY.current <= 0 && scrollEnabled) {
            setScrollEnabled(false);
        }
        lastOffsetY.current = offsetY;
        if (rest.onScroll) {
            rest.onScroll(event);
        }
    }, [scrollEnabled, rest.onScroll]);

    const handleScrollEnd = React.useCallback((event: any) => {
        const maxIndex = resolvedSnapPoints.length - 1;
        const currentVal = (animatedIndex as any)._value;
        if (typeof currentVal === 'number' && Math.abs(currentVal - maxIndex) < 0.01) {
            setScrollEnabled(true);
        }
        if (rest.onScrollEndDrag) {
            rest.onScrollEndDrag(event);
        }
    }, [animatedIndex, resolvedSnapPoints, rest.onScrollEndDrag]);

    const handleMomentumScrollEnd = React.useCallback((event: any) => {
        const maxIndex = resolvedSnapPoints.length - 1;
        const currentVal = (animatedIndex as any)._value;
        if (typeof currentVal === 'number' && Math.abs(currentVal - maxIndex) < 0.01) {
            setScrollEnabled(true);
        }
        if (rest.onMomentumScrollEnd) {
            rest.onMomentumScrollEnd(event);
        }
    }, [animatedIndex, resolvedSnapPoints, rest.onMomentumScrollEnd]);

    return (
        <ScrollView
            ref={ref}
            style={[styles.container, style]}
            contentContainerStyle={contentContainerStyle}
            scrollEventThrottle={16}
            bounces={true}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={keyboardDismissMode === 'on-drag' ? 'on-drag' : 'none'}
            scrollEnabled={scrollEnabled}
            onScroll={handleScroll}
            onScrollEndDrag={handleScrollEnd}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            {...rest}
        >
            {children}
        </ScrollView>
    );
});

BottomSheetScrollViewComponent.displayName = 'BottomSheetScrollView';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export const BottomSheetScrollView = BottomSheetScrollViewComponent;
