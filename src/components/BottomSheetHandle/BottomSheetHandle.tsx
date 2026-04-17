import React, { memo } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import type { BottomSheetHandleProps } from '../../types';

const BottomSheetHandleComponent: React.FC<BottomSheetHandleProps> = ({
    style,
    indicatorStyle,
    animatedIndex,
}) => {
    const animatedStyle = {
        opacity: animatedIndex.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp'
        })
    };

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
