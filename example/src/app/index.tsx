import React, { useRef, useMemo, useState } from 'react';
import { Button, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { BottomSheetModal, BottomSheetView, KeyboardBehavior, BottomSheetTextInput } from 'rn-smart-sheet';
import type { BottomSheetMethods } from 'rn-smart-sheet';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const [dynamicSizing, setDynamicSizing] = useState(false);
  const [keyboardBehavior, setKeyboardBehavior] = useState<KeyboardBehavior>(KeyboardBehavior.INTERACTIVE);
  
  const snapPoints = useMemo(() => dynamicSizing ? [] : ['25%', '50%', '75%'], [dynamicSizing]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Expo
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}

        <ThemedView style={styles.buttonContainer}>
          <Button
            title="Open Bottom Sheet"
            onPress={() => {
              console.warn('Example: Open Button Pressed');
              bottomSheetRef.current?.expand();
            }}
          />
          
          <Button
            title={`Dynamic Sizing: ${dynamicSizing ? 'ON' : 'OFF'}`}
            onPress={() => setDynamicSizing(!dynamicSizing)}
          />
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <ThemedText type="small">Keyboard Behavior:</ThemedText>
          <View style={styles.row}>
            <Button title="Interactive" onPress={() => setKeyboardBehavior(KeyboardBehavior.INTERACTIVE)} color={keyboardBehavior === KeyboardBehavior.INTERACTIVE ? '#007AFF' : '#8E8E93'} />
            <Button title="Extend" onPress={() => setKeyboardBehavior(KeyboardBehavior.EXTEND)} color={keyboardBehavior === KeyboardBehavior.EXTEND ? '#007AFF' : '#8E8E93'} />
          </View>
        </ThemedView>

        <BottomSheetModal
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enableDynamicSizing={dynamicSizing}
          keyboardBehavior={keyboardBehavior}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.contentContainer}>
            <ThemedText type="subtitle">🎉 Smart Sheet</ThemedText>
            <ThemedText>
              {dynamicSizing 
                ? "This sheet is using Dynamic Sizing! It will automatically adjust its height based on the content inside it."
                : "This is a performant bottom sheet component with fixed snap points."}
            </ThemedText>
            
            <BottomSheetTextInput 
              placeholder="Focus me to test keyboard..."
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
            
            {dynamicSizing && (
              <ThemedText>
                Extra content to test dynamic height changes...
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </ThemedText>
            )}

            <Button
              title="Close Sheet"
              onPress={() => bottomSheetRef.current?.close()}
              color="#FF3B30"
            />
          </BottomSheetView>
        </BottomSheetModal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  contentContainer: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginVertical: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: Spacing.three,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
});
