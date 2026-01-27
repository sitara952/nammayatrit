import Button from '@/src-v2/primitives/Button';
import React, { useMemo } from 'react';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { isNull, isUndefined } from 'lodash';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Shimmer from '../../screens/Search/components/SearchSectionListItem/Shimmer';
import { PaymentFooterWithoutPPWidget } from '../../screens/JourneyInfoScreen/components/PaymentFooterWithoutPPWidget';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { DeviceChangePopUp } from '../../screens/JourneyInfoScreen/components/SubwayPopUps/DeviceChangePopUp';
import { SubwayErrorPopUp } from '../../screens/JourneyInfoScreen/components/SubwayPopUps/SubwayErrorPopUp';
import { SubwayErrorPopUpType } from './hooks/useSubwayErrors';
import { TicketSelectorModalBS } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/TicketSelectorModalBS';
import { JourneyPaymentModalProps, JourneyPaymentUIProps } from './Types';
import { useMetroSubwayServiceability } from '@/src-v2/multimodal/hooks/useMetroSubwayServiceability';
import { calculateTotalTickets } from './Types';
import { calculateOriginalTotalFareForLeg, calculateDiscountText } from './journeyPaymentUtils';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const PaymentFooterLoader = React.memo(() => {
    return (
        <Animated.View
            style={tailwind?.style(`px-2 h-[120px] gap-y-4`)}
            entering={SlideInDown.springify().damping(50).stiffness(400)}>
            <View style={tailwind.style('flex-row h-[50px] px-4 ')}>
                <View style={tailwind.style('flex-row gap-x-2')}>
                    <Animated.View style={tailwind.style('mt-[13px]')}>
                        <Shimmer
                            finalOpacity={1}
                            height={30}
                            width={250}
                            borderRadius={10}
                            backgroundColor={'#CFCFD580'}
                        />
                    </Animated.View>
                    <Animated.View style={tailwind.style('mt-[13px]')}>
                        <Shimmer
                            finalOpacity={1}
                            height={50}
                            width={100}
                            borderRadius={50}
                            backgroundColor={'#CFCFD580'}
                        />
                    </Animated.View>
                </View>
            </View>
            <View style={tailwind.style('flex-row h-[126px] gap-x-4 px-4')}>
                <View style={tailwind.style('flex-row gap-x-2')}>
                    <Animated.View style={tailwind.style('mt-[13px]')}>
                        <Shimmer
                            finalOpacity={1}
                            height={50}
                            width={175}
                            borderRadius={10}
                            backgroundColor={'#CFCFD580'}
                        />
                    </Animated.View>
                    <Animated.View style={tailwind.style('mt-[13px]')}>
                        <Shimmer
                            finalOpacity={1}
                            height={50}
                            width={175}
                            borderRadius={10}
                            backgroundColor={'#CFCFD580'}
                        />
                    </Animated.View>
                </View>
            </View>
        </Animated.View>
    );
});

interface StartJourneyButtonProps {
    handleOnPress: () => void;
    isLoading: boolean;
    utsError: SubwayErrorPopUpType | undefined;
}

const StartJourneyButton = (props: StartJourneyButtonProps) => {
    const { utsError, handleOnPress, isLoading } = props;
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { deviceChangeModalRef, subwayPopUpModalRef } = useRefsContext();
    const themeColors = configManager.get('themeColors');
    const onPress = () => {
        switch (utsError) {
            case undefined:
                handleOnPress();
                break;
            case SubwayErrorPopUpType.DeviceChange:
                deviceChangeModalRef?.current?.present();
                break;
            default:
                subwayPopUpModalRef.current?.present();
        }
    };
    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                testID={`75c6fa66-38d6-4da8-bb98-1328288002f5`}
                accessibilityRole="button"
                accessibilityLabel={`Start Journey button`}
                {...handlers}
                style={tailwind.style(
                    `flex-row  h-[64px] rounded-[18px] bg-[${themeColors.Button_primary_default_fill_base}] ${
                        utsError && 'opacity-60'
                    } items-center justify-center  w-full `,
                )}
                onPress={onPress}>
                {isLoading && (
                    <LottieWithFallback
                        fallback={undefined}
                        style={tailwind.style('w-[40px] h-[50px] m-auto')}
                        source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                        autoPlay
                        loop
                    />
                )}
                {isLoading ? null : (
                    <>
                        {/* Center container - absolute positioning */}
                        <Animated.View
                            style={tailwind.style('absolute left-0 right-0 h-full items-center justify-center')}>
                            <Animated.Text
                                style={tailwind.style(
                                    `text-[16px] font-areaNormal-extrabold leading-[22px] text-[${themeColors.Button_Primary_Default_Text_Base}]`,
                                )}>
                                {userLanguageStrings.StartJourney}
                            </Animated.Text>
                        </Animated.View>
                    </>
                )}
            </Pressable>
        </Animated.View>
    );
};

export const JourneyPaymentUI = (props: JourneyPaymentUIProps) => {
    const { bottom } = useSafeAreaInsets();
    const bottomViewPadding = useMemo(() => (bottom ? bottom : 16), [bottom]);
    const {
        legs,
        offer,
        isConfirmingJourney,
        fetchingLegsFare,
        utsError,
        totalFare,
        totalPayableFare,
        onConfirm,
        loadingDataForLeg,
        hasBookableLeg,
        hideLoader,
        journeySegments,
        loadingTrainViaPoints,
        isViaModalShown,
        legRideOptionsPopup,
        setIsTicketModalOpen,
        isJourneyInfoModalVisible,
        setIsJourneyInfoModalVisible,
        alwaysShowPaymentFooter,
        onGoBack,
        legCategorySelections,
        handleCategoryQuantityChange,
        getCategoryDiscount,
    } = props;
    const { ticketSelectorModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { isMetroServiceable, isSubwayServiceable } = useMetroSubwayServiceability(undefined);

    const totalTicketCount = calculateTotalTickets(legCategorySelections);

    const originalTicketValue = useMemo(() => {
        return legCategorySelections.reduce((total, legCategorySelection) => {
            const totalQuantity = calculateTotalTickets([legCategorySelection]);
            if (legCategorySelection.cashPayment || (legCategorySelection.passApplicable && totalQuantity === 1)) {
                return total;
            }
            return (
                total +
                calculateOriginalTotalFareForLeg(legCategorySelection.categories, legCategorySelection.selections)
            );
        }, 0);
    }, [legCategorySelections]);

    const discountText = useMemo(() => {
        const discountParts: string[] = legCategorySelections
            .map(leg => {
                return calculateDiscountText(leg.categories, leg.selections, `${leg.travelMode.toLowerCase()} ticket`);
            })
            .filter((discount): discount is string => !isUndefined(discount));
        return discountParts.length > 0 ? discountParts.join('\n') : undefined;
    }, [legCategorySelections]);

    if (
        (!isMetroServiceable && journeySegments.some(segment => segment.type === 'metro')) ||
        (!isSubwayServiceable && journeySegments.some(segment => segment.type === 'train'))
    ) {
        return null;
    }
    return (
        <Animated.View
            style={[
                tailwind?.style(`absolute bottom-0 pb-[${bottomViewPadding}px] w-full bg-white`),
                {
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 6,
                    },
                    shadowOpacity: 0.15,
                    shadowRadius: 7.49,

                    elevation: 12,
                    overflow: 'visible',
                },
            ]}>
            {hasBookableLeg || alwaysShowPaymentFooter ? (
                <PaymentFooterWithoutPPWidget
                    offer={offer}
                    totalFare={totalFare}
                    totalPayableFare={totalPayableFare}
                    journeyModes={journeySegments.map(item => item.type) ?? []}
                    handleOnPress={onConfirm}
                    isLoading={
                        legs.length === 0 ||
                        !isNull(loadingDataForLeg) ||
                        isConfirmingJourney ||
                        fetchingLegsFare ||
                        hideLoader === true ||
                        loadingTrainViaPoints ||
                        !isViaModalShown
                    }
                    ticketSelectorModalRef={ticketSelectorModalRef}
                    isSwitchPopupOpen={legRideOptionsPopup !== null}
                    setIsTicketModalOpen={setIsTicketModalOpen}
                    totalTicketCount={totalTicketCount}
                    originalTicketValue={originalTicketValue}
                    discountText={discountText}
                />
            ) : (!hasBookableLeg &&
                  legs.length > 0 &&
                  isNull(loadingDataForLeg) &&
                  !isConfirmingJourney &&
                  !fetchingLegsFare) ||
              utsError ? (
                <Animated.View style={tailwind.style('flex-1 px-4 py-4')}>
                    <StartJourneyButton
                        handleOnPress={() => onConfirm({ skipPayment: true, viaOfferButton: false })}
                        isLoading={false}
                        utsError={utsError}
                    />
                </Animated.View>
            ) : hideLoader ? (
                <PaymentFooterLoader />
            ) : null}
            {setIsJourneyInfoModalVisible && (
                <AnimatedModal
                    visible={isJourneyInfoModalVisible}
                    setVisible={setIsJourneyInfoModalVisible}
                    onClose={() => {
                        setIsJourneyInfoModalVisible(false);
                    }}
                    onHardwareBackPress={() => {
                        setIsJourneyInfoModalVisible(false);
                        onGoBack();
                        return true;
                    }}
                    allowCloseOnBackdropPress={false}>
                    <Animated.View style={tailwind.style(`p-4 pb-[${bottom + 16}px]`)}>
                        <Animated.Text style={tailwind.style('text-lg font-bold mb-2')}>
                            {userLanguageStrings.NoJourneysFound}
                        </Animated.Text>
                        <Animated.Text style={tailwind.style('text-base mb-4')}>
                            {userLanguageStrings.WecouldntfindanyjourneysforyourselectedroutePleasetryagain}
                        </Animated.Text>
                        <Button
                            type="primary"
                            text={'Go Back'}
                            onPress={() => {
                                setIsJourneyInfoModalVisible(false);
                                onGoBack();
                            }}
                            testID="ab208fa2-5cc4-407a-95bc-1508d90ebf7c"
                        />
                    </Animated.View>
                </AnimatedModal>
            )}
            <SubwayErrorPopUp />
            <DeviceChangePopUp onConfirm={() => onConfirm({ skipPayment: false, viaOfferButton: false })} />
            <JourneyPaymentModal
                {...props}
                onModalDismiss={() => setIsTicketModalOpen?.(false)}
                ticketSelectorModalRef={ticketSelectorModalRef}
                journeyModes={journeySegments.map(item => item.type) ?? []}
                isLoading={legs.length === 0 || !isNull(loadingDataForLeg) || isConfirmingJourney}
                handleOnPress={() => onConfirm({ skipPayment: false, viaOfferButton: false })}
                legCategorySelections={legCategorySelections}
                handleCategoryQuantityChange={handleCategoryQuantityChange}
                getCategoryDiscount={getCategoryDiscount}
            />
        </Animated.View>
    );
};

export const JourneyPaymentModal = (props: JourneyPaymentModalProps) => {
    const {
        ticketSelectorModalRef,
        journeyModes,
        handleOnPress,
        isLoading,
        hasSubwayLeg,
        onModalDismiss,
        legCategorySelections,
        handleCategoryQuantityChange,
        getCategoryDiscount,
    } = props;

    return (
        <PopUpModal
            sheetRef={ticketSelectorModalRef}
            isScrollable={false}
            onHardwareBackPress={() => ticketSelectorModalRef.current?.dismiss()}
            enableDynamicSizing={true}
            showBackdrop={undefined}
            bottomInset={0}>
            <TicketSelectorModalBS
                sheetRef={ticketSelectorModalRef}
                journeyModes={journeyModes}
                handleOnPress={handleOnPress}
                isLoading={isLoading}
                hasSubwayLeg={hasSubwayLeg}
                onModalDismiss={onModalDismiss}
                legCategorySelections={legCategorySelections}
                handleCategoryQuantityChange={handleCategoryQuantityChange}
                getCategoryDiscount={getCategoryDiscount}
            />
        </PopUpModal>
    );
};
