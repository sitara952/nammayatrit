import blackAuto from '../../../../src/typescript/assets/black_Auto.webp';
import blackCab from '../../../../src/typescript/assets/black_Cab.webp';

import invoiceLogo from '../../../../src/resources/assets/png/invoice-logo.webp';
import shieldIcon from '@/typescript/assets/ny_ic_black_shield.webp';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Image, View } from 'react-native';

import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Animated from 'react-native-reanimated';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import ChevronRight from '@/typescript/assets/svg/symbols/ChevronRight';
import { Resolver } from '@/typescript/utils/common';
import { JourneyDetails, MyBookingDetailsScreenAction } from '../Types';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen.tsx';
import { BookingRideDetailsProps } from '../components/BookingRideDetails.tsx';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { selectNewFeatureFlags } from '@/typescript/state/client/session.ts';
import { isNull } from 'lodash';
import { isSingleTaxiJourney } from '@/src-v2/screens/MyRides/components/BookingDetailTopCard.tsx';
import { useCallback } from 'react';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity.tsx';
import { issueCategoryListRes } from '@/readOnly/api/types/IssueCategoryListRes.gen.tsx';
import { IssueCategoryList } from './IssueCategoryList';

export type BookingDetailNavigationCardProps = {
    mbdDispatch: Resolver<MyBookingDetailsScreenAction>;
    showHelpAndSupport: boolean;
    isCancelled: boolean;
    Pickup: locationAPIEntity;
    Destination: locationAPIEntity[];
    bookingDetailMiddle: BookingRideDetailsProps;
    isInsured: boolean;
    journeyDetails: JourneyDetails | null;
    autoClickAction: (bookingId: string | undefined, legOrder: number | undefined) => void;
    issueCategories: issueCategoryListRes | undefined;
};

const meetsAgeCriteria = (time: string | undefined, maxAgeInSeconds: number | undefined, isRecent: boolean = true) => {
    const thresholdSeconds = maxAgeInSeconds || 72 * 60 * 60; // 72 hours in seconds
    const threshHoldTime = new Date(Date.now() - thresholdSeconds * 1000);
    const bookingTime = new Date(time || Date.now());
    const timeCondition = isRecent ? bookingTime >= threshHoldTime : bookingTime < threshHoldTime;
    return timeCondition;
};

export const BookingDetailNavigationCard: React.FC<BookingDetailNavigationCardProps> = ({
    mbdDispatch,
    showHelpAndSupport,
    isCancelled,
    Pickup,
    Destination,
    bookingDetailMiddle,
    isInsured,
    journeyDetails,
    autoClickAction,
    issueCategories,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const filteredCategory = issueCategories?.categories.filter(v => {
        return (
            v.isRideRequired &&
            meetsAgeCriteria(bookingDetailMiddle.rideStartTime, v.maxAllowedRideAge) &&
            bookingDetailMiddle.status &&
            v.allowedRideStatuses?.includes(bookingDetailMiddle.status)
        );
    });

    const downloadInsurancePolicy = () => {
        mbdDispatch({ type: 'DOWNLOAD_INSURANCE_POLICY', payload: undefined });
    };
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);

    const handleDriverInvoicePress = () => {
        const cleverTapParams = {
            Pickup,
            Destination,
            Fare: bookingDetailMiddle.fare,
            Status: bookingDetailMiddle.status,
            'Ride completion timestamp': bookingDetailMiddle.rideEndTime,
            Rating: bookingDetailMiddle.rating,
        };
        logEvent(EventName.NY_USER_INVOICE_CLICKED, cleverTapParams);
        mbdDispatch({ type: 'GO_TO_DRIVER_INVOICE', payload: undefined });
    };

    // Helper function to filter multimodal taxi rides
    const getMultimodalTaxiRides = useCallback(() => {
        if (isNull(journeyDetails)) return [];

        return journeyDetails.journeyModes.filter(leg => {
            const isTaxiLeg = leg.travelMode === 'Taxi' && leg.legExtraInfo.TAG === 'Taxi';
            const hasBookingId = leg.legExtraInfo.TAG === 'Taxi' && leg.legExtraInfo._0.bookingId;
            const isNotSingleTaxiJourney = !(
                journeyDetails.journeyModes.length === 1 && leg.legExtraInfo.TAG === 'Taxi'
            );

            return isTaxiLeg && hasBookingId && isNotSingleTaxiJourney;
        });
    }, [journeyDetails]);

    // Content visibility checks
    const showDriverInvoice = !isCancelled && (isNull(journeyDetails) || isSingleTaxiJourney(journeyDetails));
    const multimodalTaxiRides = getMultimodalTaxiRides();

    return (
        <View style={tailwind.style(`flex-col`)}>
            {showDriverInvoice && (
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={handleDriverInvoicePress}
                    style={{ padding: 15 }}
                    testID="booking_details_driver_receipt">
                    <View style={tailwind.style('flex-row gap-2 items-center justify-between')}>
                        <Image
                            accessible={true}
                            accessibilityLabel="invoice logo image"
                            source={invoiceLogo}
                            style={tailwind.style('rounded-2xl h-20px w-20px')}
                        />
                        <Typography
                            type="body"
                            style={tailwind.style(`text-[${themeColors.Text_neutralMax}] mr-auto ml-2`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.ViewDriverReceipt}
                        </Typography>
                        <ChevronRight />
                    </View>
                </TouchableOpacity>
            )}

            {isInsured && newFeatureFlags.showInsurancePolicy && (
                <Animated.View style={tailwind.style('w-11/12 justify-center mx-auto')}>
                    <Divider
                        dividerColor={`${themeColors.Fill_neutralMidLow}`}
                        type={undefined}
                        direction={undefined}
                        style={undefined}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        strokeDashArray={undefined}
                    />
                </Animated.View>
            )}
            {isInsured && newFeatureFlags.showInsurancePolicy && (
                <TouchableOpacity
                    style={{ padding: 15 }}
                    accessibilityRole={undefined}
                    testID="download_insurance_policy"
                    onPress={downloadInsurancePolicy}>
                    <View style={tailwind.style('flex-row gap-2 items-center justify-between')}>
                        <Image source={shieldIcon} style={tailwind.style('rounded-2xl h-20px w-20px')} />
                        <Typography
                            type="body"
                            style={tailwind.style(`text-[${themeColors.Text_neutralMax}] mr-auto ml-2`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityRole={undefined}
                            accessibilityLabel={undefined}>
                            {userLanguageStrings.DownloadInsurancePolicy}
                        </Typography>
                        <ChevronRight />
                    </View>
                </TouchableOpacity>
            )}
            {multimodalTaxiRides.map((item, index) => {
                return (
                    <TouchableOpacity
                        testID={`booking-detail-navigation-${index}`}
                        accessibilityRole="button"
                        accessibilityLabel={'Booking Details button'}
                        key={index}
                        style={{ padding: 15 }}
                        onPress={() =>
                            autoClickAction(
                                item.legExtraInfo.TAG == 'Taxi' ? item.legExtraInfo._0.bookingId : undefined,
                                item.legExtraInfo.TAG == 'Taxi' ? item.order : undefined,
                            )
                        }>
                        <Animated.View>
                            {index != 0 && (
                                <Animated.View style={tailwind.style('w-11/12 justify-center mx-auto')}>
                                    <Divider
                                        dividerColor={`${themeColors.Fill_neutralLow}`}
                                        type="dashed"
                                        strokeDashArray="4 6"
                                        direction={undefined}
                                        style={undefined}
                                        labelPosition={undefined}
                                        offset={undefined}
                                        offsetBackground={undefined}
                                    />
                                </Animated.View>
                            )}
                            <View style={tailwind.style('flex-row gap-2 items-center justify-between')}>
                                <Image
                                    accessible={false}
                                    source={
                                        item.legExtraInfo.TAG == 'Taxi' &&
                                        item.legExtraInfo._0?.serviceTierName == 'Auto'
                                            ? blackAuto
                                            : blackCab
                                    }
                                    style={tailwind.style('rounded-2xl h-20px w-20px')}
                                />
                                <Typography
                                    type="body"
                                    style={{
                                        color: themeColors.Text_neutralMax,
                                        marginRight: 'auto',
                                        marginLeft: 8,
                                    }}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {`${
                                        (item.legExtraInfo.TAG == 'Taxi' && item.legExtraInfo._0?.serviceTierName) ||
                                        'Taxi'
                                    } Ride Details - ` +
                                        (index + 1)}
                                </Typography>
                                <ChevronRight />
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
            {showHelpAndSupport &&
                (isNull(journeyDetails) ||
                    journeyDetails.journeyModes.some(
                        leg =>
                            leg.travelMode == 'Taxi' && leg.legExtraInfo.TAG == 'Taxi' && leg.legExtraInfo._0.bookingId,
                    )) && (
                    <Animated.View style={tailwind.style('w-11/12 justify-center mx-auto')}>
                        <Divider
                            dividerColor={`${themeColors.Fill_neutralMidLow}`}
                            type={undefined}
                            direction={undefined}
                            style={undefined}
                            labelPosition={undefined}
                            offset={undefined}
                            offsetBackground={undefined}
                            strokeDashArray={undefined}
                        />
                    </Animated.View>
                )}
            {showHelpAndSupport && filteredCategory && filteredCategory.length !== 0 && (
                <IssueCategoryList
                    issueCategoryList={filteredCategory}
                    onCategoryClick={category => {
                        mbdDispatch({
                            type: 'GO_TO_HELP_AND_SUPPORT',
                            payload: { issueCategory: category },
                        });
                    }}
                />
            )}
        </View>
    );
};
