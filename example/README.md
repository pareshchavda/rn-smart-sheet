# rn-smart-sheet Example App

This is the example application for `rn-smart-sheet`, showcasing the capabilities of the native bottom sheet component across Android and Web. (iOS under development).

## Features Showcased

- **Basic Sheet**: Simple bottom sheet with predefined snap points.
- **Chat Example**: Full keyboard interactivity with `BottomSheetFlatList` and text input.
- **Dynamic Content**: Bottom sheet that automatically adjusts its height based on content.
- **Contacts**: Static list example.
- **Settings**: Inline settings menu example.
- **Comments (Footer)**: Demonstrates the `BottomSheetFooter` which smoothly follows the keyboard.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run on Android:

   ```bash
   npm run android
   ```
   *Note: This runs a custom development client to support the native code.*

3. Run on Web:

   ```bash
   npm run web
   ```

## Development Notes

This project links directly to the local package source using `babel-plugin-module-resolver` and customized metro configurations, meaning any changes you make in `../src` or `../android` will be reflected here.
