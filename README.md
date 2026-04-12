# rn-smart-sheet

A performant, feature-rich bottom sheet component for React Native with Reanimated 2-4 support and integrated keyboard management.

## New Architecture Status

The package now ships with New Architecture scaffolding:

- Fabric component spec: `src/specs/SmartSheetNativeComponent.ts`
- TurboModule spec: `src/specs/NativeSmartSheetModule.ts`
- JS compatibility wrapper: the public `BottomSheet` now prefers the native host when available and automatically falls back to the legacy Reanimated implementation

This lets you migrate app code without changing the existing JS API while you finish the Android and iOS native view managers.

[![npm version](https://img.shields.io/npm/v/rn-smart-sheet.svg)](https://www.npmjs.com/package/rn-smart-sheet)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **Reanimated 2, 3, and 4 Support** - Works seamlessly across all modern Reanimated versions
- ⌨️ **Integrated Keyboard Management** - Built-in keyboard handling with `react-native-keyboard-controller`
- 🎨 **Highly Customizable** - Custom handle, backdrop, and styling options
- 📐 **Flexible Snap Points** - Support for percentage and pixel-based snap points
- 🎭 **Modal & Inline Modes** - Use as a modal or inline component
- 🔄 **Smooth Animations** - 60fps animations with spring physics
- 📱 **iOS & Android** - Full support for both platforms
- 💪 **TypeScript First** - Comprehensive TypeScript definitions
- 🎮 **Gesture Driven** - Intuitive pan gestures with velocity detection
- 🔌 **Imperative API** - Control the sheet programmatically

## 📦 Installation

```bash
npm install rn-smart-sheet
```

or

```bash
yarn add rn-smart-sheet
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react-native-reanimated react-native-gesture-handler react-native-keyboard-controller
```

Follow the installation instructions for each:
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)
- [react-native-keyboard-controller](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/installation)

## 🚀 Quick Start

```tsx
import React, { useRef } from 'react';
import { View, Text, Button } from 'react-native';
import BottomSheet, { BottomSheetView } from 'rn-smart-sheet';
import type { BottomSheetMethods } from 'rn-smart-sheet';

const App = () => {
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  return (
    <View style={{ flex: 1 }}>
      <Button
        title="Open Bottom Sheet"
        onPress={() => bottomSheetRef.current?.expand()}
      />

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['25%', '50%', '90%']}
        index={0}
      >
        <BottomSheetView>
          <Text>Hello from Bottom Sheet! 👋</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default App;
```

## 📖 Usage Examples

### With ScrollView

```tsx
import { BottomSheetScrollView } from 'rn-smart-sheet';

<BottomSheet ref={bottomSheetRef} snapPoints={['50%', '90%']}>
  <BottomSheetScrollView>
    <Text>Scrollable content...</Text>
    {/* More content */}
  </BottomSheetScrollView>
</BottomSheet>
```

### With Keyboard Management

```tsx
import { KeyboardBehavior } from 'rn-smart-sheet';

<BottomSheet
  ref={bottomSheetRef}
  snapPoints={['50%', '90%']}
  keyboardBehavior={KeyboardBehavior.EXTEND}
  keyboardDismissMode={KeyboardDismissMode.ON_DRAG}
>
  <BottomSheetView>
    <TextInput placeholder="Type something..." />
  </BottomSheetView>
</BottomSheet>
```

### Custom Backdrop

```tsx
import { BottomSheetBackdrop } from 'rn-smart-sheet';
import type { BottomSheetBackdropProps } from 'rn-smart-sheet';

const CustomBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    opacity={0.7}
    pressBehavior="close"
    appearsOnIndex={0}
    disappearsOnIndex={-1}
  />
);

<BottomSheet
  ref={bottomSheetRef}
  snapPoints={['50%', '90%']}
  backdropComponent={CustomBackdrop}
>
  {/* Content */}
</BottomSheet>
```

### Using the Hook

```tsx
import { useBottomSheet } from 'rn-smart-sheet';

const MyComponent = () => {
  const { expand, close, snapToIndex } = useBottomSheet();

  return (
    <View>
      <Button title="Expand" onPress={expand} />
      <Button title="Close" onPress={close} />
      <Button title="Snap to Middle" onPress={() => snapToIndex(1)} />
    </View>
  );
};
```

## 📚 API Reference

### BottomSheet Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `snapPoints` | `SnapPoint[]` | **required** | Array of snap points (percentage strings or pixel values) |
| `index` | `number` | `0` | Initial snap index |
| `enablePanDownToClose` | `boolean` | `true` | Enable closing by panning down |
| `enableDynamicSizing` | `boolean` | `false` | Enable dynamic content sizing |
| `animationConfig` | `AnimationConfig` | - | Custom spring animation config |
| `keyboardBehavior` | `KeyboardBehavior` | `INTERACTIVE` | How sheet responds to keyboard |
| `keyboardDismissMode` | `KeyboardDismissMode` | `ON_DRAG` | When to dismiss keyboard |
| `enableHandleComponent` | `boolean` | `true` | Show/hide handle component |
| `handleComponent` | `ComponentType` | - | Custom handle component |
| `backdropComponent` | `ComponentType \| null` | - | Custom backdrop component |
| `backgroundStyle` | `StyleProp<ViewStyle>` | - | Background container style |
| `handleStyle` | `StyleProp<ViewStyle>` | - | Handle container style |
| `handleIndicatorStyle` | `StyleProp<ViewStyle>` | - | Handle indicator style |
| `style` | `StyleProp<ViewStyle>` | - | Sheet container style |
| `onChange` | `(index: number) => void` | - | Callback when index changes |
| `onAnimate` | `(from: number, to: number) => void` | - | Callback when animation starts |
| `enableGesture` | `boolean` | `true` | Enable/disable pan gesture |
| `overDragResistanceFactor` | `number` | `0` | Resistance when over-dragging |

### BottomSheet Methods (via ref)

| Method | Signature | Description |
|--------|-----------|-------------|
| `snapToIndex` | `(index: number) => void` | Snap to specific index |
| `snapToPosition` | `(position: number) => void` | Snap to specific position in pixels |
| `expand` | `() => void` | Expand to maximum snap point |
| `collapse` | `() => void` | Collapse to minimum snap point |
| `close` | `() => void` | Close the bottom sheet |
| `forceClose` | `() => void` | Force close without animation |

### KeyboardBehavior Enum

- `EXTEND` - Sheet extends when keyboard opens
- `FILL_PARENT` - Sheet fills available space above keyboard
- `INTERACTIVE` - Sheet stays in place (default)

### KeyboardDismissMode Enum

- `ON_DRAG` - Dismiss keyboard when dragging (default)
- `NONE` - Don't dismiss keyboard

## 🎨 Styling

The bottom sheet can be styled using the following props:

```tsx
<BottomSheet
  backgroundStyle={{
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  }}
  handleIndicatorStyle={{
    backgroundColor: '#9CA3AF',
    width: 50,
  }}
>
  {/* Content */}
</BottomSheet>
```

## 🔧 Advanced Usage

### Dynamic Snap Points

```tsx
const [snapPoints, setSnapPoints] = useState(['25%', '50%', '90%']);

// Update snap points dynamically
useEffect(() => {
  setSnapPoints(['30%', '60%', '95%']);
}, [someCondition]);
```

### Programmatic Control

```tsx
const bottomSheetRef = useRef<BottomSheetMethods>(null);

// Expand to top
bottomSheetRef.current?.expand();

// Snap to specific index
bottomSheetRef.current?.snapToIndex(1);

// Close
bottomSheetRef.current?.close();
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © 2026

## 🙏 Acknowledgments

Inspired by [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet) with modern architecture and enhanced keyboard management.
