import React, { memo } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import type { BottomSheetBackdropProps } from '../../types';

const BottomSheetBackdropComponent: React.FC<BottomSheetBackdropProps> = ({
    animatedIndex,
    animatedPosition,
    index = -1,
    style,
    opacity = 0.5,
    enableTouchThrough = false,
    disappearsOnIndex = -1,
    appearsOnIndex = 0,
    pressBehavior = 'close',
    onPress,
}) => {
    const isHidden = index <= disappearsOnIndex;
    const safeInputRange =
        disappearsOnIndex === appearsOnIndex
            ? [disappearsOnIndex, appearsOnIndex + 0.01]
            : [disappearsOnIndex, appearsOnIndex];

    const animatedStyle = {
        opacity: animatedIndex.interpolate({
            inputRange: safeInputRange,
            outputRange: [0, opacity],
            extrapolate: 'clamp',
        }),
    };

    return (
        <Animated.View
            style={[styles.container, style, animatedStyle]}
            pointerEvents={enableTouchThrough || isHidden ? 'none' : 'auto'}
        >
            {!enableTouchThrough && pressBehavior !== 'none' && (
                <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
});

export const BottomSheetBackdrop = memo(BottomSheetBackdropComponent);
