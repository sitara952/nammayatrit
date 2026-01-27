import multiModalTrain from '../../../../../consumer/src/typescript/assets/multiModal_Train.webp';
import mtIcBusTransitReview from '../../../assets/3D-assets/review-transits/mt_ic_bus_transit_review.webp';
import trainTransit from '../../../assets/3D-assets/transits/mt_ic_train_transit.webp';
import transitMulti from '../../../assets/3D-assets/transits/transit_multi.webp';
import mtIcAutoTransitReview from '../../../assets/3D-assets/review-transits/mt_ic_auto_review_transit.webp';
import mtIcAutoPriorityTransitReview from '../../../assets/3D-assets/review-transits/mt_ic_auto_priority_review_transit.webp';
import mtIcCabTransitReview from '../../../assets/3D-assets/review-transits/mt_ic_cab_review_transit.webp';
import React, { useState, useEffect } from 'react';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Image, ImageSourcePropType, View } from 'react-native';
import { BookingDetailCardProps, RideStatus } from '../../MyRides/UI';

import Typography from '@/typescript/designSystem/components/primitives/Typography';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { JourneyDetails } from '../Types';
import { isNull } from 'lodash';
import { getCurrency } from '@/typescript/utils/getCurrency';
import { calculateTotalPriceFromJourney } from '@/typescript/utils/MultiModal';
import { Pressable } from '@/src-v2/primitives/Pressable';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import ChevronUp from '@/typescript/assets/svg/symbols/ChevronUp';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { RatingsCard } from '@/src-v2/multimodal/screens/MultiTransitFeedback/components/RatingsCard';
import TrackWithDots from '@/src-v2/multimodal/components/svg/TrackWithDots';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { MultiModalRideEndAction } from '@/src-v2/multimodal/screens/MultiTransitFeedback/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import transitBus from '../../../assets/3D-assets/transits/transit_bus.webp';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import CopyContent from '@/typescript/components/svg/CopyContent';

export const BookingDetailTopCardChennaiOne: React.FC<
    BookingDetailCardProps & {
        journeyDetails: JourneyDetails | null;
        showEstimate: boolean;
        showRideStatus: boolean;
        source: string;
        destination: string;
        rideTime: string;
        rideDistance: string;
        rideId: string;
        bookingDetailsFeedbackRef: React.RefObject<BottomSheetModalMethods | null> | null;
        onRatingChange: (rating: number) => void;
        currentRating: number;
        onCopyText: () => void;
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
    showRideStatus,
    source,
    destination,
    rideTime,
    rideDistance,
    rideId,
    bookingDetailsFeedbackRef,
    onRatingChange,
    currentRating,
    onCopyText,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [isExpanded, setIsExpanded] = useState(true);
    const [localRating, setLocalRating] = useState<number>(currentRating);
    const fade = useSharedValue(1);
    const fadedStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
    const { multiTransitFeedbackBottomSheetModalRef } = useRefsContext();

    useEffect(() => {
        setLocalRating(currentRating);
    }, [currentRating]);

    const handleOpenFeedbackBottomSheet = () => {
        if (currentRating > 0) return;
        if (bookingDetailsFeedbackRef?.current) {
            bookingDetailsFeedbackRef.current.present();
        } else if (multiTransitFeedbackBottomSheetModalRef?.current) {
            multiTransitFeedbackBottomSheetModalRef.current.present();
        }
    };

    const ratingsMpDispatch = async (action: MultiModalRideEndAction): Promise<void> => {
        if (currentRating > 0) return;
        switch (action.type) {
            case 'TOGGLE_RATING_STARS': {
                const next = action?.payload?.index ?? 0;
                setLocalRating(next);
                onRatingChange(next);
                setTimeout(() => {
                    if (bookingDetailsFeedbackRef?.current) {
                        bookingDetailsFeedbackRef.current.present();
                    } else if (multiTransitFeedbackBottomSheetModalRef?.current) {
                        multiTransitFeedbackBottomSheetModalRef.current.present();
                    }
                }, 0);
            }
        }
    };

    const toggleExpand = () => {
        if (isExpanded) {
            fade.value = withTiming(0, { duration: 0 }, finished => {
                if (finished) {
                    runOnJS(setIsExpanded)(false);
                    fade.value = 1;
                }
            });
        } else {
            runOnJS(setIsExpanded)(true);
            fade.value = 0;
            fade.value = withTiming(1, { duration: 0 });
        }
    };
    const displayPrice = !isNull(journeyDetails) ? calculateTotalPriceFromJourney(journeyDetails) : price;

    const isPublicTransport = journeyDetails?.journeyModes.some(leg =>
        ['Metro', 'Bus', 'Subway'].includes(leg.travelMode),
    );

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
                return transitBus;
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

    const accessibilityLabel =
        date && time
            ? `Your ride on ${date} at ${time} with ${
                  isNull(journeyDetails) ? `${vehicleServiceTier}${type ? ' - ' + type : ''}` : journeyType
              } cost ${Math.round(Number(displayPrice))} ${currency}.`
            : `Your ride with ${
                  isNull(journeyDetails) ? `${vehicleServiceTier}${type ? ' - ' + type : ''}` : journeyType
              } cost ${Math.round(Number(displayPrice))} ${currency}.`;

    return (
        <View accessibilityLabel={accessibilityLabel}>
            <View
                style={tailwind.style(
                    `flex-row justify-between items-end ${journeyDetails && journeyDetails.journeyModes.length > 1 ? 'ml-[-28px]' : ''}`,
                )}>
                <View style={{ flex: 2, flexDirection: 'row' }}>
                    {isNull(journeyDetails) ? (
                        <Image
                            source={
                                typeof vehicleIconUrl === 'string'
                                    ? {
                                          uri: vehicleIconUrl,
                                      }
                                    : vehicleIconUrl
                            }
                            style={[tailwind.style('w-[80px] h-[60px]'), { resizeMode: 'contain' }]}
                        />
                    ) : journeyDetails && journeyDetails.journeyModes.length > 1 ? (
                        <Image
                            source={getTransitImageSource(journeyDetails)}
                            style={[tailwind.style('w-[100px] h-[70px]'), { resizeMode: 'contain' }]}
                        />
                    ) : journeyDetails?.journeyModes?.[0]?.travelMode?.toLowerCase() === 'subway' ? (
                        <View
                            style={[
                                tailwind.style('w-[80px] h-[70px] ml-[-16px] mr-[-10px]'),
                                { overflow: 'hidden', position: 'relative' },
                            ]}>
                            <Image
                                source={getTransitImageSource(journeyDetails)}
                                style={[
                                    tailwind.style('w-[100px] h-[90px]'),
                                    { position: 'absolute', top: -30, left: -7, resizeMode: 'cover' },
                                ]}
                            />
                        </View>
                    ) : journeyDetails?.journeyModes?.[0]?.travelMode?.toLowerCase() === 'bus' ? (
                        <View
                            style={[
                                tailwind.style('w-[85px] h-[70px] ml-[-16px] mr-[-10px]'),
                                { overflow: 'hidden', position: 'relative' },
                            ]}>
                            <Image
                                source={getTransitImageSource(journeyDetails)}
                                style={[
                                    tailwind.style('w-[170px] h-[150px]'),
                                    { position: 'absolute', top: -45, left: -70, resizeMode: 'contain' },
                                ]}
                            />
                        </View>
                    ) : (
                        <View
                            style={[
                                tailwind.style('w-[80px] h-[70px] ml-[-16px] mr-[-10px]'),
                                { overflow: 'hidden', position: 'relative' },
                            ]}>
                            <Image
                                source={getTransitImageSource(journeyDetails)}
                                style={[
                                    tailwind.style('w-[70px] h-[75px]'),
                                    { position: 'absolute', top: -17, left: -9, resizeMode: 'cover' },
                                ]}
                            />
                        </View>
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
                                    : journeyDetails?.journeyModes
                                          ?.map(mode =>
                                              mode?.travelMode === 'Subway'
                                                  ? userLanguageStrings.Train
                                                  : getUserLanguageStringsForMode(
                                                        mode?.travelMode,
                                                        userLanguageStrings,
                                                    ),
                                          )
                                          .join(' + ')}
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
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Toggle fare details button"
                        onPress={toggleExpand}
                        style={{ alignSelf: 'flex-end', padding: 4 }}
                        testID="annaFareChevronToggle">
                        <Animated.View
                            style={tailwind.style(
                                'h-[18px] w-[18px] rounded-full bg-[#ECEDEF] items-center justify-center',
                            )}>
                            {isExpanded ? (
                                <ChevronUp color="#016ACD" height={14} width={14} />
                            ) : (
                                <ChevronDown color="#016ACD" height={14} width={14} />
                            )}
                        </Animated.View>
                    </Pressable>
                    {showEstimate ? (
                        <View style={tailwind.style('flex-col mr-1')}>
                            {rideStatus !== RideStatus.Cancelled ? (
                                <View style={tailwind.style('flex-col gap-2 items-center justify-center mr-[-62px]')}>
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
                                        {`${getCurrency(currency)} ${Math.round(Number(displayPrice))}`}
                                    </Typography>
                                </View>
                            ) : showRideStatus ? (
                                <View style={tailwind.style(`bg-[#FFEDED] p-1 px-3 rounded-full ml-28px`)}>
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
                                <View style={{ flexDirection: 'row', alignSelf: 'flex-end', gap: 3 }}>
                                    {
                                        <Typography
                                            type="title-800"
                                            style={{ alignSelf: 'flex-end', paddingBottom: 12 }}
                                            numberOfLines={1}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {`${getCurrency(currency)} ${Number(displayPrice)}`}
                                        </Typography>
                                    }
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
            {isExpanded ? (
                <Animated.View style={[tailwind.style('overflow-hidden'), fadedStyle]} testID="annaFareDetails">
                    <Animated.View style={tailwind.style('border-b border-[#ECEDEF]')} />
                    <Animated.View style={tailwind.style('mb-[14px]')}>
                        <Animated.View style={tailwind.style('flex-row items-stretch mt-[14px]')}>
                            <TrackWithDots width={10} height={47} />
                            <Animated.View style={tailwind.style('ml-2 justify-between')}>
                                <Animated.Text
                                    style={[
                                        tailwind.style(
                                            'text-[#969696] font-areaNormal-bold leading-[18px] tracking-[0.4px]',
                                        ),
                                        { fontSize: 13 },
                                    ]}
                                    numberOfLines={1}>
                                    {source}
                                </Animated.Text>
                                <Animated.Text
                                    style={[
                                        tailwind.style(
                                            'text-[#3B3A3C] font-areaNormal-bold leading-[18px] tracking-[0.4px]',
                                        ),
                                        { fontSize: 13 },
                                    ]}
                                    numberOfLines={1}>
                                    {destination}
                                </Animated.Text>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                    <Animated.View style={tailwind.style('border-b border-dashed border-[#F5F5F5] mb-[16px]')} />
                    <Animated.View style={[tailwind.style('flex-row justify-between mb-[16px]')]}>
                        <Animated.Text
                            style={[
                                tailwind.style('text-[#656565] font-areaNormal-bold leading-[18px]'),
                                { fontSize: 13 },
                            ]}>
                            {userLanguageStrings.RideTime}
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                tailwind.style('text-[#969696] font-areaNormal-bold text-right leading-[18px]'),
                                { fontSize: 13 },
                            ]}>
                            {rideTime}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={[tailwind.style('flex-row justify-between leading-[20px] mb-[16px]')]}>
                        <Animated.Text
                            style={[
                                tailwind.style('font-areaNormal-bold text-[#656565] leading-[18px]'),
                                { fontSize: 13 },
                            ]}>
                            {userLanguageStrings.RideDistance}
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                tailwind.style('font-areaNormal-bold text-[#969696] text-right leading-[18px]'),
                                { fontSize: 13 },
                            ]}>
                            {rideDistance}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={[tailwind.style('flex-row justify-between')]}>
                        <Animated.Text
                            style={[
                                tailwind.style('font-areaNormal-bold text-[#656565] leading-[18px] mb-[16px]'),
                                { fontSize: 13 },
                            ]}>
                            {userLanguageStrings.RideId}
                        </Animated.Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onCopyText}
                            testID="booking_details_copy_ride_id_top_card"
                            accessibilityLabel={`Copy Ride ID ${rideId && rideId.length > 12 ? rideId.slice(0, 10) + '...' : rideId}`}
                            style={tailwind.style('flex-row items-center gap-1 pr-1')}>
                            <Animated.Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[
                                    tailwind.style(
                                        'font-areaNormal-bold text-[#969696] text-right leading-[18px] max-w-[120px]',
                                    ),
                                    { fontSize: 13 },
                                ]}>
                                {rideId && rideId.length > 12 ? rideId.slice(0, 10) + '...' : rideId}
                            </Animated.Text>
                            <Icon color="#5B6777" icon={<CopyContent />} size={12} />
                        </Pressable>
                    </Animated.View>
                    <Animated.View style={tailwind.style('border-b border-dashed border-[#F5F5F5] mb-[16px]')} />
                    <Animated.View style={tailwind.style('mb-2')}>
                        <Animated.Text
                            style={[
                                tailwind.style(
                                    'font-areaNormal-bold text-[#3B3A3C] text-center leading-[18px] mb-[14px]',
                                ),
                                { fontSize: 13 },
                            ]}>
                            {userLanguageStrings.RateYourJourney}
                        </Animated.Text>
                        <Pressable
                            onPress={handleOpenFeedbackBottomSheet}
                            disabled={currentRating > 0}
                            testID="booking_detail_top_card_anna_rating"
                            accessibilityRole="button"
                            accessibilityLabel={`Rate your journey. Current rating: ${localRating} stars.`}>
                            <View pointerEvents={currentRating > 0 ? 'none' : 'auto'}>
                                <RatingsCard rating={localRating} mpDispatch={ratingsMpDispatch} />
                            </View>
                        </Pressable>
                    </Animated.View>
                </Animated.View>
            ) : null}
        </View>
    );
};
