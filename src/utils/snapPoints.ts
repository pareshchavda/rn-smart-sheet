import type { SnapPoint } from '../types';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Convert snap point to pixel value
 */
export const normalizeSnapPoint = (snapPoint: SnapPoint): number => {
    if (typeof snapPoint === 'number') {
        return snapPoint;
    }

    // Handle percentage strings
    if (typeof snapPoint === 'string' && snapPoint.endsWith('%')) {
        const percentage = parseFloat(snapPoint);
        return (percentage / 100) * SCREEN_HEIGHT;
    }

    return 0;
};

/**
 * Normalize all snap points to pixel values
 */
export const normalizeSnapPoints = (snapPoints: SnapPoint[] = []): number[] => {
    return snapPoints.map(normalizeSnapPoint).sort((a, b) => a - b);
};

/**
 * Get the closest snap point index
 */
export const getClosestSnapPoint = (
    position: number,
    snapPoints: number[]
): number => {
    let minDistance = Infinity;
    let closestIndex = 0;

    snapPoints.forEach((point, index) => {
        const distance = Math.abs(position - point);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
};
