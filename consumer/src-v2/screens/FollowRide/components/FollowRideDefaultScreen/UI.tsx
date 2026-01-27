import React, { useCallback, useMemo } from 'react';
import BottomSheet, {
    BottomSheetHandleProps,
    BottomSheetScrollView,
    BottomSheetView,
    SCREEN_WIDTH,
    WINDOW_HEIGHT,
} from '@gorhom/bottom-sheet';
import colors from '@/typescript/designSystem/colorPalette';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { SafetyToolsPill } from '@/typescript/designSystem/components/SafetyToolsModal';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import PledgeContent from '@/typescript/designSystem/components/PledgeContent';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import TripDetailsModal from '@/typescript/components/TripDetailsModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import {
    BottomSheetTopBanner,
    BottomSheetTopBannerType,
} from '@/typescript/designSystem/components/BottomSheetTopBanner';
import RideWaitingCard from '@/typescript/designSystem/components/RideWaitingCard';
import { TiltedArrow } from '@/typescript/assets/svg/symbols/TiltedArrow';
import EmergencyContactCard from '@/typescript/designSystem/components/EmergencyContactCard';
import { StyleSheet } from 'react-native';
import { FollowRideDefaultScreenUIProps } from './Types';
import { FollowRideSosOptions } from '../../Types';
import { RideStatus } from '@/typescript/hooks/types';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectPledgeConfig } from '@/typescript/state/client/session';
import { getShortLanguage } from '@/src-v2/utils/common';
import { selectUserProfile } from '@/typescript/state/client/user';
import FloatingChatBar from '@/typescript/designSystem/components/FloatingChatBar';
import { useSharedValue } from 'react-native-reanimated';
import { isVehicleTypeCab } from '@/src-v2/screens/DriverProfile/DriverProfileUtils';

const FollowRideDefaultScreenUI: React.FC<FollowRideDefaultScreenUIProps> = ({
    bookedSource,
    stops,
    bookingDetails,
    rideId,
    rideDetails,
    bookingId,
    currentFollower,
    bookedDestination,
    sheetAnimatedPosition,
    chatOnPress,
    followRideSosStatus,
    followRideTitleText,
    messageCount: externalMessageCount = 0,
}) => {
    const currentFollowerName = currentFollower.name ?? '';
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { tripDetailsRefFollowRide } = useRefsContext();
    const { top } = useSafeAreaInsets();
    const { bottomSheetTopBannerRef } = useRefsContext();
    const pledgeConfig = useAppSelector(selectPledgeConfig);
    const userProfile = useAppSelector(selectUserProfile);
    const currentLanguage = userProfile?.language ?? 'ENGLISH';
    const pledgeText = pledgeConfig.pledgeText[getShortLanguage(currentLanguage)];
    const isCab = isVehicleTypeCab(bookingDetails?.vehicleServiceTierType);

    // Use the externally provided message count
    const messageCount = externalMessageCount;

    const sheetAnimatedIndex = useSharedValue(0);

    const snapPoints = useMemo(() => ['42%', WINDOW_HEIGHT - top], [top]);

    // Simple handler for chat press that logs to console
    const handleChatBarPress = useCallback(() => {
        if (chatOnPress) {
            chatOnPress();
        }
    }, [chatOnPress]);

    const renderCustomHandle = useCallback((props: BottomSheetHandleProps) => {
        bottomSheetTopBannerRef.current = true;
        return (
            <BottomSheetTopBanner
                entering={ZoomIn.withInitialValues({ transform: [{ scale: 1.3 }] }).duration(700)}
                exiting={FadeOut.duration(600)}
                {...props}
                onBannerPress={undefined}
                bannerType={BottomSheetTopBannerType.FollowRideSosSafe}
                showHandle={false}
                showInfo={false}
                handlerBGColor={themeColors.Fill_neutralUltraLow}
            />
        );
    }, []);

    return (
        <>
            <FloatingChatBar
                onPress={handleChatBarPress}
                sheetAnimatedIndex={sheetAnimatedIndex}
                sheetAnimatedPosition={sheetAnimatedPosition}
                rideId={rideId}
                isDriver={false}
                driverImage={undefined}
                messageCount={messageCount}
                showChatBar={true}
                setShowChatBar={() => {}}
            />

            <BottomSheet
                backgroundStyle={[FollowRideheadingStyles.bottomSheetStyle]}
                index={0}
                animatedPosition={sheetAnimatedPosition}
                handleComponent={
                    followRideSosStatus === FollowRideSosOptions.NOT_TRIGGERED ? undefined : renderCustomHandle
                }
                enableOverDrag={false}
                snapPoints={snapPoints}
                handleIndicatorStyle={{
                    backgroundColor: colors?.recovered?.neutralMidLow,
                    height: 3,
                    borderRadius: 20,
                }}
                enableDynamicSizing={false}
                style={{
                    backgroundColor: themeColors.Fill_neutralUltraLow,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                }}
                handleStyle={{
                    height: 26,
                    backgroundColor: themeColors.Fill_neutralUltraLow,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                }}>
                <BottomSheetView style={{ backgroundColor: themeColors.Fill_neutralUltraLow }}>
                    {rideDetails ? (
                        <BottomSheetScrollView
                            overScrollMode={'always'}
                            accessible={false}
                            scrollEnabled={true}
                            contentContainerStyle={{ marginBottom: 8 }}
                            alwaysBounceVertical={true}
                            showsVerticalScrollIndicator={false}
                            style={{
                                backgroundColor: themeColors.Fill_neutralUltraLow,
                            }}>
                            <Animated.View style={{ paddingHorizontal: 16 }}>
                                <Animated.View style={FollowRideheadingStyles.headingContainer}>
                                    <Animated.View style={[FollowRideheadingStyles.fullWidth]}>
                                        {currentFollower && (
                                            <Typography
                                                type="subhead-1"
                                                style={FollowRideheadingStyles.titleText}
                                                numberOfLines={1}
                                                isAnimate={false}
                                                accessible={true}
                                                accessibilityLabel={currentFollower.name}
                                                accessibilityRole={undefined}>
                                                {followRideTitleText}
                                            </Typography>
                                        )}
                                        <Animated.View style={FollowRideheadingStyles.subTitleContainer}>
                                            <TiltedArrow />
                                            <Animated.View>
                                                <Typography
                                                    type="body-1"
                                                    style={FollowRideheadingStyles.notifyText}
                                                    numberOfLines={1}
                                                    isAnimate={false}
                                                    accessible={true}
                                                    accessibilityLabel={bookedDestination?.area}
                                                    accessibilityRole={undefined}>
                                                    {bookedDestination?.area}
                                                </Typography>
                                            </Animated.View>
                                        </Animated.View>
                                    </Animated.View>
                                </Animated.View>
                                <Animated.View style={FollowRideheadingStyles.emergencyContactsContainer}>
                                    <EmergencyContactCard
                                        contactPersonId={currentFollower.personId}
                                        isSwitch={false}
                                        imgSrc={0}
                                        title={currentFollowerName}
                                        value={false}
                                        shareOnPress={() => {}}
                                        chatOnPress={handleChatBarPress}
                                        mobileNumber={currentFollower.mobileNumber}
                                        sharingStatus={false}
                                        shouldDisable={false}
                                        showShareButton={false}
                                        componentAnimations={{
                                            EmergencyContactCard: {},
                                            CallButton: {
                                                entering: ZoomIn.duration(600),
                                            },
                                            ChatButton: {
                                                entering: ZoomIn.duration(600),
                                            },
                                        }}
                                    />
                                </Animated.View>

                                {rideDetails && bookingDetails && (
                                    <RideWaitingCard
                                        stage={RideStatus.CAB_IS_ARRIVING}
                                        popupBanner={null}
                                        driverHighlightMessage={null}
                                        serviceTierName={undefined}
                                        driverName={rideDetails?.driverName}
                                        driverImage={rideDetails?.driverImage}
                                        vehicleModel={rideDetails?.vehicleModel}
                                        vehicleColor={rideDetails?.vehicleColor}
                                        driverRating={rideDetails?.driverRatings}
                                        numberOfSeats={bookingDetails?.vehicleServiceTierSeatingCapacity || 3}
                                        vehicleNumber={rideDetails?.vehicleNumber}
                                        rideId={rideId}
                                        bookingId={bookingId}
                                        vehicleServiceType={bookingDetails?.vehicleServiceTierType}
                                    />
                                )}
                                <Animated.View style={{ marginTop: 32 }}>
                                    <SafetyToolsPill bookingId={bookingId} />
                                </Animated.View>
                                <Animated.View style={{ marginTop: 32 }}>
                                    <Button
                                        testID="FollowRideMainScreenTripDetailsbtn"
                                        accessible={true}
                                        accessibilityLabel="click to see trip details"
                                        type={'secondary'}
                                        style={{ justifyContent: 'center', width: '100%' }}
                                        onPress={() => {
                                            tripDetailsRefFollowRide.current?.present();
                                        }}>
                                        <Typography
                                            type={'callout'}
                                            style={{
                                                color: defaultColors?.gray500,
                                                fontSize: 15,
                                                fontFamily: 'AreaNormal-Extrabold',
                                            }}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {userLanguageStrings.TripDetails}
                                        </Typography>
                                    </Button>
                                </Animated.View>
                            </Animated.View>
                            {pledgeConfig.showPledge && pledgeText ? (
                                <PledgeContent
                                    driverAnimation={false}
                                    pledgeText={pledgeText}
                                    isCab={isCab}
                                    driverName={''}
                                    isDriverProfile={false}
                                />
                            ) : null}
                            <Animated.View style={{ margin: 32 }}></Animated.View>
                        </BottomSheetScrollView>
                    ) : (
                        <Defaultscreenshimmer />
                    )}
                </BottomSheetView>
            </BottomSheet>
            <PopUpModal
                sheetRef={tripDetailsRefFollowRide}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <TripDetailsModal
                    isFollowRide={true}
                    stops={stops.map(stop => ({
                        area: stop.area,
                        address: stop.address,
                        editable: false,
                    }))}
                    originEditable={false}
                    originTitle={bookedSource?.area}
                    originAddress={bookedSource?.address}
                    onEditPickupClick={undefined}
                    onEditDestinationClick={undefined}
                    hideAccessibility={undefined}
                    closeModal={undefined}
                    setShowTripDetailsModal={() => {}}
                    setShowCancellationReasonModal={() => {}}
                />
            </PopUpModal>
        </>
    );
};

export default React.memo(FollowRideDefaultScreenUI);

const FollowRideheadingStyles = StyleSheet.create({
    bottomSheetStyle: {
        backgroundColor: homeSheetBg,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 50,
    },
    marginBottom: { marginBottom: 12 },
    headingContainer: {
        marginHorizontal: 2,
        marginTop: 19,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    titleText: {
        fontFamily: 'AreaNormal-Extrabold',
        letterSpacing: 0.5,
        fontSize: 17,
        color: '#0C772B',
    },
    subTitleContainer: {
        flexDirection: 'row',
        gap: 5,
        marginTop: 'auto',
        paddingTop: 8,
    },
    notifyText: {
        color: `${defaultColors.gray300}`,
        fontSize: 14.5,
        lineHeight: 16,
        fontFamily: 'AreaNormal-Extrabold',
        fontWeight: 600,
    },
    darkText: {
        color: defaultColors.gray550,
    },
    whiteText: {
        color: 'white',
    },
    emergencyContactsContainer: {
        marginBottom: 13,
    },
    divider: {
        marginBottom: 20,
        backgroundColor: 'transparent',
        marginTop: 20,
    },
});

const Defaultscreenshimmer = () => {
    return (
        <Animated.View style={{ height: '100%', marginHorizontal: 20 }}>
            <Animated.View style={{ marginTop: 20 }}>
                <ContentLoader height={18}>
                    <Rect x="0" y="0" rx="10" ry="10" width="60%" height="100%" />
                </ContentLoader>
            </Animated.View>
            <Animated.View style={{ marginTop: 10 }}>
                <ContentLoader height={15}>
                    <Rect x="0" y="0" rx="10" ry="10" width="50%" height="100%" />
                </ContentLoader>
            </Animated.View>
            <Animated.View style={{ marginTop: 28 }}>
                <ContentLoader height={65}>
                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                </ContentLoader>
            </Animated.View>
            <Animated.View style={{ marginTop: 12 }}>
                <ContentLoader height={115}>
                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                </ContentLoader>
            </Animated.View>
            <Animated.View style={{ marginTop: 32 }}>
                <ContentLoader height={15}>
                    <Rect x="0" y="0" rx="10" ry="10" width="40%" height="100%" />
                </ContentLoader>
            </Animated.View>
            <Animated.View
                style={{
                    marginTop: 16,
                    flexDirection: 'row',
                    width: '100%',
                    gap: 15,
                }}>
                <ContentLoader height={85} width={SCREEN_WIDTH / 2 - 30}>
                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                </ContentLoader>
                <ContentLoader height={85} width={SCREEN_WIDTH / 2 - 20}>
                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                </ContentLoader>
            </Animated.View>
            <Animated.View style={{ marginTop: 40 }}>
                <ContentLoader height={50}>
                    <Rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                </ContentLoader>
            </Animated.View>
        </Animated.View>
    );
};
