import React, { useMemo, useState } from 'react';
import { ShowTicketButtonNew } from '../screens/NewLiveJourney/components/StatusPopUpModal/ShowTicketButtonNew';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { JourneyPaymentModal } from './JourneyPayment/UI';
import { useAppSelector } from '../../../src/typescript/state/hooks';
import { selectJourneyLegs } from '../../../src/typescript/state/client/journey';
import { RootState } from '../../../src/typescript/state/store';
import { isEqual } from 'lodash';
import { JourneyId } from '../../../src/typescript/state/client/user';
import { useJourneyPayment } from './JourneyPayment/hooks/useJourneyPayment';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import Button from '@/src-v2/primitives/Button';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { getTrackingStatusForLeg, isBookingConfirmed } from '@/typescript/utils/LegStatusUtils';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { Text } from 'react-native';
import { TransitActionButton } from '../screens/NewLiveJourney/screens/TransitTracking/components/MiniTransitInfo';
import { combineSplitLegs } from '../utils/journeyTrackingUtils';
import Animated from 'react-native-reanimated';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectAppConfig, selectAppReadableName } from '@/typescript/state/client/session';
import { mapJourneyLegsToJourneyModes } from '@/typescript/utils/MultiModal';

interface SmartTicketButtonProps {
    journeyId: JourneyId;
    onPressViewTicket: () => void;
    wrapperStyle?: string;
    icon?: React.ReactNode;
    ticketText?: string;
    bookingAllowed?: boolean;
    componentType?: SmartTicketButtonComponentType;
    includePriceInButtonText?: boolean;
}

export type SmartTicketButtonComponentType = 'button' | 'hyperlink' | 'transitActionButton';

export const SmartTicketButton: React.FC<SmartTicketButtonProps> = ({
    journeyId,
    onPressViewTicket,
    wrapperStyle = 'mx-6 px-0',
    icon,
    ticketText,
    componentType = 'button',
    includePriceInButtonText = true,
}) => {
    const { ticketSelectorModalRef, smartTicketModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const journeyLegs = useAppSelector((state: RootState) => selectJourneyLegs(state, journeyId), isEqual);
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const [isJourneyConfirmed, setIsJourneyConfirmed] = useState<boolean>(false);
    const appName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);

    const paymentProps = useMemo(() => {
        return {
            legs: combineSplitLegs(journeyLegs) ?? [],
            journeyId,
            fetchingLegsFare: false,
            isJourneyConfirmed,
            offer: undefined,
            loadingDataForLeg: null,
            handledQuoteExpiry: async () => {}, // TODO :: To be handled by polling journey initiate and updating journeyInfoResponse, after backend changes.
            setIsJourneyConfirmed,
            navigation,
            onMoreOptions: () => {},
            isSingleMode: false,
        };
    }, [journeyLegs, journeyId, isJourneyConfirmed, isJourneyConfirmed, navigation]);

    const paymentState = useJourneyPayment(paymentProps);

    // Check if booking is confirmed using the bookingStatus from ProcessedLegInfo
    const { isConfirmed, bookingPossible, buttonText, handlePress, journeyModes } = useMemo(() => {
        const frfsJourneyLegs = journeyLegs.filter(leg => ['Metro', 'Bus', 'Subway'].includes(leg.travelMode));
        const isConfirmed = frfsJourneyLegs.some(leg => isBookingConfirmed(leg));
        const bookingPossible = frfsJourneyLegs.every(leg => getTrackingStatusForLeg(leg, undefined) === 'InPlan');
        const journeyModes = mapJourneyLegsToJourneyModes(frfsJourneyLegs);

        const { buttonText, handlePress } = (() => {
            if (journeyModes.length === 1 && journeyModes[0] === 'metro' && !appConfig.flowConfig.metroBookingEnable) {
                return {
                    buttonText: '',
                    handlePress: () => {},
                };
            }
            if (isConfirmed || !bookingPossible) {
                return {
                    buttonText: ticketText ?? userLanguageStrings.ViewTicket,
                    handlePress: isConfirmed
                        ? onPressViewTicket
                        : () => {
                              smartTicketModalRef.current?.present();
                          },
                };
            } else {
                return {
                    buttonText: includePriceInButtonText
                        ? `${userLanguageStrings.BookTickets} @ ₹${paymentState.totalPayableFare}`
                        : userLanguageStrings.BookTickets,
                    handlePress: () => {
                        ticketSelectorModalRef.current?.present();
                    },
                };
            }
        })();

        return {
            isConfirmed,
            bookingPossible,
            buttonText,
            handlePress,
            journeyModes,
        };
    }, [journeyLegs]);

    if (buttonText === '') return <></>;

    return (
        <>
            {(() => {
                switch (componentType) {
                    case 'button':
                        return isConfirmed || !bookingPossible ? (
                            <ShowTicketButtonNew
                                onPress={handlePress}
                                text={buttonText}
                                wrapperStyle={wrapperStyle}
                                icon={icon}
                                disabled={!isConfirmed}
                            />
                        ) : (
                            <Button
                                testID={'journey_info_confirm'}
                                onPress={handlePress}
                                type={'primary'}
                                text={buttonText}
                                style={tailwind.style(`justify-center h-[60px] mx-6 px-0 mt-[26px]`)}
                                textStyle={tailwind.style(`text-[16px] font-areaNormal-extrabold tracking-[0.3px]`)}
                                isLoading={paymentState.isConfirmingJourney}></Button>
                        );
                    case 'hyperlink':
                        return (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessible={true}
                                onPress={handlePress}
                                accessibilityLabel="View Ticket button"
                                testID="smart-ticket-button">
                                <Text style={tailwind.style(wrapperStyle)}>{buttonText}</Text>
                            </TouchableOpacity>
                        );
                    case 'transitActionButton':
                        return (
                            <TransitActionButton
                                onPress={handlePress}
                                label={buttonText}
                                icon="arrow"
                                isLoading={paymentState.isConfirmingJourney}
                            />
                        );
                    default:
                        return <></>;
                }
            })()}
            <JourneyPaymentModal
                ticketSelectorModalRef={ticketSelectorModalRef}
                journeyModes={journeyModes}
                handleOnPress={() => paymentState.onConfirm({ skipPayment: false, viaOfferButton: false })}
                isLoading={false}
                hasSubwayLeg={paymentState.hasSubwayLeg}
                onModalDismiss={() => {}}
                legCategorySelections={paymentState.legCategorySelections}
                handleCategoryQuantityChange={paymentState.handleCategoryQuantityChange}
                getCategoryDiscount={paymentState.getCategoryDiscount}
            />
            <PopUpModal
                sheetRef={smartTicketModalRef}
                isScrollable={true}
                showBackdrop={undefined}
                onHardwareBackPress={undefined}
                onDismiss={() => {
                    // TODO: Handle dismiss
                }}
                snapPoints={['50%']}>
                <Animated.View style={tailwind.style(`p-4 pb-[${bottom + 16}px]`)}>
                    <Animated.Text style={tailwind.style('text-base mb-4')}>
                        {userLanguageStrings.LooksLikeYouSkippedBookingTicketForThisJourney}{' '}
                        {userLanguageStrings.YouCanEasilyBookOneForYourNextJourneyUsingNammaTransitOption(appName)}
                    </Animated.Text>
                    <Button
                        type="primary"
                        text={userLanguageStrings.GoBack}
                        onPress={() => {
                            smartTicketModalRef.current?.dismiss();
                        }}
                        testID="ab208fa2-5cc4-407a-95bc-1508d90ebf7c"
                    />
                </Animated.View>
            </PopUpModal>
        </>
    );
};
