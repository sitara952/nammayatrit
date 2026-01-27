import React, { useEffect } from 'react';
import Animated from 'react-native-reanimated';
import { selectBookingId } from '../../state/client/user';
import { useAppSelector } from '../../state/hooks';
import Typography from '../../designSystem/components/primitives/Typography';
import { EventName, logEvent, LogInterface } from '@/typescript/utils/logger';
import { BoostCard } from '@/src-v2/screens/LookingForRides/BoostCard/Flow';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Icon } from '@/typescript/components/Icon';
import RetryIcon from '../../components/svg/RetryIcon';
import token from '@/typescript/designSystem/tokens';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useBoostCard } from '@/src-v2/screens/LookingForRides/BoostCard/useBoostCard';
import Button from '@/src-v2/primitives/Button';
import { CardEstimates } from '@/typescript/designSystem/components/CardEstimates';
import { PricingItemType, selectJourneys, selectSelectedPricingItems } from '@/typescript/state/client/search';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { getTipChangeCount, resetTipChangeCount } from '../lookingForRides/BoostSearchTipsModal';
import { getVariantChangeCount, resetVariantChangeCount } from '../lookingForRides/BoostSearchChangeVehicleModal';
import { getAvailableTipOptions } from '@/src-v2/utils/common';
import { selectFareProductType, selectNewFeatureFlags, selectAppConfig } from '@/typescript/state/client/session';
import { View } from 'react-native';
import { useRideFareCalculation } from '@/src-v2/hooks/useRideFareCalculation';
import { selectSearchId } from '@/typescript/state/client/user';

const RetryBoostedSearch = (props: {
    retryBoostSearchBackPress: () => void;
    resetSearch: () => void;
    setHeight: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const bookingId = useAppSelector(selectBookingId);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const { newBookingFlowSheetRef } = useRefsContext();
    const shouldShowDefaultTips = useAppSelector(selectNewFeatureFlags).shouldShowDefaultTips;
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const tipOptions = getAvailableTipOptions(shouldShowDefaultTips, selectedPricingItems);

    const {
        onPress: originalOnPress,
        buttonText,
        isDisabled,
        additionalFare,
        setAdditionalFare,
        selectedExpandedData,
        setSelectedExpandedData,
        isLoading,
    } = useBoostCard(props.resetSearch, bookingId, true, false);

    /*
  @hkmangla: Whenever you are writing a common logic, try to create a common function which can be use anywhere the way it is done below.
  */

    useEffect(() => {
        newBookingFlowSheetRef.current?.snapToIndex(0);
        logEvent(EventName.NY_RIDER_RETRY_REQUEST_QUOTE);
        // Reset counters when component mounts
        resetTipChangeCount();
        resetVariantChangeCount();
    }, []);

    const onPress = () => {
        const tipChanges = getTipChangeCount();
        const variantChanges = getVariantChangeCount();
        logEvent(EventName.NY_BOOST_SEARCH_ATTEMPT, { tipChanges, variantChanges }, [LogInterface.Firebase]);
        resetTipChangeCount();
        resetVariantChangeCount();
        originalOnPress();
    };

    return (
        <View style={{ height: '100%' }}>
            <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                style={{ backgroundColor: colors.white100, paddingBottom: 50 }}
                contentContainerStyle={{ paddingBottom: 80 }}>
                <Icon
                    icon={<RetryIcon />}
                    size={14}
                    style={{
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        paddingRight: 88,
                        marginTop: 15,
                        marginBottom: 30,
                    }}
                    color={token?.text['text-base']}
                />
                <Animated.View style={{ paddingHorizontal: 21, backgroundColor: colors.white100 }}>
                    <Animated.View
                        style={{
                            gap: 8,
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginBottom: 5,
                        }}>
                        <Animated.View
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: [{ perspective: 1000 }],
                                marginHorizontal: 69,
                            }}>
                            <Typography
                                type="subhead"
                                style={{ fontSize: 20, textAlign: 'center', paddingTop: 5 }}
                                numberOfLines={2}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Pleasetryboostedsearch}
                            </Typography>
                        </Animated.View>
                        <Typography
                            type="subhead"
                            style={{ color: '#9D9D9D', fontSize: 16, textAlign: 'center' }}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.UhohLookslikealldriversarebusy}
                        </Typography>
                    </Animated.View>

                    <EstimateCard additionalFare={additionalFare} />
                    <BoostCard
                        containerStyle={{ paddingBottom: bottom }}
                        additionalFare={additionalFare}
                        setAdditionalFare={setAdditionalFare}
                        selectedExpandedData={selectedExpandedData}
                        setSelectedExpandedData={setSelectedExpandedData}
                        setHeight={props.setHeight}
                        tipOptions={tipOptions}
                        currentlySelectedIds={selectedExpandedData}
                    />
                </Animated.View>
            </BottomSheetScrollView>
            <Animated.View
                style={{
                    width: '100%',
                    paddingTop: 14,
                    zIndex: 5,
                    position: 'absolute',
                    bottom: 0,
                    paddingHorizontal: 20,
                    backgroundColor: colors.white100,
                    elevation: 50,
                }}>
                <Button
                    testID="retry_search_click"
                    type="primary"
                    style={{ justifyContent: 'center', marginBottom: bottom }}
                    text={buttonText}
                    disabled={isDisabled || isLoading}
                    isLoading={isLoading}
                    onPress={onPress}
                />
            </Animated.View>
        </View>
    );
};

const EstimateCard = ({ additionalFare }: { additionalFare: number | undefined }) => {
    const selectedPricingItem = useAppSelector(state => selectSelectedPricingItems(state, null));
    const selectedValue = selectedPricingItem.at(0);
    const isBookAny = selectedPricingItem.length > 1;
    const fareProductType = useAppSelector(selectFareProductType);
    const appConfig = useAppSelector(selectAppConfig);
    const searchId = useAppSelector(state => selectSearchId(state, null));

    const { minCost, maxCost } = useRideFareCalculation(selectedPricingItem, additionalFare, searchId);

    const minCapacity = Math.min(...selectedPricingItem.map(v => v.minVehicleServiceTierSeatingCapacity));
    const maxCapacity = Math.max(...selectedPricingItem.map(v => v.maxVehicleServiceTierSeatingCapacity));
    const journeys = useAppSelector(state => selectJourneys(state, null));
    const value: PricingItemType | undefined = selectedValue
        ? {
              ...selectedValue,
              cost: minCost,
              toCost: maxCost,
              minVehicleServiceTierSeatingCapacity: minCapacity,
              maxVehicleServiceTierSeatingCapacity: maxCapacity,
          }
        : undefined;

    const imgCar = {
        uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/1743752694493.webp',
    };

    const bookAnyImage = (fareProductType: string | null, selectedPricingItem: PricingItemType[]) => {
        const isAutoIncluded = selectedPricingItem.some(
            item => item.serviceTierType === 'AUTO_RICKSHAW' || item.serviceTierType === 'EV_AUTO_RICKSHAW',
        );
        const isBikeIncluded = selectedPricingItem.some(
            item => item.serviceTierType === 'BIKE' || item.serviceTierType === 'BIKE_DELIVERY',
        );

        const mtICBookAnyBike = {
            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vehicle_icons/img-bookany_bikesedan-1761641814504.webp',
        };
        const mtIcBookAnyAmbulance = {
            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/variant/img-ny_ic_ambulance_book_any-1757836171077.webp',
        };
        const mtICBookAny = {
            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vehicle_icons/img-bookany_bikesedan-1761641814504.webp',
        };

        if (fareProductType === 'AMBULANCE') return mtIcBookAnyAmbulance;
        else if (isAutoIncluded) return mtICBookAny;
        else if (isBikeIncluded) return mtICBookAnyBike;
        return mtICBookAny;
    };

    return value ? (
        <Animated.View style={{ marginTop: 12, marginBottom: 12 }}>
            <CardEstimates
                disabled={true}
                isSelected={false}
                toCost={value?.toCost === value?.cost ? undefined : value?.toCost}
                imgSrc={
                    isBookAny
                        ? bookAnyImage(fareProductType, selectedPricingItem)
                        : value?.vehicleIconUrl
                          ? { uri: value?.vehicleIconUrl }
                          : imgCar
                }
                imgSrcSelected={imgCar}
                title={isBookAny ? 'Book Any' : value?.serviceTierName}
                titleIcon={false}
                description={value?.serviceTierShortDesc ?? ''}
                isBookAny={isBookAny}
                count={
                    value?.minVehicleServiceTierSeatingCapacity == value?.maxVehicleServiceTierSeatingCapacity
                        ? value?.minVehicleServiceTierSeatingCapacity
                        : value?.minVehicleServiceTierSeatingCapacity +
                          ' - ' +
                          value?.maxVehicleServiceTierSeatingCapacity
                }
                currency={value?.estimatedFareWithCurrency?.currency}
                cost={value?.cost}
                isAnimate={false}
                onPress={() => {}}
                defaultSelectedExpandedData={[]}
                onTagSelect={_ => {}}
                isExpanded={false}
                expandedData={undefined}
                onRateCardPress={() => {}}
                showRateCardInfoIcon={false}
                time={undefined}
                allowMultipleSelect={undefined}
                style={undefined}
                dividerType={undefined}
                index={0}
                isNammaTransit={value?.serviceTierName === appConfig.textConfig.publicTransitText}
                journeyDuration={journeys[0]?.duration}
                isAmbulance={fareProductType === 'AMBULANCE'}
                listLikeExpandedState={false}
                originalCost={selectedValue?.cost}
                originalToCost={selectedValue?.toCost}
                showDiscountedPrice={false}
            />
        </Animated.View>
    ) : null;
};

export default RetryBoostedSearch;
