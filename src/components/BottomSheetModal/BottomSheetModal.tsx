import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react';
import { BottomSheet } from '../BottomSheet';
import type { BottomSheetMethods, BottomSheetModalProps } from '../../types';
import { useBottomSheetModalInternal } from '../BottomSheetModalProvider/BottomSheetModalProvider';

const BottomSheetModalComponent = forwardRef<BottomSheetMethods, BottomSheetModalProps>(
    (props, ref) => {
        const id = useId();
        const { mount, unmount } = useBottomSheetModalInternal();
        const bottomSheetRef = useRef<BottomSheetMethods>(null);

        useImperativeHandle(ref, () => ({
            snapToIndex: (index) => bottomSheetRef.current?.snapToIndex(index),
            snapToPosition: (position) => bottomSheetRef.current?.snapToPosition(position),
            expand: () => bottomSheetRef.current?.expand(),
            collapse: () => bottomSheetRef.current?.collapse(),
            close: () => bottomSheetRef.current?.close(),
            forceClose: () => bottomSheetRef.current?.forceClose(),
        }));

        useEffect(() => {
            mount(id, <BottomSheet key={id} ref={bottomSheetRef} {...props} />);
            return () => unmount(id);
        }, [id, mount, unmount, props]);

        return null;
    }
);

BottomSheetModalComponent.displayName = 'BottomSheetModal';

export const BottomSheetModal = BottomSheetModalComponent;
