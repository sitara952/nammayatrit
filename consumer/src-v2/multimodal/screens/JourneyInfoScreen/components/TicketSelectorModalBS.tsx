import React, { useMemo, useRef, useEffect } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import CrossIcon from '@/typescript/assets/svg/symbols/Cross';
import { TransitType } from '@/src-v2/multimodal/components/PublicTransportCard/types';
import { getCtaText, PayButton } from './PaymentFooterWithoutPPWidget';
import { colors as configColors } from 'config-types/src/domain/default/themes/colors.ts';
import { selectAppName, setHideLoader, selectAppConfig } from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { isTimeBetween } from '@/typescript/utils/time';
import Button from '@/src-v2/primitives/Button';
import { getVehicleImageForTransit } from '@/typescript/utils/MultiModal';
import { getMaxTicketsForLeg } from '../utils';
import {
    LegCategorySelections,
    LegCategorySelection,
    calculateTotalTickets,
} from '../../../components/JourneyPayment/Types';
import {
    calculateTotalFareForLeg,
    calculateOriginalTotalFareForLeg,
} from '../../../components/JourneyPayment/journeyPaymentUtils';
import { CategorySelector } from './CategorySelector';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';
import { FRFSQuoteCategoryType_fRFSQuoteCategoryType } from '@/readOnly/api/types/Enums.gen';
import { TicketPriceBreakdown } from './TicketPriceBreakdownDetails';

interface TicketSelectorModalBSProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    journeyModes: TransitType[];
    handleOnPress: () => void;
    isLoading: boolean;
    hasSubwayLeg: boolean;
    onModalDismiss?: () => void;
    legCategorySelections: LegCategorySelections;
    handleCategoryQuantityChange?: (
        legOrder: number,
        categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType,
        isIncr: boolean,
    ) => void;
    getCategoryDiscount?: (category: categoryInfoResponse) => number;
}

export const TicketSelectorModalBS: React.FC<TicketSelectorModalBSProps> = ({
    sheetRef,
    journeyModes,
    handleOnPress,
    isLoading,
    hasSubwayLeg,
    onModalDismiss,
    legCategorySelections,
    handleCategoryQuantityChange,
    getCategoryDiscount,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const isBusIncluded = journeyModes.includes('bus');
    const isTrainIncluded = journeyModes.includes('train');
    const isMetroIncluded = journeyModes.includes('metro');
    const isTrainOnly =
        journeyModes.includes('train') && !journeyModes.includes('metro') && !journeyModes.includes('bus');
    const isMetroOnly =
        journeyModes.includes('metro') && !journeyModes.includes('bus') && !journeyModes.includes('train');
    const isBusOnly =
        journeyModes.includes('bus') && !journeyModes.includes('metro') && !journeyModes.includes('train');
    const appName = useAppSelector(selectAppName);

    const appConfig = useAppSelector(selectAppConfig);
    const showBusChildrenText = !appConfig.uiConfig.hideNoTicketRequiredForChildrenBelow5Text && isBusIncluded;

    const totalPayableFare = useMemo(() => {
        return legCategorySelections.reduce((total, legCategorySelection) => {
            const totalQuantity = calculateTotalTickets([legCategorySelection]);
            if (legCategorySelection.cashPayment || (legCategorySelection.passApplicable && totalQuantity === 1)) {
                return total;
            }

            return total + calculateTotalFareForLeg(legCategorySelection.categories, legCategorySelection.selections);
        }, 0);
    }, [legCategorySelections]);

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

    const maxTickets = getMaxTicketsForLeg(hasSubwayLeg);
    const colors = configManager.get('themeColors');
    const currentDate = new Date();
    const dispatch = useAppDispatch();
    const getTime = useMemo(() => {
        if (isTimeBetween(0, 2.5)) {
            return `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${currentDate.getFullYear()}`;
        }
        currentDate.setDate(currentDate.getDate() + 1);
        return `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${currentDate.getFullYear()}`;
    }, [currentDate]);

    // Accessibility focus management
    const modalContentRef = useRef<View>(null);
    const accessibilityManager = useAccessibilityFocus({
        mainContentRef: modalContentRef,
        focusDelay: 100,
        accessibilityDelay: 50,
        maxStackSize: 20,
    });

    // Set focus on modal when it mounts
    useEffect(() => {
        if (modalContentRef.current) {
            accessibilityManager.setFocus(modalContentRef);
        }
    }, []);

    const onCtaButtonPress = () => {
        handleOnPress();
        sheetRef.current?.dismiss();
        dispatch(setHideLoader(true));
    };

    const showDiscountedPrice = useMemo(() => {
        return originalTicketValue > 0 && originalTicketValue !== totalPayableFare;
    }, [originalTicketValue, totalPayableFare]);

    const buttonText =
        totalPayableFare === 0 ? (
            <Animated.Text
                style={tailwind.style(
                    `text-[${colors.Button_Primary_Default_Text_Base}] text-[16px] font-areaNormal-bold text-center`,
                )}>
                {userLanguageStrings.StartJourney}
            </Animated.Text>
        ) : showDiscountedPrice ? (
            <Animated.Text
                style={tailwind.style(
                    `text-[${colors.Button_Primary_Default_Text_Base}] text-[16px] font-areaNormal-bold text-center`,
                )}>
                {getCtaText(
                    journeyModes.filter(mode => !['walk', 'auto'].includes(mode)).map(getVehicleImageForTransit),
                    userLanguageStrings,
                )}{' '}
                <Animated.Text style={{ textDecorationLine: 'line-through' }}>₹{originalTicketValue}</Animated.Text> ₹
                {totalPayableFare}
            </Animated.Text>
        ) : (
            <Animated.Text
                style={tailwind.style(
                    `text-[${colors.Button_Primary_Default_Text_Base}] text-[16px] font-areaNormal-bold text-center`,
                )}>
                {getCtaText(
                    journeyModes.filter(mode => !['walk', 'auto'].includes(mode)).map(getVehicleImageForTransit),
                    userLanguageStrings,
                )}{' '}
                ₹{totalPayableFare}
            </Animated.Text>
        );

    const { bottom } = useSafeAreaInsets();
    return (
        <>
            <Animated.View ref={modalContentRef} style={tailwind.style('bg-[#F7F7F7] rounded-t-3xl p-6 pt-7 pb-0')}>
                <View style={tailwind.style('absolute top-5 right-6 z-10')}>
                    <Pressable
                        accessibilityRole="button"
                        testID="ticket-selector-modal-close-button"
                        accessibilityLabel="Close ticket selector modal"
                        onPress={() => {
                            onModalDismiss?.();
                            sheetRef.current?.dismiss();
                        }}>
                        <Animated.View
                            style={[tailwind.style(`p-[8px] w-6.5 h-6.5 rounded-full bg-[${colors.CrossButton_bg}]`)]}>
                            <CrossIcon fill={configColors.neutral900} />
                        </Animated.View>
                    </Pressable>
                </View>
                <Animated.Text
                    style={tailwind.style(
                        'mb-6 text-[17px] font-areaNormal-extrabold text-[#969696] leading-[16px] tracking-[0.3px] border-b border-[#EBEBEB] pt-1 pb-4',
                    )}>
                    {journeyModes.length > 1
                        ? userLanguageStrings.JourneyTickets
                        : journeyModes.length === 1 && journeyModes[0]
                          ? userLanguageStrings.SingleModeTickets(
                                getUserLanguageStringsForMode(journeyModes[0], userLanguageStrings),
                            )
                          : userLanguageStrings.TicketsPlural}
                </Animated.Text>

                {legCategorySelections.map((legCategorySelection: LegCategorySelection) => {
                    if (!legCategorySelection.cashPayment && handleCategoryQuantityChange && getCategoryDiscount) {
                        return (
                            <>
                                <CategorySelector
                                    categories={legCategorySelection.categories}
                                    selections={legCategorySelection.selections}
                                    legOrder={legCategorySelection.legOrder}
                                    travelMode={legCategorySelection.travelMode}
                                    onQuantityChange={handleCategoryQuantityChange}
                                    maxTotalTickets={maxTickets}
                                    hasSubwayLeg={hasSubwayLeg}
                                    getCategoryDiscount={getCategoryDiscount}
                                />
                                <View style={tailwind.style('h-4')} />
                            </>
                        );
                    }
                    return null;
                })}
                {
                    <View
                        style={
                            showBusChildrenText
                                ? tailwind.style('bg-white rounded-[16px] p-4 mb-7 mr-0.5')
                                : tailwind.style('rounded-[16px] mr-0.5')
                        }>
                        {isTrainIncluded ? (
                            <View style={tailwind.style('flex-row items-start')}>
                                <View
                                    style={tailwind.style(
                                        'w-[7px] h-[7px] rounded-full bg-[rgba(199,199,199,0.7)] mt-[7px] mr-2',
                                    )}
                                />
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-areaNormal font-500 text-[#656565] leading-[21px]',
                                    )}>
                                    {!isTrainOnly ? `${userLanguageStrings.SubUrban}: ` : ''}
                                    {userLanguageStrings.NoTicketRequiredForChildrenBelow5}
                                </Animated.Text>
                            </View>
                        ) : null}
                        {isMetroIncluded && (
                            <View style={tailwind.style('flex-row items-start')}>
                                <View
                                    style={tailwind.style(
                                        'w-[7px] h-[7px] rounded-full bg-[rgba(199,199,199,0.7)] mt-[7px] mr-2',
                                    )}
                                />
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-areaNormal font-500 text-[#656565] leading-[21px]',
                                    )}>
                                    {!isMetroOnly ? `${userLanguageStrings.Metro}: ` : ''}
                                    {userLanguageStrings.NoTicketRequiredForChildrenBelow3Feet}
                                </Animated.Text>
                            </View>
                        )}
                        {isBusIncluded && showBusChildrenText ? (
                            <View style={tailwind.style('flex-row items-start')}>
                                <View
                                    style={tailwind.style(
                                        'w-[7px] h-[7px] rounded-full bg-[rgba(199,199,199,0.7)] mt-[7px] mr-2',
                                    )}
                                />
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-areaNormal font-500 text-[#656565] leading-[21px]',
                                    )}>
                                    {!isBusOnly ? `${userLanguageStrings.bus}: ` : ''}
                                    {userLanguageStrings.NoTicketRequiredForChildrenBelow5}
                                </Animated.Text>
                            </View>
                        ) : null}
                        {isMetroIncluded ? (
                            <View style={tailwind.style('flex-row items-start')}>
                                {appName !== 'nammaYatri' ? (
                                    <>
                                        <View
                                            style={tailwind.style(
                                                'w-[7px] h-[7px] rounded-full bg-[rgba(199,199,199,0.7)] mt-[7px] mr-2',
                                            )}
                                        />
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[14px] font-areaNormal font-500 text-[#656565] leading-[21px]',
                                            )}>
                                            {!isMetroOnly ? `${userLanguageStrings.Metro}: ` : ''}
                                            {userLanguageStrings.QRWillOpenGateOnce}
                                        </Animated.Text>
                                    </>
                                ) : (
                                    <Animated.View style={{ flexDirection: 'column', gap: 14 }}>
                                        <Animated.View style={{ flexDirection: 'row' }}>
                                            <View
                                                style={tailwind.style(
                                                    'w-[7px] h-[7px] rounded-full bg-[rgba(199,199,199,0.7)] mt-[7px] mr-2',
                                                )}
                                            />
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[14px] font-areaNormal font-500 text-[#656565] leading-[21px]',
                                                )}>
                                                {userLanguageStrings.TicketValidTill(getTime)}
                                            </Animated.Text>
                                        </Animated.View>
                                        <Animated.View style={{ flexDirection: 'row' }}>
                                            <View
                                                style={tailwind.style(
                                                    'w-[7px] h-[7px] rounded-full bg-[rgba(199,199,199,0.7)] mt-[7px] mr-2',
                                                )}
                                            />
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[14px] font-areaNormal font-500 text-[#656565] leading-[21px]',
                                                )}>
                                                {userLanguageStrings.BangaloreMetroAllowsPurchase}
                                            </Animated.Text>
                                        </Animated.View>
                                    </Animated.View>
                                )}
                            </View>
                        ) : null}
                    </View>
                }
                <TicketPriceBreakdown
                    totalBaseFare={originalTicketValue}
                    totalPayableFare={totalPayableFare}
                    legCategorySelections={legCategorySelections}
                />
            </Animated.View>
            <Animated.View
                style={tailwind.style(
                    'px-4 pt-5 flex-row justify-between items-center gap-[18px] bg-white ',
                    appName === 'anna' ? 'pb-8' : 'pb-4',
                )}>
                <Animated.View style={{ flex: 1, marginBottom: bottom }}>
                    {appName === 'anna' ? (
                        <PayButton
                            transits={journeyModes
                                .filter(mode => !['walk', 'auto'].includes(mode))
                                .map(getVehicleImageForTransit)}
                            amount={totalPayableFare}
                            handleOnPress={handleOnPress}
                            isLoading={isLoading}
                            ticketSelectorModalRef={sheetRef}
                            originalAmount={originalTicketValue}
                        />
                    ) : (
                        <Button testID={'journey_ticket_number_confirm'} onPress={onCtaButtonPress} type={'primary'}>
                            {buttonText}
                        </Button>
                    )}
                </Animated.View>
            </Animated.View>
        </>
    );
};
