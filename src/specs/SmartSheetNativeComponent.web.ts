import React from 'react';
import { View } from 'react-native';

export const COMPONENT_NAME = 'RNSmartSheetView';

export const Commands = {
    snapToIndex: () => {},
    snapToPosition: () => {},
    expand: () => {},
    collapse: () => {},
    close: () => {},
    forceClose: () => {},
};

const RNSmartSheetView = ({ children, ...props }: any) => {
    return <View {...props}>{children}</View>;
};

export default RNSmartSheetView;
