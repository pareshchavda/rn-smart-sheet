import React, { useRef, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    BottomSheet,
    BottomSheetView,
    BottomSheetScrollView,
    BottomSheetBackdrop,
    KeyboardBehavior,
    KeyboardDismissMode,
} from 'rn-smart-sheet';
import type { BottomSheetMethods, BottomSheetBackdropProps } from 'rn-smart-sheet';

const CustomBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
        {...props}
        opacity={0.6}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
    />
);

const App = () => {
    const simpleSheetRef = useRef<BottomSheetMethods>(null);
    const scrollSheetRef = useRef<BottomSheetMethods>(null);
    const keyboardSheetRef = useRef<BottomSheetMethods>(null);
    const dynamicSheetRef = useRef<BottomSheetMethods>(null);

    const [inputValue, setInputValue] = useState('');
    const [dynamicItems, setDynamicItems] = useState(['Initial Content']);

    const addDynamicItem = () => {
        setDynamicItems(prev => [...prev, `New Item ${prev.length + 1}`]);
    };

    const removeDynamicItem = () => {
        setDynamicItems(prev => prev.slice(0, -1));
    };

    return (
        <GestureHandlerRootView style={styles.container}>
                <StatusBar style="dark" />
                <SafeAreaView style={styles.container}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.title}>rn-smart-sheet</Text>
                        <Text style={styles.subtitle}>
                            Tap a card to open a bottom sheet example
                        </Text>

                        {/* Simple Bottom Sheet */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardBadge}>01</Text>
                                <Text style={styles.cardTitle}>Simple Bottom Sheet</Text>
                            </View>
                            <Text style={styles.cardDesc}>
                                Basic sheet with snap points at 25%, 50%, and 90%
                            </Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.btn}
                                    onPress={() => {
                                        console.log('App: Open button pressed');
                                        simpleSheetRef.current?.expand();
                                    }}
                                >
                                    <Text style={styles.btnText}>Open</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnOutline]}
                                    onPress={() => {
                                        console.log('App: Snap 50% button pressed');
                                        simpleSheetRef.current?.snapToIndex(1);
                                    }}
                                >
                                    <Text style={[styles.btnText, styles.btnOutlineText]}>Snap 50%</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnDanger]}
                                    onPress={() => {
                                        console.log('App: Close button pressed');
                                        simpleSheetRef.current?.close();
                                    }}
                                >
                                    <Text style={styles.btnText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Scrollable Bottom Sheet */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardBadge}>02</Text>
                                <Text style={styles.cardTitle}>Scrollable Content</Text>
                            </View>
                            <Text style={styles.cardDesc}>
                                Sheet with a scrollable list of 20 items
                            </Text>
                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => scrollSheetRef.current?.expand()}
                            >
                                <Text style={styles.btnText}>Open Scrollable Sheet</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Keyboard Bottom Sheet */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardBadge}>03</Text>
                                <Text style={styles.cardTitle}>Keyboard Integration</Text>
                            </View>
                            <Text style={styles.cardDesc}>
                                Sheet that extends automatically when the keyboard appears
                            </Text>
                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => keyboardSheetRef.current?.expand()}
                            >
                                <Text style={styles.btnText}>Open Keyboard Sheet</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Dynamic Height Bottom Sheet */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardBadge}>04</Text>
                                <Text style={styles.cardTitle}>Dynamic Height</Text>
                            </View>
                            <Text style={styles.cardDesc}>
                                Uses native measurement to wrap height automatically
                            </Text>
                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => dynamicSheetRef.current?.expand()}
                            >
                                <Text style={styles.btnText}>Open Dynamic Sheet</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Simple Bottom Sheet */}
                    <BottomSheet
                        ref={simpleSheetRef}
                        snapPoints={['25%', '50%', '90%']}
                        index={-1}
                        backdropComponent={CustomBackdrop}
                        onChange={(index) => console.log('Simple sheet index:', index)}
                    >
                        <BottomSheetView style={styles.sheetContent}>
                            <Text style={styles.sheetTitle}>Simple Bottom Sheet</Text>
                            <Text style={styles.sheetText}>
                                Drag the handle or swipe down to dismiss. Snap points: 25%,
                                50%, 90%.
                            </Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.btn}
                                    onPress={() => simpleSheetRef.current?.expand()}
                                >
                                    <Text style={styles.btnText}>Expand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnOutline]}
                                    onPress={() => simpleSheetRef.current?.collapse()}
                                >
                                    <Text style={[styles.btnText, styles.btnOutlineText]}>Collapse</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnDanger]}
                                    onPress={() => simpleSheetRef.current?.close()}
                                >
                                    <Text style={styles.btnText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </BottomSheetView>
                    </BottomSheet>

                    {/* Scrollable Bottom Sheet */}
                    <BottomSheet
                        ref={scrollSheetRef}
                        snapPoints={['50%', '90%']}
                        index={-1}
                        backdropComponent={CustomBackdrop}
                    >
                        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
                            <Text style={styles.sheetTitle}>Scrollable Content</Text>
                            {Array.from({ length: 20 }).map((_, i) => (
                                <View key={i} style={styles.listItem}>
                                    <Text style={styles.listItemText}>Item {i + 1}</Text>
                                    <Text style={styles.listItemSubtext}>
                                        Scrollable item inside the bottom sheet
                                    </Text>
                                </View>
                            ))}
                        </BottomSheetScrollView>
                    </BottomSheet>

                    {/* Keyboard Bottom Sheet */}
                    <BottomSheet
                        ref={keyboardSheetRef}
                        snapPoints={['60%', '90%']}
                        index={-1}
                        keyboardBehavior={KeyboardBehavior.EXTEND}
                        keyboardDismissMode={KeyboardDismissMode.ON_DRAG}
                        backdropComponent={CustomBackdrop}
                    >
                        <BottomSheetView style={styles.sheetContent}>
                            <Text style={styles.sheetTitle}>Keyboard Integration</Text>
                            <Text style={styles.sheetText}>
                                Tap the input below — the sheet extends with the keyboard.
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Type something..."
                                value={inputValue}
                                onChangeText={setInputValue}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.btn, styles.btnDanger]}
                                onPress={() => keyboardSheetRef.current?.close()}
                            >
                                <Text style={styles.btnText}>Close</Text>
                            </TouchableOpacity>
                        </BottomSheetView>
                    </BottomSheet>
                    {/* Dynamic Height Bottom Sheet */}
                    <BottomSheet
                        ref={dynamicSheetRef}
                        index={-1}
                        enableDynamicSizing={true}
                        backdropComponent={CustomBackdrop}
                    >
                        <BottomSheetView style={styles.sheetContent}>
                            <Text style={styles.sheetTitle}>Dynamic Height</Text>
                            <Text style={styles.sheetText}>
                                This sheet automatically adjusts its height based on its content using native measurement.
                            </Text>
                            
                            <View style={styles.dynamicList}>
                                {dynamicItems.map((item, index) => (
                                    <View key={index} style={styles.dynamicItem}>
                                        <Text style={styles.dynamicItemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.btn}
                                    onPress={addDynamicItem}
                                >
                                    <Text style={styles.btnText}>Add Item</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnOutline]}
                                    onPress={removeDynamicItem}
                                    disabled={dynamicItems.length === 0}
                                >
                                    <Text style={[styles.btnText, styles.btnOutlineText]}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <TouchableOpacity
                                style={[styles.btn, styles.btnDanger, { marginTop: 12 }]}
                                onPress={() => dynamicSheetRef.current?.close()}
                            >
                                <Text style={styles.btnText}>Close</Text>
                            </TouchableOpacity>
                        </BottomSheetView>
                    </BottomSheet>
                </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const PRIMARY = '#6366F1';
const DANGER = '#EF4444';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5889b9ff',
    },
    content: {
        padding: 20,
        paddingBottom: 60,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 10,
    },
    cardBadge: {
        fontSize: 12,
        fontWeight: '700',
        color: PRIMARY,
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
    },
    cardDesc: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 14,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
    },
    btn: {
        flex: 1,
        backgroundColor: PRIMARY,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    btnOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: PRIMARY,
    },
    btnDanger: {
        backgroundColor: DANGER,
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    btnOutlineText: {
        color: PRIMARY,
    },
    sheetContent: {
        flex: 1,
        padding: 24,
    },
    sheetTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 10,
    },
    sheetText: {
        fontSize: 15,
        color: '#475569',
        marginBottom: 16,
        lineHeight: 22,
    },
    scrollContent: {
        padding: 20,
    },
    listItem: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    listItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2,
    },
    listItemSubtext: {
        fontSize: 13,
        color: '#64748B',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
        color: '#1E293B',
    },
    dynamicList: {
        marginBottom: 16,
    },
    dynamicItem: {
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dynamicItemText: {
        color: '#334155',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default App;
