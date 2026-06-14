import { DefaultTheme, ThemeProvider } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Stack } from 'expo-router';
import { BottomSheetModalProvider } from 'rn-smart-sheet';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <BottomSheetModalProvider>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }} />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
