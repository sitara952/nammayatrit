import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { ActivityIndicator, ImageSourcePropType, View, Dimensions, NativeModules, Platform } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { selectUserProfile, selectUserName } from '@/typescript/state/client/user';
import { selectAppName, setToastVisible, selectAppConfig } from '@/typescript/state/client/session';
import { selectFeatureFlags } from '@/typescript/state/client/session';
import { RidePath } from '@/typescript/components/svg/RidePath';
import { FlatList } from 'react-native-gesture-handler';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCurrency } from '@/typescript/utils/getCurrency';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import {
    BookingStatus_bookingStatus,
    JourneyStatus_journeyStatus,
    RideStatus_rideStatus,
} from '@/readOnly/api/types/Enums.gen';
import { getPlaceArea } from '@/typescript/utils/placeUtils';
import { BookingDetailTopCard } from './components/BookingDetailTopCard';
import { Header } from '@/src-v2/primitives/Header';
import { isUpcomingBooking } from '@/src-v2/utils/Booking';
import { getVehicleFromVehicleType } from '../../../src/typescript/utils/bookingUtils';
import { ThemeTokens } from 'config-types';
import Svg, { Ellipse } from 'react-native-svg';
import { FeatureFlags } from '@/src-v2/systems/configs/types';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import Button from '@/src-v2/primitives/Button';
import { NoRidesMessageProps, MyRidesAction, MyRideScreenProps } from './Types.ts';
import { noRidesContainerStyles, rideContainterStyles } from './Styles.ts';
import icMyRideNotFound from '@/typescript/assets/ny-service/ic_my_ride_not_found.webp';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';
import { JourneyDetails, RideDetailCardProps } from '../MyBookingDetails/Types';
import { getDateRangeFromFilter } from '@/src-v2/utils/DateRange';
import {
    rideBookingListV2GetWithParams,
    useLazyRideBookingListV2GetQuery,
} from '@/api/integrations/rtk/RideBookingListV2Get';
import { createBookingId, createJourneyId } from '@/typescript/state/client/user';
import { createAction, Resolver } from '@/typescript/utils/common';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { getTransitLocation, isRideOlderThan72Hours } from '@/src-v2/utils/common';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import colorsPalette from '@/typescript/designSystem/colorPalette';
import { hapticEffect } from '@/typescript/utils/useHaptic.ts';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { bookingListResV2 } from '@/readOnly/api/types/BookingListResV2.gen.tsx';
import { bookingAPIEntityV2 } from '@/readOnly/api/types/BookingAPIEntityV2.gen.tsx';
import { SHOW_RIDE_ASSIGNED_TIME_IN_MIN } from '@/typescript/constants/common.ts';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback.tsx';
import { isActiveRide } from './Flow.tsx';
import { useLazyGetAllActiveTicketsGetQuery } from '@/api/integrations/rtk/GetAllActiveTicketsGet.ts';
import { Icon } from '@/typescript/components/Icon.tsx';
import ExportIcon from '@/typescript/assets/svg/symbols/ExportIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import ExportInvoiceModal, { ExportInvoiceOption } from './components/ExportInvoiceModal';
import FilterRidesModal, { FilterState, DateFilterOption } from './components/FilterRidesModal';
import MyRidesFilter from '@/typescript/assets/svg/symbols/MyRidesFilter';
import { rideReceiptPdf } from '../Invoice/components/rideReceiptPdf';
import { getInvoiceFare } from '@/typescript/utils/fareEntityHelper';
import { getCurrency as getAppCurrency } from '@/typescript/utils/getCurrency';
import { formatLocation, getStopsWithDestination } from '../MyBookingDetails/utils';
import { getISTWithFormat } from '../Invoice/utils';
import { useRideBookingInvoiceGeneratePostMutation } from '@/api/integrations/rtk/RideBookingInvoiceGeneratePost';
import { setToastProps } from '@/typescript/state/client/session';
import { issueCategoryListRes } from '@/readOnly/api/types/IssueCategoryListRes.gen.tsx';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen.tsx';

export const getRideStatus = (bookingDetail: bookingAPIEntity) => {
    if (bookingDetail?.status === 'COMPLETED') {
        return RideStatus.Completed;
    } else if (bookingDetail?.status === 'CANCELLED' || bookingDetail.status === 'REALLOCATED') {
        return RideStatus.Cancelled;
    } else {
        const isUpcoming = isUpcomingBooking(bookingDetail, SHOW_RIDE_ASSIGNED_TIME_IN_MIN);
        if (isUpcoming) {
            return RideStatus.Upcoming;
        } else {
            return RideStatus.Active;
        }
    }
};

export const meetsAgeAndStatusCriteria = (
    bookingDetail: bookingAPIEntityV2,
    maxAgeInSeconds: number | undefined,
    allowedRideStatuses: undefined | RideStatus_rideStatus[],
    isRecent: boolean = true,
) => {
    const thresholdSeconds = maxAgeInSeconds || 72 * 60 * 60; // 72 hours in seconds
    const threshHoldTime = new Date(Date.now() - thresholdSeconds * 1000);
    if (bookingDetail.TAG === 'Ride') {
        const rideStatus = bookingDetail._0.rideList.at(0)?.status;
        if (rideStatus && allowedRideStatuses && !allowedRideStatuses.includes(rideStatus)) return false;
        const bookingTime = new Date(bookingDetail._0.createdAt || '');
        const hasRideId = bookingDetail._0.rideList.at(0)?.id;
        const timeCondition = isRecent ? bookingTime >= threshHoldTime : bookingTime < threshHoldTime;
        return timeCondition && hasRideId;
    } else if (bookingDetail.TAG === 'MultiModalRide') {
        // Check if any leg has Taxi travel mode
        const hasTaxiLeg = bookingDetail._0.legs[0]?.travelMode === 'Taxi';
        if (!hasTaxiLeg) return false;

        const bookingTime = new Date(bookingDetail._0.startTime || '');
        if (bookingDetail._0.legs[0]?.legExtraInfo.TAG === 'Taxi') {
            const hasRideId = bookingDetail._0.legs[0]?.legExtraInfo._0.rideId;
            const timeCondition = isRecent ? bookingTime >= threshHoldTime : bookingTime < threshHoldTime;
            return timeCondition && hasRideId;
        }
    }
    return false;
};

export const hasValidTicketBookings = (journeyInfoResp: journeyInfoResp): boolean => {
    return journeyInfoResp.legs.some(leg => {
        if (leg.bookingStatus.TAG === 'FRFSBooking') {
            return leg.bookingStatus._0 === 'FAILED';
        } else {
            return false;
        }
    });
};

export const getRideStatusFromJourney = (journeyInfoResp: journeyInfoResp) => {
    const journeyDetail = journeyInfoResp.journeyStatus;
    if (journeyDetail === 'COMPLETED' || journeyDetail === 'EXPIRED') {
        return RideStatus.Completed;
    } else if (journeyDetail === 'CANCELLED') {
        return RideStatus.Cancelled;
    } else if (journeyDetail === 'FAILED') {
        return RideStatus.Failed;
    } else if (hasValidTicketBookings(journeyInfoResp)) return RideStatus.Failed;
    else return isActiveRide(true, false, journeyInfoResp) ? RideStatus.Active : RideStatus.Completed;
};

export const getPropsFromBookingDetails = (bookingDetail: bookingAPIEntity, featureFlags: FeatureFlags): RideType => {
    const bookingDetails = bookingDetail.bookingDetails;
    const { date, time } = convertTimestamp(bookingDetail.rideScheduledTime);

    const toLocation =
        bookingDetails?.TAG === 'ONE_WAY' ||
        bookingDetails?.TAG === 'DRIVER_OFFER' ||
        bookingDetails?.TAG === 'OneWaySpecialZoneAPIDetails' ||
        bookingDetails?.TAG === 'INTER_CITY' ||
        bookingDetails?.TAG === 'AMBULANCE' ||
        bookingDetails?.TAG === 'DELIVERY'
            ? bookingDetails._0.toLocation
            : null;

    const isAcRide = bookingDetail?.isAirConditioned ?? false;

    return {
        vehicleServiceTier: bookingDetail?.serviceTierName ?? (bookingDetail?.vehicleServiceTierType?.toString() || ''),
        price:
            bookingDetail.rideList.at(0)?.computedPrice?.toString() || bookingDetail.estimatedFare?.toString() || '0',
        from: getPlaceArea(bookingDetail.fromLocation),
        to: toLocation ? getPlaceArea(toLocation) : undefined,
        type: bookingDetail.tripCategory?.TAG?.toString() || '',
        date,
        time,
        vehicleIconUrl:
            bookingDetail?.vehicleIconUrl || getVehicleFromVehicleType(bookingDetail?.vehicleServiceTierType, isAcRide),
        status: bookingDetail.status,
        rideStatus: getRideStatus(bookingDetail),
        bookingDetail,
        isCancelled: getRideStatus(bookingDetail) === RideStatus.Cancelled,
        currency: getCurrency(bookingDetail.estimatedFareWithCurrency?.currency) || '$',
        showEstimate: featureFlags.myRidesDetails.showEstimate,
        journeyId: null,
        journeyInfoResp: null,
        rideId: bookingDetail.rideList.at(0)?.id,
        driverNumber: bookingDetail.rideList.at(0)?.driverNumber,
    };
};

export const getPropsFromJourneyDetails = (journeyDetail: journeyInfoResp): RideType => {
    const { date, time } = convertTimestamp(journeyDetail?.createdAt);

    const firstLeg = journeyDetail.legs[0];
    const lastLeg = journeyDetail.legs[journeyDetail.legs.length - 1];

    const fromLocation = getTransitLocation(firstLeg, true);
    const toLocation = getTransitLocation(lastLeg, false);

    const price = journeyDetail.estimatedMinFare?.amount?.toString() || '0';

    return {
        vehicleServiceTier: '',
        price,
        from: fromLocation,
        to: toLocation,
        type: '',
        date,
        time,
        vehicleIconUrl: '',
        status: journeyDetail.journeyStatus,
        rideStatus: getRideStatusFromJourney(journeyDetail),
        bookingDetail: null,
        isCancelled: getRideStatusFromJourney(journeyDetail) === RideStatus.Cancelled,
        showEstimate: false,
        currency: getCurrency(journeyDetail.estimatedMinFare?.currency) || '$',
        journeyId: journeyDetail.journeyId,
        journeyInfoResp: journeyDetail,
        rideId:
            journeyDetail.legs[0]?.legExtraInfo.TAG === 'Taxi'
                ? journeyDetail.legs[0]?.legExtraInfo._0.rideId
                : undefined,
        driverNumber:
            journeyDetail.legs[0]?.legExtraInfo.TAG === 'Taxi'
                ? journeyDetail.legs[0]?.legExtraInfo._0.driverMobileNumber
                : undefined,
    };
};

export enum RideStatus {
    Active,
    Upcoming,
    Cancelled,
    Completed,
    Failed,
}

export interface BookingDetailCardProps {
    date: string | undefined;
    time: string | undefined;
    price: string;
    vehicleServiceTier: string;
    type: string;
    from: string;
    to: string | undefined;
    status: BookingStatus_bookingStatus | JourneyStatus_journeyStatus;
    vehicleIconUrl: string | ImageSourcePropType;
    rideStatus: RideStatus;
    currency: string;
    bookingDetail: bookingAPIEntity | null;
    refreshData?: () => void;
    setBookingData?: React.Dispatch<React.SetStateAction<RideType[] | null>>;
    showHelpAndSupport?: boolean;
    journeyId: string | null;
    isExpired: boolean | undefined;
    isHelpAndSupportScreen?: boolean;
    rideId: string | undefined;
}

const StartDot = ({ themeColors }: { themeColors: ThemeTokens }) => {
    return (
        <Svg width={5} height={5} viewBox="0 0 10 10" fill="none">
            <Ellipse
                cx={5}
                cy={5}
                rx={5}
                ry={5}
                transform="matrix(0 1 1 0 0 0)"
                fill={themeColors.Icon_neutralUltraHigh}
            />
        </Svg>
    );
};

export const convertTimestamp = (timestamp: string | undefined) => {
    if (timestamp === undefined) {
        return { date: undefined, time: undefined };
    }
    const dateObj = new Date(timestamp);

    // Get the day of the week, month, and day
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    };
    const date = dateObj.toLocaleDateString('en-US', options);

    // Format the time
    const time = dateObj
        .toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
        .toLowerCase()
        .replace(/\s+/g, '');

    return { date, time };
};

const RideActive = ({ rideStatus = RideStatus.Completed }: { rideStatus: RideStatus | undefined }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const getHeader = useMemo(() => {
        switch (rideStatus) {
            case RideStatus.Active:
                return userLanguageStrings.ActiveRide;
            case RideStatus.Upcoming:
                return userLanguageStrings.upcomingRentalRide('');
            case RideStatus.Completed:
                return 'Past Ride';
            case RideStatus.Cancelled:
                return userLanguageStrings.Cancelled;
            case RideStatus.Failed:
                return 'Failed';
        }
    }, [rideStatus]);
    return (
        <View style={tailwind.style(`rounded-t-2xl h-6 flex items-center justify-center pt-1`)}>
            <Typography
                type="body-subtext"
                style={tailwind.style(`text-white mx-auto`)}
                numberOfLines={1}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {getHeader}
            </Typography>
        </View>
    );
};

export const BookingDetailCard: React.FC<
    BookingDetailCardProps & { showEstimate: boolean } & { mpDispatch: Resolver<MyRidesAction> } & {
        journeyInfoResp: journeyInfoResp | null;
    } & {
        isActiveRide: (
            isActive: boolean,
            isExpired: boolean | undefined,
            journeyInfoResp: journeyInfoResp | null,
        ) => boolean;
    } & {
        issueCategory: issueCategoryRes | undefined;
        fetchedIssueCategory: issueCategoryListRes | undefined;
        driverNumber: string | undefined;
    }
> = ({
    date,
    time,
    price,
    vehicleServiceTier,
    type,
    from,
    to,
    status,
    vehicleIconUrl,
    rideStatus,
    currency,
    bookingDetail,
    showEstimate,
    setBookingData,
    journeyId,
    journeyInfoResp,
    mpDispatch,
    isExpired,
    isActiveRide,
    isHelpAndSupportScreen = false,
    issueCategory,
    fetchedIssueCategory,
    rideId,
    driverNumber,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const bookingDetailProps = {
        date,
        time,
        price,
        vehicleServiceTier,
        type,
        from,
        to,
        status,
        vehicleIconUrl,
        rideStatus,
        currency,
        bookingDetail,
        showEstimate,
        isCancelled: rideStatus === RideStatus.Cancelled,
        setBookingData,
        journeyId: null,
        journeyInfoResp: null,
        isExpired,
        rideId,
    };
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const isOlderThan72Hours = bookingDetail?.rideStartTime
        ? isRideOlderThan72Hours(bookingDetail.rideStartTime)
        : isRideOlderThan72Hours(bookingDetail?.createdAt);
    const shouldShowHelpAndSupport = !isOlderThan72Hours;

    const rideDetailCard: RideDetailCardProps = {
        bookingDetailCard: bookingDetailProps,
        journeyDetailCard: null,
        showEstimate,
        isCancelled: rideStatus === RideStatus.Cancelled,
        subAutoDetails: null,
        showHelpAndSupport: shouldShowHelpAndSupport,
        issueCategory: fetchedIssueCategory,
    };

    const unifiedQR = journeyInfoResp?.unifiedQRV2;

    const onPress = useCallback(() => {
        if (journeyId != null) {
            if (rideStatus === RideStatus.Active) {
                mpDispatch(
                    createAction('TRACK_ACTIVE_JOURNEY', {
                        journeyId: createJourneyId(journeyId),
                        unifiedQR: unifiedQR || undefined,
                    }),
                );
            } else {
                mpDispatch(
                    createAction('GET_FULL_JOURNEY_SUMMARY', {
                        journeyId: createJourneyId(journeyId),
                        journeyInfoResp: journeyInfoResp ? journeyInfoResp : undefined,
                    }),
                );
            }
        } else {
            switch (rideStatus) {
                case RideStatus.Active:
                    navigation.popTo('LiveTab', {
                        screen: 'taxiRideTracking',
                        params: {
                            bookingId: bookingDetail?.id ? createBookingId(bookingDetail?.id) : null,
                            multimodalProps: undefined,
                        },
                    });
                    break;
                case RideStatus.Completed:
                case RideStatus.Cancelled:
                case RideStatus.Failed:
                    navigation.navigate('ProfileTab', {
                        screen: 'myRidesNavigator',
                        params: { screen: 'myRideDetails', params: rideDetailCard },
                    });
                    break;
                case RideStatus.Upcoming:
                    navigation.navigate('ServicesTab', {
                        screen: 'extendedBookingNavigator',
                        params: {
                            screen: 'scheduleRideSummary',
                            params: {
                                bookingId: bookingDetail?.id || '',
                                fareBreakups: undefined,
                            },
                        },
                    });

                    break;
            }
        }
    }, [isActiveRide, isExpired, journeyId, journeyInfoResp, mpDispatch, navigation, rideStatus]);

    const journeyDetails: JourneyDetails = {
        isJourney: true,
        journeyModes: journeyInfoResp?.legs || [],
        journeyId: createJourneyId(journeyId || ''),
        journeyFeedBack: null,
    };

    const [getAllActiveTickets, { data: activeTickets }] = useLazyGetAllActiveTicketsGetQuery({});

    useFocusEffect(
        useCallback(() => {
            if (isHelpAndSupportScreen) {
                getAllActiveTickets({});
            }
        }, []),
    );

    const currentActiveTicket = activeTickets?.activeTickets.find(
        ticket => ticket.rideId === bookingDetail?.rideList.at(0)?.shortRideId,
    )?.ticketId;

    const onpress = useCallback(() => {
        if (issueCategory) {
            // Navigate to ReportIssueChat screen for issue reporting
            mpDispatch(
                createAction('NAVIGATE_TO_HELP_AND_SUPPORT', {
                    rideId: rideId,
                    driverNumber: driverNumber,
                    currentActiveTicket,
                }),
            );
        } else {
            // Normal ride press behavior
            onPress();
        }
    }, [issueCategory, isHelpAndSupportScreen, navigation, rideId, currentActiveTicket, onPress]);
    const getHeaderColor = useMemo(() => {
        switch (rideStatus) {
            case RideStatus.Active:
                return { backgroundColor: themeColors.Icon_positive };
            case RideStatus.Completed:
                return { backgroundColor: '#3c403c' };
            case RideStatus.Failed:
            case RideStatus.Cancelled:
                return { backgroundColor: '#DC3E42' };
            default:
                return;
        }
    }, [rideStatus]);
    return (
        <TouchableWithoutFeedback
            accessibilityRole="button"
            testID="my_rides_booking_card"
            onPress={isExpired ? () => {} : onpress}>
            <Animated.View style={[tailwind.style(`rounded-2xl flex-col mt-1 mb-4 `), getHeaderColor]}>
                <RideActive rideStatus={rideStatus} />

                <Animated.View
                    style={[
                        tailwind.style(`rounded-b-2xl shadow-md py-3 px-2 `),

                        isExpired ? { backgroundColor: '#F5F5F5', opacity: 0.6 } : { backgroundColor: '#FCFCFD' },
                    ]}>
                    <BookingDetailTopCard
                        {...bookingDetailProps}
                        journeyDetails={journeyId != null ? journeyDetails : null}
                        showFareDescription={false}
                        showRideStatus={false}
                    />
                    <Animated.View
                        style={[
                            tailwind.style('w-full justify-center py-3 pl-1 mx-auto '),
                            isExpired ? { backgroundColor: '#F5F5F5' } : { backgroundColor: '#FCFCFD' },
                        ]}>
                        <Divider
                            dividerColor={`${themeColors.Fill_neutralMid}`}
                            type={undefined}
                            direction={undefined}
                            style={undefined}
                            labelPosition={undefined}
                            offset={undefined}
                            offsetBackground={undefined}
                            strokeDashArray={undefined}
                        />
                    </Animated.View>

                    <View
                        style={tailwind.style('flex flex-row gap-4 ml-4')}
                        accessibilityLabel={`From ${from?.toLowerCase()} to ${to?.toLowerCase()}`}>
                        <Animated.View style={tailwind.style('justify-center item-center')}>
                            {to ? <RidePath /> : <StartDot themeColors={themeColors} />}
                        </Animated.View>
                        <Animated.View style={tailwind.style('flex flex-col gap-1 items-start w-7/8')}>
                            <View style={tailwind.style('items-center')}>
                                <Typography
                                    type="body-7"
                                    style={[
                                        { color: themeColors.Text_neutralHigh, fontSize: 12, lineHeight: 16 },
                                        isExpired && { color: '#999999' },
                                    ]}
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {from}
                                </Typography>
                            </View>
                            {to ? (
                                <View style={tailwind.style('items-center mt-2')}>
                                    <Typography
                                        type="body-7"
                                        style={[
                                            { color: themeColors.Text_neutralHigh, fontSize: 12, lineHeight: 16 },
                                            isExpired && { color: '#999999' },
                                        ]}
                                        numberOfLines={1}
                                        isAnimate={false}
                                        accessible={undefined}
                                        accessibilityRole={undefined}
                                        accessibilityLabel={undefined}>
                                        {to}
                                    </Typography>
                                </View>
                            ) : null}
                        </Animated.View>
                    </View>
                    {rideStatus === RideStatus.Failed && (
                        <>
                            <Divider
                                dividerColor={`${themeColors.Fill_neutralMid}`}
                                type={undefined}
                                direction={undefined}
                                style={tailwind.style('mt-2')}
                                labelPosition={undefined}
                                offset={undefined}
                                offsetBackground={undefined}
                                strokeDashArray={undefined}
                            />
                            <View style={tailwind.style('ml-2 mt-2')}>
                                <Typography
                                    type="body-7"
                                    style={undefined}
                                    numberOfLines={10}
                                    isAnimate={false}
                                    accessible={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    Your booking failed due to temporary technical issue. If money has left your bank
                                    account it will be refunded within 7-14 days.
                                </Typography>
                            </View>
                        </>
                    )}
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

export type RideType = {
    vehicleServiceTier: string;
    price: string;
    from: string;
    to: string | undefined;
    type: string;
    date: string | undefined;
    time: string | undefined;
    status: BookingStatus_bookingStatus | JourneyStatus_journeyStatus;
    vehicleIconUrl: string | ImageSourcePropType;
    rideStatus: RideStatus;
    currency: string;
    bookingDetail: bookingAPIEntity | null;
    showEstimate: boolean;
    isCancelled: boolean;
    journeyId: string | null;
    journeyInfoResp: journeyInfoResp | null;
    rideId: string | undefined;
    driverNumber: string | undefined;
};

export const getUniqueId = (ride: RideType) => {
    if (ride.journeyId) return ride.journeyId;
    if (ride.bookingDetail?.id) return ride.bookingDetail.id;
    return `${ride.date}-${ride.time}-${ride.from}-${ride.to}`;
};

const calculateExportDateRange = (
    dateFilter: DateFilterOption,
    customStartDate: Date | undefined,
    customEndDate: Date | undefined,
): { startDate: string; endDate: string } => {
    const dateRange = getDateRangeFromFilter(dateFilter, customStartDate, customEndDate);
    const now = new Date();

    const finalFromDate =
        dateRange.fromDate ??
        new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0)).getTime();
    const finalToDate = dateRange.toDate ?? now.getTime();

    const startDateObj = new Date(finalFromDate);
    const startDate = new Date(
        Date.UTC(startDateObj.getUTCFullYear(), startDateObj.getUTCMonth(), startDateObj.getUTCDate(), 0, 0, 0, 0),
    ).toISOString();

    const endDateObj = new Date(finalToDate);
    const endOfDayUTC = new Date(
        Date.UTC(endDateObj.getUTCFullYear(), endDateObj.getUTCMonth(), endDateObj.getUTCDate(), 23, 59, 59, 999),
    );

    const endDate = endOfDayUTC > now ? now.toISOString() : endOfDayUTC.toISOString();

    return { startDate, endDate };
};

const useRideBookingData = (
    isHelpAndSupportScreen: boolean,
    issueCategory: issueCategoryRes | undefined,
    filters: FilterState | undefined,
) => {
    const [bookingData, setBookingData] = React.useState<RideType[] | null>(null);
    const hasMoreRef = React.useRef(true);
    const [isLoadingMore, setIsLoadingMore] = React.useState(true);
    const [hasMore, setHasMore] = React.useState(true);
    const [hasReached72HourLimit, setHasReached72HourLimit] = React.useState(false);
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const limit = 5;
    const isLoadingRef = React.useRef(false);
    const seenIds = React.useRef<Set<string>>(new Set());

    const [triggerRideBookingList, { data, isSuccess, isFetching }] = useLazyRideBookingListV2GetQuery();

    const { fromDate, toDate } = React.useMemo(() => {
        if (filters) {
            const { fromDate, toDate } = getDateRangeFromFilter(
                filters.dateFilter,
                filters.customStartDate,
                filters.customEndDate,
            );
            return { fromDate: fromDate, toDate: toDate };
        }
        return { fromDate: undefined, toDate: undefined };
    }, [filters?.dateFilter, filters?.customStartDate, filters?.customEndDate]);

    const queryParams: rideBookingListV2GetWithParams = React.useMemo(
        () => ({
            limit,
            offset: undefined,
            bookingOffset: 0,
            journeyOffset: 0,
            rideStatus: undefined,
            journeyStatus: undefined,
            isPaymentSuccess: true,
            bookingRequestType: undefined,
            billingCategory: filters?.category,
            rideType: filters?.rideType ? [filters.rideType] : undefined,
            fromDate: fromDate,
            toDate: toDate,
        }),
        [fromDate, toDate, filters?.category, filters?.rideType],
    );
    const featureFlags = useAppSelector(selectFeatureFlags);
    const hasInitialFetchRef = React.useRef(false);

    const processBookingData = React.useCallback(
        (data: bookingListResV2) => {
            // Filter rides based on age criteria when isHelpAndSupportScreen is true
            const filteredList = isHelpAndSupportScreen
                ? data.list.filter(bookingDetail =>
                      meetsAgeAndStatusCriteria(
                          bookingDetail,
                          issueCategory?.maxAllowedRideAge,
                          issueCategory?.allowedRideStatuses,
                          true,
                      ),
                  )
                : data.list;

            // Check if we've reached rides older than the threshold for help and support screen
            if (isHelpAndSupportScreen && data.list.length > 0) {
                const hasOlderRides = data.list.some(bookingDetail =>
                    meetsAgeAndStatusCriteria(
                        bookingDetail,
                        issueCategory?.maxAllowedRideAge,
                        issueCategory?.allowedRideStatuses,
                        false,
                    ),
                );
                if (hasOlderRides) {
                    setHasReached72HourLimit(true);
                }
            }

            const mappedData: RideType[] = filteredList.map((bookingDetail: bookingAPIEntityV2) => {
                return bookingDetail.TAG === 'Ride'
                    ? getPropsFromBookingDetails(bookingDetail._0, featureFlags)
                    : getPropsFromJourneyDetails(bookingDetail._0);
            });

            const newRides = mappedData.filter(
                (ride: RideType) => ride.from && !seenIds.current.has(getUniqueId(ride)),
            );
            newRides.forEach(ride => seenIds.current.add(getUniqueId(ride)));

            setBookingData(prev => {
                return [...(prev || []), ...newRides];
            });

            // For help and support screen, stop loading more if we've reached 72-hour limit
            hasMoreRef.current = isHelpAndSupportScreen
                ? mappedData.length > 0 && !hasReached72HourLimit
                : mappedData.length > 0;
            setHasMore(hasMoreRef.current);

            if (!hasInitialFetchRef.current) {
                hasInitialFetchRef.current = true;
            }
            setIsLoadingMore(false);
            isLoadingRef.current = false;
        },
        [featureFlags, isHelpAndSupportScreen, hasReached72HourLimit, issueCategory],
    );

    const loadMore = React.useCallback(() => {
        // Don't load more if we've reached the 72-hour limit for help and support screen
        if (isHelpAndSupportScreen && hasReached72HourLimit) {
            return;
        }

        if (
            !isFetching &&
            hasMoreRef.current &&
            !isLoadingRef.current &&
            !isLoadingMore &&
            hasInitialFetchRef.current
        ) {
            isLoadingRef.current = true;
            setIsLoadingMore(true);
            const newBookingOffset = data?.bookingOffset ?? 0;
            const newJourneyOffset = data?.journeyOffset ?? 0;

            triggerRideBookingList({
                ...queryParams,
                bookingOffset: newBookingOffset,
                journeyOffset: newJourneyOffset,
            });
        }
    }, [isFetching, triggerRideBookingList, isLoadingMore, queryParams, isHelpAndSupportScreen, hasReached72HourLimit]);

    React.useEffect(() => {
        if (isSuccess && data) {
            processBookingData(data);
        }
    }, [data, isSuccess]);

    React.useEffect(() => {
        if (!hasInitialFetchRef.current) {
            isLoadingRef.current = true;
            triggerRideBookingList({ ...queryParams, bookingOffset: 0, journeyOffset: 0 });
        }
    }, [triggerRideBookingList]);

    const refetchWithFilters = React.useCallback(() => {
        // Reset state for new filter query
        setBookingData(null);
        seenIds.current.clear();
        hasMoreRef.current = true;
        setHasMore(true);
        setHasReached72HourLimit(false);
        hasInitialFetchRef.current = false;
        isLoadingRef.current = true;
        setIsLoadingMore(true);
        triggerRideBookingList({
            ...queryParams,
            bookingOffset: 0,
            journeyOffset: 0,
            fromDate: fromDate,
            toDate: toDate,
        }).then(data => {
            if (data.data && data.data.list && data.data.list.length > 0) {
                processBookingData(data.data);
            } else {
                dispatch(
                    setToastProps({
                        visible: true,
                        message: userLanguageStrings.NoDataFoundForSelectedCategory,
                        backgroundColor: '#14171F',
                        autoDismissAfter: 3000,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        logo: undefined,
                        dismissButton: () => {
                            dispatch(setToastVisible(false));
                        },
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
            }
        });
    }, [queryParams, triggerRideBookingList, processBookingData]);

    return {
        bookingData,
        setBookingData,
        hasMore,
        isLoadingMore,
        isFetching,
        loadMore,
        limit,
        refetchWithFilters,
    };
};

const MyRides: React.FC<MyRideScreenProps> = props => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const featureFlags = useAppSelector(selectFeatureFlags);
    const dispatch = useAppDispatch();
    const userProfile = useAppSelector(selectUserProfile);
    const userName = useAppSelector(selectUserName);
    const appName = useAppSelector(selectAppName);
    const appConfig = useAppSelector(selectAppConfig);
    const appLogoImage = appConfig.assets.appLogoB64;
    const [rideBookingInvoiceGeneratePost] = useRideBookingInvoiceGeneratePostMutation();

    const [isExportInvoicePopupVisible, setIsExportInvoicePopupVisible] = React.useState(false);
    const [selectedExportOption, setSelectedExportOption] = React.useState<ExportInvoiceOption>('EMAIL');
    const [isFilterModalVisible, setIsFilterModalVisible] = React.useState(false);
    const [isDownloadLoading, setIsDownloadLoading] = React.useState(false);
    const [filterState, setFilterState] = React.useState<FilterState>({
        dateFilter: 'default',
        customStartDate: undefined,
        customEndDate: undefined,
        category: undefined,
        rideType: undefined,
    });

    // Ref to track pending PDF share for iOS
    const pendingPdfShareRef = useRef<{ filePath: string; timestamp: string } | null>(null);
    const exportInvoiceModalRef = useRef<BottomSheetModal | null>(null);
    const filterModalRef = useRef<BottomSheetModal | null>(null);

    const { bookingData, setBookingData, isLoadingMore, isFetching, loadMore, hasMore, limit, refetchWithFilters } =
        useRideBookingData(props.isHelpAndSupportScreen ?? false, props.issueCategory, filterState);

    const onBackPress = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
        navigation.goBack();
        return true;
    }, [navigation]);

    const handleExportInvoiceAction = useCallback(() => {
        exportInvoiceModalRef.current?.dismiss();
        setIsExportInvoicePopupVisible(false);
        setIsDownloadLoading(false);
    }, []);

    useEffect(() => {
        if (Platform.OS === 'ios' && !isExportInvoicePopupVisible && pendingPdfShareRef.current) {
            const { filePath, timestamp } = pendingPdfShareRef.current;
            pendingPdfShareRef.current = null;

            setTimeout(async () => {
                try {
                    await NativeModules['RNHTMLtoPDF'].convert({
                        html: filePath,
                        fileName: `MyRides_Invoice_${timestamp}`,
                        base64: false,
                        height: 1050,
                        width: 750,
                    });
                } catch (error) {
                    console.error('Error opening share sheet:', error);
                }
            }, 500);
        }
    }, [isExportInvoicePopupVisible]);

    const handleExportAction = useCallback(
        async (email: string) => {
            if (selectedExportOption === 'EMAIL') {
                try {
                    const { startDate, endDate } = calculateExportDateRange(
                        filterState.dateFilter,
                        filterState.customStartDate,
                        filterState.customEndDate,
                    );

                    // Call the API
                    await rideBookingInvoiceGeneratePost({
                        body: {
                            email,
                            startDate,
                            endDate,
                            billingCategories: filterState.category ? [filterState.category] : undefined,
                            rideTypes: filterState.rideType ? [filterState.rideType] : undefined,
                            bookingId: undefined,
                        },
                    }).unwrap();
                } catch (error) {
                    console.error('Error generating invoice:', error);

                    // Extract error message from RTK Query error response
                    const getErrorMessage = (): string => {
                        if (error && typeof error === 'object' && 'data' in error) {
                            const errorData = error.data;
                            if (errorData && typeof errorData === 'object' && 'errorMessage' in errorData) {
                                const message = errorData.errorMessage;
                                if (typeof message === 'string') {
                                    return message;
                                }
                            }
                        }
                        return userLanguageStrings.Somethingwentwrong || 'Error generating invoice';
                    };
                    const errorMessage = getErrorMessage();

                    dispatch(
                        setToastProps({
                            message: errorMessage,
                            backgroundColor: colorsPalette.recovered.pinkRed,
                            autoDismissAfter: 2000,
                            visible: true,
                            buttons: [],
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            logo: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                }
            }
        },
        [selectedExportOption, filterState, rideBookingInvoiceGeneratePost, dispatch, userLanguageStrings],
    );

    const handleDownloadAction = useCallback(async () => {
        setIsDownloadLoading(true);
        try {
            const { startDate, endDate } = calculateExportDateRange(
                filterState.dateFilter,
                filterState.customStartDate,
                filterState.customEndDate,
            );

            const response = await rideBookingInvoiceGeneratePost({
                body: {
                    email: undefined,
                    startDate,
                    endDate,
                    billingCategories: filterState.category ? [filterState.category] : undefined,
                    rideTypes: filterState.rideType ? [filterState.rideType] : undefined,
                    bookingId: undefined,
                },
            }).unwrap();

            const bookingAPIEntities = response.bookingAPIEntities || [];

            if (bookingAPIEntities.length === 0) {
                dispatch(
                    setToastProps({
                        message: 'No bookings found for the selected filters',
                        backgroundColor: colorsPalette.recovered.pinkRed,
                        autoDismissAfter: 2000,
                        visible: true,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        logo: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
                setIsDownloadLoading(false);
                return;
            }

            const allReceiptsHtml = bookingAPIEntities
                .map(bookingDetail => {
                    const firstRideEntity = bookingDetail.rideList.at(0);
                    const fareBreakup = bookingDetail.fareBreakup;

                    const fareList = getInvoiceFare(
                        fareBreakup,
                        appName || '',
                        userLanguageStrings,
                        bookingDetail.bookingDetails.TAG === 'OneWaySpecialZoneAPIDetails',
                        bookingDetail.isPetRide,
                    );

                    const htmlFares = fareList
                        .map(v => {
                            return `<div style="display: flex; flex-direction: row; ">
                                <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280; flex-grow:1;">${v.key}</div>
                                <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280;">${v.amountText}</div>
                            </div>`;
                        })
                        .join('');

                    const extraInfo = fareList
                        .map(v => {
                            return v.extraDetail !== ''
                                ? `<div style="font-weight: 400; font-size: 16px; line-height: 20px; color:#868B98; font-style: italic;">
                                    ${v.extraDetail}
                                </div>`
                                : '';
                        })
                        .join('');

                    const stops = getStopsWithDestination(bookingDetail.bookingDetails);
                    const lastStop = stops.length > 0 ? stops.at(stops.length - 1) : undefined;
                    const destinationAddress = lastStop ? formatLocation(lastStop) : undefined;

                    const finalAmount = `${
                        firstRideEntity?.computedPriceWithCurrency?.currency
                            ? getCurrency(firstRideEntity?.computedPriceWithCurrency?.currency)
                            : getAppCurrency(appName || '')
                    }${Math.round(firstRideEntity?.computedPriceWithCurrency?.amount || 0)}`;
                    const stopsInfoArray = firstRideEntity?.stopsInfo
                        ? [...(firstRideEntity?.stopsInfo || [])]
                              .sort((a, b) => a.stopOrder - b.stopOrder)
                              .map(stop => ({
                                  stopsTime: getISTWithFormat(stop.waitingTimeStart || '', 'hh:mm A'),
                                  stopsLocation: formatLocation(stops[stop.stopOrder - 1] ?? null),
                              }))
                        : [];
                    return rideReceiptPdf({
                        license: firstRideEntity?.vehicleNumber || '',
                        sourceDate: getISTWithFormat(
                            firstRideEntity?.rideStartTime || firstRideEntity?.createdAt || '',
                            'ddd, DD MMM, YYYY',
                        ),
                        finalAmount,
                        driverName: firstRideEntity?.driverName || '',
                        sourceAddress: formatLocation(bookingDetail.fromLocation),
                        destinationAddress,
                        sourceTime: getISTWithFormat(
                            firstRideEntity?.rideStartTime || firstRideEntity?.createdAt || '',
                            'hh:mm A',
                        ),
                        destinationTime: getISTWithFormat(firstRideEntity?.rideEndTime || '', 'hh:mm A'),
                        extraInfo,
                        htmlFares,
                        userName: userName || '',
                        rideShortId: firstRideEntity?.shortRideId || '',
                        stopsInfo: stopsInfoArray || undefined,
                        height: stopsInfoArray.length * 120 || 80,
                        appLogoImage,
                    });
                })
                .join('<div style="page-break-after: always;"></div>');

            const htmlContent = `
                <html>
                    <head>
                        <style>
                            @media print {
                                div { -webkit-print-color-adjust: exact !important; }
                            }
                        </style>
                    </head>
                    <body style="margin: 0; padding: 0;">
                        ${allReceiptsHtml}
                    </body>
                </html>
            `;

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            if (Platform.OS === 'ios') {
                pendingPdfShareRef.current = {
                    filePath: htmlContent,
                    timestamp,
                };
                setIsDownloadLoading(false);
            } else {
                await NativeModules['RNHTMLtoPDF'].convert({
                    html: htmlContent,
                    fileName: `MyRides_Invoice_${timestamp}`,
                    base64: false,
                    height: 1050,
                    width: 750,
                });
                setIsDownloadLoading(false);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);

            const getErrorMessage = (): string => {
                if (error && typeof error === 'object' && 'data' in error) {
                    const errorData = error.data;
                    if (errorData && typeof errorData === 'object' && 'errorMessage' in errorData) {
                        const message = errorData.errorMessage;
                        if (typeof message === 'string') {
                            return message;
                        }
                    }
                }
                return userLanguageStrings.Somethingwentwrong || 'Error generating invoice';
            };
            const errorMessage = getErrorMessage();

            dispatch(
                setToastProps({
                    message: errorMessage,
                    backgroundColor: colorsPalette.recovered.pinkRed,
                    autoDismissAfter: 2000,
                    visible: true,
                    buttons: [],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    logo: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
            setIsDownloadLoading(false);
        }
    }, [filterState, rideBookingInvoiceGeneratePost, dispatch, userLanguageStrings, appName, userName]);

    useEffect(() => {
        if (isExportInvoicePopupVisible) {
            exportInvoiceModalRef.current?.present();
        } else {
            exportInvoiceModalRef.current?.dismiss();
        }
    }, [isExportInvoicePopupVisible]);

    useEffect(() => {
        if (isFilterModalVisible) {
            filterModalRef.current?.present();
        } else {
            filterModalRef.current?.dismiss();
        }
    }, [isFilterModalVisible]);

    const handleFilterPress = useCallback(() => {
        setIsFilterModalVisible(true);
    }, []);

    const handleApplyFilters = useCallback(() => {
        filterModalRef.current?.dismiss();
        setIsFilterModalVisible(false);
        refetchWithFilters();
    }, [refetchWithFilters, filterState]);

    const renderBookingDetailCard = useCallback(
        (item: RideType | null) => {
            if (!item) return null;

            return (
                <BookingDetailCard
                    {...item}
                    setBookingData={setBookingData}
                    mpDispatch={props.mpDispatch}
                    isExpired={false}
                    showEstimate={featureFlags.myRidesDetails.showEstimate}
                    isActiveRide={props.isActiveRide}
                    isHelpAndSupportScreen={props.isHelpAndSupportScreen}
                    rideId={item.rideId}
                    issueCategory={props.issueCategory}
                    fetchedIssueCategory={props.fetchedIssueCategories}
                />
            );
        },
        [setBookingData, props.mpDispatch, featureFlags.myRidesDetails.showEstimate, props.isActiveRide],
    );

    const renderContent = React.useMemo(() => {
        if (bookingData?.length === 0 && !hasMore) {
            return (
                <NoRidesMessage
                    isAnyFilterApplied={
                        filterState.dateFilter !== 'default' ||
                        filterState.category !== undefined ||
                        filterState.rideType !== undefined
                    }
                    onBookYourFirstRideButton={props.onBookYourFirstRideButton}
                    userLanguageStrings={userLanguageStrings}
                    isHelpAndSupportScreen={props.isHelpAndSupportScreen}
                    issueCategory={props.issueCategory}
                />
            );
        }

        return (
            <View style={rideContainterStyles.bookingsContainer}>
                <FlatList
                    data={bookingData}
                    contentContainerStyle={{ paddingBottom: bottom }}
                    style={rideContainterStyles.bookingsFlatList}
                    renderItem={({ item }) => renderBookingDetailCard(item)}
                    keyExtractor={item => {
                        return getUniqueId(item);
                    }}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.1}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        isLoadingMore ? (
                            <View
                                style={{
                                    height:
                                        bookingData && bookingData.length > 0
                                            ? 60
                                            : Dimensions.get('window').height - top - bottom - 120,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <ActivityIndicator size="large" color={themeColors.Icon_neutralMidHigh} />
                            </View>
                        ) : null
                    }
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={limit}
                    windowSize={limit}
                    initialNumToRender={limit}
                />
            </View>
        );
    }, [
        bookingData,
        bottom,
        renderBookingDetailCard,
        loadMore,
        isFetching,
        isLoadingMore,
        themeColors,
        props.onBookYourFirstRideButton,
        userLanguageStrings,
    ]);

    const hasRides = Boolean(bookingData && bookingData.length > 0);

    const activeFiltersCount = React.useMemo(() => {
        const activeFilters = [
            filterState.dateFilter !== 'default',
            filterState.category !== undefined,
            filterState.rideType !== undefined,
        ];
        return activeFilters.filter(Boolean).length;
    }, [filterState.dateFilter, filterState.category, filterState.rideType]);

    const filterButtonBorderColor = activeFiltersCount > 0 ? '#000000' : '#D3D7DC';

    return (
        <HardwareBackpressHandler>
            <View style={[rideContainterStyles.myRidesView, { backgroundColor: colors.neutral200 }]}>
                <Header
                    showNextView={!props.isHelpAndSupportScreen}
                    compactTitle={!props.isHelpAndSupportScreen && hasRides}
                    nextViewIcon={
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ position: 'relative' }}>
                                <Pressable
                                    testID="filter-button"
                                    onPress={handleFilterPress}
                                    accessibilityLabel="Filter rides"
                                    accessibilityRole="button"
                                    style={{
                                        padding: 8,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: filterButtonBorderColor,
                                        backgroundColor: '#FFFFFF',
                                    }}>
                                    <MyRidesFilter size={15} color="#14171F" />
                                </Pressable>
                                {activeFiltersCount > 0 && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: -5,
                                            right: -8,
                                            backgroundColor: '#000000',
                                            borderRadius: 15,
                                            minWidth: 15,
                                            height: 20,
                                            paddingHorizontal: 5,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: '#FFFFFF',
                                        }}>
                                        <Typography
                                            type="body-5"
                                            style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 14 }}
                                            numberOfLines={1}
                                            isAnimate={undefined}
                                            accessible={false}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {activeFiltersCount.toString()}
                                        </Typography>
                                    </View>
                                )}
                            </View>
                            {hasRides ? (
                                <Pressable
                                    testID="export-invoice-button"
                                    disabled={!hasRides}
                                    onPress={() => {
                                        setSelectedExportOption('EMAIL');
                                        setIsExportInvoicePopupVisible(true);
                                    }}
                                    accessibilityLabel="Export Invoice"
                                    accessibilityRole="button"
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 8,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: '#D3D7DC',
                                        backgroundColor: '#FFFFFF',
                                        maxWidth: 150,
                                        flexShrink: 1,
                                        minWidth: 0,
                                    }}>
                                    <Icon size={16} icon={<ExportIcon color="#14171F" />} />
                                    <Typography
                                        type="subhead-700"
                                        style={{
                                            marginLeft: 6,
                                            color: '#14171F',
                                            fontSize: 14,
                                            flexShrink: 1,
                                            minWidth: 0,
                                        }}
                                        accessibilityLabel="Export Invoice"
                                        numberOfLines={1}
                                        isAnimate={false}
                                        accessible={true}
                                        accessibilityRole="text">
                                        {userLanguageStrings.ExportInvoice}
                                    </Typography>
                                </Pressable>
                            ) : null}
                        </View>
                    }
                    title={
                        props.isHelpAndSupportScreen ? userLanguageStrings.HelpandSupport : userLanguageStrings.MyRides
                    }
                    onBackPress={onBackPress}
                />

                {renderContent}
                <PopUpModal
                    sheetRef={exportInvoiceModalRef}
                    enableDynamicSizing={true}
                    onHardwareBackPress={undefined}
                    showBackdrop={undefined}
                    isScrollable={false}
                    onDismiss={() => {
                        setSelectedExportOption('EMAIL');
                        setIsDownloadLoading(false);
                        setIsExportInvoicePopupVisible(false);
                    }}>
                    <ExportInvoiceModal
                        selectedOption={selectedExportOption}
                        onSelectOption={setSelectedExportOption}
                        onPrimaryAction={handleExportInvoiceAction}
                        onExportAction={handleExportAction}
                        onDownloadAction={handleDownloadAction}
                        businessEmail={userProfile?.businessEmail ?? undefined}
                        isBusinessEmailVerified={userProfile?.businessProfileVerified ?? undefined}
                        personalEmail={userProfile?.email ?? undefined}
                        isDownloadLoading={isDownloadLoading}
                    />
                </PopUpModal>
                <PopUpModal
                    sheetRef={filterModalRef}
                    enableDynamicSizing={true}
                    onHardwareBackPress={undefined}
                    showBackdrop={undefined}
                    isScrollable={true}
                    onDismiss={() => setIsFilterModalVisible(false)}>
                    <FilterRidesModal
                        initialFilters={filterState}
                        onApply={handleApplyFilters}
                        setFilterState={setFilterState}
                    />
                </PopUpModal>
            </View>
        </HardwareBackpressHandler>
    );
};

export default MyRides;

const NoRidesMessage: React.FC<NoRidesMessageProps> = ({
    onBookYourFirstRideButton,
    userLanguageStrings,
    isHelpAndSupportScreen,
    isAnyFilterApplied,
    issueCategory,
}) => {
    return (
        <Animated.View style={noRidesContainerStyles.container}>
            <Animated.View style={noRidesContainerStyles.errorContainer}>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="my ride not found image"
                    source={icMyRideNotFound}
                    resizeMode="contain"
                    style={noRidesContainerStyles.image}
                />
            </Animated.View>
            <Typography
                type="subhead-1"
                style={noRidesContainerStyles.subhead}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={
                    isHelpAndSupportScreen
                        ? issueCategory
                            ? 'No recent rides available for this issue'
                            : 'You have not taken any ride in the last 72 hours'
                        : 'No ride history available'
                }
                accessibilityRole={undefined}>
                {isHelpAndSupportScreen
                    ? issueCategory
                        ? userLanguageStrings.NoRecentRidesAvailableForThisIssue
                        : userLanguageStrings.YouHaveNotTakenAnyRideInTheLast72Hours
                    : isAnyFilterApplied
                      ? userLanguageStrings.NoRidesFoundForSelectedFilters
                      : userLanguageStrings.noRideHistoryAvailable}
            </Typography>
            {!isHelpAndSupportScreen && !isAnyFilterApplied && (
                <>
                    <Typography
                        type="callout"
                        style={noRidesContainerStyles.callout}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={'You have not taken any ride yet'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.youHaveNotTakenAnyRideYet}
                    </Typography>
                    <Button
                        style={{ marginTop: 16 }}
                        type="primary"
                        testID="My_Rides_No_ride_found_button"
                        text={userLanguageStrings.bookYourFirstRideNow}
                        onPress={onBookYourFirstRideButton}
                    />
                </>
            )}
        </Animated.View>
    );
};
