import type { AnimationConfig } from '../types';
import {
    withSpring,
    withTiming,
    type WithSpringConfig,
    type WithTimingConfig,
} from 'react-native-reanimated';

/**
 * Default spring animation config
 */
export const SPRING_CONFIG: WithSpringConfig = {
    damping: 50,
    stiffness: 400,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
};

/**
 * Default timing animation config
 */
export const TIMING_CONFIG: WithTimingConfig = {
    duration: 250,
};

/**
 * Create spring animation with custom config
 */
export const createSpringAnimation = (
    toValue: number,
    config?: AnimationConfig
) => {
    return withSpring(toValue, {
        ...SPRING_CONFIG,
        ...config,
    } as any);
};

/**
 * Create timing animation
 */
export const createTimingAnimation = (
    toValue: number,
    duration: number = 250
) => {
    return withTiming(toValue, {
        duration,
    });
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
    'worklet';
    return Math.min(Math.max(value, min), max);
};

/**
 * Interpolate value from input range to output range
 */
export const interpolate = (
    value: number,
    inputRange: number[],
    outputRange: number[]
): number => {
    'worklet';

    if (value <= inputRange[0]) return outputRange[0];
    if (value >= inputRange[inputRange.length - 1])
        return outputRange[outputRange.length - 1];

    for (let i = 0; i < inputRange.length - 1; i++) {
        if (value >= inputRange[i] && value <= inputRange[i + 1]) {
            const progress =
                (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
            return outputRange[i] + progress * (outputRange[i + 1] - outputRange[i]);
        }
    }

    return outputRange[0];
};
