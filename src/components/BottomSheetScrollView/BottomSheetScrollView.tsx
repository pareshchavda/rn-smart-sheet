import React, { forwardRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { BottomSheetScrollViewProps } from '../../types';

const BottomSheetScrollViewComponent = forwardRef<
    ScrollView,
    BottomSheetScrollViewProps
>(({ children, style, contentContainerStyle }, ref) => {
    return (
        <ScrollView
            ref={ref}
            style={[styles.container, style]}
            contentContainerStyle={contentContainerStyle}
            scrollEventThrottle={16}
            bounces={true}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
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
