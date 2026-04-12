import { UIManager } from 'react-native';
import SmartSheetNativeModule from '../specs/NativeSmartSheetModule';
import { COMPONENT_NAME } from '../specs/SmartSheetNativeComponent';

export const isFabricRuntimeAvailable = (): boolean => {
    return (globalThis as { nativeFabricUIManager?: unknown }).nativeFabricUIManager != null;
};

export const isNativeSheetViewAvailable = (): boolean => {
    const hasViewManager =
        typeof UIManager.getViewManagerConfig === 'function' &&
        UIManager.getViewManagerConfig(COMPONENT_NAME) != null;

    if (!hasViewManager) {
        return false;
    }

    if (SmartSheetNativeModule?.isFabricAvailable) {
        return SmartSheetNativeModule.isFabricAvailable();
    }

    return isFabricRuntimeAvailable();
};
