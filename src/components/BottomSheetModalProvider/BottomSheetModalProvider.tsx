import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { BottomSheetModalProviderProps } from '../../types';

export interface BottomSheetModalContextType {
    mount: (key: string, node: React.ReactNode) => void;
    unmount: (key: string) => void;
    onOpen: (key: string, closeSelf: () => void) => void;
    onClose: (key: string) => void;
}

export const BottomSheetModalContext = createContext<BottomSheetModalContextType | null>(null);

export const useBottomSheetModalInternal = () => {
    const context = useContext(BottomSheetModalContext);
    if (!context) {
        throw new Error('useBottomSheetModalInternal must be used within a BottomSheetModalProvider');
    }
    return context;
};

export const BottomSheetModalProvider: React.FC<BottomSheetModalProviderProps> = ({ children }) => {
    const [modals, setModals] = useState<Record<string, React.ReactNode>>({});
    const openSheetsRef = React.useRef<Record<string, () => void>>({});

    const mount = useCallback((key: string, node: React.ReactNode) => {
        setModals((prev) => ({ ...prev, [key]: node }));
    }, []);

    const unmount = useCallback((key: string) => {
        delete openSheetsRef.current[key];
        setModals((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const onOpen = useCallback((key: string, closeSelf: () => void) => {
        openSheetsRef.current[key] = closeSelf;
        Object.entries(openSheetsRef.current).forEach(([k, closeFn]) => {
            if (k !== key) {
                closeFn();
            }
        });
    }, []);

    const onClose = useCallback((key: string) => {
        delete openSheetsRef.current[key];
    }, []);

    const contextValue = useMemo(() => ({ mount, unmount, onOpen, onClose }), [mount, unmount, onOpen, onClose]);

    return (
        <BottomSheetModalContext.Provider value={contextValue}>
            <View style={styles.container}>
                {children}
                {Object.entries(modals).map(([key, node]) => (
                    <React.Fragment key={key}>{node}</React.Fragment>
                ))}
            </View>
        </BottomSheetModalContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'visible',
    },
});
