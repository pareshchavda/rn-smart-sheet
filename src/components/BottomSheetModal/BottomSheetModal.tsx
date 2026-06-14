import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react';
import { BottomSheet } from '../BottomSheet';
import type { BottomSheetMethods, BottomSheetModalProps } from '../../types';
import { useBottomSheetModalInternal } from '../BottomSheetModalProvider/BottomSheetModalProvider';

const BottomSheetModalComponent = forwardRef<BottomSheetMethods, BottomSheetModalProps>(
    (props, ref) => {
        const id = useId();
        const { mount, unmount } = useBottomSheetModalInternal();
        const bottomSheetRef = useRef<BottomSheetMethods>(null);

        useImperativeHandle(ref, () => {
            console.warn(`[BottomSheetModal] useImperativeHandle created for id=${id}. bottomSheetRef.current is ${bottomSheetRef.current ? 'defined' : 'null'}`);
            return {
                snapToIndex: (index) => {
                    console.warn(`[BottomSheetModal] snapToIndex called with index=${index} on id=${id}. bottomSheetRef.current is ${bottomSheetRef.current ? 'defined' : 'null'}`);
                    bottomSheetRef.current?.snapToIndex(index);
                },
                snapToPosition: (position) => {
                    console.warn(`[BottomSheetModal] snapToPosition called with position=${position} on id=${id}. bottomSheetRef.current is ${bottomSheetRef.current ? 'defined' : 'null'}`);
                    bottomSheetRef.current?.snapToPosition(position);
                },
                expand: () => {
                    console.warn(`[BottomSheetModal] expand called on id=${id}. bottomSheetRef.current is ${bottomSheetRef.current ? 'defined' : 'null'}`);
                    bottomSheetRef.current?.expand();
                },
                collapse: () => bottomSheetRef.current?.collapse(),
                close: () => bottomSheetRef.current?.close(),
                forceClose: () => bottomSheetRef.current?.forceClose(),
            };
        });

        useEffect(() => {
            console.warn(`[BottomSheetModal] Mounted modal with id=${id}`);
            return () => {
                console.warn(`[BottomSheetModal] Clean up (unmount) for id=${id}`);
                unmount(id);
            };
        }, [id, unmount]);

        useEffect(() => {
            console.warn(`[BottomSheetModal] Updating modal props/element for id=${id}`);
            mount(id, <BottomSheet key={id} ref={bottomSheetRef} {...props} />);
        }, [id, mount, props]);

        return null;
    }
);

BottomSheetModalComponent.displayName = 'BottomSheetModal';

export const BottomSheetModal = BottomSheetModalComponent;
