import { type HybridObject } from 'react-native-nitro-modules';

export interface SmartSheetHelper extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
  snapToIndex(viewTag: number, index: number): void;
  snapToPosition(viewTag: number, position: number): void;
  close(viewTag: number): void;
  forceClose(viewTag: number): void;
}
