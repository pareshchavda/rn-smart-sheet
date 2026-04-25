# rn-smart-sheet

A high-performance, **Pure Native** bottom sheet component for React Native. Designed for the New Architecture (Fabric/Bridgeless), it provides elite-level keyboard management and buttery-smooth animations.

[![npm version](https://img.shields.io/npm/v/rn-smart-sheet.svg)](https://www.npmjs.com/package/rn-smart-sheet)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

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

```tsx
import React, { useRef } from 'react';
import { View, Button } from 'react-native';
import { BottomSheet, BottomSheetView, BottomSheetTextInput, BottomSheetModalProvider } from 'rn-smart-sheet';

const App = () => {
  const bottomSheetRef = useRef(null);

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <Button title="Open Sheet" onPress={() => bottomSheetRef.current?.expand()} />

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={['25%', '50%', '90%']}
        >
          <BottomSheetView style={{ padding: 20 }}>
            <BottomSheetTextInput 
              placeholder="Deep Native Focus..." 
              style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} 
            />
          </BottomSheetView>
        </BottomSheet>
      </View>
    </BottomSheetModalProvider>
  );
};
```

## 📖 Key Components

### `BottomSheetTextInput`
A specialized wrapper around the standard `TextInput`. When focused, it automatically triggers the native sheet's "lift" behavior, ensuring the input stays visible above the keyboard with zero latency.

### `BottomSheetView`
A layout-optimized container for your sheet content. On Android, this container dynamically grows to accommodate the keyboard height.

## 📚 API Reference

### BottomSheet Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `snapPoints` | `SnapPoint[]` | **required** | Array of snap points (e.g., `['25%', 500]`) |
| `index` | `number` | `0` | Initial snap index |
| `keyboardBehavior` | `KeyboardBehavior` | `INTERACTIVE` | `INTERACTIVE` | `EXTEND` |
| `enableDynamicSizing` | `boolean` | `false` | Automatically adjust height to content |

### Keyboard Behaviors
- **INTERACTIVE**: The sheet stays at its current snap point and lifts the content.
- **EXTEND**: The sheet automatically expands to its maximum height when an input is focused.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © 2026

---

*Inspired by elite native performance. Built for the modern React Native ecosystem.*
