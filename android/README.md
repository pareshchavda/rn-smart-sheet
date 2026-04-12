# Android Native Layer

This package now exposes React Native codegen specs for:

- `RNSmartSheetView` as a Fabric component
- `RNSmartSheetModule` as a TurboModule

The JS layer already knows how to use these interfaces and will fall back to
the legacy implementation until the Android native classes are registered.
