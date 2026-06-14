import { View, type ViewProps } from 'react-native';

import { ThemeColor, Colors } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  return <View style={[{ backgroundColor: Colors.light[type ?? 'background'] }, style]} {...otherProps} />;
}
