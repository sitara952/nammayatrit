import React from 'react';
import ContentLoader from './ContentLoader';
import { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Rect } from 'react-native-svg';
import { tailwind } from '../../tailwindTheme/tailwind';
import { ChildrenType } from '../../types/CommonTypes';
import Typography from '../components/primitives/Typography';
import { HighlightedTypography } from '../components/primitives/HighlightedTypography';
import token from '../tokens';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { GeolocationResponse } from '@/typescript/utils/location';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { SearchInput } from '@/typescript/state/client/session';
import { FormatedLocation } from '@/typescript/utils/placeUtils';

type CardSearchTypes = PressableProps & {
    prefix: ChildrenType;
    title: string;
    description: string;
    showTime: boolean | undefined;
    isAnimate: boolean | undefined;
    suffix: ChildrenType | undefined;
    location: string | undefined;
    badge: ChildrenType | undefined;
    isLoading: boolean | undefined;
    styles: StyleProp<ViewStyle> | undefined;
    searchTerm: string;
    isFavouritesSearch: boolean;
    currentLocation: GeolocationResponse | null;
    sourceLocation: location | FormatedLocation | null;
    activeInput: SearchInput | undefined;
};

const CardSearch = (props: CardSearchTypes) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const {
        prefix,
        title,
        description,
        onPress,
        badge,
        suffix,
        isLoading,
        styles,
        searchTerm,
        isFavouritesSearch = false,
        currentLocation,
        sourceLocation,
        activeInput,
        ...otherProps
    } = props;

    return (
        <Animated.View entering={undefined}>
            <Pressable
                testID="49f0663f-5c05-4384-9041-aa8584696afa"
                onPress={event => {
                    logEvent(EventName.NY_USER_LOCATION_LIST_ITEM);
                    if (onPress) onPress(event);
                }}
                accessible={true}
                accessibilityLabel={`${title} button`}
                accessibilityRole="button"
                {...otherProps}
                style={({ pressed }) => [
                    styles,
                    tailwind.style(
                        `gap-[${token?.gap?.spacing?.[6]}] border-[#ebebeb] border-[1px] ${
                            pressed ? `bg-[${themeColors.Fill_neutralMidLow}]` : `bg-[${themeColors.Fill_neutralMin}]`
                        }  rounded-[${token?.corner.md}]  px-[${token?.spacing[16]}] py-[${token?.spacing?.[12]}]`,
                    ),
                ]}>
                <Animated.View style={tailwind.style('flex-row items-start gap-[10px]')}>
                    {prefix && isLoading ? (
                        <Animated.View style={tailwind.style('max-w-[20%] min-w-[5%] flex-row overflow-hidden')}>
                            <ContentLoader height={20} width={20}>
                                <Rect x="0" y="0" rx="100" ry="100" width="20" height="20" />
                            </ContentLoader>
                        </Animated.View>
                    ) : null}
                    {prefix && !isLoading ? (
                        <Animated.View
                            entering={FadeIn.duration(260)}
                            style={[
                                tailwind.style('max-w-[30%] min-w-[5%]  flex-row overflow-hidden'),
                                tailwind.style(!isFavouritesSearch ? 'self-center' : ''),
                            ]}>
                            {prefix}
                        </Animated.View>
                    ) : null}
                    <Animated.View style={tailwind.style(`flex-col flex-1 gap-[${token?.gap?.spacing?.[4]}]`)}>
                        {isLoading ? (
                            <Animated.View>
                                <ContentLoader height={40} width={'75%'}>
                                    <Rect x="0" y="0" rx="6" ry="6" width="60%" height="14" />
                                    <Rect x="0" y="24" rx="6" ry="6" width="95%" height="14" />
                                </ContentLoader>
                            </Animated.View>
                        ) : null}
                        <View style={tailwind.style('flex-row')}>
                            {!isLoading ? (
                                <Animated.View
                                    style={tailwind.style(`gap-[${token?.gap?.spacing?.[6]}] flex-1`)}
                                    entering={FadeIn.duration(200)}>
                                    <HighlightedTypography
                                        type="subhead-1"
                                        numberOfLines={1}
                                        style={tailwind.style(`text-[${token?.text?.['text-highContrast']}]`)}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        searchTerm={searchTerm}>
                                        {title}
                                    </HighlightedTypography>
                                </Animated.View>
                            ) : null}
                            {suffix &&
                            !isLoading &&
                            (activeInput === SearchInput.Source
                                ? currentLocation?.coords.latitude && currentLocation?.coords.longitude
                                : sourceLocation?.lng && sourceLocation?.lat) ? (
                                <Animated.View
                                    entering={FadeIn.duration(260)}
                                    style={tailwind.style('max-w-[25%] min-w-[10%] ml-[5px]')}>
                                    {suffix}
                                </Animated.View>
                            ) : null}
                        </View>

                        {!isLoading ? (
                            <Animated.View entering={FadeIn.duration(260)}>
                                <Typography
                                    type="body-1"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {description}
                                </Typography>
                            </Animated.View>
                        ) : null}
                        {badge}
                    </Animated.View>
                    {suffix && isLoading ? (
                        <Animated.View style={tailwind.style('max-w-[25%] min-w-[10%]')}>
                            <ContentLoader height={24} width={'100%'}>
                                <Rect x="0" y="0" rx="6" ry="6" width="100%" height="18" />
                            </ContentLoader>
                        </Animated.View>
                    ) : null}
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export default CardSearch;
