import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import type { BottomSheetViewProps } from '../../types';

const BottomSheetViewComponent = forwardRef<View, BottomSheetViewProps>(
    ({ children, style }, ref) => {
        return (
            <View ref={ref} style={[styles.container, style]}>
                {children}
            </View>
        );
    }
);

BottomSheetViewComponent.displayName = 'BottomSheetView';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export const BottomSheetView = BottomSheetViewComponent;
