import React, { FC } from 'react';
import { tailwind } from '../../tailwindTheme/tailwind';
import Animated, { FadeIn, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import token from '../../designSystem/tokens';
import Typography from './primitives/Typography';
import TravelArrow from '../../components/svg/TravelArrow';
import { location } from '../../../helpers/utils/Location/LocationTypes.gen';
import { useRefsContext } from '../../context/RefsContext';

import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    BottomSheetStage,
    SearchInput,
    selectSearchedStops,
    setActiveInput,
    setBottomSheetStage,
    setSearchedSource,
    setStartLocationFromTextInput,
    updateSelectedSearchedStop,
    updateSelectedStopLocationTextInput,
} from '@/typescript/state/client/session';
import useMapRoute from '../../Maps/UseMapRouteTS';

import { resetIds } from '../../state/sharedReducer';
import { selectToken } from '@/typescript/state/client/auth';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

type FromToStackProps = {
    sheetAnimatedIndex: SharedValue<number>;
    sheetAnimatedPosition: SharedValue<number>;
    destination: location | null;
    source: location | null;
};

const FromToStack: FC<FromToStackProps> = ({ sheetAnimatedIndex, sheetAnimatedPosition, source, destination }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { removeRoute } = useMapRoute(null, undefined);
    const { stopLocationsTextInputRef, startLocationTextInputRef } = useRefsContext();

    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - 60,
                },
            ],
            opacity: interpolate(sheetAnimatedIndex.value, [0.8, 1], [1, 0]),
        };
    });

    const dispatch = useAppDispatch();
    const stops = useAppSelector(selectSearchedStops);
    const userToken = useAppSelector(selectToken);
    const updateSourceAndDestination = () => {
        dispatch(setSearchedSource(source));
        dispatch(updateSelectedSearchedStop(destination ? destination : null));
        dispatch(setStartLocationFromTextInput(source?.title ?? ''));
        dispatch(updateSelectedStopLocationTextInput(destination?.title ?? ''));
    };

    const onClickSource = () => {
        removeRoute('defaultRoute');
        resetIds(userToken, null, dispatch);
        updateSourceAndDestination();
        dispatch(setActiveInput(SearchInput.Source));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'ft_src' }));
        startLocationTextInputRef.current?.setSelection(
            0,
            ((source?.title ?? '') + (source?.subtitle ?? '')).length + 1,
        );
    };

    const onClickDestination = () => {
        removeRoute('defaultRoute');
        resetIds(userToken, null, dispatch);
        updateSourceAndDestination();
        dispatch(setActiveInput(SearchInput.Destination));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'ft_dest' }));
        stopLocationsTextInputRef.current?.[stops.length - 1]?.setSelection(
            0,
            ((destination?.title ?? '') + (destination?.subtitle ?? '')).length + 1,
        );
    };

    return (
        <Animated.View style={[tailwind.style(`px-[${token?.spacing[16]}] absolute w-full`), floatingHeaderStyle]}>
            <Animated.View
                entering={FadeIn}
                style={[
                    tailwind.style(
                        `bg-[${themeColors.Fill_neutralMin}] w-full rounded-[${token?.corner.md}] py-[13px] px-[${token?.spacing[16]}] flex-row items-center gap-[${token?.gap.spacing[12]}]`,
                    ),
                ]}>
                <Pressable
                    testID="8b8addfb-5035-4d24-8de4-d621a0ee3573"
                    onPress={onClickSource}
                    accessibilityRole="button"
                    style={{ width: '40%' }}
                    accessible
                    accessibilityLabel={'Source ' + `${source?.title} ${source?.subtitle} button`}
                    accessibilityHint="Click to edit pickup">
                    <Typography
                        numberOfLines={1}
                        style={tailwind.style(`text-[${token?.text['text-bold']}]`)}
                        type="body-2"
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {`${source?.title} ${source?.subtitle}`}
                    </Typography>
                </Pressable>
                <TravelArrow />
                <Pressable
                    testID="2e69a60d-e4c0-4a58-bd2a-c71fca84f288"
                    onPress={onClickDestination}
                    accessibilityRole="button"
                    style={{ width: '40%' }}
                    accessible
                    accessibilityLabel={'Destination' + `${destination?.title} ${destination?.subtitle} button`}
                    accessibilityHint="Click to edit destination">
                    <Typography
                        numberOfLines={1}
                        type="body-2"
                        style={tailwind.style(`text-[${token?.text['text-bold']}]`)}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {`${destination?.title} ${destination?.subtitle}`}
                    </Typography>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
};

export default FromToStack;
