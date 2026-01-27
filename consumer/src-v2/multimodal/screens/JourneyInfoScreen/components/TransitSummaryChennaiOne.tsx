import { distance } from '@/readOnly/api/types/Distance.gen';
import { ChevronRight } from '@/src-v2/assets/svg/Arrows';
import { formatDistanceWithUnit, formatTimeFromSeconds } from '@/src-v2/utils/common';
import { isNull, isUndefined } from 'lodash';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { getIconFromType } from '../../../components/PublicTransportCard/PublicTransportCardUtils';
import { TransitType } from '../../../components/PublicTransportCard/types';
import { Icon } from '../../../components/common/Icon';
import { ShimmerEffect } from '../DirectBooking/components/SourceDestinationCard';
import { strings } from 'config-types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getUserLanguageStringsForMetroLine } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Define the enum for transit types
export type TransitSummaryTypeEnum = 'standard' | 'alternate' | 'alternate-colored';

export type TransitSummaryType = {
    type: TransitType;
    cost: number | null;
    costWithQuantity: number | null;
    distance: distance | null;
    routeCode: string | null;
    busStopsCount: number | undefined;
    time: number | undefined;
    legOrder: number | undefined;
    metroLineColor: string | undefined;
    isSkipped: boolean;
    hasApplicablePasses: boolean;
};

export type TransitSummaryProps = {
    journey: TransitSummaryType[];
    type: TransitSummaryTypeEnum; // Updated to use the new type prop
    fromJourneyCompleteScreen: boolean;
};

export const getIconColorFromType = (transitType: TransitType, type: TransitSummaryTypeEnum) => {
    if (type === 'alternate') {
        if (transitType === 'walk') return '#FFFFFF';
        return '#656565';
    }

    if (type === 'alternate-colored') {
        switch (transitType) {
            case 'auto':
                return '#8834E5';
            case 'taxi':
                return '#8834E5';
            case 'bus':
                return '#F78622';
            case 'metro':
                return '#2C6ED4';
            case 'train':
                return '#1D8C2D';
            case 'walk':
                return '#656565';
        }
    }

    return '#656565';
};

// Create a constant to check for alternate types
const isAlternateType = (type: TransitSummaryTypeEnum) => type === 'alternate' || type === 'alternate-colored';

// Reusable component for transit cost or duration
const TransitCostDisplay = ({
    transit,
    type,
    userLanguageStrings,
}: {
    transit: TransitSummaryType;
    type: TransitSummaryTypeEnum;
    userLanguageStrings: strings;
}) => {
    if (isAlternateType(type)) {
        // Alternate style cost/duration display
        if (transit.type !== 'walk') {
            return (
                <Animated.View style={tailwind.style('flex-row items-center  pt-[8px] pb-[6px]')}>
                    {transit.cost === undefined || transit.cost === 0 || transit.cost === null ? (
                        <ShimmerEffect style={undefined} height={16} width={15} />
                    ) : (
                        <Animated.Text
                            style={[
                                tailwind.style(
                                    `text-[${transit.isSkipped ? '13px' : '14px'}]  leading-[19px]  font-areaNormal-extrabold`,
                                ),
                                tailwind.style(
                                    type === 'alternate-colored'
                                        ? `text-[${transit.isSkipped ? '#7E7E7E' : '#3B3A3C'}]`
                                        : `text-[#7E7E7E]`,
                                ),
                            ]}>
                            {transit.isSkipped
                                ? 'Skipped'
                                : transit.type === 'auto' || transit.type === 'taxi'
                                  ? `₹${transit.cost}`
                                  : `₹${transit.costWithQuantity}`}
                        </Animated.Text>
                    )}
                </Animated.View>
            );
        } else {
            return (
                <Animated.View style={tailwind.style('flex-row items-center  pt-[8px] pb-[6px]')}>
                    {!isNull(transit.distance) && (
                        <Animated.Text
                            style={[
                                tailwind.style('text-[14px]  leading-[19px]  font-areaNormal-extrabold'),
                                tailwind.style(type === 'alternate-colored' ? 'text-[#3B3A3C]' : 'text-[#7E7E7E]'),
                            ]}>
                            {formatDistanceWithUnit(transit.distance.value, transit.distance.unit, userLanguageStrings)}
                        </Animated.Text>
                    )}
                </Animated.View>
            );
        }
    } else {
        // Standard style cost display
        if (!['walk', 'auto'].includes(transit.type)) {
            return (
                <Animated.View style={tailwind.style('flex-row items-end justify-center pl-1')}>
                    {transit.cost === undefined || transit.cost === 0 ? (
                        <ShimmerEffect style={undefined} height={16} width={15} />
                    ) : (
                        <>
                            <Animated.Text
                                style={tailwind.style('text-[14px] leading-[19px] font-inter-semibold text-[#656565]')}>
                                ₹
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] leading-[19px] font-areaNormal-extrabold text-[#656565]',
                                )}>
                                {transit.cost}
                            </Animated.Text>
                        </>
                    )}
                </Animated.View>
            );
        }
        return null;
    }
};

// Reusable component for a transit item
const TransitItem = ({
    transit,
    index,
    type,
    userLanguageStrings,
    fromJourneyCompleteScreen,
}: {
    transit: TransitSummaryType;
    index: number;
    type: TransitSummaryTypeEnum;
    userLanguageStrings: strings;
    fromJourneyCompleteScreen: boolean;
}) => {
    if (isAlternateType(type)) {
        return (
            <Animated.View
                onStartShouldSetResponder={() => true}
                accessible={false}
                key={JSON.stringify(transit.type + index)}
                style={[
                    tailwind.style('rounded-[16px] bg-white px-[14px] py-[11px] border border-[#F1F2F2] max-w-[110px]'),
                    {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.02,
                        shadowRadius: 6,
                    },
                ]}>
                <Animated.View style={tailwind.style('gap-[4px] flex-row items-center')}>
                    {getIconFromType(transit.type, 14, getIconColorFromType(transit.type, type))}
                    <Animated.View style={tailwind.style('flex-row items-center gap-1')}>
                        <Animated.Text
                            accessible={false}
                            style={[
                                tailwind.style(
                                    `text-[13px] leading-[17px] font-areaNormal-extrabold tracking-[0.1px] ${
                                        isNull(transit.routeCode) ? `capitalize` : ''
                                    }`,
                                ),
                                tailwind.style(transit.type === 'walk' ? 'text-[#656565]' : 'text-[#3B3A3C]'),
                            ]}>
                            {transit.type === 'metro'
                                ? `${getUserLanguageStringsForMetroLine(transit.metroLineColor || '', userLanguageStrings)} ${userLanguageStrings.Line}`
                                : transit.type === 'train' && fromJourneyCompleteScreen
                                  ? getUserLanguageStringsForMode(transit.type, userLanguageStrings)
                                  : transit.routeCode ||
                                    getUserLanguageStringsForMode(transit.type, userLanguageStrings)}
                        </Animated.Text>
                        {!isUndefined(transit.busStopsCount) &&
                            transit.busStopsCount > 0 &&
                            !fromJourneyCompleteScreen && (
                                <Animated.View
                                    style={tailwind.style(
                                        `bg-[#F4F4F4] rounded-full justify-center items-center h-[17px] w-[17px] flex-row items-center`,
                                    )}>
                                    <Animated.Text
                                        accessible={false}
                                        style={tailwind.style(
                                            'text-[10px] leading-[14px] font-areaNormal-extrabold text-[#656565]',
                                        )}>
                                        {transit.busStopsCount}
                                    </Animated.Text>
                                </Animated.View>
                            )}
                    </Animated.View>
                </Animated.View>

                {transit.isSkipped ? (
                    <Animated.View style={tailwind.style('flex-1 justify-center items-center pt-[8px] pb-[6px]')}>
                        <Animated.View
                            style={tailwind.style(
                                'border-t border-[#F1F2F2] pt-[5px] flex-1 justify-center items-center',
                            )}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] leading-[19px] font-areaNormal-extrabold text-[#969696]',
                                )}>
                                Skipped
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                ) : transit.hasApplicablePasses && transit.type === 'bus' && fromJourneyCompleteScreen ? (
                    <>
                        <Animated.View style={tailwind.style('flex-1 justify-center items-center pt-[8px] pb-[6px]')}>
                            <Animated.View
                                style={tailwind.style(
                                    'border-t border-[#F1F2F2] pt-[5px] flex-1 justify-center items-center',
                                )}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[10px] leading-[19px] font-areaNormal-extrabold text-[#09941E]',
                                    )}>
                                    {userLanguageStrings.PassApplied}
                                </Animated.Text>
                            </Animated.View>
                        </Animated.View>
                        <Animated.View style={tailwind.style('border-t border-[#F1F2F2] pt-[5px]')}>
                            <Animated.Text
                                accessible={false}
                                numberOfLines={1}
                                style={tailwind.style(
                                    'text-[14px] leading-[19px] font-areaNormal-extrabold text-[#969696]',
                                )}>
                                {formatTimeFromSeconds(transit.time, true, userLanguageStrings)}
                            </Animated.Text>
                        </Animated.View>
                    </>
                ) : (
                    <>
                        <TransitCostDisplay transit={transit} type={type} userLanguageStrings={userLanguageStrings} />

                        <Animated.View style={tailwind.style('border-t border-[#F1F2F2] pt-[5px]')}>
                            <Animated.Text
                                accessible={false}
                                numberOfLines={1}
                                style={tailwind.style(
                                    'text-[14px] leading-[19px] font-areaNormal-extrabold text-[#969696]',
                                )}>
                                {formatTimeFromSeconds(transit.time, true, userLanguageStrings)}
                            </Animated.Text>
                        </Animated.View>
                    </>
                )}
            </Animated.View>
        );
    } else {
        // Standard style transit item
        return (
            <Animated.View
                onStartShouldSetResponder={() => true}
                key={JSON.stringify(transit.type + index)}
                style={tailwind.style(
                    'h-[30px] items-center justify-center rounded-[12px] px-[5.5px]',
                    transit.type === 'walk' ? 'bg-transparent' : 'bg-[#FFF]',
                )}>
                <Animated.View style={tailwind.style('flex flex-row items-center')}>
                    {getIconFromType(transit.type, 16, '#656565')}
                    <TransitCostDisplay transit={transit} type={type} userLanguageStrings={userLanguageStrings} />
                </Animated.View>
            </Animated.View>
        );
    }
};

export const TransitSummaryChennaiOne = (props: TransitSummaryProps) => {
    const { journey, type, fromJourneyCompleteScreen } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View accessible={false} style={tailwind.style('pt-2')}>
            <AnimatedScrollView
                showsHorizontalScrollIndicator={false}
                horizontal
                contentContainerStyle={tailwind.style('flex-row gap-2', isAlternateType(type) ? 'px-4' : '')}>
                {journey.map((transit, index) => {
                    return (
                        <Animated.View
                            accessible={false}
                            key={JSON.stringify(transit.type + index)}
                            style={tailwind.style('flex-row items-center gap-2')}>
                            <TransitItem
                                transit={transit}
                                index={index}
                                type={type}
                                userLanguageStrings={userLanguageStrings}
                                fromJourneyCompleteScreen={fromJourneyCompleteScreen}
                            />
                            {isAlternateType(type) && index < journey.length - 1 && <Icon icon={<ChevronRight />} />}
                        </Animated.View>
                    );
                })}
            </AnimatedScrollView>
        </Animated.View>
    );
};
