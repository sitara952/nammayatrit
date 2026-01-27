import { distance } from '@/readOnly/api/types/Distance.gen';
import { ChevronRight } from '@/src-v2/assets/svg/Arrows';
import { formatDistance, formatTimeFromSeconds } from '@/src-v2/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { isNull, isUndefined } from 'lodash';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import {
    getIconBGFromType,
    getIconColorFromType,
    getIconFromType,
} from '../../../components/PublicTransportCard/PublicTransportCardUtils';
import { TransitType } from '../../../components/PublicTransportCard/types';
import { Icon } from '../../../components/common/Icon';
import { ShimmerEffect } from '../DirectBooking/components/SourceDestinationCard';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { strings } from 'config-types';
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
    bookingAllowed: boolean | undefined;
    hasApplicablePasses: boolean;
};

export type TransitSummaryProps = {
    journey: TransitSummaryType[];
    type: TransitSummaryTypeEnum; // Updated to use the new type prop
    switchToAuto: (legOrder: number) => void;
};

const getAccessibilityLabel = (transit: TransitSummaryType): string => {
    switch (transit.type) {
        case 'walk':
            return transit.distance ? `Walk for ${formatDistance(transit.distance, 'Meter', undefined)}` : 'Walk';
        case 'bus':
            return transit.time
                ? `${formatTimeFromSeconds(transit.time, true, undefined)} Bus ride`
                : `Take a bus ${transit.routeCode ?? ''}`;
        case 'metro':
            return transit.time
                ? `${formatTimeFromSeconds(transit.time, true, undefined)} Metro ride`
                : `Take the ${transit.routeCode ?? ''} metro`;
        case 'taxi':
            return transit.time ? `${formatTimeFromSeconds(transit.time, true, undefined)} Taxi ride` : 'Take a taxi';
        case 'auto':
            return transit.time ? `${formatTimeFromSeconds(transit.time, true, undefined)} Auto ride` : 'Take an auto';
        case 'train':
            return transit.time
                ? `Train ride for ${formatTimeFromSeconds(transit.time, true, undefined)}`
                : 'Take a train';
        default:
            return transit.type;
    }
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
                <Animated.View style={tailwind.style('flex-row items-center pt-[10px]')}>
                    {transit.cost === undefined || transit.cost === 0 || transit.cost === null ? (
                        <ShimmerEffect style={undefined} height={16} width={15} />
                    ) : (
                        <Animated.Text
                            style={[
                                tailwind.style('text-[13px] font-areaNormal-extrabold'),
                                tailwind.style(type === 'alternate-colored' ? 'text-[#3B3A3C]' : 'text-[#7E7E7E]'),
                            ]}>
                            {transit.type === 'auto' || transit.type === 'taxi'
                                ? `₹${transit.cost}`
                                : `₹${transit.costWithQuantity}`}
                        </Animated.Text>
                    )}
                </Animated.View>
            );
        } else {
            return (
                <Animated.View style={tailwind.style('flex-row items-center pt-[10px]')}>
                    {!isNull(transit.distance) && (
                        <Animated.Text
                            style={[
                                tailwind.style('text-[13px] font-areaNormal-extrabold'),
                                tailwind.style(type === 'alternate-colored' ? 'text-[#3B3A3C]' : 'text-[#7E7E7E]'),
                            ]}>
                            {formatDistance(transit.distance, 'Meter', userLanguageStrings)}
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
                                style={tailwind.style('text-[14px] leading-[14px] font-inter-semibold text-[#656565]')}>
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
    switchToAuto,
}: {
    transit: TransitSummaryType;
    index: number;
    type: TransitSummaryTypeEnum;
    switchToAuto: () => void;
}) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    if (isAlternateType(type)) {
        // Alternate style transit item
        // const { sheetAnimatedIndex } = useAnimatedContextValues();

        // const buttonTextValue = useAnimatedProps(() => {
        //     return { text: sheetAnimatedIndex.value === 0 ? transit.routeCode : transit.type };
        // }, [sheetAnimatedIndex]);
        return (
            <Animated.View
                accessible={false}
                key={JSON.stringify(transit.type + index)}
                style={[
                    tailwind.style('rounded-[16px] bg-white p-[12px] border border-[#F1F2F2] max-w-[110px]'),
                    {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.02,
                        shadowRadius: 6,
                    },
                ]}>
                <Animated.View style={tailwind.style('gap-[4px] flex-row items-center')}>
                    <Animated.View
                        accessible={false}
                        style={tailwind.style(
                            'w-5 h-5 rounded-[8px] items-center justify-center',
                            `bg-[${getIconBGFromType(transit.type)}]`,
                        )}>
                        {getIconFromType(transit.type, 12, getIconColorFromType(transit.type, type))}
                    </Animated.View>
                    <Animated.View style={tailwind.style('flex-row items-center gap-1')}>
                        {((transit.type === 'bus' && type === 'alternate-colored') || transit.type !== 'bus') &&
                            transit.distance && (
                                <Animated.Text
                                    accessible={false}
                                    style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                                    {formatTimeFromSeconds(transit.time, true, userLanguageStrings)}
                                </Animated.Text>
                            )}
                        {!transit.distance ||
                            (transit.type === 'bus' && type === 'alternate' && (
                                <Animated.Text
                                    accessible={false}
                                    style={[
                                        tailwind.style(
                                            `text-[12px] font-areaNormal-extrabold ${
                                                isNull(transit.routeCode) ? `capitalize` : ''
                                            }`,
                                        ),
                                        tailwind.style(type === 'alternate' ? 'text-[#3B3A3C]' : 'text-[#656565]'),
                                    ]}>
                                    {transit.routeCode || transit.type}
                                </Animated.Text>
                            ))}
                        {!isUndefined(transit.busStopsCount) && transit.busStopsCount > 0 && type === 'alternate' && (
                            <Animated.View
                                style={tailwind.style(
                                    `bg-[${colors.CrossButton_bg}] rounded-[5px] h-[13px] px-[3px] flex-row items-center`,
                                )}>
                                <Animated.Text
                                    accessible={false}
                                    style={tailwind.style('text-[9px] font-areaNormal-extrabold text-[#656565]')}>
                                    +{transit.busStopsCount}
                                </Animated.Text>
                            </Animated.View>
                        )}
                    </Animated.View>
                </Animated.View>
                {((transit.type !== 'walk' && type === 'alternate') || transit.type === 'walk') && transit.distance && (
                    <Animated.View style={tailwind.style('pt-[10px]')}>
                        {/* <Animated.Text
                            accessible={false}
                            style={tailwind.style(
                                'text-[12px] leading-[15px] font-areaNormal-extrabold text-[#7E7E7E]',
                            )}>
                            {transit.distance.value < 1000
                                ? formatDistance(transit.distance, 'Meter', userLanguageStrings)
                                : formatDistance(transit.distance, 'Kilometer', userLanguageStrings)}
                        </Animated.Text> */}
                        <Animated.Text
                            style={[
                                tailwind.style('text-[13px] font-areaNormal-extrabold'),
                                tailwind.style(type === 'alternate-colored' ? 'text-[#3B3A3C]' : 'text-[#7E7E7E]'),
                            ]}>
                            {transit.type === 'walk'
                                ? `${
                                      transit.distance.value < 1000
                                          ? formatDistance(transit.distance, 'Meter', userLanguageStrings)
                                          : formatDistance(transit.distance, 'Kilometer', userLanguageStrings)
                                  }`
                                : `₹${transit.cost}`}
                        </Animated.Text>

                        {type === 'alternate-colored' && transit.type === 'walk' && (
                            <Pressable
                                testID="journey-info-screen-switch-btn"
                                accessible={true}
                                accessibilityRole="button"
                                style={tailwind.style('flex-row items-center')}
                                accessibilityLabel={`${formatTimeFromSeconds(transit.time, true, undefined)} Walk ride, Switch to auto`}
                                onPress={switchToAuto}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[18px] font-areaNormal-extrabold text-[#005FCB]',
                                    )}>
                                    {userLanguageStrings.Switch}
                                </Animated.Text>
                            </Pressable>
                        )}
                    </Animated.View>
                )}

                {type === 'alternate-colored' && (
                    <>
                        {(transit.type === 'auto' || transit.type === 'taxi' || transit.type === 'bike') && (
                            <Animated.View style={tailwind.style('pt-[10px]')}>
                                <Animated.Text
                                    accessibilityLabel={getAccessibilityLabel(transit)}
                                    style={tailwind.style(
                                        'text-[12px] leading-[18px] font-areaNormal-extrabold text-[#7E7E7E]',
                                    )}>
                                    {userLanguageStrings.AutoRideTime}
                                </Animated.Text>
                            </Animated.View>
                        )}
                        {(transit.type === 'metro' || transit.type === 'train') && (
                            <Animated.View style={tailwind.style('pt-[10px]')}>
                                <Animated.Text
                                    accessibilityLabel={getAccessibilityLabel(transit)}
                                    style={tailwind.style(
                                        'text-[12px] leading-[18px] font-areaNormal-extrabold text-[#7E7E7E]',
                                    )}>
                                    {transit.type === 'metro'
                                        ? userLanguageStrings.MetroRideTime
                                        : userLanguageStrings.TrainRideTime}
                                </Animated.Text>
                            </Animated.View>
                        )}
                        {transit.type === 'bus' && (
                            <Animated.View style={tailwind.style('pt-[10px]')}>
                                <Animated.Text
                                    accessibilityLabel={getAccessibilityLabel(transit)}
                                    style={tailwind.style(
                                        'text-[12px] leading-[18px] font-areaNormal-extrabold text-[#7E7E7E]',
                                    )}>
                                    {userLanguageStrings.BusRideTime}
                                </Animated.Text>
                            </Animated.View>
                        )}
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

export const TransitSummary = (props: TransitSummaryProps) => {
    const { journey, type, switchToAuto } = props;

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
                                switchToAuto={() =>
                                    !isUndefined(transit.legOrder) ? switchToAuto(transit.legOrder) : undefined
                                }
                            />
                            {isAlternateType(type) && index < journey.length - 1 && <Icon icon={<ChevronRight />} />}
                        </Animated.View>
                    );
                })}
            </AnimatedScrollView>
        </Animated.View>
    );
};
