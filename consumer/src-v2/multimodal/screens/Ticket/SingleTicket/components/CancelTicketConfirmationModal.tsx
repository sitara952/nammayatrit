import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Shimmer from '@/src-v2/multimodal/screens/Search/components/SearchSectionListItem/Shimmer';
import { useMetroTicketCancellation } from '@/src-v2/multimodal/hooks/useMetroTicketCancellation';
import cancelMetroImage from '@/src-v2/assets/cancelMetro.webp';
import { Icon } from '@/typescript/components/Icon';
import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

type CancelTicketConfirmationModalProps = {
    primaryButtonText: string;
    secondaryButtonText: string;
    journeyId: string | undefined;
    isTicketCancellable: boolean | undefined;
};

// Helper component for amount with shimmer
const AmountWithShimmer = ({
    amount,
    isLoading,
    color = '#3B3A3C',
    width,
}: {
    amount: number | undefined;
    isLoading: boolean;
    color: string | undefined;
    width: number;
}) => {
    if (isLoading) {
        return <Shimmer width={width} height={16} borderRadius={4} />;
    }
    return <Text style={[tailwind.style('text-[14px] font-areaNormal-extrabold'), { color }]}>₹{amount}</Text>;
};

export const CancelTicketConfirmationModal = (props: CancelTicketConfirmationModalProps) => {
    const { handlers: confirmHandlers, animatedStyle: confirmAnimatedStyle } = useScaleAnimation();
    const { handlers: cancelHandlers, animatedStyle: cancelAnimatedStyle } = useScaleAnimation();
    const { secondaryButtonText, journeyId } = props;
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { cancelTicketConfirmationRef } = useRefsContext();

    const { metroTicketCancellationStep, ticketInfo, cancelStatusData, handleSoftCancel, handleFinalCancel } =
        useMetroTicketCancellation(journeyId);

    const onCancel = useCallback(() => {
        cancelTicketConfirmationRef?.current?.dismiss();
    }, [cancelTicketConfirmationRef]);

    useEffect(() => {
        if (metroTicketCancellationStep === 'cancelled' || metroTicketCancellationStep == 'notInitialized') {
            cancelTicketConfirmationRef?.current?.dismiss();
        }
    }, [metroTicketCancellationStep]);

    const { bottom } = useSafeAreaInsets();

    const handleConfirmCancellation = useCallback(async () => {
        handleFinalCancel();
    }, [handleFinalCancel]);

    const isCancellationDataLoading = useMemo(() => {
        return (
            !cancelStatusData ||
            cancelStatusData.cancellationCharges === undefined ||
            cancelStatusData.refundAmount === undefined
        );
    }, [cancelStatusData]);

    const renderContent = () => {
        if (!props.isTicketCancellable) {
            return (
                <>
                    <Animated.View style={tailwind.style('flex-row justify-center ')}>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="cancel metro image"
                            source={cancelMetroImage}
                            style={tailwind.style('w-[169px] h-[52px] mb-[16px] flex')}
                            resizeMode="contain"
                        />
                    </Animated.View>
                    <Animated.View style={{ rowGap: 6 }}>
                        <Text
                            style={tailwind.style(
                                `font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] text-center mx-auto pb-[24px]`,
                            )}>
                            {userLanguageStrings.CancellationIsNotAllowedForCompletedJourney}
                        </Text>
                    </Animated.View>
                </>
            );
        }

        switch (metroTicketCancellationStep) {
            case 'initial':
                return (
                    <>
                        <Animated.View style={tailwind.style('flex-row justify-center ')}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="cancel metro image"
                                source={cancelMetroImage}
                                style={tailwind.style('w-[169px] h-[52px] mb-[16px] flex')}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={{ rowGap: 6 }}>
                            <Text
                                style={tailwind.style(
                                    `font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] text-center mx-auto pb-[24px]`,
                                )}>
                                {userLanguageStrings.AreYouSureYouWantToCancelYourMetroTicketAlongWithYourJourney}
                            </Text>
                        </Animated.View>
                        <Animated.View style={confirmAnimatedStyle}>
                            <Pressable
                                testID="check-cancellation-button"
                                accessibilityLabel="Proceed button"
                                onPress={handleSoftCancel}
                                accessibilityRole="button"
                                {...confirmHandlers}>
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            `rounded-[16px] bg-[${colors.Button_primary_default_fill_base}] h-[56px] flex-row items-center justify-center mb-[12px]`,
                                        ),
                                    ]}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            `font-areaNormal-extrabold text-[16px] text-[${colors.Button_Primary_Default_Text_Base}]`,
                                        )}>
                                        {userLanguageStrings.Proceed}
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                        </Animated.View>
                    </>
                );

            case 'checking':
                return (
                    <>
                        {/* <Animated.View style={tailwind.style("flex-row justify-center ")}>
                                <LottieWithFallback fallback={undefined}
                                    style={tailwind.style('w-[169px] h-[52px] mb-[16px]')}
                                    source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                                    autoPlay
                                    loop
                                />
                            </Animated.View> */}
                        <Animated.View style={{ rowGap: 6 }}>
                            <Text
                                style={tailwind.style(
                                    `font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] text-center mx-auto pb-[24px]`,
                                )}>
                                {userLanguageStrings.CheckingCancellationCharges}
                            </Text>
                        </Animated.View>
                    </>
                );

            case 'showingCharges':
                return (
                    <Animated.View>
                        <Animated.View style={{ marginBottom: 10 }}>
                            <Text
                                style={tailwind.style(
                                    `font-areaNormal-extrabold text-[18px] text-[#3B3A3C] text-left mb-4`,
                                )}>
                                {userLanguageStrings.ConfirmCancellation}
                            </Text>
                            <Text style={tailwind.style(`font-areaNormal-medium text-[16px] text-[#3B3A3C] mb-1`)}>
                                {ticketInfo.destination}
                            </Text>
                            <Text style={tailwind.style(`text-[14px] text-[#656565] mb-4`)}>{ticketInfo.date}</Text>
                        </Animated.View>

                        <Animated.View style={{ marginBottom: 16 }}>
                            <View style={tailwind.style('flex-row justify-between mb-3')}>
                                <Text style={tailwind.style('text-[14px] text-[#3B3A3C] font-areaNormal-medium')}>
                                    {userLanguageStrings.YouPaid}
                                </Text>
                                <AmountWithShimmer
                                    amount={
                                        cancelStatusData
                                            ? (cancelStatusData.cancellationCharges || 0) +
                                              (cancelStatusData.refundAmount || 0)
                                            : undefined
                                    }
                                    isLoading={isCancellationDataLoading}
                                    color="#3B3A3C"
                                    width={48}
                                />
                            </View>
                            <View style={tailwind.style('flex-row justify-between mb-4')}>
                                <Text style={tailwind.style('text-[14px] text-[#3B3A3C] font-areaNormal-medium')}>
                                    {userLanguageStrings.RefundOnCancellation}
                                </Text>
                                <AmountWithShimmer
                                    amount={cancelStatusData?.refundAmount}
                                    isLoading={isCancellationDataLoading}
                                    color="#00C853"
                                    width={48}
                                />
                            </View>
                            {cancelStatusData?.cancellationCharges !== 0 && (
                                <View
                                    style={tailwind.style(
                                        'flex-row justify-between items-center px-2 py-4 rounded-md bg-[#FFFAF1]',
                                    )}>
                                    {!cancelStatusData || cancelStatusData.cancellationCharges === undefined ? (
                                        <Shimmer width="100%" height={14} borderRadius={3} />
                                    ) : (
                                        <Text style={tailwind.style('text-[14px] text-[#656565] flex-1')}>
                                            {userLanguageStrings.CancellationFeeOfWillBeDeducted(
                                                String(cancelStatusData.cancellationCharges),
                                            )}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </Animated.View>

                        {cancelStatusData?.isCancellable !== false && (
                            <Animated.View style={[confirmAnimatedStyle, { marginBottom: 12 }]}>
                                <Pressable
                                    testID="confirm-cancellation-button"
                                    accessibilityLabel="Cancel Ticket button"
                                    accessibilityRole="button"
                                    disabled={isCancellationDataLoading}
                                    onPress={isCancellationDataLoading ? undefined : handleConfirmCancellation}
                                    {...confirmHandlers}>
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                `rounded-[16px] bg-[${colors.Button_primary_default_fill_base}] h-[56px] flex-row items-center justify-center`,
                                            ),
                                        ]}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                `font-areaNormal-extrabold text-[16px] text-[${colors.Button_Primary_Default_Text_Base}] mr-2`,
                                            )}>
                                            {userLanguageStrings.CancelTicket}
                                        </Animated.Text>
                                        <Icon
                                            icon={<DoubleArrowsWhite fill={colors.Button_Primary_Default_Text_Base} />}
                                            color={colors.Button_Primary_Default_Text_Base}
                                        />
                                    </Animated.View>
                                </Pressable>
                            </Animated.View>
                        )}
                    </Animated.View>
                );
            case 'cancelling':
                return (
                    <>
                        <Animated.View style={tailwind.style('flex-row justify-center ')}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="cancel metro image"
                                source={cancelMetroImage}
                                style={tailwind.style('w-[169px] h-[52px] mb-[16px] flex')}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={{ rowGap: 6 }}>
                            <Text
                                style={tailwind.style(
                                    `font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] text-center mx-auto pb-[24px]`,
                                )}>
                                {userLanguageStrings.CancellationIsInProgress}
                            </Text>
                        </Animated.View>
                    </>
                );
            case 'cancelled':
                return (
                    <>
                        <Animated.View style={tailwind.style('flex-row justify-center ')}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="cancel metro image"
                                source={cancelMetroImage}
                                style={tailwind.style('w-[169px] h-[52px] mb-[16px] flex')}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={{ rowGap: 6 }}>
                            <Text
                                style={tailwind.style(
                                    `font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] text-center mx-auto pb-[24px]`,
                                )}>
                                {userLanguageStrings.YourJourneyHasBeenCancelledSuccessfully}
                            </Text>
                        </Animated.View>

                        {/* <Animated.View style={confirmAnimatedStyle}>
                                <Pressable testID="close-button-1" onPress={onCancel} {...confirmHandlers}>
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                `rounded-[16px] bg-[${colors.Button_primary_default_fill_base}] h-[56px] flex-row items-center justify-center mb-[12px]`,
                                            ),
                                        ]}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                `font-areaNormal-extrabold text-[16px] text-[${colors.Button_Primary_Default_Text_Base}]`,
                                            )}>
                                            {userLanguageStrings.Close}
                                        </Animated.Text>
                                    </Animated.View>
                                </Pressable>
                            </Animated.View> */}
                    </>
                );

            case 'journeyStarted':
                return (
                    <>
                        <Animated.View style={tailwind.style('flex-row justify-center ')}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="cancel metro image"
                                source={cancelMetroImage}
                                style={tailwind.style('w-[169px] h-[52px] mb-[16px] flex')}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={{ rowGap: 6 }}>
                            {/* <Text
                                    style={tailwind.style(
                                        `font-areaNormal-extrabold text-[18px] w-[90%] text-[#3B3A3C] text-center mx-auto pb-[12px]`,
                                    )}>
                                    {"Cancel Ticket"}
                                </Text> */}
                            <Text
                                style={tailwind.style(
                                    `font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] text-center mx-auto pb-[24px]`,
                                )}>
                                {userLanguageStrings.YourJourneyHasAlreadyStartedYouCannotCancelTheTicketNow}
                            </Text>
                        </Animated.View>

                        <Animated.View style={confirmAnimatedStyle}>
                            <Pressable
                                testID="close-button"
                                accessibilityRole="button"
                                onPress={onCancel}
                                accessibilityLabel="Close button"
                                {...confirmHandlers}>
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            `rounded-[16px] bg-[${colors.Button_primary_default_fill_base}] h-[56px] flex-row items-center justify-center mb-[12px]`,
                                        ),
                                    ]}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            `font-areaNormal-extrabold text-[16px] text-[${colors.Button_Primary_Default_Text_Base}]`,
                                        )}>
                                        {userLanguageStrings.Close}
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                        </Animated.View>
                    </>
                );
            case 'notCancellable':
                return (
                    <>
                        <Animated.View style={tailwind.style('flex-row justify-center ')}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="cancel metro image"
                                source={cancelMetroImage}
                                style={tailwind.style('w-[169px] h-[52px] mb-[16px] flex')}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={{ rowGap: 6 }}>
                            <Text
                                style={tailwind.style(
                                    `font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] text-center mx-auto pb-[24px]`,
                                )}>
                                {userLanguageStrings.CancellationIsNotAllowedForThisTicket}
                            </Text>
                        </Animated.View>

                        <Animated.View style={confirmAnimatedStyle}>
                            <Pressable
                                testID="close-button-3"
                                accessibilityRole="button"
                                onPress={onCancel}
                                accessibilityLabel="Close button"
                                {...confirmHandlers}>
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            `rounded-[16px] bg-[${colors.Button_primary_default_fill_base}] h-[56px] flex-row items-center justify-center mb-[12px]`,
                                        ),
                                    ]}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            `font-areaNormal-extrabold text-[16px] text-[${colors.Button_Primary_Default_Text_Base}]`,
                                        )}>
                                        {userLanguageStrings.Close}
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                        </Animated.View>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <PopUpModal
            sheetRef={cancelTicketConfirmationRef}
            enableDynamicSizing={true}
            isScrollable={false}
            onHardwareBackPress={onCancel}
            showBackdrop={true}
            enablePanDownToClose={false}
            enableContentPanningGesture={false}
            enableHandlePanningGesture={false}
            backgroundStyle={tailwind.style('rounded-[28px] bg-[#FFFFFF]')}>
            <BottomSheetView style={tailwind.style('px-5')}>
                <Animated.View style={{ paddingBottom: bottom, paddingTop: 22 }}>
                    {renderContent()}
                    {(metroTicketCancellationStep === 'initial' || metroTicketCancellationStep === 'showingCharges') &&
                        secondaryButtonText && (
                            <Animated.View style={cancelAnimatedStyle}>
                                <Pressable
                                    testID="favourites-cancel-delete-button"
                                    accessibilityLabel="Close button"
                                    accessibilityRole="button"
                                    onPress={onCancel}
                                    {...cancelHandlers}>
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                'rounded-[20px] h-[56px] flex-row items-center justify-center bg-[#E5E5E5]',
                                            ),
                                        ]}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'font-areaNormal-extrabold text-[16px] text-[#3B3A3C]',
                                            )}>
                                            {secondaryButtonText}
                                        </Animated.Text>
                                    </Animated.View>
                                </Pressable>
                            </Animated.View>
                        )}
                </Animated.View>
            </BottomSheetView>
        </PopUpModal>
    );
};
