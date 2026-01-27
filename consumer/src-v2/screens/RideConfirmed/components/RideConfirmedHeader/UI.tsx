import React from 'react';
import { Text } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut, Easing, FlipInXDown, FlipOutXUp } from 'react-native-reanimated';
import { colors, colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import {
    isStageInGroup,
    isStageNotInGroup,
    RideConfirmedHeaderCardUIProps,
    AddOrEditStopButtonProps,
} from './Types.tsx';
import { headingStyles } from './Styles';
import Typography from '../../../../../src/typescript/designSystem/components/primitives/Typography';
import EmergencyContactCard from '../../../../../src/typescript/designSystem/components/EmergencyContactCard';
import { RideStatus } from '@/typescript/hooks/types';
import Divider from '../../../../../src/typescript/designSystem/components/primitives/Divider';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '../../../../../src/typescript/context/ConfigContext';
import Button from '../../../../primitives/Button';
import { Icon } from '../../../../../src/typescript/components/Icon';
import DownArrow from '../../../../../src/typescript/components/svg/DownArrow';
import { handleChatPress } from '@/typescript/designSystem/components/LiveTrackingModal';

export const RideConfirmedHeaderCardUI: React.FC<RideConfirmedHeaderCardUIProps> = ({
    stage,
    titleText,
    etaMinutesForHeaderText,
    isAccordionOpen,
    setIsAccordionOpen,
    emergencyContacts,
    handleShare,
    startOtp,
    endOtp,
    nextStop,
    userLanguageStrings,
    rentalsTitleText,
    onEditOrAddStopClicked,
    rideConfirmedBottomsheetModalRef,
    rideConfirmedChatBottomsheetRef,
    setIsBottomSheetChatOpen,
    defaultEmergencyNumbers,
    dispatch,
    rideId,
    bookingId,
    rideOtpText,
}) => {
    return (
        <Animated.View layout={LinearTransition}>
            <Animated.View
                style={
                    isStageInGroup(stage, [RideStatus.BRIDGE_TO_DESTINATION, RideStatus.RIDE_STARTED])
                        ? [headingStyles.paddingBottom, emergencyContacts.length <= 0 && { paddingBottom: 0 }]
                        : headingStyles.headingContainer
                }
                layout={LinearTransition}>
                <Animated.View
                    layout={LinearTransition}
                    style={[
                        headingStyles.titleContainer,
                        isStageInGroup(stage, [RideStatus.BRIDGE_TO_DESTINATION, RideStatus.RIDE_STARTED])
                            ? headingStyles.fullWidth
                            : headingStyles.partialWidth,
                    ]}>
                    {titleText &&
                        isStageNotInGroup(stage, [
                            RideStatus.RENTAL,
                            RideStatus.INTER_CITY,
                            RideStatus.OTP_RIDE_ASSIGNED,
                        ]) && (
                            <Animated.View
                                entering={FlipInXDown.duration(200).easing(Easing.inOut(Easing.quad))}
                                exiting={FlipOutXUp.duration(200).easing(Easing.inOut(Easing.quad))}
                                key={titleText}
                                style={{
                                    backfaceVisibility: 'hidden',
                                    transform: [{ perspective: 1000 }],
                                    justifyContent: 'center',
                                }}>
                                <Typography
                                    type="subhead-1"
                                    style={[headingStyles.titleText, { color: colors.black900 }]}
                                    numberOfLines={2}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={titleText}
                                    accessibilityRole={undefined}>
                                    {etaMinutesForHeaderText ? (
                                        <Text>
                                            {userLanguageStrings.DriverArrivingPrefix + ' '}
                                            <Text style={{ color: '#0C772B' }}>
                                                {etaMinutesForHeaderText}{' '}
                                                {etaMinutesForHeaderText > 1
                                                    ? userLanguageStrings.Mins
                                                    : userLanguageStrings.Min}
                                            </Text>
                                            {userLanguageStrings.DriverArrivingSuffix}
                                        </Text>
                                    ) : (
                                        titleText
                                    )}
                                </Typography>
                            </Animated.View>
                        )}
                    {/* RENTAL HEADING TEXT */}
                    {stage === RideStatus.RENTAL && (
                        <Typography
                            type="subhead-1"
                            style={[headingStyles.titleText, headingStyles.rentalTitleText]}
                            numberOfLines={3}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={rentalsTitleText}
                            accessibilityRole={undefined}>
                            {rentalsTitleText}
                        </Typography>
                    )}
                    {/* OTP RIDE HEADING TEXT */}
                    {stage === RideStatus.OTP_RIDE_ASSIGNED && (
                        <Typography
                            type="subhead-1"
                            style={[headingStyles.titleText]}
                            numberOfLines={2}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={titleText}
                            accessibilityRole={undefined}>
                            {titleText}
                        </Typography>
                    )}
                    {/* INTERCITY HEADING TEXT */}
                    {stage === RideStatus.INTER_CITY && (
                        <Animated.View>
                            <Animated.View
                                style={{
                                    alignSelf: 'flex-start',
                                    backgroundColor: '#3C8D42',
                                    borderRadius: 4,
                                    paddingHorizontal: 14,
                                    padding: 4,
                                    marginBottom: 4,
                                }}>
                                <Typography
                                    type="subhead-1"
                                    style={[
                                        headingStyles.titleText,
                                        {
                                            color: '#fff',
                                            fontSize: 14,
                                        },
                                    ]}
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={titleText}
                                    accessibilityRole={undefined}>
                                    {titleText}
                                </Typography>
                            </Animated.View>
                            <Animated.View style={headingStyles.flexRow}>
                                <Typography
                                    type="subhead-1"
                                    style={[headingStyles.titleText, { color: defaultColors?.green100, paddingTop: 4 }]}
                                    numberOfLines={3}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={titleText}
                                    accessibilityRole={undefined}>
                                    {`${userLanguageStrings.enrouteTo} ${nextStop}`}
                                </Typography>
                            </Animated.View>
                        </Animated.View>
                    )}
                    <Animated.View style={headingStyles.subTitleContainer} layout={LinearTransition}>
                        {emergencyContacts.length > 1 &&
                        isStageInGroup(stage, [
                            RideStatus.BRIDGE_TO_DESTINATION,
                            RideStatus.RIDE_STARTED,
                            RideStatus.INTER_CITY,
                        ]) ? (
                            <Animated.View entering={FadeIn} exiting={FadeOut}>
                                <Typography
                                    type="body-1"
                                    style={headingStyles.notifyText}
                                    numberOfLines={2}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={`Notify trusted contacts when in need`}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.notifyTrustedContactsWhenInNeed}
                                </Typography>
                            </Animated.View>
                        ) : (
                            <></>
                        )}
                    </Animated.View>
                </Animated.View>
                {startOtp &&
                isStageNotInGroup(stage, [
                    RideStatus.RIDE_STARTED,
                    RideStatus.BRIDGE_TO_DESTINATION,
                    RideStatus.RENTAL,
                    RideStatus.INTER_CITY,
                    RideStatus.WAY_TO_STOP,
                    RideStatus.STOP_ARRIVED,
                    RideStatus.WAITING_AT_STOP,
                    RideStatus.STOP_WAITING_CHARGE_APPLY_NOW,
                ]) ? (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={[
                            headingStyles.otpContainer,
                            headingStyles.otpShadow,
                            {
                                backgroundColor: colors.grayReal200,
                            },
                        ]}
                        accessible={true}
                        accessibilityLabel={`${rideOtpText}: ${String(startOtp).split('').join(' ')}`}>
                        <Typography
                            type="callout"
                            style={[
                                headingStyles.otpText,
                                {
                                    color: colors.black,
                                },
                            ]}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {rideOtpText} {startOtp}
                        </Typography>
                    </Animated.View>
                ) : (endOtp && stage === RideStatus.RENTAL) || stage === RideStatus.INTER_CITY ? (
                    <Animated.View
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
                        {stage === RideStatus.RENTAL && (
                            <AddOrEditStopButton
                                stopAddedOrNot={nextStop}
                                onAddOrEditButtonPress={onEditOrAddStopClicked}
                            />
                        )}
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={[
                                headingStyles.otpContainer,
                                headingStyles.otpShadow,
                                headingStyles.endRideOtpContainer,
                            ]}>
                            <Typography
                                type="callout-1"
                                style={[headingStyles.endOtpText]}
                                numberOfLines={2}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={`${userLanguageStrings.endOtp}: ${String(endOtp)
                                    .split('')
                                    .join(' ')}`}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.endOtp}
                            </Typography>
                            <Typography
                                type="callout-1"
                                style={[headingStyles.endOtpValue]}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={`${String(endOtp).split('').join(' ')}`}
                                accessibilityRole={undefined}>
                                {endOtp}
                            </Typography>
                        </Animated.View>
                    </Animated.View>
                ) : (
                    <></>
                )}
            </Animated.View>
            {isStageInGroup(stage, [
                RideStatus.BRIDGE_TO_DESTINATION,
                RideStatus.WAY_TO_STOP,
                RideStatus.RIDE_STARTED,
                RideStatus.RENTAL,
                RideStatus.INTER_CITY,
            ]) ? (
                <>
                    {stage === RideStatus.RENTAL ? (
                        <Animated.View style={headingStyles.subTitleContainer} layout={LinearTransition}>
                            {emergencyContacts.length > 1 ? (
                                <Animated.View entering={FadeIn} exiting={FadeOut}>
                                    <Typography
                                        type="callout"
                                        style={headingStyles.notifyText}
                                        numberOfLines={2}
                                        isAnimate={false}
                                        accessible={true}
                                        accessibilityLabel={`Notify trusted contacts when in need`}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.notifyTrustedContactsWhenInNeed}
                                    </Typography>
                                </Animated.View>
                            ) : (
                                <></>
                            )}
                        </Animated.View>
                    ) : (
                        <></>
                    )}
                    <Animated.View style={headingStyles.emergencyContactsContainer} layout={LinearTransition}>
                        {emergencyContacts.length > 0 && emergencyContacts[0] && (
                            <EmergencyContactCard
                                sharingStatus={true}
                                isSwitch={false}
                                contactPersonId={emergencyContacts[0].contactPersonId}
                                imgSrc={emergencyContacts[0].imgSrc}
                                title={emergencyContacts[0].title}
                                mobileNumber={emergencyContacts[0].mobileNumber}
                                value={emergencyContacts[0].isRideShared}
                                shareOnPress={() => handleShare(0)}
                                shouldDisable={false}
                                chatOnPress={() =>
                                    handleChatPress(
                                        0,
                                        rideConfirmedBottomsheetModalRef,
                                        rideConfirmedChatBottomsheetRef,
                                        setIsBottomSheetChatOpen,
                                        defaultEmergencyNumbers,
                                        emergencyContacts,
                                        dispatch,
                                        rideId,
                                        bookingId,
                                    )
                                }
                            />
                        )}
                        {isAccordionOpen ? (
                            <>
                                {emergencyContacts.length > 1 &&
                                    emergencyContacts
                                        .slice(1)
                                        .map((contact, index) => (
                                            <EmergencyContactCard
                                                key={contact.contactPersonId}
                                                contactPersonId={contact.contactPersonId}
                                                sharingStatus={true}
                                                isSwitch={false}
                                                imgSrc={contact.imgSrc}
                                                title={contact.title}
                                                mobileNumber={contact.mobileNumber}
                                                value={contact.isRideShared}
                                                shareOnPress={() => handleShare(index + 1)}
                                                shouldDisable={false}
                                                chatOnPress={() =>
                                                    handleChatPress(
                                                        index + 1,
                                                        rideConfirmedBottomsheetModalRef,
                                                        rideConfirmedChatBottomsheetRef,
                                                        setIsBottomSheetChatOpen,
                                                        defaultEmergencyNumbers,
                                                        emergencyContacts,
                                                        dispatch,
                                                        rideId,
                                                        bookingId,
                                                    )
                                                }
                                            />
                                        ))}
                            </>
                        ) : null}
                    </Animated.View>
                    {emergencyContacts.length > 1 && (
                        <Animated.View layout={LinearTransition} style={headingStyles.marginBottom}>
                            <Divider
                                type={undefined}
                                direction={undefined}
                                style={headingStyles.divider}
                                labelPosition={'center'}
                                offset={undefined}
                                offsetBackground={defaultColors?.white100}
                                dividerColor={undefined}
                                strokeDashArray={undefined}>
                                <Pressable
                                    accessibilityLabel="Show more contacts button"
                                    accessibilityRole="button"
                                    testID="ride_confirmed_more_contacts"
                                    style={headingStyles.showMoreButton}
                                    onPress={() => {
                                        setIsAccordionOpen(!isAccordionOpen);
                                    }}>
                                    <Animated.View style={headingStyles.showMoreContent}>
                                        <Animated.Text style={headingStyles.showMoreText}>
                                            {isAccordionOpen ? 'close ' : `${emergencyContacts.length - 1} more`}
                                        </Animated.Text>
                                        <Icon
                                            icon={<DownArrow size={undefined} />}
                                            color={defaultColors?.black600}
                                            size={10}
                                            style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                transform: [{ rotate: isAccordionOpen ? '180deg' : '0deg' }],
                                                marginTop: isAccordionOpen ? 3 : 0,
                                            }}
                                        />
                                    </Animated.View>
                                </Pressable>
                            </Divider>
                        </Animated.View>
                    )}
                </>
            ) : null}
        </Animated.View>
    );
};

const AddOrEditStopButton: React.FC<AddOrEditStopButtonProps> = ({ stopAddedOrNot, onAddOrEditButtonPress }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Button
            style={headingStyles.addOrEditStopButtonContainer}
            onPress={onAddOrEditButtonPress}
            accessible={true}
            accessibilityLabel={stopAddedOrNot ? 'Edit' : 'Add'}
            testID={'RentalRideConfirmedScreenHeaderAddOrEditStopButton'}
            type={'link'}>
            <Typography
                type="callout-1"
                style={headingStyles.addOrEditStopButtonText}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {stopAddedOrNot ? userLanguageStrings.Edit : userLanguageStrings.Add}
            </Typography>
        </Button>
    );
};
