import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    interpolate, 
    Extrapolate 
} from 'react-native-reanimated';
import type { BottomSheetFooterProps } from '../../types';

const BottomSheetFooterComponent = ({
    animatedFooterPosition,
    children,
    style,
}: BottomSheetFooterProps) => {
    const containerAnimatedStyle = useAnimatedStyle(() => {
        if (!animatedFooterPosition) {
            return {};
        }

        return {
            transform: [
                {
                    translateY: animatedFooterPosition.value,
                },
            ],
        };
    });

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[styles.container, style, containerAnimatedStyle]}
        >
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
});

export const BottomSheetFooter = memo(BottomSheetFooterComponent);
