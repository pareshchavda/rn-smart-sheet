import React, { memo } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import type { BottomSheetBackdropProps } from '../../types';

const BottomSheetBackdropComponent: React.FC<BottomSheetBackdropProps> = ({
    animatedIndex,
    style,
    opacity = 0.5,
    enableTouchThrough = false,
    disappearsOnIndex = -1,
    appearsOnIndex = 0,
    pressBehavior = 'close',
}) => {
    const animatedStyle = {
        opacity: animatedIndex.interpolate({
            inputRange: [disappearsOnIndex, appearsOnIndex],
            outputRange: [0, opacity],
            extrapolate: 'clamp'
        }),
    };

    const handlePress = () => {
        // Will connect to BS
    };

    return (
        <Animated.View style={[styles.container, style, animatedStyle]} pointerEvents="box-none">
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
