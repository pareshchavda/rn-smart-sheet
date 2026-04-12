import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { BottomSheetHandleProps } from '../../types';
import { interpolate } from '../../utils/animations';

const BottomSheetHandleComponent: React.FC<BottomSheetHandleProps> = ({
    style,
    indicatorStyle,
    animatedIndex,
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animatedIndex.value, [-1, 0, 1], [0, 1, 1]);

        return {
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.container, style, animatedStyle]}>
            <View style={[styles.indicator, indicatorStyle]} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    indicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
    },
});

export const BottomSheetHandle = memo(BottomSheetHandleComponent);
