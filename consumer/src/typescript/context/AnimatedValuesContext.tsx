import React from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

type AnimatedScreenKey = 'default' | 'journeyDetails' | 'liveJourneyDetailedView' | 'rideConfirmed';

interface AnimatedValuesContextType {
    sheetAnimatedIndex: SharedValue<number>;
    sheetAnimatedPosition: SharedValue<number>;
    sheetAnimatedIndexJourneyDetails: SharedValue<number>;
    sheetAnimatedPositionJourneyDetails: SharedValue<number>;
    liveJourneyBottomSheetIndex: SharedValue<number>;
    liveJourneyBottomSheetPosition: SharedValue<number>;
    sheetAnimatedIndexRideConfirmed: SharedValue<number>;
    sheetAnimatedPositionRideConfirmed: SharedValue<number>;
    circularSliderParentScroll: SharedValue<boolean>;
    animatedValuesMap: Record<
        AnimatedScreenKey,
        Pick<AnimatedValuesContextType, 'sheetAnimatedIndex' | 'sheetAnimatedPosition' | 'circularSliderParentScroll'>
    >;
}
const AnimatedValuesContext = React.createContext<AnimatedValuesContextType | undefined>(undefined);

const useAnimatedContextValues = (
    screenName: AnimatedScreenKey | undefined,
): Pick<AnimatedValuesContextType, 'sheetAnimatedIndex' | 'sheetAnimatedPosition' | 'circularSliderParentScroll'> => {
    const context = React.useContext(AnimatedValuesContext);
    if (!context) {
        throw new Error(
            'useAnimatedContextValues: `AnimatedValuesContext` is undefined. Seems you forgot to wrap component within the AnimatedValuesProvider',
        );
    }

    return context.animatedValuesMap[screenName ?? 'default'];
};
const AnimatedValuesProvider: React.FC<Partial<AnimatedValuesContextType & { children: React.ReactNode }>> = props => {
    const sheetAnimatedIndex = useSharedValue(1);
    const sheetAnimatedPosition = useSharedValue(0);
    const sheetAnimatedIndexJourneyDetails = useSharedValue(1);
    const sheetAnimatedPositionJourneyDetails = useSharedValue(0);
    const liveJourneyBottomSheetIndex = useSharedValue(1);
    const liveJourneyBottomSheetPosition = useSharedValue(0);
    const sheetAnimatedIndexRideConfirmed = useSharedValue(1);
    const sheetAnimatedPositionRideConfirmed = useSharedValue(0);
    const circularSliderParentScroll = useSharedValue(true);
    const animatedValuesMap: Record<
        AnimatedScreenKey,
        Pick<AnimatedValuesContextType, 'sheetAnimatedIndex' | 'sheetAnimatedPosition' | 'circularSliderParentScroll'>
    > = {
        default: {
            sheetAnimatedIndex,
            sheetAnimatedPosition,
            circularSliderParentScroll,
        },
        journeyDetails: {
            sheetAnimatedIndex: sheetAnimatedIndexJourneyDetails,
            sheetAnimatedPosition: sheetAnimatedPositionJourneyDetails,
            circularSliderParentScroll,
        },
        liveJourneyDetailedView: {
            sheetAnimatedIndex: liveJourneyBottomSheetIndex,
            sheetAnimatedPosition: liveJourneyBottomSheetPosition,
            circularSliderParentScroll,
        },
        rideConfirmed: {
            sheetAnimatedIndex: sheetAnimatedIndexRideConfirmed,
            sheetAnimatedPosition: sheetAnimatedPositionRideConfirmed,
            circularSliderParentScroll,
        },
    };
    const { children } = props;
    const contextRefValues = {
        sheetAnimatedIndex,
        sheetAnimatedPosition,
        sheetAnimatedIndexJourneyDetails,
        sheetAnimatedPositionJourneyDetails,
        liveJourneyBottomSheetIndex,
        liveJourneyBottomSheetPosition,
        sheetAnimatedIndexRideConfirmed,
        sheetAnimatedPositionRideConfirmed,
        circularSliderParentScroll,
        animatedValuesMap,
    };
    return <AnimatedValuesContext.Provider value={contextRefValues}>{children}</AnimatedValuesContext.Provider>;
};
export { AnimatedValuesProvider, useAnimatedContextValues };
export type { AnimatedScreenKey };
