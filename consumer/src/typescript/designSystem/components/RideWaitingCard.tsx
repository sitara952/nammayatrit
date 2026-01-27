import React, { useMemo } from 'react';
import Animated, { LinearTransition, SlideInRight, useAnimatedStyle } from 'react-native-reanimated';

import Typography from './primitives/Typography';
import { Icon } from '../../components/Icon';
import { Image, StyleSheet, View } from 'react-native';
import { useDriverPhotoUri } from '@/typescript/hooks/useDriverPhotoUri';
import { StarEmpty } from '@/typescript/components/svg/Star';
import PassengerIcon from '@/typescript/assets/svg/symbols/PassengerIcon';
import colors from '../colorPalette';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { selectFeatureFlags } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RideId } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { getVehicleImage } from '@/typescript/utils/bookingUtils';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { RideStatus } from '@/typescript/hooks/types';
import { getVehicleNumber } from '../../screens/chat/utils';
import { selectRideDetailsWithId } from '../../state/client/ride';
import { truncateDriverName } from '@/src-v2/utils/common';
import { isStageNotInGroup } from '@/src-v2/screens/RideConfirmed/components/RideConfirmedHeader/Types';

type RideWaitingCardTypes = {
    driverName: string;
    driverRating: number | undefined;
    numberOfSeats: number;
    vehicleNumber: string;
    rideId: RideId | null;
    serviceTierName: string | undefined;
    driverImage: string | undefined;
    bookingId: BookingId | null;
    vehicleColor: string | null;
    vehicleModel: string | undefined;
    vehicleServiceType: ServiceTierType_serviceTierType;
    popupBanner: React.ReactNode | null;
    driverHighlightMessage: React.ReactNode | null;
    stage: RideStatus;
};

const RideWaitingCard = ({
    driverName,
    driverRating,
    numberOfSeats,
    rideId,
    serviceTierName,
    driverImage,
    // vehicleColor,
    vehicleModel,
    vehicleServiceType,
    popupBanner,
    driverHighlightMessage,
    stage,
}: RideWaitingCardTypes) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const featureFlags = useAppSelector(selectFeatureFlags);
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const vehicleNumber = rideDetails?.vehicleNumber || '';
    const truncatedDriverName = truncateDriverName(driverName);
    const handleDriverProfile = () => {
        if (featureFlags.showDriverProfile && stage !== RideStatus.OTP_RIDE_ASSIGNED) {
            navigation.navigate('driverProfile', {
                rideId: rideId,
                vehicleServiceType: vehicleServiceType,
                driverId: null,
            });
        }
    };
    const getNumberInFormat = useMemo(() => {
        return getVehicleNumber(vehicleNumber);
    }, [vehicleNumber]);

    const animatedBorderRadius = useAnimatedStyle(() => {
        return {
            borderTopLeftRadius: driverHighlightMessage ? 0 : 16,
            borderTopRightRadius: driverHighlightMessage ? 0 : 16,
        };
    });

    const cardContainerStyle = useMemo(() => {
        return [styles.cardContainer, driverHighlightMessage ? { marginTop: 0 } : {}];
    }, [driverHighlightMessage]);

    const imageUri = useDriverPhotoUri(driverImage);
    return (
        <Animated.View layout={LinearTransition}>
            {popupBanner}

            {driverHighlightMessage}

            <Animated.View style={[cardContainerStyle, animatedBorderRadius]} layout={LinearTransition}>
                <Animated.View style={[styles.driverInfoContainer]} layout={LinearTransition}>
                    <Pressable
                        testID="c0438e60-b619-47ba-b39b-11bf248e8aad"
                        onPress={handleDriverProfile}
                        accessibilityRole="button"
                        accessibilityLabel="Driver Name button"
                        accessible={true}>
                        <View style={styles.driverNameRow}>
                            <Image
                                accessible={true}
                                accessibilityLabel="driver profile image"
                                source={{ uri: imageUri }}
                                style={styles.driverImageStyle}
                            />
                            {driverName && (
                                <Typography
                                    type="subhead-1"
                                    style={styles.driverName}
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={
                                        stage !== RideStatus.OTP_RIDE_ASSIGNED
                                            ? `driver name ${driverName}`
                                            : `${driverName}`
                                    }
                                    accessibilityRole={undefined}>
                                    {truncatedDriverName}
                                </Typography>
                            )}
                        </View>
                    </Pressable>
                    <Animated.View style={styles.vehicleInfoRow} layout={LinearTransition} accessible={true}>
                        {vehicleModel && (
                            <Typography
                                type="body-3"
                                style={styles.vehicleInfoText}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={vehicleModel}
                                accessibilityRole={undefined}>
                                {vehicleModel}
                            </Typography>
                        )}
                    </Animated.View>

                    <Animated.View style={[styles.driverStatsRow, { flexWrap: 'wrap' }]}>
                        {stage !== RideStatus.OTP_RIDE_ASSIGNED && serviceTierName && (
                            <Animated.View accessible={true}>
                                <Typography
                                    type="body-3"
                                    style={styles.serviceTier}
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={serviceTierName}
                                    accessibilityRole={undefined}>
                                    {serviceTierName}
                                </Typography>
                            </Animated.View>
                        )}
                        <Animated.View style={{ flexDirection: 'row', paddingTop: 3 }} accessible={true}>
                            {stage !== RideStatus.OTP_RIDE_ASSIGNED && (
                                <Animated.View
                                    style={[
                                        styles.ratingContainer,
                                        driverRating !== 0 && {
                                            borderLeftWidth: 1,
                                            marginLeft: 6,
                                            borderLeftColor: `${defaultColors.gray600}`,
                                            paddingLeft: 6,
                                        },
                                    ]}
                                    accessibilityLabel={
                                        driverRating && driverRating !== 0
                                            ? 'Driver Rating: ' + driverRating
                                            : 'New Driver'
                                    }>
                                    {driverRating && driverRating !== 0 && (
                                        <>
                                            <Icon
                                                icon={<StarEmpty fill={'#D2D2D2'} />}
                                                size={16}
                                                color={defaultColors.gray600}
                                                importantForAccessibility="no-hide-descendants"
                                            />
                                            <Typography
                                                type="body-3"
                                                style={[styles.driverRating]}
                                                numberOfLines={1}
                                                isAnimate={false}
                                                accessible={false}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {driverRating}
                                            </Typography>
                                        </>
                                    )}
                                </Animated.View>
                            )}
                            <Animated.View
                                style={
                                    stage !== RideStatus.OTP_RIDE_ASSIGNED
                                        ? styles.seatsContainer
                                        : { flexDirection: 'row', alignItems: 'center' }
                                }
                                accessible={true}
                                accessibilityLabel={'Passengers allowed' + numberOfSeats}>
                                <Icon
                                    icon={<PassengerIcon />}
                                    size={16}
                                    color={defaultColors.gray600}
                                    accessible={false}
                                    importantForAccessibility="no-hide-descendants"
                                />
                                <Typography
                                    type="body-3"
                                    style={styles.seatsText}
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible={false}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {numberOfSeats}
                                </Typography>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
                <Animated.View style={[styles.carAndNumberContainer, { width: '42%' }]}>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="vehicle image"
                        entering={SlideInRight.duration(700)}
                        source={getVehicleImage(vehicleServiceType, vehicleModel)}
                        style={[
                            vehicleServiceType === 'AUTO_RICKSHAW' ? styles.autoImage : styles.carImage,
                            {
                                marginBottom: isStageNotInGroup(stage, [RideStatus.OTP_RIDE_ASSIGNED])
                                    ? vehicleServiceType === 'AUTO_RICKSHAW'
                                        ? -35
                                        : -25
                                    : 0,
                            },
                        ]}
                    />
                    {isStageNotInGroup(stage, [RideStatus.OTP_RIDE_ASSIGNED]) && (
                        <Animated.View style={styles.vehicleNumberContainer} accessible={true}>
                            <Typography
                                type="callout"
                                style={[styles.vehicleNumberText, styles.vehicleNumberFont]}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={true}
                                accessibilityLabel={`vehicle number: ${getNumberInFormat}`}
                                accessibilityRole={undefined}>
                                {getNumberInFormat}
                            </Typography>
                        </Animated.View>
                    )}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default RideWaitingCard;

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        overflow: 'hidden',
        paddingLeft: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    driverInfoContainer: {
        flexDirection: 'column',
        gap: 8,
        paddingLeft: 1,
        width: '58%',
    },
    driverNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverImageStyle: {
        width: 38,
        height: 38,
        borderRadius: 30,
        marginRight: 8,
    },
    driverName: {
        fontFamily: 'AreaNormal-Extrabold',
        color: `${defaultColors?.black600}`,
        textDecorationLine: 'underline',
    },
    vehicleInfoRow: {
        flexDirection: 'row',
    },
    vehicleInfoText: {
        fontFamily: 'AreaNormal-Extrabold',
        color: `${defaultColors?.gray600}`,

        fontSize: 14,
    },
    driverStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 6,
    },
    driverRating: {
        fontFamily: 'AreaNormal-Extrabold',
        color: `${defaultColors?.gray600}`,
        paddingLeft: 6,
        fontSize: 13,
        lineHeight: 16,
    },
    serviceTier: {
        fontFamily: 'AreaNormal-Extrabold',
        color: `${defaultColors?.gray600}`,
        fontSize: 13,
        lineHeight: 16,
    },
    seatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderColor: `${defaultColors?.gray600}`,
        paddingLeft: 6,
    },
    seatsText: {
        fontFamily: 'AreaNormal-Extrabold',
        color: `${defaultColors?.gray600}`,
        paddingLeft: 5,
        fontSize: 13,
        lineHeight: 16,
    },
    autoImage: {
        width: 80,
        height: 80,
        marginRight: 5,
        resizeMode: 'contain',
    },
    carImage: {
        width: 120,
        height: 90,
        resizeMode: 'contain',
    },
    vehicleNumberFont: {
        fontFamily: 'FE-Font',
    },
    containerShadow: {
        shadowColor: '' + `${colors?.recovered?.neutralMax}` + '08',
        shadowRadius: 4.5,
        shadowOpacity: 1.0,
        shadowOffset: { width: 0, height: 5.5 },
    },
    vehicleNumberContainer: {
        borderRadius: 6.8,
        height: 26,
        borderWidth: 1.5,
        borderColor: defaultColors.gray400,
        backgroundColor: defaultColors.yellow700,
        marginBottom: 10,
        minWidth: 119,
        marginTop: 8,
    },
    vehicleNumberText: {
        color: '#302F2F',
        fontSize: 12,
        fontFamily: 'AreaNormal-Regular',
        paddingTop: 1.5,
        textAlign: 'center',
        flex: 1,
        paddingHorizontal: 1,
        alignSelf: 'center',
    },
    carAndNumberContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        paddingTop: 10,
    },
});
