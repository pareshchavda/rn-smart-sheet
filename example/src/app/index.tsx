import React, { useRef, useMemo, useState } from 'react';
import { Button, FlatList, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { BottomSheetModal, BottomSheetView, KeyboardBehavior, BottomSheetTextInput, BottomSheetFlatList } from 'rn-smart-sheet';
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
  const [exampleType, setExampleType] = useState<'basic' | 'chat' | 'dynamic'>('basic');
  const [keyboardBehavior, setKeyboardBehavior] = useState<KeyboardBehavior>(KeyboardBehavior.INTERACTIVE);
  
  const snapPoints = useMemo(() => {
    if (exampleType === 'dynamic') return [];
    if (exampleType === 'chat') return ['50%', '90%'];
    return ['25%', '50%', '75%'];
  }, [exampleType]);

  const chatData = useMemo(() => Array.from({ length: 50 }, (_, i) => ({ id: i, text: `Message ${i + 1}` })), []);

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
          <ThemedText type="subtitle">Select Example:</ThemedText>
          <View style={styles.row}>
            <Button title="Basic" onPress={() => setExampleType('basic')} color={exampleType === 'basic' ? '#007AFF' : '#8E8E93'} />
            <Button title="Chat" onPress={() => setExampleType('chat')} color={exampleType === 'chat' ? '#007AFF' : '#8E8E93'} />
            <Button title="Dynamic" onPress={() => setExampleType('dynamic')} color={exampleType === 'dynamic' ? '#007AFF' : '#8E8E93'} />
          </View>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <Button
            title="Open Bottom Sheet"
            onPress={() => {
              bottomSheetRef.current?.expand();
            }}
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
          enableDynamicSizing={exampleType === 'dynamic'}
          keyboardBehavior={keyboardBehavior}
          enablePanDownToClose={true}
        >
          {exampleType === 'chat' ? (
            <View style={styles.chatContainer}>
              <ThemedText type="subtitle" style={styles.chatHeader}>💬 Chat Example</ThemedText>
              <View style={styles.chatListContainer}>
                {/* On Android, nested scrolling works naturally with BottomSheetBehavior */}
                <BottomSheetView style={{ flex: 1 }}>
                  <BottomSheetFlatList
                    data={chatData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.chatMessage}>
                        <ThemedText>{item.text}</ThemedText>
                      </View>
                    )}
                    contentContainerStyle={styles.chatListContent}
                    initialNumToRender={15}
                    windowSize={5}
                  />
                </BottomSheetView>
              </View>
              <View style={styles.chatInputContainer}>
                <BottomSheetTextInput 
                  placeholder="Type a message..."
                  style={styles.input}
                  placeholderTextColor="#8E8E93"
                />
              </View>
            </View>
          ) : (
            <BottomSheetView style={styles.contentContainer}>
              <ThemedText type="subtitle">
                {exampleType === 'dynamic' ? '⚡ Dynamic Sheet' : '🎉 Basic Sheet'}
              </ThemedText>
              
              <ThemedText>
                {exampleType === 'dynamic' 
                  ? "This sheet automatically adjusts its height based on the content. It perfectly avoids the keyboard while maintaining its dynamic height."
                  : "This is a performant bottom sheet component with fixed snap points."}
              </ThemedText>
              
              <BottomSheetTextInput 
                placeholder="Focus me to test keyboard..."
                style={styles.input}
                placeholderTextColor="#8E8E93"
              />
              
              {exampleType === 'dynamic' && (
                <View style={styles.dynamicContent}>
                  <ThemedText>
                    Adding more content to show off the dynamic resizing capabilities...
                  </ThemedText>
                  <View style={styles.placeholderBox} />
                  <ThemedText>
                    Even with all this content, the keyboard avoidance remains perfect!
                  </ThemedText>
                </View>
              )}

              <Button
                title="Close Sheet"
                onPress={() => bottomSheetRef.current?.close()}
                color="#FF3B30"
              />
            </BottomSheetView>
          )}
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
  chatContainer: {
    flex: 1,
    height: '100%',
  },
  chatHeader: {
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatListContainer: {
    flex: 1,
  },
  chatListContent: {
    padding: Spacing.four,
  },
  chatMessage: {
    padding: Spacing.three,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: Spacing.two,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  chatInputContainer: {
    padding: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  dynamicContent: {
    gap: Spacing.three,
  },
  placeholderBox: {
    height: 100,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
});
