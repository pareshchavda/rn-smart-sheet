import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { BottomSheetModalProviderProps } from '../../types';

interface BottomSheetModalContextType {
    mount: (key: string, node: React.ReactNode) => void;
    unmount: (key: string) => void;
}

const BottomSheetModalContext = createContext<BottomSheetModalContextType | null>(null);

export const useBottomSheetModalInternal = () => {
    const context = useContext(BottomSheetModalContext);
    if (!context) {
        throw new Error('useBottomSheetModalInternal must be used within a BottomSheetModalProvider');
    }
    return context;
};

export const BottomSheetModalProvider: React.FC<BottomSheetModalProviderProps> = ({ children }) => {
    const [modals, setModals] = useState<Record<string, React.ReactNode>>({});

    const mount = useCallback((key: string, node: React.ReactNode) => {
        setModals((prev) => ({ ...prev, [key]: node }));
    }, []);

    const unmount = useCallback((key: string) => {
        setModals((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const contextValue = useMemo(() => ({ mount, unmount }), [mount, unmount]);

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
        ...StyleSheet.absoluteFillObject,
        overflow: 'visible',
    },
});
