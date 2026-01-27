import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import token from '../../designSystem/tokens';
import Typography from '../../designSystem/components/primitives/Typography';
import { Icon } from '../../components/Icon';
import { BookingId, selectBookingId } from '../../state/client/user';
import { useAppSelector } from '../../state/hooks';
import Button from '@/src-v2/primitives/Button';
import { useRefsContext } from '../../context/RefsContext';
import CloseIcon from '../../components/svg/CloseIcon';
import { CardRideDetails } from '../../designSystem/components/CardRideDetails';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import {
    selectSelectedPricingItems,
    selectCustomerTip,
    selectIsPetRide,
    selectTripTypeSelection,
} from '../../state/client/search';
import { selectSearchedSource, selectSearchedStops } from '@/typescript/state/client/session';
import { getCurrency } from '@/typescript/utils/getCurrency';
import { selectBookingDetailsWithId } from '@/typescript/state/client/booking';
import { adjustPriceForPetRide } from '@/src-v2/utils/common';
import { FareTypes, getFareType } from '@/typescript/utils/fareEntityHelper';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export type TripDetailsBottomSheetModalProps = {
    bookingId: BookingId | null;
};

const TripDetailsBottomSheetModal: React.FC<TripDetailsBottomSheetModalProps> = props => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { tripDetailsBottomSheetModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();

    const searchedSource = useAppSelector(selectSearchedSource);
    const searchedStops = useAppSelector(selectSearchedStops);
    const bookingId = useAppSelector(selectBookingId) ?? props.bookingId; // TODO: Fix this properly
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const customerTip = useAppSelector(state => selectCustomerTip(state, null)) ?? 0;
    const isPetRide = useAppSelector(state => selectIsPetRide(state, null));
    const selectedTripType = useAppSelector(state => selectTripTypeSelection(state, null));

    const currency = getCurrency(
        selectedPricingItems?.[0]?.estimatedFareWithCurrency?.currency ??
            bookingDetails?.estimatedFareWithCurrency?.currency ??
            'INR',
    );

    const [minFare, maxFare] = (() => {
        if (selectedPricingItems.length > 0) {
            const petCharges = selectedPricingItems[0]?.fareBreakup?.find(
                val => getFareType(val.title).name === FareTypes.PET_CHARGES,
            )?.priceWithCurrency.amount;

            const businessDiscountInfo = selectedPricingItems[0]?.businessDiscountInfo;
            const businessDiscountAmount =
                selectedTripType === 'BUSINESS' && businessDiscountInfo
                    ? businessDiscountInfo.businessDiscount || 0
                    : 0;
            const hasBusinessDiscount = businessDiscountAmount > 0;

            const baseMinFare = Math.min(...(selectedPricingItems?.map(item => item.cost) ?? []));
            const adjustedMinFare = adjustPriceForPetRide(baseMinFare, isPetRide, petCharges);
            const discountedMinFare = hasBusinessDiscount
                ? Math.max(0, (adjustedMinFare ?? 0) - businessDiscountAmount)
                : adjustedMinFare;
            const minFare = (discountedMinFare ?? 0) + customerTip;

            const baseMaxFare = Math.max(...(selectedPricingItems?.map(item => item.toCost ?? 0) ?? []));
            const adjustedMaxFare = adjustPriceForPetRide(baseMaxFare, isPetRide, petCharges);
            const discountedMaxFare = hasBusinessDiscount
                ? Math.max(0, (adjustedMaxFare ?? 0) - businessDiscountAmount)
                : adjustedMaxFare;
            const maxFare = (discountedMaxFare ?? 0) + customerTip;

            return [minFare.toString(), maxFare.toString()];
        } else {
            const fare = bookingDetails?.estimatedFare ? bookingDetails?.estimatedFare.toString() : '--';
            return [fare, fare];
        }
    })();

    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.Fill_neutralUltraLow}] px-[${token?.spacing?.[16]}] pt-[${token?.spacing?.[16]}] pb-[${bottom}px] pt-6 rounded-[15px]`,
            )}>
            <Animated.View style={tailwind.style(`flex-row justify-between items-center`)}>
                <Typography
                    type="subhead-1"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.TripDetails}
                </Typography>
                <Button
                    testID="bc15d44c-102c-49d1-9a06-5412849491a8"
                    type="secondary-inverse"
                    size="md"
                    onPress={() => {
                        tripDetailsBottomSheetModalRef?.current?.close();
                    }}>
                    <Icon
                        icon={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                        style={tailwind.style(`p-2px`)}
                        size={20}
                        color={themeColors.Button_Primary_Disabled_Fill_Base}
                    />
                </Button>
            </Animated.View>
            <Animated.View style={tailwind.style(`py-[${token?.spacing?.[12]}]`)}>
                <CardRideDetails
                    userLanguageStrings={userLanguageStrings}
                    stops={searchedStops
                        .filter(stop => stop !== null && stop !== undefined)
                        .map(stop => ({
                            area: stop?.title,
                            address: stop?.subtitle,
                            editable: false,
                        }))}
                    originEditable={false}
                    originTitle={searchedSource?.title}
                    originAddress={searchedSource?.subtitle}
                    isRideConfirmed={false}
                    onRateCardPress={undefined}
                    estimatedFareBreakup={bookingDetails?.estimatedFareBreakup}
                    fare={
                        minFare === maxFare
                            ? `${currency}${minFare}`
                            : `${currency}${minFare}` + ' - ' + `${currency}${maxFare}`
                    }
                    wrapperStyles={tailwind.style(`bg-[${themeColors.Fill_neutralMin}]`)}
                    isRoundTrip={bookingDetails?.returnTime != undefined}
                    isIntercityOrRentals={
                        bookingDetails?.tripCategory?.TAG === 'InterCity' ||
                        bookingDetails?.tripCategory?.TAG === 'Rental'
                    }
                    footerContent={undefined}
                    onEditPickupClick={undefined}
                    onEditDestinationClick={undefined}
                    serviceTierName={undefined}
                    showFareDetails={undefined}
                    hideAccessibility={undefined}
                    setHideAccessibility={undefined}
                    isRideWaitingScreen={false}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default TripDetailsBottomSheetModal;
