import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { JourneyFilterOption } from '@/src-v2/multimodal/components/common/JourneyFilterOption';
import Button from '@/src-v2/primitives/Button';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import token from '@/typescript/designSystem/tokens';
import { createAction, Resolver } from '@/typescript/utils/common';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '../../../../src/typescript/tailwindTheme/tailwind';
import { TransitSummaryType } from '../JourneyInfoScreen/components/TransitSummary';
import { SourceDestinationCard } from '../JourneyInfoScreen/DirectBooking/components/SourceDestinationCard';
import { PublicTransitItem } from './components/PublicTransitItem';
import {
    JourneyFilterOptions,
    JourneyOptionsScreenAction,
    JourneyOptionsScreenProps,
    PublicTransportList,
} from './Types';
import { formatDistance } from '@/src-v2/utils/common';
import { getPlaceArea, transformLocationToAPIEntity } from '@/typescript/utils/placeUtils';
import { getTransitType } from '@/typescript/utils/MultiModal';
import NoRoutesFoundImg from '@/src-v2/assets/no_routes_found.webp';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const BackPress: React.FC<{
    mbDispatch: Resolver<JourneyOptionsScreenAction>;
}> = props => {
    const icon = (
        <Icon
            icon={<CloseIcon color={undefined} height={undefined} width={undefined} />}
            size={16}
            color={token?.text['text-base']}
        />
    );
    return (
        <Animated.View style={{ alignItems: 'flex-start', marginLeft: 15 }}>
            <Button
                size="md"
                type="secondary"
                prefix={icon}
                onPress={() => {
                    props.mbDispatch(createAction('GO_BACK', undefined));
                }}
                testID={'55f0b0b9-9752-47b4-b615-470592ba2237'}
                accessibilityLabel="Go back to previous screen"
            />
        </Animated.View>
    );
};

/**
 * Determines the tag for a PublicTransitItem based on its characteristics
 * - EARLIEST: for the route with the shortest duration
 * - AFFORDABLE: for the route with the least cost
 * - HYBRID: if any auto leg is present in the route alongside other legs
 * - null: if no special conditions are met or if there's only one leg and it's an auto
 */
const determinePublicTransitTag = (
    transportDetails: PublicTransportList,
    allTransportDetails: PublicTransportList[],
): 'EARLIEST' | 'AFFORDABLE' | 'HYBRID' | null => {
    // Check if there is only one leg and it's auto
    const journeyLegs = transportDetails.journeyData;
    const isSingleLegAuto = journeyLegs.length === 1 && journeyLegs[0]?.type?.toLowerCase() === 'taxi';

    // Don't show HYBRID tag for single auto leg
    if (isSingleLegAuto) {
        return null;
    }

    // Check if any auto leg is present alongside other legs
    const hasAutoLeg = transportDetails.journeyData.some(
        journey => journey.type.toLowerCase() === 'auto' || journey.type.toLowerCase() === 'taxi',
    );

    // Find the shortest duration route
    const shortestDuration = Math.min(...allTransportDetails.map(item => item.totalTime || Infinity));
    if (transportDetails.totalTime === shortestDuration && shortestDuration !== Infinity) {
        return 'EARLIEST';
    }

    // Find the least cost route
    const lowestCost = Math.min(...allTransportDetails.map(item => item.cost || Infinity));
    if (transportDetails.cost === lowestCost && lowestCost !== Infinity) {
        return 'AFFORDABLE';
    }

    if (hasAutoLeg) {
        return 'HYBRID';
    }

    // Default case - don't show any tag
    return null;
};

export const PublicTransitList = (props: JourneyOptionsScreenProps) => {
    const insets = useSafeAreaInsets();
    const showNoRoutes = props.filtersApplied && props.publicTransportList.length === 0;
    const { transitOptions } = useAppSelector(selectNewFeatureFlags);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const renderJourneyList = (journeyList: PublicTransportList[]) =>
        journeyList.map((transportDetails: PublicTransportList, index: number) => (
            <PublicTransitItem
                index={index}
                key={index}
                onPress={() =>
                    props.mpDispatch(
                        createAction('JOURNEY_CLICK', {
                            JourneyId: transportDetails.journeyId,
                        }),
                    )
                }
                distance={formatDistance(transportDetails.distance, 'Kilometer', userLanguageStrings)}
                cost={Math.round(transportDetails.cost ?? 0).toString()}
                tag={determinePublicTransitTag(transportDetails, journeyList)}
                endTime={transportDetails.endTime ?? null}
                journey={transportDetails.journeyData.reduce<TransitSummaryType[]>((acc, curr) => {
                    return [
                        ...acc,
                        {
                            type: getTransitType(curr.type),
                            cost: curr.cost ? Math.round(curr.cost) : null,
                            costWithQuantity: curr.cost ? Math.round(curr.cost) : null,
                            distance: curr.distance,
                            routeCode: curr.routeShortName,
                            busStopsCount: curr.alternateRouteNames?.length
                                ? curr.alternateRouteNames?.length - 1
                                : undefined,
                            time: curr.time ? curr.time * 60 : undefined,
                            legOrder: undefined,
                            metroLineColor: undefined,
                            isSkipped: false,
                            bookingAllowed: undefined,
                            hasApplicablePasses: false,
                        },
                    ];
                }, [])}
                startTime={transportDetails.startTime ?? null}
            />
        ));

    return (
        <HardwareBackpressHandler>
            <View
                style={[
                    tailwind.style('flex-1 bg-[#F8F9FB] '),
                    { paddingTop: insets.top, paddingBottom: insets.bottom },
                ]}>
                <BackPress mbDispatch={props.mpDispatch} />
                {/* <Pressable
                    onPress={() => props.mpDispatch(createAction('NAVIGATE_TO_SEARCH_MODAL', undefined))}
                    style={tailwind.style('mt-[12px] mx-4 mb-[13px]')}>
                    <InputGroup isSourceAndStopEditable={false} isMultiModal={false} />
                </Pressable> */}
                <Pressable
                    accessibilityRole="button"
                    testID="8d2dbad3-b70d-40bc-a52b-e694e0a8d50f"
                    accessibilityLabel="Source and Destination button"
                    onPress={() => props.mpDispatch(createAction('NAVIGATE_TO_SEARCH_MODAL', undefined))}>
                    <Animated.View style={tailwind.style('px-4 pt-[13px]')}>
                        <SourceDestinationCard
                            isMultiModal={false}
                            // TODO: Set the start and drop location
                            source={props.source ? getPlaceArea(transformLocationToAPIEntity(props.source)) : ''}
                            destination={
                                props.destination ? getPlaceArea(transformLocationToAPIEntity(props.destination)) : ''
                            }
                            fare={undefined}
                            time={undefined}
                            journeyTypes={undefined}
                            onPress={() => {}}
                            showFare={false}
                            fetchingLegsFare={undefined}
                        />
                    </Animated.View>
                </Pressable>
                <Animated.View style={tailwind.style('px-4 pt-[18px]')}></Animated.View>
                {transitOptions.showPublicTransitPreferences && (
                    <JourneyFilterOption
                        options={[
                            JourneyFilterOptions.Most_Relevant,
                            JourneyFilterOptions.Quickest,
                            JourneyFilterOptions.Cheapest,
                            JourneyFilterOptions.Fewest_Transfers,
                            JourneyFilterOptions.Least_Walking,
                        ]}
                        selectJourneyFilter={option =>
                            props.mpDispatch(createAction('FILTER_LEGS', { options: option }))
                        }
                        dispatch={props.mpDispatch}
                    />
                )}

                {showNoRoutes ? (
                    <Animated.View style={tailwind.style('flex-1 bg-[#F8F9FB]')}>
                        <Animated.ScrollView
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            showsVerticalScrollIndicator={false}
                            style={tailwind.style('flex-1')}>
                            <Animated.View style={tailwind.style('items-center justify-center py-3 z-10 ')}>
                                <Animated.Image
                                    accessible={true}
                                    accessibilityLabel="no routes found image"
                                    source={NoRoutesFoundImg}
                                    style={{ width: 42, height: 53, marginVertical: 16 }}
                                    resizeMode="contain"
                                />
                                <Typography
                                    type="subhead-1"
                                    style={tailwind.style('text-[14px] text-[#656565] text-center pb-5 max-w-[60%]')}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.NoRoutesFoundTryChangingYourFilters}
                                </Typography>
                                <Animated.View
                                    style={tailwind.style(
                                        'h-[1px] bg-[#E6E6E6]',
                                        `w-[${SCREEN_WIDTH - 40}px]`,
                                    )}></Animated.View>
                            </Animated.View>
                            <Typography
                                type="subhead-2"
                                style={tailwind.style('text-[14px] text-[#7E7E7E] text-left w-full px-6 my-3')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.SuggestedRoutesForYou}
                            </Typography>
                            {renderJourneyList(
                                props.allJourneysList.filter(journey =>
                                    journey.journeyData.every(leg => leg.cost !== null),
                                ),
                            )}
                        </Animated.ScrollView>
                    </Animated.View>
                ) : (
                    <Animated.ScrollView
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={tailwind.style('bg-[#F8F9FB]')}>
                        <Animated.View style={tailwind.style('flex-1')}>
                            {renderJourneyList(props.publicTransportList)}
                        </Animated.View>
                    </Animated.ScrollView>
                )}
                {props.isLoading && (
                    <Animated.View style={tailwind.style('flex-1 items-center justify-center')}>
                        <ActivityIndicator size="large" color={token?.text['text-base']} />
                    </Animated.View>
                )}
            </View>
        </HardwareBackpressHandler>
    );
};
