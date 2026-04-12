import { useSharedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { KeyboardBehavior } from '../types';

interface UseKeyboardHandlerProps {
    enabled: boolean;
    behavior: KeyboardBehavior;
    animatedPosition: any;
    snapPoints: number[];
    currentIndex: number;
    onKeyboardChange?: (keyboardHeight: number) => void;
}

/**
 * Hook to handle keyboard interactions with bottom sheet
 * Integrates with react-native-keyboard-controller
 */
export const useKeyboardHandler = ({
    enabled,
    behavior,
    animatedPosition,
    snapPoints,
    currentIndex,
    onKeyboardChange,
}: UseKeyboardHandlerProps) => {
    const { height: keyboardHeight, progress } = useReanimatedKeyboardAnimation();
    const previousKeyboardHeight = useSharedValue(0);

    useAnimatedReaction(
        () => keyboardHeight.value,
        (current: number, previous: number | null) => {
            if (!enabled) return;

            const keyboardIsShowing = current > 0;
            const keyboardIsHiding = current === 0 && previous && previous > 0;

            if (behavior === KeyboardBehavior.EXTEND && keyboardIsShowing) {
                // Extend the sheet by keyboard height
                const currentSnapPoint = snapPoints[currentIndex];
                const newPosition = currentSnapPoint + current;
                animatedPosition.value = newPosition;
            } else if (behavior === KeyboardBehavior.FILL_PARENT && keyboardIsShowing) {
                // Adjust to fill available space
                const currentSnapPoint = snapPoints[currentIndex];
                animatedPosition.value = Math.max(currentSnapPoint, current);
            }

            if (keyboardIsHiding && previous) {
                // Restore original position
                animatedPosition.value = snapPoints[currentIndex];
            }

            previousKeyboardHeight.value = current;

            if (onKeyboardChange) {
                runOnJS(onKeyboardChange)(current);
            }
        },
        [enabled, behavior, snapPoints, currentIndex]
    );

    return {
        keyboardHeight,
        keyboardProgress: progress,
    };
};
