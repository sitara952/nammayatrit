import ContentLoader, { Circle, Path } from '@/typescript/designSystem/components/ContentLoader';
import React from 'react';
import Animated from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { SourceDestinationCard } from '../DirectBooking/components/SourceDestinationCard';
import { TransitSummaryType, TransitSummary } from './TransitSummary';
import { TransitSummaryChennaiOne } from './TransitSummaryChennaiOne';
import { Icon } from '../../../components/common/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { AnimatedScreenKey } from '@/typescript/context/AnimatedValuesContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import ClockIcon from '@/src-v2/multimodal/components/svg/ClockIcon';
import { strings } from 'config-types';

export type PTReviewHeaderProps = {
    duration: string | undefined;
    dropLocation: string;
    startLocation: string;
    journey: TransitSummaryType[] | undefined;
    legCount: number;
    renderShowDetailsSection: boolean | undefined;
    price: number | undefined;
    screenName: AnimatedScreenKey | undefined;
    handleClickMoreRoutes: () => void;
    appName: string;
    fetchingLegsFare: boolean;
    totalTimeSaved: number | undefined;
    journeyETATime: string | undefined;
    switchToAuto: (legOrder: number) => void;
};

export const FromToArrow = () => {
    return (
        <Svg width="10" height="48" viewBox="0 0 10 48" fill="none">
            <Circle cx="5.03906" cy="8" r="4.5" fill="#8B8B8F" />
            <Circle cx="5.03906" cy="39" r="4.5" fill="#F7493F" />
            <Circle cx="5.03906" cy="39" r="1.96094" fill="white" />
            <Path
                d="M5.13501 14.5V32.5"
                stroke="url(#paint0_linear_1150_25402)"
                strokeWidth="1.49495"
                strokeMiterlimit="10"
            />
            <Defs>
                <LinearGradient
                    id="paint0_linear_1150_25402"
                    x1="5.63501"
                    y1="14.5"
                    x2="5.63501"
                    y2="32.5"
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#8B8B8F" />
                    <Stop offset="1" stopColor="#F7493F" />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};

export const LinkToMoreRoutes = () => {
    return (
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <Path
                d="M10.9434 10.7949L10.9434 5.96429C10.9434 5.7011 10.7268 5.48451 10.4636 5.48452L5.63295 5.48451"
                stroke="#016ACD"
                strokeWidth="1.5"
                strokeMiterlimit="10"
            />
            <Path d="M10.2876 6.2124L5.69141 10.8086" stroke="#016ACD" strokeWidth="1.5" strokeMiterlimit="10" />
        </Svg>
    );
};

const renderTimeMessage = (
    appName: string,
    journey: TransitSummaryType[] | undefined,
    timeSavedByMultimodal: number | undefined,
    userLanguageStrings: strings,
): React.ReactElement | null => {
    if (journey && journey.length > 0 && appName === 'nammaYatri') {
        if (timeSavedByMultimodal && timeSavedByMultimodal > 0) {
            return (
                <Animated.View style={tailwind.style('px-4 pb-4 pt-4')}>
                    <Animated.View
                        style={tailwind.style('p-3 bg-[#E8F5E8] rounded-[12px] flex-row items-center justify-center')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[12px] text-[#2E7D32] font-areaNormal-medium leading-4 text-center',
                            )}>
                            {userLanguageStrings.YouWillSaveMinsComparedToOtherTransit(timeSavedByMultimodal)}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            );
        }
        return null;
    }
    return null;
};

export const PTReviewHeader = (props: PTReviewHeaderProps) => {
    const {
        duration,
        dropLocation,
        journey,
        startLocation,
        renderShowDetailsSection = true,
        price,
        fetchingLegsFare,
        totalTimeSaved,
        journeyETATime,
        switchToAuto,
    } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { transitOptions } = useAppSelector(selectNewFeatureFlags);
    const timeSavingsInMinutes = totalTimeSaved ? Math.round(totalTimeSaved / 60) : undefined;
    return (
        <Animated.View>
            <Animated.View style={tailwind.style('px-4')}>
                <SourceDestinationCard
                    isMultiModal={true}
                    source={startLocation}
                    destination={dropLocation}
                    fare={price}
                    time={duration}
                    journeyTypes={journey}
                    onPress={() => {}}
                    showFare={true}
                    fetchingLegsFare={fetchingLegsFare}
                />
            </Animated.View>

            {renderShowDetailsSection && (
                <>
                    <Animated.View style={tailwind.style('flex-row justify-between items-center pt-[18px]')}>
                        {journey && journey.length ? (
                            <Animated.View style={tailwind.style('w-full')}>
                                <Animated.View style={tailwind.style('flex-row items-end justify-between pb-4 px-6')}>
                                    <Animated.View>
                                        <Animated.View style={tailwind.style('flex-row items-center gap-1.5')}>
                                            <Icon icon={<ClockIcon />} size={16} color="#525461" />
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] leading-[18px]',
                                                )}>
                                                {duration}
                                            </Animated.Text>
                                        </Animated.View>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[14px] font-areaNormal-extrabold text-[#969696] leading-[18px] pl-5.5 pt-2.5',
                                            )}>
                                            {userLanguageStrings.ETA} {journeyETATime}
                                        </Animated.Text>
                                    </Animated.View>
                                    {transitOptions.showMoreRoutes && (
                                        <Pressable
                                            onPress={props.handleClickMoreRoutes}
                                            hitSlop={10}
                                            testID="MORE_ROUTES_CLICK"
                                            accessibilityRole="button"
                                            accessibilityLabel="More routes button">
                                            <Animated.View style={tailwind.style('flex-row items-center')}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[13px] font-areaNormal-extrabold text-[#016ACD] leading-[18px]',
                                                    )}>
                                                    {userLanguageStrings.Moreroutes}
                                                </Animated.Text>
                                                <Icon icon={<LinkToMoreRoutes />} size={16} color="#016ACD" />
                                            </Animated.View>
                                        </Pressable>
                                    )}
                                </Animated.View>

                                {props.appName === 'anna' ? (
                                    <TransitSummaryChennaiOne
                                        journey={journey}
                                        type="alternate-colored"
                                        fromJourneyCompleteScreen={false}
                                    />
                                ) : (
                                    <TransitSummary
                                        journey={journey}
                                        type="alternate-colored"
                                        switchToAuto={switchToAuto}
                                    />
                                )}

                                {/* {renderPaymentMessage(props.appName, props.journey)} */}
                                {renderTimeMessage(
                                    props.appName,
                                    props.journey,
                                    timeSavingsInMinutes,
                                    userLanguageStrings,
                                )}
                                {timeSavingsInMinutes && props.appName === 'anna' ? (
                                    <Animated.View style={tailwind.style('pt-[10px] px-5')}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] leading-[18px] font-areaNormal-extrabold text-[#7E7E7E]',
                                            )}>
                                            {userLanguageStrings.YouWillSaveMinsComparedToOtherTransit(
                                                timeSavingsInMinutes,
                                            )}
                                        </Animated.Text>
                                    </Animated.View>
                                ) : null}
                            </Animated.View>
                        ) : (
                            <Animated.View style={tailwind.style('flex-row gap-2 px-4')}>
                                {[...Array(Math.min(props.legCount || 2, 4))]
                                    .map(() => null)
                                    .map((_, index) => (
                                        <Animated.View
                                            key={index}
                                            style={tailwind.style(
                                                'h-[30px] w-[60px] items-center justify-center rounded-[12px] px-[5.5px] bg-[#FFF]',
                                            )}>
                                            <ContentLoader
                                                width={40}
                                                height={20}
                                                backgroundColor="#E8E8E8"
                                                foregroundColor="#DEDEDE"
                                                style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                <Rect x="0" y="5" width="40" height="10" rx="2" />
                                            </ContentLoader>
                                        </Animated.View>
                                    ))}
                            </Animated.View>
                        )}
                    </Animated.View>
                </>
            )}
        </Animated.View>
    );
};
