import React, { useCallback } from 'react';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { View } from 'react-native';
import { BookingRideDetails } from './components/BookingRideDetails';
import { BookingDetailNavigationCard } from './components/BookingDetailNavigationCard';
import { BookingDetailsUIProps } from './Types.ts';
import { BookingDetailLocationCard } from './components/BookingDetailsLocationCard';
import { BookingDetailTopCard } from '../MyRides/components/BookingDetailTopCard.tsx';
import { BookingDetailTopCardChennaiOne } from './components/BookingDetailTopCardChennaiOne';
import TrainTicketComponent from './components/TrainTicketComponent';
import BookingDetailCardForPublicTransport from './components/BookingDetailCardForPublicTransport';
import { Header } from '@/src-v2/primitives/Header';
import { ScrollView } from 'react-native-gesture-handler';
import { BottomSheetBackdrop, BottomSheetFooter, BottomSheetView } from '@gorhom/bottom-sheet';
// import Review from '@/typescript/screens/reviewAndFeedback/components/Review.tsx';
import Review from '../reviewAndFeedback/components/Review.tsx';
import { RatingScreenType } from '@/typescript/state/client/ride';
// import RideCompletedBottomSheetContent from '@/typescript/screens/reviewAndFeedback/components/RideCompletedBottomSheetContent.tsx';
import RideCompletedBottomSheetContent from '../../../../consumer/src-v2/screens/reviewAndFeedback/components/RideCompletedBottomSheetContent.tsx';
import Animated from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button.tsx';
import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import { LinearTransition } from 'react-native-reanimated';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import token from '@/typescript/designSystem/tokens/index.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler.tsx';
import colors from '@/typescript/designSystem/colorPalette/';
import { createAction } from '@/typescript/utils/common.ts';
import { isNull } from 'lodash';
import { MultiTransitFeedbackBottomSheet } from '@/src-v2/multimodal/screens/MultiTransitFeedback/components/MultiTransitFeedbackBottomSheet.tsx';
import { SubAutoJourneysRating } from '@/src-v2/multimodal/screens/MultiTransitFeedback/components/SubAutoJourneysRatingBottomSheet.tsx';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';
import { createBusData, createMetroData, createTrainData, formatLocation } from './utils.ts';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen.tsx';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen.tsx';
import { homeSheetBg } from '../HomeScreen/HomeScreenFragment.tsx';
import { extractCategories } from '@/src-v2/multimodal/utils/journeyTrackingUtils.ts';
import { IssueCategoryList } from './components/IssueCategoryList';
import { isTicketOlderThanXSeconds } from '@/src-v2/utils/common';
import { issueCategoryListRes } from '@/readOnly/api/types/IssueCategoryListRes.gen.tsx';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen.tsx';

export const renderPublicTransportCard = (
    leg: legInfo,
    index: number,
    issueCategory: issueCategoryListRes | undefined,
    onCategoryClick: (category: issueCategoryRes) => void,
) => {
    const travelMode = leg?.travelMode;
    const categories = extractCategories(leg);

    const filteredCategory = issueCategory?.categories.filter(v => {
        return v.isTicketRequired && !isTicketOlderThanXSeconds(leg.startTime, v.maxAllowedRideAge || 72 * 60 * 60);
    });

    const renderIssueCategoryList = () => {
        if (filteredCategory && filteredCategory.length > 0) {
            return (
                <IssueCategoryList
                    issueCategoryList={filteredCategory}
                    onCategoryClick={category => onCategoryClick(category)}
                />
            );
        }
        return null;
    };

    if (travelMode === 'Bus') {
        const busData = createBusData(leg, categories);
        return (
            <View key={`pt-card-${index}`} style={tailwind.style('m-2 mt-[-1]')}>
                <BookingDetailCardForPublicTransport {...busData} issueListComponent={renderIssueCategoryList()} />
            </View>
        );
    }

    if (travelMode === 'Metro') {
        const metroData = createMetroData(leg, categories);
        return (
            <View key={`pt-card-${index}`} style={tailwind.style('m-2 mt-[-1]')}>
                <BookingDetailCardForPublicTransport {...metroData} issueListComponent={renderIssueCategoryList()} />
            </View>
        );
    }

    if (travelMode === 'Subway') {
        const trainData = createTrainData(leg, categories);
        return (
            <View key={`pt-card-${index}`} style={tailwind.style('m-2 mt-[-1]')}>
                <TrainTicketComponent {...trainData} issueListComponent={renderIssueCategoryList()} />
            </View>
        );
    }

    return null;
};

export const BookingDetails: React.FC<BookingDetailsUIProps> = ({
    fromLocation,
    stops,
    rideStartTime,
    rideEndTime,
    rideDetail,
    bookingDetailMiddle,
    showEstimate,
    showHelpAndSupport,
    showRideDetails,
    tripCategory,
    isCancelled,
    top,
    rating,
    reviewAndFeedbackApiCall,
    mbdDispatch,
    rateRide,
    ratingScreen,
    onSubmit,
    bookingDetailsFeedbackRef,
    snapPoints,
    initiallyFavorite,
    setinitiallyFavorite,
    isInsured,
    autoClickAction,
    transcitLegRating,
    journey,
    isMultimodal,
    rideDistance,
    rideTime,
    currentRating,
    onRatingChange,
    showTrainDetailsInMyRides,
    stopsInfo,
    issueCategory,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const { bottom } = useSafeAreaInsets();
    const hasPublicTransport =
        journey?.journeyDetails?.journeyModes?.some(leg => ['Metro', 'Bus', 'Subway'].includes(leg?.travelMode)) ??
        false;
    const journeyIncludesTrain =
        journey?.journeyDetails?.journeyModes?.some(leg => ['Subway'].includes(leg?.travelMode)) ?? false;

    const renderFooter = useCallback(
        (props: React.JSX.IntrinsicAttributes & BottomSheetDefaultFooterProps) => (
            <BottomSheetFooter {...props} bottomInset={bottom}>
                <Animated.View
                    layout={LinearTransition.springify().damping(24).stiffness(200)}
                    style={[
                        tailwind.style(`bg-white pt-5 py-4 px-[${token?.spacing?.[16]}] border-t border-[#edecee]`),
                    ]}>
                    <Button
                        testID="booking_details_submit_feedback"
                        importantForAccessibility={'no-hide-descendants'}
                        disabled={rating <= 0}
                        style={tailwind.style('text-extrabold justify-center')}
                        text={userLanguageStrings.Submityourfeedback}
                        type="primary"
                        onPress={reviewAndFeedbackApiCall}
                        accessibilityLabel="Submit Feedback"
                        accessibilityRole="button"
                    />
                </Animated.View>
            </BottomSheetFooter>
        ),
        [rating, reviewAndFeedbackApiCall],
    );

    const handleCategoryClick = useCallback(
        (category: issueCategoryRes) => {
            mbdDispatch({
                type: 'GO_TO_HELP_AND_SUPPORT',
                payload: { issueCategory: category },
            });
        },
        [mbdDispatch],
    );

    return (
        <HardwareBackpressHandler onHardwareBackPress={() => mbdDispatch(createAction('GO_BACK', undefined))}>
            <View style={[tailwind.style('flex-1'), { backgroundColor: homeSheetBg }]}>
                <Header
                    title={userLanguageStrings.BookingDetails}
                    onBackPress={() => mbdDispatch(createAction('GO_BACK', undefined))}
                />
                <View style={tailwind.style(`flex-col flex-1 bg-${themeColors.Fill_neutralMid}`)}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 20, marginHorizontal: 10, paddingBottom: 30 }}>
                        {hasPublicTransport ? (
                            <>
                                <View
                                    style={tailwind.style(
                                        `bg-[${colors.primitive.white[11]}] rounded-2xl shadow-md pl-[16px] pr-[16px] m-2 py-1`,
                                    )}>
                                    <BookingDetailTopCardChennaiOne
                                        {...rideDetail}
                                        showEstimate={showEstimate}
                                        journeyDetails={journey?.journeyDetails ?? null}
                                        showRideStatus={true}
                                        source={formatLocation(fromLocation)}
                                        destination={
                                            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                                            stops ? formatLocation(stops.at(stops.length - 1) as locationAPIEntity) : ''
                                        }
                                        rideTime={rideTime}
                                        rideDistance={rideDistance}
                                        rideId={bookingDetailMiddle.rideShortId}
                                        bookingDetailsFeedbackRef={bookingDetailsFeedbackRef}
                                        onRatingChange={onRatingChange}
                                        currentRating={currentRating}
                                        onCopyText={() =>
                                            mbdDispatch({ type: 'COPY_TO_CLIPBOARD', payload: undefined })
                                        }
                                    />
                                </View>
                                {!journeyIncludesTrain || showTrainDetailsInMyRides ? (
                                    <>
                                        {journey?.journeyDetails?.journeyModes?.map((leg, index) =>
                                            renderPublicTransportCard(leg, index, issueCategory, handleCategoryClick),
                                        )}
                                    </>
                                ) : null}
                            </>
                        ) : (
                            <>
                                <View
                                    style={tailwind.style(
                                        `bg-[${colors.primitive.white[11]}] rounded-2xl shadow-md px-2 mt-1 py-1 `,
                                    )}>
                                    <BookingDetailTopCard
                                        {...rideDetail}
                                        showEstimate={showEstimate}
                                        showFareDescription={
                                            !!journey?.journeyDetails?.journeyModes &&
                                            journey?.journeyDetails?.journeyModes?.length > 1
                                        }
                                        journeyDetails={journey?.journeyDetails ?? null}
                                        showRideStatus={true}
                                    />
                                </View>
                                {bookingDetailMiddle.rideShortId && (
                                    <View
                                        style={[
                                            tailwind.style('bg-white rounded-2xl shadow-md p-4'),
                                            bookingDetailMiddle.isPetRide && { paddingBottom: 10 },
                                        ]}>
                                        <BookingRideDetails
                                            {...bookingDetailMiddle}
                                            mbdDispatch={mbdDispatch}
                                            showRideDetails={showRideDetails}
                                            tripCategory={tripCategory}
                                            isCancelled={isCancelled}
                                            rating={bookingDetailMiddle.rating}
                                            journeyDetails={journey?.journeyDetails ?? null}
                                            isPetRide={bookingDetailMiddle.isPetRide ?? false}
                                        />
                                    </View>
                                )}
                                <View style={tailwind.style('bg-white rounded-2xl shadow-md p-4')}>
                                    <BookingDetailLocationCard
                                        source={fromLocation}
                                        stops={stops}
                                        rideStartTime={rideStartTime}
                                        rideEndTime={rideEndTime}
                                        showTitle={true}
                                        stopsInfo={stopsInfo}
                                    />
                                </View>
                            </>
                        )}
                        {((isCancelled && showHelpAndSupport) || !isCancelled) && (
                            <View
                                style={tailwind.style(
                                    `bg-white rounded-2xl shadow-md ${hasPublicTransport && isMultimodal ? 'mx-[10px]' : null}`,
                                )}>
                                <BookingDetailNavigationCard
                                    mbdDispatch={mbdDispatch}
                                    showHelpAndSupport={showHelpAndSupport}
                                    isCancelled={isCancelled}
                                    Pickup={fromLocation}
                                    Destination={stops}
                                    bookingDetailMiddle={bookingDetailMiddle}
                                    isInsured={isInsured}
                                    journeyDetails={journey?.journeyDetails ?? null}
                                    autoClickAction={autoClickAction}
                                    issueCategories={issueCategory}
                                />
                            </View>
                        )}
                    </ScrollView>
                    {isNull(journey) ? (
                        <PopUpModal
                            sheetRef={bookingDetailsFeedbackRef}
                            topInset={top}
                            keyboardBehavior="interactive"
                            keyboardBlurBehavior="restore"
                            backgroundStyle={tailwind.style('bg-[#FFFFFF]')}
                            handleComponent={null}
                            snapPoints={snapPoints}
                            showBackdrop={undefined}
                            footerComponent={renderFooter}
                            enableDynamicSizing={true}
                            onHardwareBackPress={undefined}
                            isScrollable={true}>
                            {ratingScreen === RatingScreenType.Review && (
                                <Review
                                    alternateNavigateToHome={() =>
                                        mbdDispatch(createAction('ALTERNATE_NAVIGATE_TO_HOME', undefined))
                                    }
                                    rateRide={rateRide}
                                    bookingDetails={rideDetail.bookingDetail}
                                />
                            )}
                            {ratingScreen === RatingScreenType.Feedback && (
                                <RideCompletedBottomSheetContent
                                    alternateNavigateToHome={() =>
                                        mbdDispatch(createAction('ALTERNATE_NAVIGATE_TO_HOME', undefined))
                                    }
                                    onSubmit={onSubmit}
                                    bookingDetailsFeedbackRef={bookingDetailsFeedbackRef}
                                    bookingDetails={rideDetail.bookingDetail}
                                    showBlacklist={undefined}
                                    initiallyFavorite={initiallyFavorite}
                                    setinitiallyFavorite={setinitiallyFavorite}
                                />
                            )}
                        </PopUpModal>
                    ) : !isNull(journey.journeyDetails) ? (
                        <PopUpModal
                            sheetRef={bookingDetailsFeedbackRef}
                            keyboardBehavior="interactive"
                            keyboardBlurBehavior="restore"
                            handleComponent={null}
                            enableOverDrag={false}
                            enableDynamicSizing={true}
                            showBackdrop={undefined}
                            onHardwareBackPress={undefined}
                            isScrollable={true}>
                            {
                                <BottomSheetView
                                    style={tailwind.style(`bg-white pb-[${bottom + 12}px]`, {
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        overflow: 'hidden',
                                    })}
                                    accessibilityElementsHidden={true}
                                    importantForAccessibility={'no-hide-descendants'}>
                                    <MultiTransitFeedbackBottomSheet
                                        transcitLegRating={transcitLegRating}
                                        fromJourney={true}
                                        legs={journey.journeyDetails.journeyModes}
                                        journeyId={journey.journeyDetails.journeyId}
                                        bookingDetailsFeedbackRef={bookingDetailsFeedbackRef}
                                        initialRating={currentRating}
                                        onRatingSubmitted={onRatingChange}
                                    />
                                </BottomSheetView>
                            }
                        </PopUpModal>
                    ) : (
                        <PopUpModal
                            sheetRef={bookingDetailsFeedbackRef}
                            backdropComponent={BottomSheetBackdrop}
                            keyboardBehavior="interactive"
                            keyboardBlurBehavior="restore"
                            handleComponent={null}
                            enableOverDrag={false}
                            enableDynamicSizing={true}
                            onHardwareBackPress={undefined}
                            showBackdrop={undefined}
                            isScrollable={true}>
                            {
                                <BottomSheetView
                                    style={tailwind.style(`bg-white`, {
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        overflow: 'hidden',
                                    })}
                                    accessibilityElementsHidden={true}
                                    importantForAccessibility={'no-hide-descendants'}>
                                    <SubAutoJourneysRating
                                        mbdDispatch={mbdDispatch}
                                        legOrder={journey.subAutoLegDetails?.subAutoLegOrder ?? 0}
                                        journeyId={journey.journeyId}
                                    />
                                </BottomSheetView>
                            }
                        </PopUpModal>
                    )}
                </View>
            </View>
        </HardwareBackpressHandler>
    );
};
