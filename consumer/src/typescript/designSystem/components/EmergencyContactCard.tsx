import React from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import Typography from './primitives/Typography';
import { ImageSourcePropType, Linking } from 'react-native';
import { AnimatedPressable, CallButton, ChatButton } from '@/typescript/components/FloatingMenu';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useConfigContext } from '../../context/ConfigContext';
import { formatPhone } from '@/src-v2/utils/Booking';
import Button, { AnimationProps } from '@/src-v2/primitives/Button';
import { shareApp } from '@/src-v2/utils/common';
import { selectAppConfig, selectAppReadableName, selectOperatingCity } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfile } from '@/typescript/state/client/user';
import { getInitials } from '../../utils/common';
import NameInitials from './NameInitials';
interface EmergencyContactCardTypes {
    imgSrc: ImageSourcePropType;
    title: string;
    mobileNumber: string;
    value: boolean;
    shareOnPress: () => void;
    chatOnPress: () => void;
    isSwitch: boolean | undefined;
    sharingStatus: boolean;
    componentAnimations?: Record<string, AnimationProps> | undefined;
    shouldDisable: boolean | undefined;
    contactPersonId: string | undefined;
    showShareButton?: boolean;
}

const EmergencyContactCard = ({
    title,
    mobileNumber,
    value,
    shareOnPress,
    chatOnPress,
    isSwitch = true,
    componentAnimations,
    sharingStatus = true,
    shouldDisable = false,
    showShareButton = true,
    contactPersonId,
}: EmergencyContactCardTypes) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const operatingCity = useAppSelector(selectOperatingCity);
    const userProfile = useAppSelector(selectUserProfile);
    const appReadableName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);

    const handleDialPress = (phoneNumber: string) => {
        const url = `tel:${formatPhone(phoneNumber)}`;
        try {
            return Linking.openURL(url);
        } catch (error) {
            console.error('Unable to open dialer', error);
        }
        return undefined;
    };
    const nameInitial = getInitials(title);
    return (
        <Animated.View
            entering={componentAnimations?.['EmergencyContactCard']?.entering}
            exiting={componentAnimations?.['EmergencyContactCard']?.exiting}
            style={[
                tailwind.style(
                    `bg-white mt-3 pt-3 py-${
                        sharingStatus ? '3' : '4'
                    } pl-[17px] pr-[10px] rounded-[16px] flex-row items-center justify-between`,
                ),
                {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.09,
                    shadowRadius: 1,
                },
            ]}
            accessible={true}
            accessibilityLabel="Chat Card">
            <Animated.View style={tailwind.style('flex-row items-center max-w-55%')} accessibilityLabel={nameInitial}>
                <NameInitials nameInitial={nameInitial} textStyle={undefined} style={undefined} />

                <Animated.View
                    style={tailwind.style('pl-[10px]')}
                    accessibilityLabel={title}
                    accessible={true}
                    accessibilityRole="text">
                    <Typography
                        type={'body-1'}
                        style={{ fontFamily: 'AreaNormal-Bold', fontSize: 14, color: colors?.gray500 }}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {title}
                    </Typography>
                    {sharingStatus &&
                        (value ? (
                            <Animated.View
                                layout={LinearTransition}
                                entering={FadeIn}
                                exiting={FadeOut}
                                accessible={true}
                                accessibilityLabel={`Shared your location with ${title}`}
                                accessibilityRole="text">
                                <Typography
                                    type="body-1"
                                    style={tailwind.style('pt-0.5 text-[12px] text-[#3C8B41]')}
                                    numberOfLines={undefined}
                                    isAnimate={false}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.shared}
                                </Typography>
                            </Animated.View>
                        ) : (
                            <Animated.View layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
                                <Typography
                                    type="body-1"
                                    style={tailwind.style('pt-0.5 text-[12px] text-[#A2A2A2]')}
                                    numberOfLines={undefined}
                                    isAnimate={false}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.NotShared}
                                </Typography>
                            </Animated.View>
                        ))}
                </Animated.View>
            </Animated.View>
            {isSwitch ? (
                <Animated.View
                    layout={LinearTransition.springify().damping(28).stiffness(340)}
                    style={tailwind.style('flex-row items-center justify-between')}>
                    {/* Show share button if showShareButton is true, but disabled if status is shared */}
                    {showShareButton && (
                        <AnimatedPressable
                            onPress={shareOnPress}
                            testID="emergency-contact-share-button-switch"
                            style={tailwind.style('ml-3')}
                            disabled={value || shouldDisable}>
                            <Typography
                                type={'callout'}
                                style={tailwind.style(
                                    `text-[14px] leading-[20px] text-[#004FB6] opacity-${value || shouldDisable ? '50' : '100'}`,
                                )}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.share}
                            </Typography>
                        </AnimatedPressable>
                    )}
                </Animated.View>
            ) : (
                <Animated.View
                    layout={LinearTransition.springify().damping(28).stiffness(340)}
                    style={tailwind.style('flex-row items-center justify-between')}>
                    {/* Always show call button */}
                    <CallButton
                        entering={componentAnimations?.['CallButton']?.entering}
                        exiting={componentAnimations?.['CallButton']?.exiting}
                        handleOnPressCall={() => {
                            handleDialPress(mobileNumber);
                        }}
                        isCompact={true}
                        title={title}
                    />

                    {/* Always show chat button */}
                    {contactPersonId ? (
                        <ChatButton
                            entering={componentAnimations?.['ChatButton']?.entering}
                            exiting={componentAnimations?.['ChatButton']?.exiting}
                            handleOnPressChat={chatOnPress}
                            isCompact={true}
                            title={title}
                        />
                    ) : (
                        <Button
                            testID={`invite-clicked-${contactPersonId}`}
                            accessibilityLabel={`Invite contact ${title}`}
                            accessibilityHint="Click to invite"
                            type="secondary"
                            style={tailwind.style('ml-3')}
                            onPress={() => {
                                shareApp(
                                    operatingCity,
                                    userProfile?.customerReferralCode || '',
                                    appReadableName,
                                    userLanguageStrings,
                                    appConfig.flowConfig.shareReferralLink,
                                );
                            }}>
                            <Typography
                                type="subhead"
                                style={tailwind.style('text-blue-600 ')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Invite}
                            </Typography>
                        </Button>
                    )}

                    {/* Show share button for contacts with "not shared" status if showShareButton is true */}
                    {!value && showShareButton && (
                        <AnimatedPressable
                            onPress={shareOnPress}
                            testID="emergency-contact-share-button"
                            style={tailwind.style('ml-3')}
                            disabled={shouldDisable}>
                            <Typography
                                type={'callout'}
                                style={tailwind.style(
                                    `text-[14px] leading-[20px] text-[#004FB6] opacity-${shouldDisable ? '50' : '100'}`,
                                )}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.share}
                            </Typography>
                        </AnimatedPressable>
                    )}
                </Animated.View>
            )}
        </Animated.View>
    );
};

export default React.memo(EmergencyContactCard);
