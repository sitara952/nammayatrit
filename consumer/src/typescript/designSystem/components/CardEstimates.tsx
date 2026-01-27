import { Pressable } from '@/src-v2/primitives/Pressable';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { selectEstimatesStarted, selectJourneys } from '@/typescript/state/client/search';
import { useAppSelector } from '@/typescript/state/hooks';
import find from 'lodash/find';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInUp,
    FadeOut,
    FadeOutUp,
    interpolateColor,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Path, Rect, Svg } from 'react-native-svg';
import { Icon } from '../../components/Icon';
import { tailwind } from '../../tailwindTheme/tailwind';
import { StyleType } from '../../types/CommonTypes';
import { setFocus } from '../../utils/Accessibility';
import { getCurrency } from '../../utils/getCurrency';
import token from '../tokens';
import ContentLoader from './ContentLoader';
import Divider from './primitives/Divider';
import Tag from './primitives/Tag';
import Typography from './primitives/Typography';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';

import { useConfigContext } from '@/typescript/context/ConfigContext';

import {
    MultimodalTravelMode_multimodalTravelMode,
    ServiceTierType_serviceTierType,
} from '@/readOnly/api/types/Enums.gen';
import { getIconFromType } from '@/src-v2/multimodal/components/PublicTransportCard/PublicTransportCardUtils';
import { ChevronRight } from '@/src-v2/multimodal/components/svg/ChevronRight';
import { secondsToHours } from '@/src-v2/utils/common';
import { getVehicleFromVehicleType } from '@/typescript/utils/bookingUtils';
import { getTransitType } from '@/typescript/utils/MultiModal';
import { ListExpandedView } from './cardEstimates/ListExpandedView';
import { InfoIcon } from '@/typescript/assets/svg/symbols/InfoIcon';

const UserIcon = ({ size = 16, color = '#656565' }: { size: number | undefined; color: string | undefined }) => (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.05835 1.95312C8.5406 1.95312 9.74168 3.15479 9.74168 4.63646C9.74168 6.1187 8.5406 7.31979 7.05835 7.31979C5.57608 7.31979 4.375 6.1187 4.375 4.63646C4.375 3.15479 5.57608 1.95312 7.05835 1.95312Z"
            fill={color}
        />
        <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.45868 8.07812H5.71699C4.20033 8.07812 2.91699 9.36146 2.91699 10.8781C2.91699 11.1698 2.91699 11.5198 2.97533 11.8115C2.97533 11.9281 3.09199 12.0448 3.26699 12.0448H10.9087C11.0253 12.0448 11.142 11.9281 11.2003 11.8115C11.2587 11.5198 11.2587 11.1698 11.2587 10.8781C11.2003 9.30312 9.97534 8.07812 8.45868 8.07812Z"
            fill={color}
        />
    </Svg>
);

type CardEstimatesTypes = {
    imgSrc: { uri: string };
    imgSrcSelected: ImageSourcePropType;
    title: string | undefined;
    description: string;
    count: number | string | undefined;
    cost: number | undefined;
    time: number | undefined;
    onPress: ((index: number) => void) | undefined;
    isAnimate: boolean | undefined;
    index: number | undefined;
    isSelected: boolean | undefined;
    isExpanded: boolean | undefined;
    toCost: number | undefined;
    expandedData:
        | {
              name: string;
              value: string;
              service: ServiceTierType_serviceTierType;
              isAc: boolean;
              description: string | undefined;
              cost: number | undefined;
              toCost: number | undefined;
              currency: string | undefined;
              vehicleIconUrl: string | undefined;
          }[]
        | undefined;
    onTagSelect: ((value: string[]) => void) | undefined;
    allowMultipleSelect: boolean | undefined;
    style: StyleType | undefined;
    titleIcon: boolean | undefined;
    defaultSelectedExpandedData: string[] | undefined;
    dividerType: 'default' | 'dashed' | undefined;
    currency: string | undefined;
    onRateCardPress: (() => void) | undefined;
    showRateCardInfoIcon: boolean | undefined;
    disabled: boolean;
    isNammaTransit: boolean | undefined;
    journeyDuration: number | undefined;
    isBookAny: boolean | undefined;
    isAmbulance: boolean;
    listLikeExpandedState: boolean | undefined;
    originalCost: number | undefined;
    originalToCost: number | undefined;
    showDiscountedPrice: boolean | undefined;
};

export const CardEstimatesShimmer = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <View
            style={tailwind.style(
                `py-[14px] w-full rounded-[${token?.corner?.md}] border bg-[${themeColors.Fill_neutralMin}] border-[${themeColors.Fill_neutralMin}] flex-row justify-between gap-[${token?.gap.spacing[10]}] px-[${token?.spacing?.[16]}]`,
            )}>
            <View style={tailwind.style('w-[60px] h-[52px]')}>
                <ContentLoader>
                    <Rect x="0" y="0" rx="8" ry="8" width="60" height="52" />
                </ContentLoader>
            </View>
            <View style={tailwind.style(`gap-[${token?.spacing[6]}] flex-1 w-full h-[52px]`)}>
                <ContentLoader>
                    <Rect x="0" y="0" rx="8" ry="8" width="100%" height="22" />
                    <Rect x="0" y="30" rx="8" ry="8" width="100%" height="22" />
                </ContentLoader>
            </View>
        </View>
    );
};

const JourneyView = () => {
    const journeys = useAppSelector(state => selectJourneys(state, null));
    const firstJourney = journeys?.[0];
    const transitModes = firstJourney?.modes || [];

    return (
        <Animated.View style={tailwind.style(`rounded-md flex-row items-center justify-between w-full mt-1.5`)}>
            <View style={tailwind.style('flex-row items-center gap-x-[6px]')}>
                {firstJourney &&
                    firstJourney.modes.map((mode: MultimodalTravelMode_multimodalTravelMode, transitIndex: number) => {
                        return (
                            <Animated.View
                                key={transitIndex}
                                style={tailwind.style(
                                    'flex flex-row items-center self-start justify-start rounded-md',
                                )}>
                                {getIconFromType(
                                    getTransitType(mode) === 'metro' ? 'metroNoleaf' : getTransitType(mode),
                                    14,
                                    '#656565',
                                )}

                                {transitIndex !== transitModes.length - 1 ? (
                                    <Icon
                                        style={tailwind.style('ml-1')}
                                        icon={<ChevronRight />}
                                        size={12}
                                        color="#7E7E7E"
                                    />
                                ) : null}
                            </Animated.View>
                        );
                    })}
            </View>
        </Animated.View>
    );
};

const CardEstimatesImpl: React.FC<CardEstimatesTypes> = ({
    imgSrc,
    time,
    title,
    description,
    cost,
    count,
    onPress,
    index = 0,
    isSelected = false,
    // imgSrcSelected, // currently not used, uncomment based in selected asset
    isExpanded = false,
    toCost,
    expandedData,
    onTagSelect = () => {},
    allowMultipleSelect = true,
    style,
    titleIcon = false,
    defaultSelectedExpandedData,
    dividerType = 'default',
    currency,
    onRateCardPress,
    showRateCardInfoIcon,
    disabled,
    isNammaTransit,
    journeyDuration,
    isAmbulance,
    listLikeExpandedState = false,
    originalCost,
    originalToCost,
    showDiscountedPrice = false,
}: CardEstimatesTypes) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const [selectedExpandedData, setSelectedExpandedData] = useState<string[]>([]);
    const { newBookingFlowSheetRef } = useRefsContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const journeyTime = secondsToHours(journeyDuration, userLanguageStrings);
    const selectedSharedValue = useSharedValue(0);
    const { showNammaTransitOnTop } = useAppSelector(selectNewFeatureFlags);
    const featureFlags = useAppSelector(selectNewFeatureFlags);

    useEffect(() => {
        if (isSelected) {
            selectedSharedValue.value = withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.ease),
            });
        } else {
            selectedSharedValue.value = withTiming(0, {
                duration: 500,
                easing: Easing.out(Easing.ease),
            });
        }
    }, [isSelected]);

    const estimatesStarted = useAppSelector(state => selectEstimatesStarted(state, null));
    const currencySymbol = getCurrency(currency);
    const resolvedCost = typeof cost === 'number' ? cost : undefined;
    const resolvedToCost = typeof toCost === 'number' ? toCost : undefined;
    const hasRange = resolvedCost !== undefined && resolvedToCost !== undefined && resolvedCost !== resolvedToCost;

    const priceDisplayText = (() => {
        if (hasRange && resolvedCost !== undefined && resolvedToCost !== undefined) {
            const lower = Math.min(resolvedCost, resolvedToCost);
            const higher = Math.max(resolvedCost, resolvedToCost);
            return `${currencySymbol}${lower} - ${currencySymbol}${higher}`;
        }
        const singleValue = resolvedCost ?? resolvedToCost;
        if (singleValue === undefined) {
            return '';
        }
        return `${currencySymbol}${singleValue}`;
    })();

    const getOriginalRangeText = () => {
        if (!showDiscountedPrice) {
            return '';
        }
        if (originalCost === undefined || originalCost === null) {
            return '';
        }
        const minValue = originalCost;
        const hasRange = originalToCost !== undefined && originalToCost !== null && originalToCost !== originalCost;
        if (hasRange) {
            const low = Math.min(minValue, originalToCost ?? minValue);
            const high = Math.max(minValue, originalToCost ?? minValue);
            return currencySymbol ? `${currencySymbol}${low} - ${currencySymbol}${high}` : `${low} - ${high}`;
        }
        return currencySymbol ? `${currencySymbol}${minValue}` : `${minValue}`;
    };

    const originalRangeText = getOriginalRangeText();

    useEffect(() => {
        if (defaultSelectedExpandedData) {
            setSelectedExpandedData(defaultSelectedExpandedData);
        }
    }, [defaultSelectedExpandedData]);

    const selectedBorderStyle = useAnimatedStyle(() => {
        return {
            borderColor: interpolateColor(
                selectedSharedValue.value,
                [0, 1],
                ['#ECEDEF', themeColors.Estimate_border || '#007AFF'],
            ),
        };
    }, [themeColors.Estimate_border]);

    const bookAnyExpandViewRef = useRef(null);

    const handleOnPress = (index: number) => {
        if (!estimatesStarted) {
            if (
                showRateCardInfoIcon &&
                onRateCardPress &&
                isSelected &&
                !isNammaTransit &&
                featureFlags.enableUserRateCard
            ) {
                onRateCardPress();
            } else if (onPress) {
                onPress(index);
            }
        }
    };

    useEffect(() => {
        if (isExpanded && isSelected) {
            setFocus(bookAnyExpandViewRef);
        }
    }, [isExpanded, isSelected]);

    return (
        <Animated.View
            entering={FadeIn.duration(350)}
            exiting={FadeOut.duration(100)}
            layout={LinearTransition.springify().damping(28).stiffness(200)}>
            <Pressable
                testID={`choose_ride_card_${title?.toLowerCase().replace(/\s+/g, '_')}`}
                accessibilityRole="button"
                accessibilityLabel={`Choose ride card ${title} button`}
                onPress={() => {
                    handleOnPress(index);
                }}
                onAccessibilityTap={() => {
                    newBookingFlowSheetRef.current?.expand();
                    handleOnPress(index);
                }}
                disabled={disabled}
                accessible={!(isExpanded && isSelected)}
                accessibilityState={isExpanded ? undefined : { selected: isSelected }}
                style={{ borderRadius: 8, borderColor: 'red' }}>
                {({ pressed }: { pressed: boolean }) => (
                    <Animated.View
                        // layout={LinearTransition.springify().damping(28).stiffness(200)}
                        // entering={
                        //     isAnimate
                        //         ? SlideInDown.delay(index * 10)
                        //               .springify()
                        //               .damping(28)
                        //               .stiffness(200)
                        //         : undefined
                        // }
                        style={[
                            tailwind.style(
                                `${isNammaTransit ? 'py-0' : 'py-3'}  rounded-[20px] border border-[#ECEDEF] bg-[${themeColors.Fill_neutralMin}] relative `,
                            ),
                            // border style when selected
                            pressed && !isSelected
                                ? tailwind.style(
                                      `border-[${themeColors.Estimate_border}] bg-[${themeColors.Fill_neutralMidLow}]`,
                                  )
                                : selectedBorderStyle,
                            style,
                        ]}>
                        {/* {isNammaTransit && (
                        <View style={tailwind.style('absolute -top-[8px] left-[12px] z-10')}>
                            <Badge
                                text="BETA"
                                accessible={true}
                                accessibilityLabel="Beta feature"
                                color={colors.blue700}
                            />
                        </View>
                    )} */}
                        <Animated.View
                            accessible={true}
                            accessibilityLabel={`${title}, ${
                                toCost && cost != toCost
                                    ? `${
                                          getCurrency(undefined) +
                                          (toCost !== undefined && cost !== undefined ? Math.min(cost, toCost) : cost)
                                      } to ${
                                          getCurrency(undefined) +
                                          (toCost !== undefined && cost !== undefined ? Math.max(cost, toCost) : toCost)
                                      }`
                                    : `${getCurrency(undefined) + cost}`
                            }, ${description}, capacity ${count} `}
                            accessibilityState={isExpanded ? undefined : { selected: isSelected }}
                            style={tailwind.style(
                                `flex-row justify-between gap-[13px] px-[${token?.spacing?.[6]}] overflow-hidden w-full rounded-[20px]`,
                            )}>
                            <Image
                                accessible={true}
                                accessibilityLabel="card estimates image"
                                source={imgSrc}
                                style={tailwind.style(
                                    `w-[65px] h-[46px] ${isNammaTransit ? (showNammaTransitOnTop ? '-ml-6 w-[120px] h-[88px] absolute ' : '-ml-6 w-[120px] h-[73px] absolute ') : ''}`,
                                )}
                                resizeMode="contain"
                            />
                            <Animated.View
                                style={tailwind.style(
                                    `flex-col gap-[${token?.spacing[6]}] flex-1 ${isNammaTransit ? 'ml-22 w-full pt-3 pb-4' : ''}`,
                                )}>
                                <Animated.View
                                    style={tailwind.style('flex-row gap-[4px] items-center')}
                                    accessible={false}>
                                    <Typography
                                        type="subhead-1"
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            `text-[${token?.text['text-highContrast']}] flex-shrink min-w-0`,
                                        )}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {`${title}`}
                                    </Typography>
                                    {count && !isNammaTransit && !isAmbulance ? (
                                        <Animated.View
                                            style={tailwind.style('flex-row items-center gap-[1px] ml-[1px]')}>
                                            <Animated.View
                                                style={tailwind.style(
                                                    `bg-[${token?.text?.['text-lowContrast']}] w-[3px] h-[3px] rounded-full`,
                                                )}
                                            />
                                            <Animated.View style={tailwind.style(`flex-row items-center gap-[2px]`)}>
                                                <UserIcon size={14} color="#656565" />
                                                <Typography
                                                    type="body-1"
                                                    style={tailwind.style(`text-xs text-[#656565] leading-[16px]`)}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {count?.toString()}
                                                </Typography>
                                            </Animated.View>
                                        </Animated.View>
                                    ) : null}
                                    {titleIcon && titleIcon}
                                </Animated.View>
                                <Animated.View style={tailwind.style('flex-row items-center gap-[7px] w-full')}>
                                    {description && (
                                        <Typography
                                            numberOfLines={1}
                                            type="body-7"
                                            style={tailwind.style(`text-[#656565] text-[14px] text-xs`)}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {description}
                                        </Typography>
                                    )}
                                    {showRateCardInfoIcon && featureFlags.enableUserRateCard && (
                                        <View style={{ marginLeft: -4 }}>
                                            <InfoIcon />
                                        </View>
                                    )}
                                    {isNammaTransit ? <JourneyView /> : null}
                                </Animated.View>
                                {isNammaTransit && showNammaTransitOnTop && (
                                    <Typography
                                        type="body-1"
                                        style={tailwind.style(
                                            `font-bold pt-1.2 text-[#9557FF] text-start text-[13px] leading-[18px]`,
                                        )}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.Futureofcommute}
                                    </Typography>
                                )}
                            </Animated.View>

                            <Animated.View
                                layout={LinearTransition}
                                style={tailwind.style(
                                    `flex-col gap-[${token?.gap.spacing[6]}] items-end pr-2 ${isNammaTransit ? 'pt-3' : ''}`,
                                )}>
                                {priceDisplayText ? (
                                    <Animated.View style={tailwind.style('flex-row')}>
                                        <Animated.View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <Typography
                                                type="subhead-1"
                                                style={tailwind.style(
                                                    `text-[${token?.text?.['text-highContrast']}] text-right`,
                                                )}
                                                numberOfLines={1}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {priceDisplayText}
                                            </Typography>
                                            {originalRangeText ? (
                                                <Typography
                                                    type="sub-body-700"
                                                    style={[
                                                        tailwind.style('text-[#7B8997] text-right text-[12px] mt-1'),
                                                        { textDecorationLine: 'line-through' },
                                                    ]}
                                                    numberOfLines={1}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {originalRangeText}
                                                </Typography>
                                            ) : null}

                                            {isNammaTransit ? (
                                                <Typography
                                                    type="body-1"
                                                    style={tailwind.style(
                                                        `font-extrabold text-[13px] text-[#969696] leading-[13px] text-right pt-3.5`,
                                                    )}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {journeyTime ? `${journeyTime}` : ''}
                                                </Typography>
                                            ) : null}
                                        </Animated.View>
                                    </Animated.View>
                                ) : null}

                                {time && (
                                    <Typography
                                        type="body-1"
                                        style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {`${time?.toString()} min`}
                                    </Typography>
                                )}
                            </Animated.View>
                        </Animated.View>

                        {isExpanded && isSelected ? (
                            <Animated.View
                                style={tailwind.style('w-full pt-[17px]')}
                                exiting={FadeOutUp.duration(150)}
                                entering={FadeInUp.springify().damping(28).stiffness(200)}
                                accessible={false}>
                                <Animated.View style={tailwind.style(`mx-[${token?.spacing?.[16]}] `)}>
                                    <Divider
                                        type={dividerType}
                                        direction={undefined}
                                        style={undefined}
                                        labelPosition={undefined}
                                        offset={undefined}
                                        offsetBackground={undefined}
                                        dividerColor={undefined}
                                        strokeDashArray={undefined}
                                    />
                                </Animated.View>

                                {listLikeExpandedState ? (
                                    <ListExpandedView
                                        expandedData={expandedData}
                                        selectedExpandedData={selectedExpandedData}
                                        setSelectedExpandedData={setSelectedExpandedData}
                                        onTagSelect={onTagSelect}
                                    />
                                ) : (
                                    // Original tag-based view for other services
                                    <Animated.View
                                        style={tailwind.style('pt-[16px] flex-row flex-wrap px-15px gap-12px')}>
                                        {expandedData?.map(
                                            item =>
                                                item && (
                                                    <Tag
                                                        // eslint-disable-next-line myCustomPlugin/no-duplicate-test-id
                                                        testID={`choose_ride_vehicle_tag_${item?.name
                                                            ?.toLowerCase()
                                                            .replace(/\s+/g, '_')}`}
                                                        size="md"
                                                        key={item?.value}
                                                        type="primary"
                                                        text={item?.name}
                                                        accessible={true}
                                                        accessibilityState={{
                                                            selected: item?.value
                                                                ? selectedExpandedData?.includes(item.value)
                                                                : false,
                                                        }}
                                                        // subText={item.name === 'Sedan' ? 'a' : ''}    #till a new config is made
                                                        onPress={() => {
                                                            if (
                                                                item?.value &&
                                                                selectedExpandedData?.includes(item.value)
                                                            ) {
                                                                if (
                                                                    selectedExpandedData?.length === 1 &&
                                                                    allowMultipleSelect
                                                                ) {
                                                                    // if only one value is selected, the value should not be removed
                                                                    return;
                                                                }
                                                                const updatedData =
                                                                    selectedExpandedData?.filter(
                                                                        filterItem => filterItem !== item?.value,
                                                                    ) ?? [];
                                                                setSelectedExpandedData(updatedData);
                                                                const mappedData = updatedData.map(dataItem => {
                                                                    const foundItem = find(
                                                                        expandedData,
                                                                        findItem => dataItem === findItem?.value,
                                                                    );
                                                                    return foundItem?.value ?? dataItem;
                                                                });
                                                                onTagSelect(mappedData);
                                                            } else {
                                                                const updatedData =
                                                                    allowMultipleSelect && item?.value
                                                                        ? [...(selectedExpandedData ?? []), item.value]
                                                                        : item?.value
                                                                          ? [item.value]
                                                                          : [];
                                                                setSelectedExpandedData(updatedData);
                                                                const mappedData = updatedData.map(dataItem => {
                                                                    const foundItem = find(
                                                                        expandedData,
                                                                        findItem => dataItem === findItem?.value,
                                                                    );
                                                                    return foundItem?.value ?? dataItem;
                                                                });
                                                                onTagSelect(mappedData);
                                                            }
                                                        }}
                                                        selected={
                                                            !!item?.value && selectedExpandedData?.includes(item.value)
                                                        }
                                                        icon={
                                                            <Image
                                                                source={getVehicleFromVehicleType(
                                                                    item.service,
                                                                    item.isAc,
                                                                )}
                                                                style={{ width: 42, height: 32 }}
                                                                resizeMode="contain"
                                                                accessible={true}
                                                                accessibilityLabel="card estimates vehicle image"
                                                            />
                                                        }
                                                    />
                                                ),
                                        )}
                                    </Animated.View>
                                )}
                            </Animated.View>
                        ) : null}
                    </Animated.View>
                )}
            </Pressable>
        </Animated.View>
    );
};

export const CardEstimates = React.memo(CardEstimatesImpl);
