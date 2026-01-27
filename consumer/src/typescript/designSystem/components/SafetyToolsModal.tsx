import { useConfigContext } from '@/typescript/context/ConfigContext';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { selectSafetyHelplineNo } from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { Linking, StyleSheet } from 'react-native';
import Animated, { SharedValue, useSharedValue, ZoomIn } from 'react-native-reanimated';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import BottomSheet, { BottomSheetHandleProps, BottomSheetView } from '@gorhom/bottom-sheet';
import EmergencyContactCard from '@/typescript/designSystem/components/EmergencyContactCard';
import { followers } from '@/readOnly/api/types/Followers.gen';
import React, { useCallback } from 'react';
import { BottomSheetTopBanner, BottomSheetTopBannerType } from './BottomSheetTopBanner';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { FollowRideOptions, FollowRideScreenAction, FollowRideSosOptions } from '@/src-v2/screens/FollowRide/Types';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { formatPhone } from '@/src-v2/utils/Booking';
import { Resolver } from '@/typescript/utils/common';
import { AlertIcon } from '../../components/svg/AlertIcon';
import { Headphone } from '../../components/svg/HeadPhone';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useSosCreatePostMutation } from '@/api/integrations/rtk/SosCreatePost';
import { selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { sosType } from '@/readOnly/api/types/SosType.gen';
import { selectSosId, setSosId } from '@/typescript/state/client/sos';
import { getSafetyCreatePostBody } from '@/src-v2/screens/SafetyModule/Flow';

export const SafetyToolsModal = React.memo(
    ({
        currentFollower,
        sheetAnimatedPosition,
        rcsDispatch,
        bookingId,
    }: {
        currentFollower: followers;
        sheetAnimatedPosition: SharedValue<number> | undefined;
        followRideSosStatus: FollowRideSosOptions;
        followRideStatus: FollowRideOptions;
        rcsDispatch: Resolver<FollowRideScreenAction>;
        bookingId: BookingId;
    }) => {
        const configManager = useConfigContext();
        const themeColors = configManager.get('themeColors');
        const { bottomSheetTopBannerRef } = useRefsContext();
        const { bottom } = useSafeAreaInsets();
        const bannerAnimatedIndex = useSharedValue(1);

        const renderCustomHandle = useCallback(
            (props: BottomSheetHandleProps) => {
                bottomSheetTopBannerRef.current = true;
                return (
                    <BottomSheetTopBanner
                        entering={ZoomIn.withInitialValues({ transform: [{ scale: 1.3 }] }).duration(700)}
                        {...props}
                        onBannerPress={undefined}
                        bannerType={BottomSheetTopBannerType.FollowRideSosOn}
                        showHandle={false}
                        showInfo={false}
                        animatedIndex={bannerAnimatedIndex}
                        handlerBGColor={themeColors.Fill_neutralUltraLow}
                    />
                );
            },
            [bannerAnimatedIndex],
        );

        const chatOnPress = useCallback(() => {
            rcsDispatch({ type: 'SET_FOLLOW_RIDE_SOS_STATUS', payload: FollowRideSosOptions.HIDDEN });
            rcsDispatch({ type: 'SET_FOLLOW_RIDE_STATUS', payload: FollowRideOptions.CHAT });
        }, []);

        return (
            <>
                <BottomSheet
                    index={0}
                    style={[styles.bottomsheetstyle, { backgroundColor: themeColors.Fill_neutralUltraLow }]}
                    handleComponent={renderCustomHandle}
                    enableOverDrag={false}
                    animatedPosition={sheetAnimatedPosition}
                    keyboardBehavior="extend"
                    snapPoints={[310 + bottom]}
                    handleStyle={{ height: 26, opacity: 0 }}
                    enableDynamicSizing={false}>
                    <BottomSheetView
                        style={[styles.bottomSheetViewstyle, { backgroundColor: themeColors.Fill_neutralUltraLow }]}>
                        <Animated.View style={{ paddingHorizontal: 16, marginTop: 16 }}>
                            <SafetyToolsPill bookingId={bookingId} />
                            <Animated.View style={{ marginTop: 3 }}>
                                <EmergencyContactCard
                                    contactPersonId={currentFollower.personId}
                                    isSwitch={false}
                                    imgSrc={0}
                                    title={currentFollower.name ?? ''}
                                    value={false}
                                    shareOnPress={() => {}}
                                    chatOnPress={chatOnPress}
                                    mobileNumber={currentFollower.mobileNumber}
                                    sharingStatus={false}
                                    shouldDisable={false}
                                    showShareButton={false}
                                    componentAnimations={{
                                        CallButton: {
                                            entering: ZoomIn.duration(600),
                                        },
                                        ChatButton: {
                                            entering: ZoomIn.duration(600),
                                        },
                                    }}
                                />
                            </Animated.View>
                        </Animated.View>
                    </BottomSheetView>
                </BottomSheet>
            </>
        );
    },
);

export const SafetyToolsPill = ({ bookingId }: { bookingId: BookingId }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { safetyNumber, enableSafetyCall } = useAppSelector(selectSafetyHelplineNo);
    const dispatch = useAppDispatch();
    const sosId = useAppSelector(selectSosId);

    const rideId: string | null = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const [sosCreatePost] = useSosCreatePostMutation();

    const call = useCallback(
        async (phone: string, flow: sosType) => {
            try {
                if (sosId === undefined) {
                    const sosReqBody = await getSafetyCreatePostBody(rideId, flow);
                    sosCreatePost({ body: sosReqBody })
                        .then(data => {
                            if (data.data?.sosId !== undefined) {
                                dispatch(setSosId(data?.data?.sosId));
                            }
                        })
                        .catch(err => console.error('Error in create sos api', err));
                }
                Linking.openURL(`tel:${formatPhone(phone)}`);
            } catch (e) {
                console.info(e);
            }
        },
        [sosCreatePost, dispatch, sosId, rideId],
    );

    return (
        <>
            <Typography
                type="subhead-1"
                numberOfLines={1}
                style={styles.SafetyTextHeading}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.SafetyTools}
            </Typography>
            <Animated.View style={styles.toolCenterContainer}>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="SafetyToolsCallPolice"
                    onPress={() => call('112', 'Police')}
                    style={styles.safetytoolsBar}>
                    <Animated.View style={{ width: 24, height: 24 }}>
                        <AlertIcon fill={undefined} />
                    </Animated.View>

                    <Typography
                        type="callout"
                        numberOfLines={1}
                        style={{ fontSize: 13 }}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.CallPolice}
                    </Typography>
                </TouchableOpacity>

                {enableSafetyCall && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="SafetyToolsCallSafety"
                        onPress={() => call(safetyNumber, 'CustomerCare')}
                        style={styles.safetytoolsBar}>
                        <Animated.View style={{ width: 24, height: 24 }}>
                            <Headphone fill={undefined} />
                        </Animated.View>

                        <Typography
                            type="callout"
                            numberOfLines={1}
                            style={{ fontSize: 13 }}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.CallSafetyTeam}
                        </Typography>
                    </TouchableOpacity>
                )}
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    toolCenterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        gap: 12,
        marginVertical: 12,
    },
    SafetyTextHeading: {
        paddingHorizontal: 2,
        color: `${defaultColors.gray300}`,
        fontSize: 15,
        lineHeight: 16,
        fontFamily: 'AreaNormal-Extrabold',
        fontWeight: 600,
    },
    bottomsheetstyle: {
        borderTopLeftRadius: 30,
        borderWidth: 0,
        borderTopRightRadius: 30,
    },
    safetytoolsBar: {
        flexDirection: 'column',
        gap: 15,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'white',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        borderRadius: 16,
    },
    bottomSheetViewstyle: {
        flexGrow: 1,
        borderWidth: 0,
    },
});
