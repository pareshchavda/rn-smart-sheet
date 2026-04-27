import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import type { BottomSheetFlatListProps } from '../../types';

const BottomSheetFlatListComponent = forwardRef<
    FlatList,
    BottomSheetFlatListProps
>((props, ref) => {
    const { style, contentContainerStyle, ...rest } = props;
    
    return (
        <FlatList
            ref={ref}
            style={[styles.container, style]}
            contentContainerStyle={contentContainerStyle}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
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
