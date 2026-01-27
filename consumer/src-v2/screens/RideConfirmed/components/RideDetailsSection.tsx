import React from 'react';
import Animated from 'react-native-reanimated';
import { CityAdImage } from '@/src-v2/components/CityAdImage';
import { AD_VIEW_UNIT_IDS } from '@/src-v2/components/CityAdImage/viewUnitIds';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { CardRideDetails } from '@/typescript/designSystem/components/CardRideDetails';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import { createAction, Resolver } from '@/typescript/utils/common';
import { isNull } from 'lodash';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { getDriverLocResp } from '@/readOnly/api/types/GetDriverLocResp.gen.tsx';
import { RideConfirmedScreenAction } from '../Types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectFeatureFlags, selectFareProductType } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { disability } from '@/readOnly/api/types/Disability.gen';

interface RideDetailsSectionProps {
    stops: Array<FormatedLocation>;
    source: FormatedLocation | null;
    bookingDetails: bookingAPIEntity | null;
    rideDetails: rideAPIEntity | null;
    editLocationAttempts: number;
    editPickupAttempts: number;
    rcsDispatch: Resolver<RideConfirmedScreenAction>;
    driverLocation: getDriverLocResp | undefined;
    tripDetailsRef: React.RefObject<BottomSheetModal | null>;
    setHideAccessibility: React.Dispatch<React.SetStateAction<boolean>>;
    callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    setShowTripDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
    bookingSpecialAssistance: disability | null | undefined;
    onCancelTripPress: () => void;
}

const RideDetailsSection: React.FC<RideDetailsSectionProps> = ({
    stops,
    source,
    bookingDetails,
    rideDetails,
    tripDetailsRef,
    editLocationAttempts,
    editPickupAttempts,
    rcsDispatch,
    driverLocation,
    setHideAccessibility,
    callDriverBottomsheetModalRef,
    setShowTripDetailsModal,
    onCancelTripPress,
    bookingSpecialAssistance,
}) => {
    const featureFlags = useAppSelector(selectFeatureFlags);
    const fareProductType = useAppSelector(state => selectFareProductType(state));
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const currencySymbol = CURRENCY_SYMBOL.value;
    const { bottom } = useSafeAreaInsets();
    return (
        <Animated.View style={{ paddingBottom: bottom }}>
            <CardRideDetails
                userLanguageStrings={userLanguageStrings}
                stops={stops
                    .filter(stop => stop !== null && stop !== undefined)
                    .map((stop, index) => ({
                        area: stop.area,
                        address: stop.address,
                        editable:
                            index === stops.length - 1 &&
                            editLocationAttempts > 0 &&
                            !isNull(rideDetails) &&
                            bookingDetails?.bookingDetails?.TAG !== 'INTER_CITY' &&
                            bookingDetails?.bookingDetails?.TAG !== 'RENTAL' &&
                            bookingDetails?.tripCategory?._0 !== 'OneWayRideOtp' && //this will disable edit destination for otp rides for all city
                            featureFlags.editDestination,
                    }))}
                originEditable={
                    (!rideDetails?.driverArrivalTime || rideDetails?.driverArrivalTime === null) &&
                    rideDetails?.status !== 'INPROGRESS' &&
                    editPickupAttempts > 0
                }
                estimatedFareBreakup={bookingDetails?.estimatedFareBreakup}
                originTitle={source?.area}
                originAddress={source?.address}
                isRideConfirmed={true}
                fare={`${currencySymbol}${bookingDetails?.estimatedFare?.toString() || ''}`}
                wrapperStyles={tailwind.style(`bg-[${themeColors.Fill_neutralUltraLow}]`)}
                onEditPickupClick={() => rcsDispatch(createAction('EDIT_PICKUP_CLICKED', undefined))}
                onEditDestinationClick={() =>
                    rcsDispatch(
                        createAction('EDIT_DESTINATION_CLICKED', {
                            driverLocation,
                        }),
                    )
                }
                footerContent={
                    <>
                        {!!bookingDetails?.hasDisability &&
                            bookingSpecialAssistance?.tag === 'BLIND_LOW_VISION' &&
                            (rideDetails?.status === 'NEW' ||
                                (rideDetails?.status === 'INPROGRESS' &&
                                    (bookingDetails?.bookingDetails.TAG === 'RENTAL' ||
                                        bookingDetails?.bookingDetails.TAG === 'INTER_CITY'))) && (
                                <Button
                                    testID="call-driver-button"
                                    accessible={true}
                                    accessibilityLabel="Call Driver"
                                    accessibilityHint="Click here to Call Driver"
                                    type={'secondary'}
                                    style={tailwind.style('mt-[26px] justify-center')}
                                    onPress={() => {
                                        if (callDriverBottomsheetModalRef?.current) {
                                            callDriverBottomsheetModalRef.current.present();
                                            if (setHideAccessibility) {
                                                setHideAccessibility(true);
                                            }
                                        }
                                    }}>
                                    <Typography
                                        type={'callout'}
                                        style={tailwind.style(
                                            `text-[${defaultColors?.gray500}] font-areaNormal-extrabold`,
                                        )}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.CallDriver}
                                    </Typography>
                                </Button>
                            )}
                        <CityAdImage
                            imageSource="rideConfirmed"
                            testID="ride-confirmed-offer-image"
                            viewUnitId={AD_VIEW_UNIT_IDS.RIDE_CONFIRMED_BANNER}
                            containerStyle={tailwind.style('mt-[10px] mx-0')}
                            useAnimatedView={false}
                        />

                        <Button
                            testID="ride_confirmed_trip_details"
                            accessible={true}
                            accessibilityLabel="click to see trip details"
                            type={'secondary'}
                            style={tailwind.style(
                                bookingSpecialAssistance?.tag === 'BLIND_LOW_VISION'
                                    ? 'mt-[10px] justify-center'
                                    : 'mt-[26px] justify-center',
                            )}
                            onPress={() => {
                                tripDetailsRef.current?.present();
                                setShowTripDetailsModal(true);
                            }}>
                            <Typography
                                type={'callout'}
                                style={tailwind.style(`text-[${defaultColors?.gray500}] font-areaNormal-extrabold`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityRole={undefined}
                                accessibilityLabel={undefined}>
                                {userLanguageStrings.EditTrip}
                            </Typography>
                        </Button>
                        {(fareProductType !== 'AMBULANCE' ||
                            !rideDetails?.driverArrivalTime ||
                            rideDetails?.driverArrivalTime === null) &&
                            rideDetails?.status !== 'INPROGRESS' && (
                                <Button
                                    testID="cancel-trip-button-main"
                                    accessible={true}
                                    accessibilityLabel="Cancel Trip"
                                    accessibilityHint="Click here to Cancel Trip"
                                    type={'secondary-danger'}
                                    style={tailwind.style('mt-[10px] justify-center')}
                                    onPress={() => {
                                        setShowTripDetailsModal(false);
                                        onCancelTripPress();
                                    }}
                                    text={userLanguageStrings.CancelTrip}
                                    textType="callout"></Button>
                            )}
                    </>
                }
                serviceTierName={bookingDetails?.serviceTierName}
                setHideAccessibility={setHideAccessibility}
                isRoundTrip={bookingDetails?.returnTime !== undefined}
                isIntercityOrRentals={
                    bookingDetails?.tripCategory?.TAG === 'InterCity' || bookingDetails?.tripCategory?.TAG === 'Rental'
                }
                onRateCardPress={undefined}
                showFareDetails={undefined}
                hideAccessibility={undefined}
                isRideWaitingScreen={true}
            />
        </Animated.View>
    );
};

export default RideDetailsSection;
