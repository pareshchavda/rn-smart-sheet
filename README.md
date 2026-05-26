# rn-smart-sheet

A high-performance, **Pure Native** bottom sheet component for React Native. Designed for the New Architecture (Fabric/Bridgeless), it provides elite-level keyboard management and buttery-smooth animations.

[![npm version](https://img.shields.io/npm/v/rn-smart-sheet.svg)](https://www.npmjs.com/package/rn-smart-sheet)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🌐 Supported Platforms

- 🤖 **Android**: Fully supported (Native via BottomSheetBehavior)
- 🍎 **iOS**: Fully supported (Native via UISheetPresentationController with dynamic detents)
- 💻 **Web**: Fully supported (DOM/CSS based)

## 🚀 Why Pure Native?

Unlike traditional bottom sheets that rely on JavaScript listeners and the React Native bridge for keyboard handling, **rn-smart-sheet** manages everything on the native side. 

- **Zero-Latency Keyboard Lift**: Perfect, frame-by-frame synchronization with the native Android keyboard animation.
- **Ironclad Stability**: Uses a "Stable Height" memory system to prevent the sheet from vanishing or clipping when the Android window resizes.
- **Native Focus Detection**: Automatically detects focus in *any* child input (Native or React) and lifts the sheet instantly.

## ✨ Features

- 🎯 **New Architecture Ready** - Full support for Fabric and Bridgeless mode.
- ⌨️ **Deep Native Keyboard Sync** - Integrated `WindowInsets` handling in Kotlin.
- 📐 **Stable Height Memory** - Prevents layout instability during OS-level window resizing.
- 🔄 **Adaptive Snap Points** - Support for dynamic sizing and percentage-based snaps.
- 📱 **Modals & Inline Sheets** - Exporting both `BottomSheet` and `BottomSheetModal` for various UX patterns.
- 📜 **Scrollable Components** - Built-in `BottomSheetScrollView` and `BottomSheetFlatList` for dynamic content.
- 👟 **Footer Support** - Stick components to the keyboard seamlessly with `BottomSheetFooter`.
- 🎮 **BottomSheetTextInput** - Specialized input component for perfect focus integration.
- 🎨 **Customizable Aesthetics** - Premium defaults with deep customization for handles and backdrops.

## 📦 Installation

```bash
npm install rn-smart-sheet
```

### Peer Dependencies

```bash
npm install react-native-reanimated react-native-gesture-handler
```

## 🚀 Quick Start

Here is a comprehensive example using `BottomSheetModalProvider` and `BottomSheetModal`:

```tsx
import React, { useRef } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { 
  BottomSheetModalProvider, 
  BottomSheetModal, 
  BottomSheetView, 
  BottomSheetTextInput 
} from 'rn-smart-sheet';

const App = () => {
  const bottomSheetRef = useRef(null);

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Button title="Open Sheet" onPress={() => bottomSheetRef.current?.expand()} />

        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={['25%', '50%', '90%']}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.sheetContent}>
            <BottomSheetTextInput 
              placeholder="Deep Native Focus..." 
              style={styles.input} 
            />
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  sheetContent: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 }
});

export default App;
```

## 📖 Key Components

### `BottomSheetModalProvider` & `BottomSheetModal`
Used to display bottom sheets that appear above all other app content. Must be wrapped in `BottomSheetModalProvider`.

### `BottomSheetTextInput`
A specialized wrapper around the standard `TextInput`. When focused, it automatically triggers the native sheet's "lift" behavior, ensuring the input stays visible above the keyboard with zero latency.

### `BottomSheetView`
A layout-optimized container for your sheet content. On Android, this container dynamically grows to accommodate the keyboard height.

### `BottomSheetFlatList` & `BottomSheetScrollView`
Optimized scrollable components that properly interact with the bottom sheet's pan gestures and keyboard events.

### `BottomSheetFooter`
A sticky footer component that seamlessly moves with the keyboard when an input is focused.

## 📚 API Reference

### BottomSheet / BottomSheetModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `snapPoints` | `SnapPoint[]` | **required** | Array of snap points (e.g., `['25%', 500]`) |
| `index` | `number` | `-1` | Initial snap index (`-1` means closed for Modals) |
| `keyboardBehavior` | `KeyboardBehavior` | `INTERACTIVE` | `INTERACTIVE` \| `EXTEND` |
| `enableDynamicSizing` | `boolean` | `false` | Automatically adjust height to content |
| `enablePanDownToClose` | `boolean` | `false` | Allow closing the sheet by dragging down |
| `footerComponent` | `FC<BottomSheetFooterProps>`| `undefined` | Sticky footer component |

### Keyboard Behaviors
- **INTERACTIVE**: The sheet stays at its current snap point and lifts the content.
- **EXTEND**: The sheet automatically expands to its maximum height when an input is focused.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © 2026

---

*Inspired by elite native performance. Built for the modern React Native ecosystem.*
