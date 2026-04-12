import React, { memo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { BottomSheetBackdropProps } from '../../types';
import { interpolate } from '../../utils/animations';

const BottomSheetBackdropComponent: React.FC<BottomSheetBackdropProps> = ({
    animatedIndex,
    style,
    opacity = 0.5,
    enableTouchThrough = false,
    disappearsOnIndex = -1,
    appearsOnIndex = 0,
    pressBehavior = 'close',
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const backdropOpacity = interpolate(
            animatedIndex.value,
            [disappearsOnIndex, appearsOnIndex],
            [0, opacity]
        );

        return {
            opacity: backdropOpacity,
            pointerEvents: animatedIndex.value <= disappearsOnIndex ? 'none' : 'auto',
        };
    });

    const handlePress = () => {
        // This will be connected to the bottom sheet context
        // For now, it's a placeholder
    };

    return (
        <Animated.View style={[styles.container, style, animatedStyle]}>
            {!enableTouchThrough && pressBehavior !== 'none' && (
                <Pressable style={StyleSheet.absoluteFill} onPress={handlePress} />
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
