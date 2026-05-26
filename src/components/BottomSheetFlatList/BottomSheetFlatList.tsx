import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useBottomSheetInternal } from '../BottomSheet/BottomSheet';
import type { BottomSheetFlatListProps } from '../../types';

const BottomSheetFlatListComponent = forwardRef<
    FlatList,
    BottomSheetFlatListProps
>((props, ref) => {
    const { style, contentContainerStyle, ...rest } = props;
    const { keyboardDismissMode } = useBottomSheetInternal();
    
    return (
        <FlatList
            ref={ref}
            style={[styles.container, style]}
            contentContainerStyle={contentContainerStyle}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={keyboardDismissMode === 'on-drag' ? 'on-drag' : 'none'}
            removeClippedSubviews={false}
            {...rest}
        />
    );
});

BottomSheetFlatListComponent.displayName = 'BottomSheetFlatList';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export const BottomSheetFlatList = BottomSheetFlatListComponent;
