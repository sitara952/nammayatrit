import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '../../../../components/common/Icon';
import { ChevronRight } from '@/src-v2/multimodal/components/svg/ChevronRight';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { TransitMode, VehicleState } from '@/src-v2/multimodal/types/journeyTracking';
import {
    ViewJourneyIcon,
    CompleteJourneyIcon,
    SkipModeIcon,
    ViewTicketIcon,
    CloseErrorIcon,
    FixLocationIcon,
} from './JourneyIcons';
import { useAppSelector } from '@/typescript/state/hooks';
import { isBookingStatusConfirmed } from '@/typescript/utils/LegStatusUtils';
import { journeyBookingStatus } from '@/readOnly/api/types/JourneyBookingStatus.gen';
import { isVehicleStateOngoing } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { selectAppConfig } from '@/typescript/state/client/session';

type JourneyOptionsPopupProps = {
    visible: boolean;
    onClose: () => void;
    onMuteJourney: () => void;
    onViewJourneyPlan: () => void;
    onMarkLegCompletePress: () => void;
    onCompleteJourneyPress: () => void;
    onDirectRidePress: () => void;
    currentLegMode: TransitMode;
    currentLegBookingId: string | undefined;
    currentLegStatus: VehicleState | undefined;
    currentLegBookingStatus: journeyBookingStatus;
    onViewTicketPress: () => void;
    onCancelTicketPress: () => void;
    isTicketCancelled: boolean | undefined;
    onPressStatusBadge: () => void;
    accessibilityRef: React.RefObject<View | null> | undefined;
};

export const JourneyOptionsPopup: React.FC<JourneyOptionsPopupProps> = props => {
    const { animatedStyle } = useScaleAnimation();
    const {
        onViewJourneyPlan,
        onMarkLegCompletePress,
        onClose,
        onCompleteJourneyPress,
        visible,
        onViewTicketPress,
        onCancelTicketPress,
        isTicketCancelled,
        onPressStatusBadge,
        currentLegStatus,
        currentLegBookingStatus,
        currentLegMode,
        accessibilityRef,
    } = props;
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);

    const OptionButton = ({
        title,
        description,
        onPress,
        icon,
    }: {
        title: string;
        description: string;
        onPress: (() => void) | undefined;
        icon: React.ReactNode | undefined;
    }) => (
        <Pressable
            accessibilityLabel={title + ' button'}
            accessibilityRole="button"
            testID="live-journey-options"
            onPress={onPress}
            style={({ pressed }) => [
                tailwind.style('flex-row items-center justify-between bg-[#FFFFFF] p-4 rounded-[24px]'),
                pressed && { opacity: 0.7 },
            ]}>
            <View style={tailwind.style('flex-row items-start flex-1 gap-3')}>
                {icon && <View style={tailwind.style('mt-1')}>{icon}</View>}
                <View style={tailwind.style('flex-1')}>
                    <View style={tailwind.style('flex-row items-center justify-between')}>
                        <Text style={tailwind.style('text-[15px] font-areaNormal-extrabold text-[#37313E] mb-2')}>
                            {title}
                        </Text>
                        <Icon icon={<ChevronRight />} size={20} color="#5A5A5A" style={tailwind.style('mb-0.5')} />
                    </View>
                    <Text style={tailwind.style('text-[14px] text-[#616161] font-areaNormal-bold leading-[22px] mr-2')}>
                        {description}
                    </Text>
                </View>
            </View>
        </Pressable>
    );

    const { bottom } = useSafeAreaInsets();
    return (
        <AnimatedModal
            visible={visible}
            setVisible={onClose}
            onClose={onClose}
            contentStyle={{
                backgroundColor: colors.Fill_neutralUltraLow,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingBottom: bottom,
                marginTop: 'auto', // This pushes the modal to the bottom
            }}
            animationDuration={300}>
            <View ref={accessibilityRef}>
                <Text
                    style={tailwind.style(
                        'text-[15px] leading-[19px] text-[#969696] text-center my-6 font-areaNormal-extrabold',
                    )}>
                    {userLanguageStrings.JourneyOptions}
                </Text>

                <View style={tailwind.style('gap-4 mx-4')}>
                    {/* <OptionButton
                            title="Mute Journey"
                            description="You can keep going—navigation runs silently in the background."
                            onPress={onMuteJourney}
                        /> */}
                    <OptionButton
                        title={userLanguageStrings.ViewJourneyPlan}
                        description={userLanguageStrings.SeeRouteAndPlatformInfo}
                        onPress={onViewJourneyPlan}
                        icon={<ViewJourneyIcon />}
                    />

                    <OptionButton
                        title={userLanguageStrings.SkipCurrentMode}
                        description={userLanguageStrings.SkipCurrentModeAndContinue}
                        onPress={onMarkLegCompletePress}
                        icon={<SkipModeIcon />}
                    />
                    <OptionButton
                        title={userLanguageStrings.CompleteJourney}
                        description={userLanguageStrings.EndTripNowNonRefundable}
                        onPress={onCompleteJourneyPress}
                        icon={<CompleteJourneyIcon />}
                    />
                    {/* <OptionButton
                            title="Book a ride to destination"
                            description="Get a direct ride, skip transfers"
                            onPress={onDirectRidePress}
                            icon={<BookRideIcon />}
                        /> */}
                    {!isTicketCancelled && currentLegMode && isBookingStatusConfirmed(currentLegBookingStatus) && (
                        <OptionButton
                            title={userLanguageStrings.ViewTicket}
                            description={userLanguageStrings.ViewYourTicket}
                            onPress={onViewTicketPress}
                            icon={<ViewTicketIcon />}
                        />
                    )}
                    {/* {isNammaYatri && isTicketCancelled && ( */}
                    {/*     <OptionButton */}
                    {/*         title="Book Ticket" */}
                    {/*         description="Book a new ticket" */}
                    {/*         onPress={onBookTicketPress} */}
                    {/*         icon={<BookRideIcon />} */}
                    {/*     /> */}
                    {/* )} */}
                    {appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable &&
                        !isTicketCancelled &&
                        currentLegStatus &&
                        isBookingStatusConfirmed(currentLegBookingStatus) &&
                        !isVehicleStateOngoing(currentLegStatus) && (
                            <OptionButton
                                title={userLanguageStrings.CancelTicket}
                                description={userLanguageStrings.YouWillReceiveARefund}
                                onPress={onCancelTicketPress}
                                icon={<CloseErrorIcon />}
                            />
                        )}
                    <OptionButton
                        title={userLanguageStrings.FixLocation}
                        description={userLanguageStrings.UpdateYourCurrentLocation}
                        onPress={onPressStatusBadge}
                        icon={<FixLocationIcon />}
                    />
                </View>

                <Animated.View style={[animatedStyle]}>
                    <Pressable
                        accessibilityLabel="Close button"
                        accessibilityRole="button"
                        onPress={onClose}
                        testID="view-details"
                        style={({ pressed }) => [
                            tailwind.style(
                                `mx-4 bg-[${colors.Confirm_button_bg}] rounded-[16px] py-[19px] gap-[7px] items-center flex-row justify-center border border-[#F2F0F5] mt-4`,
                            ),
                            {
                                shadowOffset: {
                                    width: 0,
                                    height: 3.7,
                                },
                                shadowOpacity: 0.16,
                                shadowRadius: 3.8,
                                shadowColor: '#000',
                            },
                            pressed && { opacity: 0.7 },
                        ]}>
                        <Text
                            style={tailwind.style(
                                `text-[${colors.Confirm_button_text}] text-base font-areaNormal-extrabold`,
                            )}>
                            {userLanguageStrings.Close}
                        </Text>
                    </Pressable>
                </Animated.View>
            </View>
        </AnimatedModal>
    );
};
