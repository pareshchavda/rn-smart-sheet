import React, { forwardRef, useCallback } from 'react';
import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { useBottomSheetInternal } from '../BottomSheet/BottomSheet';

export const BottomSheetTextInput = forwardRef<TextInput, TextInputProps>(
    ({ onFocus, onBlur, style, ...rest }, ref) => {
        const { snapToIndex, resolvedSnapPoints } = useBottomSheetInternal();

        const handleFocus = useCallback(
            (e: any) => {
                // When focused, we extend the sheet to ensure visibility
                snapToIndex(resolvedSnapPoints.length - 1);
                if (onFocus) {
                    onFocus(e);
                }
            },
            [onFocus, snapToIndex, resolvedSnapPoints.length]
        );

        return (
            <TextInput
                ref={ref}
                style={[styles.input, style]}
                onFocus={handleFocus}
                onBlur={onBlur}
                {...rest}
            />
        );
    }
);

const styles = StyleSheet.create({
    input: {
        height: 50,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000000',
    },
});

BottomSheetTextInput.displayName = 'BottomSheetTextInput';
