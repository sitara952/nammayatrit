import multiModalTrain from '../../../../../consumer/src/typescript/assets/multiModal_Train.webp';
import mtIcBusTransitReview from '../../../assets/3D-assets/review-transits/mt_ic_bus_transit_review.webp';
import trainTransit from '../../../assets/3D-assets/transits/mt_ic_train_transit.webp';
import transitMulti from '../../../assets/3D-assets/transits/transit_multi.webp';
import mtIcAutoTransitReview from '../../../assets/3D-assets/review-transits/mt_ic_auto_review_transit.webp';
import mtIcAutoPriorityTransitReview from '../../../assets/3D-assets/review-transits/mt_ic_auto_priority_review_transit.webp';
import mtIcCabTransitReview from '../../../assets/3D-assets/review-transits/mt_ic_cab_review_transit.webp';
import React, { useRef } from 'react';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Image, ImageSourcePropType, View } from 'react-native';
import { BookingDetailCardProps, RideStatus } from '../UI';

import Typography from '@/typescript/designSystem/components/primitives/Typography';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { JourneyDetails } from '../../MyBookingDetails/Types';
import { isNull } from 'lodash';
import { getCurrency } from '@/typescript/utils/getCurrency';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen.tsx';
import { calculateTotalPriceFromJourney } from '@/typescript/utils/MultiModal';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { InfoIcon } from '@/typescript/assets/svg/symbols/InfoIcon';
import { MultimodalConfirmationModal } from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/MultimodalConfirmationModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName, selectNewFeatureFlags } from '@/typescript/state/client/session';
import DoubleChevronUp from '@/typescript/assets/svg/symbols/DoubleChevronUp';
import { getAccumulatedCancellationCharges } from '@/typescript/utils/fareEntityHelper';
import { useGetRemoteConfigTexts } from '@/src-v2/hooks/useGetRemoteConfigTexts';

export const isSingleTaxiJourney = (journeyDetails: JourneyDetails | null): boolean => {
    return (
        journeyDetails?.journeyModes?.length === 1 &&
        journeyDetails.journeyModes[0]?.travelMode === 'Taxi' &&
        journeyDetails.journeyModes[0]?.legExtraInfo?.TAG === 'Taxi'
    );
};

export const isSingleTaxiJourneyFromResp = (journeyData: { legs: legInfo[] }): boolean => {
    return (
        journeyData.legs.length === 1 &&
        journeyData.legs[0]?.travelMode === 'Taxi' &&
        journeyData.legs[0]?.legExtraInfo?.TAG === 'Taxi'
    );
};

export const BookingDetailTopCard: React.FC<
    BookingDetailCardProps & {
        journeyDetails: JourneyDetails | null;
        showEstimate: boolean;
        showFareDescription: boolean;
        showRideStatus: boolean;
    }
> = ({
    date,
    time,
    price,
    vehicleServiceTier,
    type,
    vehicleIconUrl,
    currency,
    showEstimate,
    rideStatus,
    journeyDetails,
    showFareDescription,
    showRideStatus,
    bookingDetail,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const fareDescriptionModalRef = useRef<BottomSheetModal>(null);
    const appReadableName = useAppSelector(selectAppReadableName);
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const isPublicTransport = journeyDetails?.journeyModes.some(leg =>
        ['Metro', 'Bus', 'Subway'].includes(leg.travelMode),
    );
    const { getCancellationTexts } = useGetRemoteConfigTexts();
    const { cancellationStatusTexts } = getCancellationTexts;
    const currencySymbol = getCurrency(currency);

    const displayPrice = !isNull(journeyDetails) ? calculateTotalPriceFromJourney(journeyDetails) : price;
    const getJourneyType = (journeyDetails: JourneyDetails | null) => {
        if (isPublicTransport) return 'Public Transport';
        if (journeyDetails?.journeyModes[0]?.legExtraInfo.TAG === 'Taxi') {
            return journeyDetails?.journeyModes[0]?.legExtraInfo._0?.serviceTierName;
        }
        return 'Taxi';
    };
    const journeyType = getJourneyType(journeyDetails);

    const getTransitImageSource = (journeyDetails: JourneyDetails | null): ImageSourcePropType => {
        const travelMode = journeyDetails?.journeyModes[0]?.travelMode?.toLowerCase();

        if (journeyDetails && journeyDetails.journeyModes.length > 1) {
            return transitMulti;
        }

        switch (travelMode) {
            case 'metro':
                return multiModalTrain;
            case 'bus':
                return mtIcBusTransitReview;
            case 'subway':
                return trainTransit;
            case 'taxi': {
                return typeof vehicleIconUrl === 'string'
                    ? vehicleIconUrl === ''
                        ? journeyType?.toLowerCase().includes('auto')
                            ? journeyType?.toLowerCase().includes('priority')
                                ? mtIcAutoPriorityTransitReview
                                : mtIcAutoTransitReview
                            : mtIcCabTransitReview
                        : { uri: vehicleIconUrl }
                    : vehicleIconUrl;
            }
            default:
                return mtIcBusTransitReview;
        }
    };
    const cancellationFeeForThisRide = bookingDetail?.rideList.at(0)?.cancellationChargesOnCancel ?? 0;
    const accumulatedCancellationCharges = getAccumulatedCancellationCharges(bookingDetail?.fareBreakup);
    const displayCancellationCharge =
        rideStatus === RideStatus.Cancelled ? cancellationFeeForThisRide : accumulatedCancellationCharges;
    const cancellationSource = bookingDetail?.cancellationReason?.source;

    const accessibilityLabel =
        date && time
            ? `Your ride on ${date} at ${time} with ${
                  isNull(journeyDetails) ? `${vehicleServiceTier}${type ? ' - ' + type : ''}` : journeyType
              } cost ${Math.round(Number(displayPrice))} ${currency}.`
            : `Your ride with ${
                  isNull(journeyDetails) ? `${vehicleServiceTier}${type ? ' - ' + type : ''}` : journeyType
              } cost ${Math.round(Number(displayPrice))} ${currency}.`;
    return (
        <View accessible={true} accessibilityLabel={accessibilityLabel}>
            <View style={tailwind.style('flex-row justify-between items-end ')}>
                <View style={{ flex: 2, flexDirection: 'row' }}>
                    {isNull(journeyDetails) ? (
                        <Image
                            accessible={false}
                            source={
                                typeof vehicleIconUrl === 'string'
                                    ? {
                                          uri: vehicleIconUrl,
                                      }
                                    : vehicleIconUrl
                            }
                            style={[tailwind.style('w-[75px] h-[56px]'), { resizeMode: 'contain' }]}
                        />
                    ) : (
                        <Image
                            accessible={false}
                            source={getTransitImageSource(journeyDetails)}
                            style={[tailwind.style('w-[71px] h-[56px] mr-1'), { resizeMode: 'cover' }]}
                        />
                    )}

                    {date && time ? (
                        <View style={tailwind.style('flex-col justify-center gap-1 ')}>
                            <Typography
                                type="body-1"
                                style={undefined}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>{`${date} • ${time}`}</Typography>
                            <Typography
                                type="body-7"
                                style={tailwind.style(`text-[${themeColors.Text_neutralHigh}]`)}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {isNull(journeyDetails)
                                    ? `${vehicleServiceTier}${type ? ' - ' + type : ''}`
                                    : journeyType}
                            </Typography>
                        </View>
                    ) : (
                        <View style={tailwind.style('mr-auto flex-col justify-center gap-1 mt-3')}>
                            <Typography
                                type="body-7"
                                style={tailwind.style(`text-[${themeColors.Text_neutralHigh}]`)}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {`${vehicleServiceTier} - ${type}`}
                            </Typography>
                        </View>
                    )}
                </View>
                <View style={{ flex: 1, marginBottom: 5 }}>
                    {showEstimate ? (
                        <View style={tailwind.style('flex-col mr-1')}>
                            {rideStatus !== RideStatus.Cancelled ? (
                                <View style={tailwind.style('flex-col gap-2 items-center justify-center')}>
                                    <Typography
                                        type="body-7"
                                        style={tailwind.style(`${themeColors.Text_neutralHigh}`)}
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.Estimate}
                                    </Typography>
                                    <Typography
                                        type="title-800"
                                        style={undefined}
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {`${getCurrency(currency)} ${Number(displayPrice)}`}
                                    </Typography>
                                </View>
                            ) : showRideStatus ? (
                                <View style={tailwind.style(`bg-[#FFEDED] p-1 px-3 rounded-full`)}>
                                    <Typography
                                        style={{ color: '#EA4848' }}
                                        type="body-7"
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.Cancelled}
                                    </Typography>
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <View style={tailwind.style('flex-col')}>
                            {rideStatus !== RideStatus.Cancelled ? (
                                <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginRight: 8, gap: 3 }}>
                                    {
                                        <Typography
                                            type="title-800"
                                            style={{ alignSelf: 'flex-end' }}
                                            numberOfLines={1}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {`${getCurrency(currency)} ${Number(displayPrice)}`}
                                        </Typography>
                                    }
                                    {showFareDescription ? (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Show Fare Description button"
                                            onPress={() => {
                                                fareDescriptionModalRef.current?.present();
                                            }}
                                            testID="showFareDescription"
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                            <InfoIcon fill="gray" />
                                        </Pressable>
                                    ) : null}
                                </View>
                            ) : showRideStatus ? (
                                <View style={tailwind.style(`bg-[#FFEDED] p-1 px-2 rounded-full`)}>
                                    <Typography
                                        style={{ color: '#EA4848', alignSelf: 'center' }}
                                        type="body-7"
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.Cancelled}
                                    </Typography>
                                </View>
                            ) : null}
                        </View>
                    )}
                </View>
            </View>
            {featureFlags.customerCancellationConfig.enableCancellationCharges &&
                (rideStatus === RideStatus.Cancelled || rideStatus === RideStatus.Completed) &&
                displayCancellationCharge > 0 && (
                    <View
                        style={tailwind.style(
                            'flex-row items-center justify-center mx-3 mt-2 px-2 py-1 my-1.5 rounded-lg bg-[#F1F2F7]',
                        )}>
                        {rideStatus === RideStatus.Cancelled ? (
                            <DoubleChevronUp height={16} width={16} color="#454C55" />
                        ) : (
                            <InfoIcon fill="#454C55" />
                        )}
                        <Typography
                            type="body-2"
                            style={tailwind.style('text-[#454C55] text-[12px] ml-1')}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={
                                rideStatus === RideStatus.Cancelled
                                    ? `${currencySymbol}${displayCancellationCharge} charged, ${cancellationSource === 'ByDriver' ? cancellationStatusTexts.myRidesDriverCancellationText : cancellationStatusTexts.myRidesUserCancellationText}`
                                    : `Fare includes ${currencySymbol}${displayCancellationCharge} cancellation charge`
                            }
                            accessibilityRole={undefined}>
                            {rideStatus === RideStatus.Cancelled
                                ? `${currencySymbol}${displayCancellationCharge} charged • ${cancellationSource === 'ByDriver' ? cancellationStatusTexts.myRidesDriverCancellationText : cancellationStatusTexts.myRidesUserCancellationText}`
                                : `Fare includes ${currencySymbol}${displayCancellationCharge} cancellation charge`}
                        </Typography>
                    </View>
                )}
            <MultimodalConfirmationModal
                ref={fareDescriptionModalRef}
                onConfirm={() => {
                    fareDescriptionModalRef.current?.dismiss();
                }}
                onCancel={() => {}}
                heading=""
                description={
                    <Animated.View
                        style={[tailwind.style('flex'), { gap: 20, marginBottom: 25, marginTop: 12, fontWeight: 600 }]}>
                        <Typography
                            type="subhead-600"
                            style={{ color: themeColors.Text_neutralUltraHigh, fontSize: 14 }}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={undefined}
                            accessibilityRole={undefined}
                            accessibilityLabel={undefined}>
                            {userLanguageStrings.TotalFareDescription(appReadableName)}
                        </Typography>
                        <Typography
                            type="body-7"
                            style={{ color: themeColors.Text_neutralUltraHigh, fontSize: 14 }}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={undefined}
                            accessibilityRole={undefined}
                            accessibilityLabel={undefined}>
                            {userLanguageStrings.SkippedLegsFareNote}
                        </Typography>
                    </Animated.View>
                }
                primaryButtonText={userLanguageStrings.GotIt}
                secondaryButtonText=""
                accessibilityRef={undefined}
                onModalContentReady={undefined}
            />
        </View>
    );
};
