import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useBottomSheetInternal } from '../BottomSheet/BottomSheet';
import type { BottomSheetScrollViewProps } from '../../types';

const BottomSheetScrollViewComponent = forwardRef<
    ScrollView,
    BottomSheetScrollViewProps
>(({ children, style, contentContainerStyle, ...rest }, ref) => {
    const { keyboardDismissMode } = useBottomSheetInternal();

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
