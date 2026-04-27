import React, { useRef, useMemo, useState } from 'react';
import { Platform, StyleSheet, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { BottomSheetModal, BottomSheetView, KeyboardBehavior, BottomSheetTextInput, BottomSheetFlatList } from 'rn-smart-sheet';
import type { BottomSheetMethods } from 'rn-smart-sheet';

export default function HomeScreen() {
  const basicSheetRef = useRef<BottomSheetMethods>(null);
  const chatSheetRef = useRef<BottomSheetMethods>(null);
  const dynamicSheetRef = useRef<BottomSheetMethods>(null);
  const contactSheetRef = useRef<BottomSheetMethods>(null);
  const settingsSheetRef = useRef<BottomSheetMethods>(null);
  
  const [keyboardBehavior, setKeyboardBehavior] = useState<KeyboardBehavior>(KeyboardBehavior.INTERACTIVE);
  const chatData = useMemo(() => Array.from({ length: 50 }, (_, i) => ({ id: i, text: `Message ${i + 1}` })), []);
  const contacts = useMemo(() => [
    { id: 1, name: 'John Doe', status: 'Online' },
    { id: 2, name: 'Jane Smith', status: 'Away' },
    { id: 3, name: 'Alex Johnson', status: 'Offline' },
    { id: 4, name: 'Sarah Wilson', status: 'Online' },
    { id: 5, name: 'Mike Brown', status: 'Busy' },
  ], []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Smart Sheet Showcase</ThemedText>
          <ThemedText style={styles.subtitle}>Premium Bottom Sheet for React Native</ThemedText>
        </ThemedView>

        <ThemedView style={styles.buttonGrid}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Main Examples</ThemedText>
          <View style={styles.row}>
            <Pressable 
              onPress={() => basicSheetRef.current?.expand()}
              style={({ pressed }) => [
                styles.exampleButton,
                { backgroundColor: '#007AFF', opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <ThemedText style={styles.buttonText}>🎉 Basic</ThemedText>
            </Pressable>
            
            <Pressable 
              onPress={() => chatSheetRef.current?.expand()}
              style={({ pressed }) => [
                styles.exampleButton,
                { backgroundColor: '#34C759', opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <ThemedText style={styles.buttonText}>💬 Chat</ThemedText>
            </Pressable>
            
            <Pressable 
              onPress={() => dynamicSheetRef.current?.expand()}
              style={({ pressed }) => [
                styles.exampleButton,
                { backgroundColor: '#5856D6', opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <ThemedText style={styles.buttonText}>⚡ Dynamic</ThemedText>
            </Pressable>
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>App Use Cases</ThemedText>
          <View style={styles.row}>
            <Pressable 
              onPress={() => contactSheetRef.current?.expand()}
              style={({ pressed }) => [
                styles.exampleButton,
                { backgroundColor: '#FF9500', opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <ThemedText style={styles.buttonText}>👥 Contacts</ThemedText>
            </Pressable>
            
            <Pressable 
              onPress={() => settingsSheetRef.current?.expand()}
              style={({ pressed }) => [
                styles.exampleButton,
                { backgroundColor: '#8E8E93', opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <ThemedText style={styles.buttonText}>⚙️ Settings</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        <ThemedView style={styles.configSection}>
          <ThemedText type="small">Keyboard Strategy:</ThemedText>
          <View style={styles.row}>
            <Pressable 
              onPress={() => setKeyboardBehavior(KeyboardBehavior.INTERACTIVE)}
              style={[
                styles.smallButton,
                { backgroundColor: keyboardBehavior === KeyboardBehavior.INTERACTIVE ? '#007AFF' : '#E5E7EB' }
              ]}
            >
              <ThemedText style={{ color: keyboardBehavior === KeyboardBehavior.INTERACTIVE ? '#FFF' : '#374151', fontSize: 12 }}>Interactive</ThemedText>
            </Pressable>
            
            <Pressable 
              onPress={() => setKeyboardBehavior(KeyboardBehavior.EXTEND)}
              style={[
                styles.smallButton,
                { backgroundColor: keyboardBehavior === KeyboardBehavior.EXTEND ? '#007AFF' : '#E5E7EB' }
              ]}
            >
              <ThemedText style={{ color: keyboardBehavior === KeyboardBehavior.EXTEND ? '#FFF' : '#374151', fontSize: 12 }}>Extend</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {/* Basic Sheet */}
        <BottomSheetModal
          ref={basicSheetRef}
          index={-1}
          snapPoints={['25%', '50%', '75%']}
          keyboardBehavior={keyboardBehavior}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.contentContainer}>
            <ThemedText type="subtitle">🎉 Basic Sheet</ThemedText>
            <ThemedText>
              This is a performant bottom sheet component with fixed snap points.
            </ThemedText>
            <BottomSheetTextInput 
              placeholder="Focus me..."
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
            <Pressable 
              onPress={() => basicSheetRef.current?.close()}
              style={[styles.closeButton, { backgroundColor: '#FF3B30' }]}
            >
              <ThemedText style={styles.buttonText}>Close</ThemedText>
            </Pressable>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Chat Sheet */}
        <BottomSheetModal
          ref={chatSheetRef}
          index={-1}
          snapPoints={['50%', '90%']}
          keyboardBehavior={keyboardBehavior}
          enablePanDownToClose={true}
        >
          <View style={styles.chatContainer}>
            <ThemedText type="subtitle" style={styles.chatHeader}>💬 Chat Example</ThemedText>
            <View style={styles.chatListContainer}>
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
        </BottomSheetModal>

        {/* Dynamic Sheet */}
        <BottomSheetModal
          ref={dynamicSheetRef}
          index={-1}
          snapPoints={[]}
          enableDynamicSizing={true}
          keyboardBehavior={keyboardBehavior}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.contentContainer}>
            <ThemedText type="subtitle">⚡ Dynamic Sheet</ThemedText>
            <ThemedText>
              This sheet automatically adjusts its height based on the content.
            </ThemedText>
            <BottomSheetTextInput 
              placeholder="Focus me..."
              style={styles.input}
              placeholderTextColor="#8E8E93"
            />
            <View style={styles.dynamicContent}>
              <ThemedText>
                Adding more content to show off the dynamic resizing capabilities...
              </ThemedText>
              <View style={styles.placeholderBox} />
              <ThemedText>
                Even with all this content, the keyboard avoidance remains perfect!
              </ThemedText>
            </View>
            <Pressable 
              onPress={() => dynamicSheetRef.current?.close()}
              style={[styles.closeButton, { backgroundColor: '#FF3B30' }]}
            >
              <ThemedText style={styles.buttonText}>Close</ThemedText>
            </Pressable>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Contacts Sheet */}
        <BottomSheetModal
          ref={contactSheetRef}
          index={-1}
          snapPoints={['50%', '80%']}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.contentContainer}>
            <ThemedText type="subtitle">👥 Contacts</ThemedText>
            {contacts.map(contact => (
              <View key={contact.id} style={styles.contactRow}>
                <View style={styles.avatar} />
                <View>
                  <ThemedText style={{ fontWeight: 'bold' }}>{contact.name}</ThemedText>
                  <ThemedText type="small">{contact.status}</ThemedText>
                </View>
              </View>
            ))}
            <Pressable 
              onPress={() => contactSheetRef.current?.close()}
              style={[styles.closeButton, { backgroundColor: '#FF9500' }]}
            >
              <ThemedText style={styles.buttonText}>Done</ThemedText>
            </Pressable>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Settings Sheet */}
        <BottomSheetModal
          ref={settingsSheetRef}
          index={-1}
          snapPoints={['40%']}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.contentContainer}>
            <ThemedText type="subtitle">⚙️ Settings</ThemedText>
            <View style={styles.settingItem}>
              <ThemedText>Notifications</ThemedText>
              <View style={styles.placeholderSwitch} />
            </View>
            <View style={styles.settingItem}>
              <ThemedText>Dark Mode</ThemedText>
              <View style={[styles.placeholderSwitch, { backgroundColor: '#007AFF' }]} />
            </View>
            <View style={styles.settingItem}>
              <ThemedText>Privacy Mode</ThemedText>
              <View style={styles.placeholderSwitch} />
            </View>
            <Pressable 
              onPress={() => settingsSheetRef.current?.close()}
              style={[styles.closeButton, { backgroundColor: '#8E8E93' }]}
            >
              <ThemedText style={styles.buttonText}>Save Settings</ThemedText>
            </Pressable>
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
  contentContainer: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  exampleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  header: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 14,
  },
  buttonGrid: {
    width: '100%',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.7,
    marginTop: Spacing.two,
  },
  configSection: {
    width: '100%',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
    paddingTop: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  placeholderSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
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
