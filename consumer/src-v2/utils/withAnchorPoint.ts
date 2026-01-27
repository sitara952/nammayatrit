import type { TransformsStyle } from 'react-native';

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

const isValidSize = (size: Size): boolean => {
    'worklet';
    return size && size.width > 0 && size.height > 0;
};

const defaultAnchorPoint = { x: 0.5, y: 0.5 };
export const withAnchorPoint = (transform: TransformsStyle, anchorPoint: Point, size: Size) => {
    'worklet';
    if (!isValidSize(size)) {
        return transform;
    }

    const injectedTransform = Array.isArray(transform.transform) ? transform.transform : [];

    const shiftTranslateX =
        anchorPoint.x !== defaultAnchorPoint.x && size.width
            ? [
                  { translateX: size.width * (anchorPoint.x - defaultAnchorPoint.x) },
                  ...injectedTransform,
                  { translateX: size.width * (defaultAnchorPoint.x - anchorPoint.x) },
              ]
            : injectedTransform;

    const shiftTranslateY =
        anchorPoint.y !== defaultAnchorPoint.y && size.height
            ? [
                  { translateY: size.height * (anchorPoint.y - defaultAnchorPoint.y) },
                  ...shiftTranslateX,
                  { translateY: size.height * (defaultAnchorPoint.y - anchorPoint.y) },
              ]
            : shiftTranslateX;

    return { transform: shiftTranslateY };
};
