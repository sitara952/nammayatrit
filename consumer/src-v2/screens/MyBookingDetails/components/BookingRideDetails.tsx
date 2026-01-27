import thumbsDown from '../../../../../consumer/src/typescript/assets/thumbs_down.webp';
import thumbsUp from '../../../../../consumer/src/typescript/assets/thumbs_up.webp';
import nyIcChevronRight from '@/typescript/assets/ny_ic_chevron_right.webp';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Image, View } from 'react-native';

import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Icon } from '@/typescript/components/Icon';
import CopyContent from '@/typescript/components/svg/CopyContent';
import { StarRating } from './StarRating';
import { JourneyDetails, MyBookingDetailsScreenAction } from '../Types';
import { Resolver } from '@/typescript/utils/common';

import { tripCategory } from '@/readOnly/api/types/TripCategory.gen';
import type { RideStatus_rideStatus as Enums_RideStatus_rideStatus } from '../../../../src/readOnly/api/types/Enums.gen.tsx';
import { fareDetail } from '@/typescript/utils/fareEntityHelper.ts';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { truncateDriverName } from '@/src-v2/utils/common.ts';
import { isNull } from 'lodash';
import { Pressable } from '@/src-v2/primitives/Pressable.tsx';
import React from 'react';
import { formatDurationInHoursMinutesSeconds } from '../utils.ts';
import { getTrackingStatusForLeg } from '@/typescript/utils/LegStatusUtils';
import Divider from '@/typescript/designSystem/components/primitives/Divider.tsx';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import PetPaw from '@/typescript/components/svg/PetPaw.tsx';

export type BookingRideDetailsProps = {
    vehicleModel: string;
    driver: string;
    actualDistance: string | undefined;
    estimatedDistance: string | undefined;
    rideShortId: string;
    rideTime: string;
    rating: boolean | number | undefined;
    estimatedDuration: number | undefined;
    rideEndTime: undefined | string;
    rideStartTime: undefined | string;
    status: undefined | Enums_RideStatus_rideStatus;
    fare: fareDetail;
    isPetRide: boolean;
};

export type RideDistanceAndTimeCol1Props = {
    actualDistance: string | undefined;
    estimatedDistance: string | undefined;
    tripCategory: tripCategory | undefined;
    estimatedDuration: number | undefined;
    showRideDetails: boolean;
};

export const RideDistanceAndTimeCol1: React.FC<RideDistanceAndTimeCol1Props> = ({
    actualDistance,
    estimatedDistance,
    tripCategory,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { text, estimatedDistance1, actualDistance1 } = (() => {
        switch (tripCategory?.TAG) {
            case 'Rental':
                return {
                    text: userLanguageStrings.BookedDistance,
                    estimatedDistance1: estimatedDistance,
                    actualDistance1: undefined,
                };
            case 'InterCity':
                return {
                    text: userLanguageStrings.BookedDistance,
                    estimatedDistance1: estimatedDistance,
                    actualDistance1: undefined,
                };
            default:
                return {
                    text: userLanguageStrings.RideDistance,
                    estimatedDistance1: estimatedDistance,
                    actualDistance1: actualDistance,
                };
        }
    })();
    return (
        <View style={tailwind.style('gap-2')}>
            <Typography
                type="body-7"
                style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {text}
            </Typography>
            <View style={tailwind.style('')}>
                {actualDistance1 ? (
                    <Typography
                        type="body"
                        style={{ color: themeColors.Text_neutralMax, fontSize: 12 }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {actualDistance1}
                    </Typography>
                ) : null}
                {estimatedDistance1 ? (
                    <Typography
                        type="body"
                        style={{ color: themeColors.Text_neutralMidHigh, fontSize: 10 }}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        (Estimated • {estimatedDistance1})
                    </Typography>
                ) : null}
            </View>
        </View>
    );
};

export type RideDistanceAndTimeCol2Props = {
    actualDistance: string | undefined;
    rideTime: string;
    tripCategory: tripCategory | undefined;
    estimatedDuration: number | undefined;
};

export const RideDistanceAndTimeCol2: React.FC<RideDistanceAndTimeCol2Props> = ({
    rideTime,
    tripCategory,
    estimatedDuration,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { text, estimatedDuration1, actualDuration1 } = (() => {
        const { ActualTimeAndDistance, ActualRideDistance, RideTime } = userLanguageStrings;

        const actualtime = rideTime ?? 'N/A';
        const estimatedtime = formatDurationInHoursMinutesSeconds(estimatedDuration);

        switch (tripCategory?.TAG) {
            case 'Rental':
                return {
                    text: ActualTimeAndDistance,
                    actualDuration1: actualtime,
                    estimatedDuration1: estimatedtime,
                };

            case 'InterCity':
                return {
                    text: ActualRideDistance,
                    actualDuration1: actualtime,
                    estimatedDuration1: estimatedtime,
                };

            default:
                return {
                    text: RideTime,
                    actualDuration1: actualtime,
                    estimatedDuration1: estimatedtime,
                };
        }
    })();

    return (
        <View style={tailwind.style('flex-col gap-2')}>
            <Typography
                type="body-7"
                style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {text}
            </Typography>
            <View style={tailwind.style('')}>
                <Typography
                    type="body"
                    style={{ color: themeColors.Text_neutralMax, fontSize: 12 }}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {actualDuration1}
                </Typography>
                <Typography
                    type="body"
                    style={{ color: themeColors.Text_neutralMidHigh, fontSize: 10 }}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    ({userLanguageStrings.Estimated} • {estimatedDuration1})
                </Typography>
            </View>
        </View>
    );
};

export const BookingRideDetails: React.FC<
    BookingRideDetailsProps & {
        mbdDispatch: Resolver<MyBookingDetailsScreenAction>;
        showRideDetails: boolean;
        tripCategory: tripCategory | undefined;
        isCancelled: boolean;
        journeyDetails: JourneyDetails | null;
        isPetRide: boolean;
    }
> = ({
    vehicleModel,
    driver,
    actualDistance,
    estimatedDistance,
    rideShortId,
    rideTime,
    rating,
    mbdDispatch,
    estimatedDuration,
    showRideDetails,
    tripCategory,
    isCancelled,
    journeyDetails,
    isPetRide,
}) => {
    const props = {
        vehicleModel,
        driver,
        estimatedDuration,
        actualDistance,
        estimatedDistance,
        rideShortId,
        rideTime,
        rating,
        mbdDispatch,
        showRideDetails,
        tripCategory,
        isPetRide,
    };
    const onPress = () => {
        mbdDispatch({ type: 'COPY_TO_CLIPBOARD', payload: undefined });
    };

    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const truncatedDriverName = truncateDriverName(driver);
    const handleFeedback = () => {
        mbdDispatch({ type: 'ADD_FEEDBACK', payload: { openJourneyFeedBack: !isNull(journeyDetails) } });
    };
    if (!isCancelled) {
        return (
            <View style={tailwind.style('flex-col justify-between')}>
                {!isNull(journeyDetails) && (
                    <View style={tailwind.style('gap-2 mb-6')}>
                        <Typography
                            type="body-7"
                            style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.TravelModes}
                        </Typography>
                        <View style={[tailwind.style('flex-row gap-1'), { width: '100%', flexWrap: 'wrap' }]}>
                            {journeyDetails.journeyModes.map((legInfo, index) => {
                                return (
                                    <View key={`${legInfo.pricingId}-${index}`} style={tailwind.style('flex-row')}>
                                        {index != 0 && (
                                            <Image
                                                accessible={false}
                                                key={`chevron-${legInfo.pricingId}-${index}`}
                                                source={nyIcChevronRight}
                                                style={[
                                                    tailwind.style('w-[14px] h-[17px] mr-1 mt-0.7'),
                                                    { resizeMode: 'contain' },
                                                ]}
                                            />
                                        )}
                                        <Typography
                                            key={`mode-${legInfo.pricingId}-${index}`}
                                            type="body"
                                            style={{
                                                borderWidth: 1,
                                                borderColor: themeColors.Fill_neutralMidLow,
                                                paddingHorizontal: 6,
                                                paddingVertical: 3,
                                                borderRadius: 9,
                                                fontSize: 12,
                                                textAlign: 'center',
                                                color:
                                                    getTrackingStatusForLeg(legInfo, undefined) === 'Finished'
                                                        ? themeColors.Text_neutralMax
                                                        : themeColors.Text_neutralMidHigh,
                                            }}
                                            numberOfLines={1}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {legInfo.travelMode === 'Subway' ? 'Train' : legInfo.travelMode}
                                        </Typography>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
                <View style={tailwind.style('flex-row justify-between')}>
                    <View style={tailwind.style('flex-col gap-5 mr-auto')}>
                        {isNull(journeyDetails) && (
                            <View style={tailwind.style('flex-col gap-2')}>
                                <Typography
                                    type="body-7"
                                    style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.VehicleModel}
                                </Typography>
                                <Typography
                                    type="body"
                                    style={tailwind.style(`text-[${themeColors.Text_neutralMax}]`)}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {vehicleModel}
                                </Typography>
                            </View>
                        )}
                        {showRideDetails && <RideDistanceAndTimeCol1 {...props} />}
                        {rating !== undefined ? (
                            typeof rating === 'number' ? (
                                <View
                                    style={tailwind.style('flex-col gap-2')}
                                    accessible={true}
                                    accessibilityLabel={`Your rating is ${rating} star${rating === 1 ? '' : 's'}.`}>
                                    <Typography
                                        type="body-7"
                                        style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.YourRating}
                                    </Typography>
                                    <StarRating rating={rating} total={5} />
                                </View>
                            ) : (
                                <View
                                    style={tailwind.style('flex-col gap-2')}
                                    accessible={true}
                                    accessibilityLabel={`You rated this as a ${rating ? 'thumbs up' : 'thumbs down'}.`}>
                                    <Typography
                                        type="body-7"
                                        style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.YourRating}
                                    </Typography>
                                    <Image
                                        accessible={true}
                                        accessibilityLabel={rating ? 'thumbs up image' : 'thumbs down image'}
                                        source={rating ? thumbsUp : thumbsDown}
                                        style={tailwind.style('h-20px w-20px')}
                                    />
                                </View>
                            )
                        ) : (
                            <View style={tailwind.style('flex-col gap-2')}>
                                <Typography
                                    type="body-7"
                                    style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.YourRating}
                                </Typography>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={handleFeedback}
                                    testID="booking_details_add_rating"
                                    accessibilityLabel={'Add now button'}>
                                    <Typography
                                        type="body"
                                        style={tailwind.style(`text-[#306AFE]`)}
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.AddNow}
                                    </Typography>
                                </Pressable>
                            </View>
                        )}
                    </View>
                    <View style={tailwind.style('flex-col gap-5 mr-2')}>
                        {isNull(journeyDetails) ? (
                            <View style={tailwind.style('flex-col gap-2')}>
                                <Typography
                                    type="body-7"
                                    style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Driver}
                                </Typography>
                                <Typography
                                    type="body"
                                    style={tailwind.style(`text-[${themeColors.Text_neutralMax}]`)}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {truncatedDriverName}
                                </Typography>
                            </View>
                        ) : (
                            <></>
                        )}
                        {showRideDetails && <RideDistanceAndTimeCol2 {...props} />}
                        <View style={tailwind.style('flex-col gap-2')}>
                            <Typography
                                type="body-7"
                                style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={true}
                                accessibilityLabel={userLanguageStrings.RideId}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.RideId}
                            </Typography>
                            <Pressable
                                onPress={onPress}
                                testID="booking_details_copy_ride_id"
                                accessibilityRole="button"
                                accessibilityLabel={`Copy Ride ID ${rideShortId.length > 12 ? rideShortId.slice(0, 10) + '...' : rideShortId}`}
                                style={tailwind.style('flex-row gap-2')}>
                                <Typography
                                    type="body"
                                    style={{ color: themeColors.Text_neutralMax, fontSize: 12 }}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {rideShortId.length > 12 ? rideShortId.slice(0, 10) + '...' : rideShortId}
                                </Typography>
                                <Icon color="#FFF" icon={<CopyContent />} size={26} accessibilityLabel="Copy Ride ID" />
                            </Pressable>
                        </View>
                    </View>
                </View>
                {isPetRide && (
                    <View style={tailwind.style('flex-col justify-center ')}>
                        <Divider
                            type="dashed"
                            dividerColor={colors.neutral450}
                            strokeDashArray="6 5"
                            direction={undefined}
                            style={{ marginTop: 12 }}
                            labelPosition={undefined}
                            offset={undefined}
                            offsetBackground={undefined}
                        />
                        <View style={tailwind.style('flex-row items-center mt-2 ')}>
                            <Icon icon={<PetPaw />} color={colors.blue800} size={26} style={{ marginTop: 6 }} />
                            <Typography
                                accessibilityLabel="Driver Tip"
                                type="sub-body-700"
                                style={{ fontSize: 14, color: colors.neutral800, fontWeight: 600 }}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Thiswasapetride}
                            </Typography>
                        </View>
                    </View>
                )}
            </View>
        );
    } else {
        return (
            <View style={tailwind.style('flex-col gap-2')}>
                <Typography
                    type="body-7"
                    style={{ color: themeColors.Text_neutralMidHigh, fontSize: 12 }}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.RideId}
                </Typography>
                <Pressable
                    onPress={onPress}
                    testID="booking_details_copy_cancelled"
                    accessibilityRole="button"
                    accessibilityLabel="Copy Ride ID button"
                    style={tailwind.style('flex-row gap-2')}>
                    <Typography
                        type="body"
                        style={tailwind.style(`text-[${themeColors.Text_neutralMax}]`)}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {rideShortId}
                    </Typography>
                    <Icon color="#FFF" icon={<CopyContent />} size={26} />
                </Pressable>
            </View>
        );
    }
};
