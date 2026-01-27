import { useCallback, useContext } from 'react';
import { SharedValue } from 'react-native-reanimated';
import useOnAnimationEnd from './useOnAnimationEnd';
import { Dimensions } from 'react-native';
import { MapContext } from '../Maps/MapContext';

type OnAnimationStop = (currentPosition: number) => void;

const useOnBottomSheetAnimate = (
    sheetAnimatedPosition: SharedValue<number>,
    shouldRun: React.MutableRefObject<boolean>,
    bottomOffset: {
        top: number | undefined;
        right: number | undefined;
        left: number | undefined;
        bottom: number;
    },
    updateStaticPadding: boolean | undefined,
) => {
    const { mapRef } = useContext(MapContext);
    const onAnimationStop: OnAnimationStop = useCallback(
        currentPosition => {
            const bottomPad = Dimensions.get('screen').height - currentPosition - 30 + bottomOffset.bottom;
            if (updateStaticPadding === undefined) return;
            if (updateStaticPadding === true) {
                mapRef.current?.addStaticMapPadding({
                    left: bottomOffset.left,
                    top: bottomOffset.top,
                    right: bottomOffset.right,
                    bottom: bottomPad,
                });
            } else {
                mapRef.current?.addMapPadding({
                    left: bottomOffset.left,
                    top: bottomOffset.top,
                    right: bottomOffset.right,
                    bottom: bottomPad,
                });
            }
        },
        [mapRef.current, updateStaticPadding],
    );

    useOnAnimationEnd(sheetAnimatedPosition, shouldRun, onAnimationStop);
};

export default useOnBottomSheetAnimate;
