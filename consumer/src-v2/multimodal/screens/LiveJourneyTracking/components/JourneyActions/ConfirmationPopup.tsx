import { RideOptionsConfirmationPopup } from '../../Types';
import { isLegOngoing } from '@/typescript/utils/LegStatusUtils';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import React from 'react';

type RideOptionConfirmationProps = {
    confirmationPopupType: RideOptionsConfirmationPopup;
    leg: legInfo | undefined;
    isLoading: boolean;
    onDismiss: () => void;
    onSkipLeg: () => void;
    onCancelJourney: () => void;
    onStartJourney: () => void;
    onGoHome: (() => void) | undefined;
};

export const RideOptionConfirmationPopup = (props: RideOptionConfirmationProps) => {
    const { confirmationPopupType, leg, onSkipLeg, onCancelJourney, onStartJourney, onDismiss, onGoHome } = props;
    const { cancelJourneyBottomSheetModalRef } = useRefsContext();

    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const closePopup = () => {
        cancelJourneyBottomSheetModalRef.current?.dismiss();
        onDismiss();
    };
    return (
        <PopUpModal
            backgroundStyle={{ backgroundColor: themeColors.Fill_neutralLow }}
            sheetRef={cancelJourneyBottomSheetModalRef}
            handleComponent={null}
            enableDynamicSizing={true}
            onDismiss={closePopup}
            bottomInset={0}
            showBackdrop={undefined}
            isScrollable={false}
            onHardwareBackPress={undefined}>
            <BottomSheetView style={tailwind.style(' rounded-2')}>
                <Animated.View
                    style={{
                        backgroundColor: 'white',
                        paddingHorizontal: 16,
                        paddingVertical: 24,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                    }}>
                    <ModalContentView
                        onSkipLeg={onSkipLeg}
                        onCancelJourney={onCancelJourney}
                        onStartJourney={onStartJourney}
                        onDismiss={onDismiss}
                        confirmationPopupType={confirmationPopupType}
                        leg={leg}
                        isLoading={props.isLoading}
                        onGoHome={onGoHome}
                    />
                </Animated.View>
            </BottomSheetView>
        </PopUpModal>
    );
};

const ModalContentView = ({
    onSkipLeg,
    onStartJourney,
    confirmationPopupType,
    leg,
    isLoading,
    onDismiss,
    onGoHome,
}: RideOptionConfirmationProps) => {
    const { cancelJourneyBottomSheetModalRef } = useRefsContext();
    const closePopup = () => {
        cancelJourneyBottomSheetModalRef.current?.dismiss();
        onDismiss();
    };
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const popupConfig = (() => {
        switch (confirmationPopupType) {
            case RideOptionsConfirmationPopup.CONFIRM_SKIP_LEG:
                return {
                    title: userLanguageStrings.SkipRide,
                    message: userLanguageStrings.AreYouSureYouWantToSkipThisRide,
                    primaryButton: {
                        text: userLanguageStrings.DontSkip,
                        action: closePopup,
                    },
                    secondaryButton: { text: userLanguageStrings.SkipRide, action: onSkipLeg },
                };
            case RideOptionsConfirmationPopup.CANCEL_JOURNEY:
                return {
                    title: userLanguageStrings.StartJourney,
                    message:
                        leg?.travelMode === 'Taxi' && isLegOngoing(leg)
                            ? userLanguageStrings.YoucantcancelthejourneyduringanongoingautorideAskthedrivertoendtherideandthenyoucancancelyourjourney
                            : userLanguageStrings.Startjourneynoworgobacktothehomescreen,
                    primaryButton:
                        leg?.travelMode === 'Taxi' && isLegOngoing(leg)
                            ? {
                                  text: userLanguageStrings.Okay,
                                  action: closePopup,
                              }
                            : {
                                  text: userLanguageStrings.GoHome,
                                  action: () => {
                                      if (onGoHome) onGoHome();
                                      closePopup();
                                  },
                              },
                    secondaryButton:
                        leg?.travelMode === 'Taxi' && isLegOngoing(leg)
                            ? null
                            : {
                                  text: userLanguageStrings.StartJourney,
                                  action: () => {
                                      onStartJourney();
                                      closePopup();
                                  },
                              },
                };
            default:
                return null;
        }
    })();

    if (!popupConfig) return null;

    return (
        <>
            <Typography
                type="subhead-800"
                style={tailwind.style('text-xl font-semibold leading-[40px]')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={true}
                accessibilityLabel={popupConfig.title}
                accessibilityRole={undefined}>
                {popupConfig.title}
            </Typography>
            <Typography
                type="subhead-800"
                style={tailwind.style('mt-[20px] text-[#EA4848] font-semibold leading-[23px]')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={true}
                accessibilityLabel={popupConfig.message}
                accessibilityRole={undefined}>
                {popupConfig.message}
            </Typography>
            <Button
                type="primary"
                text={popupConfig.primaryButton.text}
                style={{ marginTop: 20, justifyContent: 'center' }}
                onPress={() => popupConfig.primaryButton.action()}
                testID={'55782b70-b023-4774-8c4b-0ffbc85f830a'}
            />
            {popupConfig.secondaryButton && (
                <Button
                    type="secondary"
                    text={popupConfig.secondaryButton?.text}
                    style={tailwind.style('justify-center items-center border-0 mt-2')}
                    onPress={() =>
                        popupConfig.secondaryButton !== null ? popupConfig.secondaryButton.action() : () => {}
                    }
                    isLoading={isLoading}
                    disabled={isLoading}
                    testID={'51410f96-c1b0-4099-8896-c007c0e7b149'}
                />
            )}
        </>
    );
};
