import React, { memo } from 'react';
import { StyleSheet, Animated } from 'react-native';
import type { BottomSheetFooterProps } from '../../types';

const BottomSheetFooterComponent = ({
    animatedFooterPosition,
    children,
    style,
}: BottomSheetFooterProps) => {
    return (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.container, 
                style, 
                animatedFooterPosition ? {
                    transform: [
                        {
                            translateY: animatedFooterPosition,
                        },
                    ],
                } : {}
            ]}
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
