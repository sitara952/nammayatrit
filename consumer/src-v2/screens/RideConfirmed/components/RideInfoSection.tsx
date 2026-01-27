import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import token from '@/typescript/designSystem/tokens/index';
import RentalDetails from '@/typescript/designSystem/components/RentalDetails';
import RideWaitingCard from '@/typescript/designSystem/components/RideWaitingCard';
import { RideStatus_rideStatus } from '@/readOnly/api/types/Enums.gen';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { RideId } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { RideConfirmedHeaderCard } from './RideConfirmedHeader/Flow';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import MultipleAvatar from '@/typescript/components/svg/MultipleAvatar';
import { strings } from 'config-types';
import { RideStatus } from '@/typescript/hooks/types';
import { UtilityBanner } from '@/typescript/designSystem/components/UtilityBanner';
import { isStageInGroup } from './RideConfirmedHeader/Types';
import { StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { followers } from '@/readOnly/api/types/Followers.gen';
import SharedRides from '@/typescript/screens/home/homeComponents/sharedRides/SharedRides';
import { RidePickupInstructions } from './RidePickupInstructions';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';

interface RideInfoSectionProps {
    bookingDetails: bookingAPIEntity | null;
    rideDetails: rideAPIEntity | null;
    otpCode: string | null;
    destination: FormatedLocation | undefined;
    estimatedDistance: number;
    rentalCardState: (status: RideStatus_rideStatus | undefined) => 'yetToStart' | 'inProgress' | 'ended';
    elapsedTime: number;
    rentaldiffTimer: number;
    onEditAddStopClick: () => void;
    rideId: RideId | null;
    bookingId: BookingId | null;
    popupBanner: React.ReactNode | null;
    driverHighlightMessage: React.ReactNode | null;
    setIsBottomSheetChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    emergencyContacts: Array<personDefaultEmergencyNumberAPIEntity>;
    onNudgePress: () => void;
    userLanguageStrings: strings;
    stage: RideStatus;
    bookedSource: FormatedLocation | null;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    followers: followers[];
    currentLocation: location | null;
}

const RideInfoSection: React.FC<RideInfoSectionProps> = ({
    bookingDetails,
    rideDetails,
    otpCode,
    destination,
    estimatedDistance,
    rentalCardState,
    elapsedTime,
    rentaldiffTimer,
    onEditAddStopClick,
    rideId,
    bookingId,
    popupBanner,
    driverHighlightMessage,
    setIsBottomSheetChatOpen,
    emergencyContacts,
    onNudgePress,
    userLanguageStrings,
    stage,
    followers,
    currentLocation,
}) => {
    return (
        <Animated.View style={tailwind.style(`px-[${token?.spacing[16]}]`)}>
            <RideConfirmedHeaderCard
                startOtp={rideDetails?.rideOtp ?? otpCode ?? ''}
                bookingId={bookingId}
                endOtp={rideDetails?.endOtp}
                nextStop={destination?.area}
                setIsBottomSheetChatOpen={setIsBottomSheetChatOpen}
            />

            {emergencyContacts.length === 0 &&
                isStageInGroup(stage, [
                    RideStatus.RENTAL,
                    RideStatus.INTER_CITY,
                    RideStatus.BRIDGE_TO_DESTINATION,
                    RideStatus.RIDE_STARTED,
                ]) && (
                    <UtilityBanner
                        onPress={onNudgePress}
                        titleText={userLanguageStrings.setUpemergencyContact}
                        LeftIcon={<MultipleAvatar />}
                        containerBackground={colors.neutral100}
                        subTitleStyles={styles.defaultUtilityBannerSubTitleTextStyle}
                        titleTextStyleFontSize={14}
                        subtitleText={undefined}
                        RightIcon={undefined}
                        titleTextFontWeight={600}
                        marginBottom={undefined}
                        rightIconStyles={undefined}
                        iconFillColor={colors.gray700}
                        titleTextStyles={undefined}
                    />
                )}

            {bookingDetails?.bookingDetails?.TAG === 'RENTAL' && (
                <Animated.View style={{ marginBottom: 16 }}>
                    <RentalDetails
                        state={rentalCardState(rideDetails?.status)}
                        elapsedTime={elapsedTime}
                        totalTime={rentaldiffTimer}
                        nextStop={destination?.area}
                        estimateDistance={estimatedDistance}
                        onEditAddStop={onEditAddStopClick}
                    />
                </Animated.View>
            )}
            <Animated.View>{followers.length > 0 ? <SharedRides /> : null}</Animated.View>

            <RideWaitingCard
                serviceTierName={bookingDetails?.serviceTierName}
                driverName={rideDetails?.driverName ?? bookingDetails?.serviceTierName ?? ''}
                vehicleModel={rideDetails?.vehicleModel ?? bookingDetails?.serviceTierShortDesc}
                vehicleColor={rideDetails?.vehicleColor ?? ''}
                driverImage={rideDetails?.driverImage}
                driverRating={rideDetails?.driverRatings}
                numberOfSeats={bookingDetails?.vehicleServiceTierSeatingCapacity || 3}
                vehicleNumber={rideDetails?.vehicleNumber ?? ''}
                rideId={rideId}
                bookingId={bookingId}
                vehicleServiceType={bookingDetails?.vehicleServiceTierType || 'SEDAN'}
                popupBanner={popupBanner}
                driverHighlightMessage={driverHighlightMessage}
                stage={stage}
            />

            {/* Pickup Instructions Component - now shown below vehicle card */}
            <RidePickupInstructions
                rideDetails={rideDetails}
                currentLocation={currentLocation}
                bookingDetails={bookingDetails}
            />
        </Animated.View>
    );
};

export default RideInfoSection;

const styles = StyleSheet.create({
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    defaultUtilityBannerSubTitleTextStyle: {
        color: colors.black900,
        fontWeight: 600,
    },
});
