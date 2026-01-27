import { passAPIEntity } from '@/readOnly/api/types/PassAPIEntity.gen';
import { purchasedPassAPIEntity } from '@/readOnly/api/types/PurchasedPassAPIEntity.gen';
import EditIcon from '@/typescript/assets/svg/symbols/EditIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { BottomSheetBackgroundProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-native-date-picker';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';
import { BottomSheetBackdrop } from '../../../../../src/typescript/components/common/BottomSheetBackdrop';
import { useRefsContext } from '../../../../../src/typescript/context/RefsContext';
import mtIcMtcMockTicket from '../../../../assets/mt_ic_bus_sheet_bg.webp';
import mtIcGoldenTicket from '../../../../assets/mt_ic_golden_pass.webp';
import mtIcSilverTicket from '../../../../assets/mt_ic_silver_pass.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import PassCalendarIcon from '@/src-v2/assets/svg/PassCalendarIcon';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { EventName, EventPrefix, logEvent, logPrefixEvent } from '@/typescript/utils/logger';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import * as Haptics from 'react-native-haptic-feedback';
import { TouchableHighlight } from 'react-native';
import {
    candidateEndDate,
    formatDateToString,
    IST_OFFSET_MS,
    makeDateAtISTMidnight,
    toISTDateParts,
} from '../utils/passUtils';

interface BuyBussPassOptionsSheetProps {
    passes?: passAPIEntity[];
    purchasedPasses?: purchasedPassAPIEntity[];
    isLoading: boolean;
    isValidity: boolean;
    onConfirm: (selectedPass: passAPIEntity | undefined) => void;
    handleConfirmValidity: (data: { startDate: Date; endDate: Date }) => void;
    onDismiss?: () => void;
}

const BuyBussPassOptionsSheetComponent: React.FC<BuyBussPassOptionsSheetProps> = ({
    passes,
    purchasedPasses,
    isValidity = false,
    handleConfirmValidity = () => {},
    onConfirm,
    onDismiss,
}) => {
    const { buyBussPassOptionsSheetRef } = useRefsContext();
    const [selectedPassId, setSelectedPassId] = useState<string | undefined>(undefined);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const defaultPassStartDate = newFeatureFlags.defaultPassStartDate;
    const hapticFeedback = useHaptic(Haptics.HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    // Helper function to find the next valid date without conflicts
    const findNextValidDate = useCallback(
        (fromDate: Date, selectedPass: passAPIEntity | undefined): Date => {
            if (!selectedPass || !purchasedPasses || purchasedPasses.length === 0) {
                return fromDate;
            }

            const maxDaysToCheck = 60;
            for (const i of Array.from({ length: maxDaysToCheck }, (_, idx) => idx)) {
                const candidateDate = new Date(fromDate);
                candidateDate.setDate(candidateDate.getDate() + i);

                const testStartDate = new Date(candidateDate);
                const testEndDate = candidateEndDate(testStartDate);

                const hasConflict = purchasedPasses.some(purchased => {
                    if (purchased.status !== 'Active') return false;

                    const purchasedStartDate = new Date(purchased.startDate);
                    const purchasedExpiryDate = new Date(purchased.expiryDate);

                    const hasDateOverlap = testStartDate <= purchasedExpiryDate && purchasedStartDate <= testEndDate;

                    if (!hasDateOverlap) return false;

                    const purchasedCode = purchased.passEntity?.passDetails?.code;
                    const availableCode = selectedPass.code;

                    return purchasedCode != null && purchasedCode === availableCode;
                });

                if (!hasConflict) {
                    return candidateDate;
                }
            }

            return fromDate;
        },
        [purchasedPasses],
    );

    const defaultStartDate = useMemo(() => {
        const today = new Date();
        const currentDay = today.getDate();

        // If current day > 15, set start date to today
        if (defaultPassStartDate === 'today' || (defaultPassStartDate === 'default' && currentDay > 15)) {
            const { y, m, d } = toISTDateParts(today);
            return makeDateAtISTMidnight(y, m, d);
        }

        // Otherwise, set to 16th of current month
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-based
        return new Date(currentYear, currentMonth, 16);
    }, []);

    const [startDate, setStartDate] = useState<Date>(defaultStartDate);
    const [endDate, setEndDate] = useState<Date>(() => {
        return candidateEndDate(startDate);
    });

    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState<boolean>(false);
    const [_isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    useEffect(() => {
        if (passes && passes.length > 0 && passes[0]) {
            setSelectedPassId(passes[0].id);
        }
    }, [passes]);

    // Calculate the next valid date from today (considering conflicts)
    const nextValidFromToday = useMemo(() => {
        const today = new Date();
        const { y, m, d } = toISTDateParts(today);
        const istToday = makeDateAtISTMidnight(y, m, d);
        const pass = passes?.find(p => p.id === selectedPassId);
        return findNextValidDate(istToday, pass);
    }, [passes, selectedPassId, findNextValidDate, purchasedPasses]);

    // Calculate next valid date from the default start date (considering conflicts)
    const nextValidFromDefault = useMemo(() => {
        const pass = passes?.find(p => p.id === selectedPassId);
        return findNextValidDate(defaultStartDate, pass);
    }, [defaultStartDate, passes, selectedPassId, findNextValidDate, purchasedPasses]);

    const nextValid16th = useMemo(() => {
        const date = nextValidFromDefault;
        const { y, m, d } = toISTDateParts(date);
        console.warn(y, m, d);
        if (d <= 16) {
            return makeDateAtISTMidnight(y, m, 16);
        }
        return makeDateAtISTMidnight(y, m + 1, 16);
    }, []);

    const handleTodayButtonPress = useCallback(() => {
        hapticFeedback();
        // Use the pre-calculated next valid date from today
        logEvent(EventName.USER_CLICKED_TODAY_RENEWAL);
        setStartDate(nextValidFromToday);
        setEndDate(candidateEndDate(nextValidFromToday));
    }, [nextValidFromToday]);

    const handleCustomButtonPress = useCallback(() => {
        hapticFeedback();
        logEvent(EventName.USER_CLICKED_CUSTOM_RENEWAL);
        setStartDate(nextValid16th);
        setEndDate(candidateEndDate(nextValid16th));
    }, [nextValid16th]);

    const handleSelectPass = useCallback((passId: string) => {
        logPrefixEvent(EventPrefix.User_Clicked, passId);
        setSelectedPassId(passId);
    }, []);

    const onHardwareBackPress = useCallback(() => {}, []);

    const renderBackdrop = useCallback(
        (backdropProps: BottomSheetBackgroundProps) => (
            <BottomSheetBackdrop
                sheetRef={buyBussPassOptionsSheetRef}
                onHardwareBackPress={onHardwareBackPress}
                {...backdropProps}
                showBackdrop={true}
            />
        ),
        [buyBussPassOptionsSheetRef, onHardwareBackPress],
    );

    const selectedPass = useMemo(() => {
        return passes?.find(pass => pass.id === selectedPassId);
    }, [passes, selectedPassId]);

    // Validate and update start date when selected pass changes
    useEffect(() => {
        if (selectedPass) {
            const validDate = findNextValidDate(startDate, selectedPass);
            if (validDate.getTime() !== startDate.getTime()) {
                setStartDate(validDate);
                setEndDate(candidateEndDate(validDate));
            }
        }
    }, [selectedPass]);

    const handleConfirmPass = useCallback(() => {
        onConfirm(selectedPass);
    }, [selectedPass, onConfirm]);

    const handleConfirmValidityWithCheck = useCallback(() => {
        // Date validation is now handled by the date picker's minimum/maximum dates
        // No need to check for conflicts here as invalid dates are already disabled
        logEvent(EventName.USER_PASS_CONFIRMED);
        handleConfirmValidity({
            startDate,
            endDate,
        });
    }, [handleConfirmValidity, startDate, endDate]);

    const formatDate = useCallback(
        (date: Date, showTodayText: boolean = true): string => {
            return formatDateToString(date, showTodayText, userLanguageStrings.Today);
        },
        [userLanguageStrings.Today],
    );

    const getStartDateLabel = useCallback((date: Date): string => {
        try {
            const todayIST = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
            const dateIST = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

            if (dateIST === todayIST) {
                return userLanguageStrings.Today;
            }

            // Calculate days difference
            const today = new Date();
            const { y: todayY, m: todayM, d: todayD } = toISTDateParts(today);
            const todayMidnight = makeDateAtISTMidnight(todayY, todayM, todayD);

            const daysDiff = Math.round((date.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff > 0) {
                return daysDiff === 1
                    ? userLanguageStrings.OneDayFromToday
                    : userLanguageStrings.XDaysFromToday(daysDiff);
            }

            return '';
        } catch {
            // Fallback calculation
            const now = new Date();
            const shiftedNow = new Date(now.getTime() + IST_OFFSET_MS);
            const shiftedDate = new Date(date.getTime() + IST_OFFSET_MS);

            const yyyyMMdd = (d: Date) =>
                `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
                    d.getUTCDate(),
                ).padStart(2, '0')}`;

            if (yyyyMMdd(shiftedNow) === yyyyMMdd(shiftedDate)) {
                return userLanguageStrings.Today;
            }

            // Calculate days difference using UTC dates
            const todayY = shiftedNow.getUTCFullYear();
            const todayM = shiftedNow.getUTCMonth() + 1;
            const todayD = shiftedNow.getUTCDate();
            const todayMidnight = makeDateAtISTMidnight(todayY, todayM, todayD);

            const daysDiff = Math.round((date.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff > 0) {
                return daysDiff === 1
                    ? userLanguageStrings.OneDayFromToday
                    : userLanguageStrings.XDaysFromToday(daysDiff);
            }

            return '';
        }
    }, []);

    const isStartDateToday = useCallback((date: Date): boolean => {
        try {
            const todayIST = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
            const dateIST = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
            return dateIST === todayIST;
        } catch {
            // Fallback
            const now = new Date();
            const shiftedNow = new Date(now.getTime() + IST_OFFSET_MS);
            const shiftedDate = new Date(date.getTime() + IST_OFFSET_MS);

            const yyyyMMdd = (d: Date) =>
                `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
                    d.getUTCDate(),
                ).padStart(2, '0')}`;

            return yyyyMMdd(shiftedNow) === yyyyMMdd(shiftedDate);
        }
    }, []);

    const handleStartDateConfirm = useCallback((date: Date) => {
        // Normalize picked date to IST midnight so calculations/display are consistent
        const { y, m, d } = toISTDateParts(date);
        const istStart = makeDateAtISTMidnight(y, m, d);
        setStartDate(istStart);
        setIsStartDatePickerOpen(false);
        setEndDate(candidateEndDate(istStart));
    }, []);

    const handleDatePickerCancel = useCallback(() => {
        setIsStartDatePickerOpen(false);
    }, []);

    const minimumDate = useMemo(() => {
        if (!selectedPass || !purchasedPasses || purchasedPasses.length === 0) {
            const today = new Date();
            const { y, m, d } = toISTDateParts(today);
            return makeDateAtISTMidnight(y, m, d);
        }

        // Find the earliest valid start date that doesn't conflict with active passes
        const today = new Date();
        const { y: todayY, m: todayM, d: todayD } = toISTDateParts(today);
        const istToday = makeDateAtISTMidnight(todayY, todayM, todayD);
        const maxDaysToCheck = 60;

        for (const i of Array.from({ length: maxDaysToCheck }, (_, idx) => idx)) {
            const candidateDate = new Date(istToday);
            candidateDate.setDate(candidateDate.getDate() + i);

            const testStartDate = new Date(candidateDate);
            const testEndDate = candidateEndDate(testStartDate);

            const hasConflict = purchasedPasses.some(purchased => {
                if (purchased.status !== 'Active') return false;

                const purchasedStartDate = new Date(purchased.startDate);
                const purchasedExpiryDate = new Date(purchased.expiryDate);

                const hasDateOverlap = testStartDate <= purchasedExpiryDate && purchasedStartDate <= testEndDate;

                if (!hasDateOverlap) return false;

                const purchasedCode = purchased.passEntity?.passDetails?.code;
                const availableCode = selectedPass.code;

                return purchasedCode != null && purchasedCode === availableCode;
            });

            if (!hasConflict) {
                return candidateDate;
            }
        }

        const today2 = new Date();
        const { y: todayY2, m: todayM2, d: todayD2 } = toISTDateParts(today2);
        return makeDateAtISTMidnight(todayY2, todayM2, todayD2);
    }, [selectedPass, purchasedPasses]);

    const maximumDate = useMemo(() => {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        // Get the last day of next month
        const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
        return lastDayOfNextMonth;
    }, []);

    const calculatedEndDate = useMemo(() => {
        return new Date(new Date(startDate).setDate(startDate.getDate() + 30));
    }, [startDate]);

    const isStartDateTodayMemo = useMemo(() => {
        return isStartDateToday(startDate);
    }, [startDate, isStartDateToday]);

    const upcoming16thFormatted = useMemo(() => {
        // If startDate is not today and not the next valid 16th, show the actual startDate
        const isStartDateToday = startDate.getTime() === nextValidFromToday.getTime();
        const isStartDateNext16th = startDate.getTime() === nextValid16th.getTime();

        const dateToShow = !isStartDateToday && !isStartDateNext16th ? startDate : nextValid16th;

        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Kolkata',
                month: 'short',
                day: 'numeric',
            });
            const parts = formatter.formatToParts(dateToShow);
            const month = parts.find(p => p.type === 'month')?.value?.toLowerCase();
            const day = parts.find(p => p.type === 'day')?.value;

            return userLanguageStrings.ValidFromDayMonth(day ?? '', month ?? '');
        } catch {
            // Fallback formatting
            const shiftedDate = new Date(dateToShow.getTime() + IST_OFFSET_MS);
            const day = String(shiftedDate.getUTCDate());
            const monthIndex = shiftedDate.getUTCMonth();
            const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = MONTH_SHORT[monthIndex] ?? String(monthIndex + 1);

            return userLanguageStrings.ValidFromDayMonth(day, month);
        }
    }, [startDate, nextValid16th, nextValidFromToday]);

    // Check if startDate matches the nextValidFromToday (for animation)
    const isStartDateNextValidFromToday = useMemo(() => {
        return startDate.getTime() === nextValidFromToday.getTime();
    }, [startDate, nextValidFromToday]);

    // Animation for segmented control
    const segmentAnimation = useDerivedValue(
        () => withSpring(isStartDateNextValidFromToday ? 1 : 0, { damping: 34, stiffness: 400 }),
        [isStartDateNextValidFromToday],
    );

    // useEffect(() => {
    //     segmentAnimation.value = withTiming(isStartDateNextValidFromToday ? 1 : 0, {
    //         duration: 300,
    //     });
    // }, [isStartDateNextValidFromToday]);

    const customDateAnimatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(segmentAnimation.value, [0, 1], ['white', '#F4F4F4']),
            // opacity: interpolate(segmentAnimation.value, [0, 1], [1, 0.9]),
            // transform: [{ scale: interpolate(segmentAnimation.value, [0, 1], [1, 0.96]) }],
        };
    });

    const todayDateAnimatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(segmentAnimation.value, [0, 1], ['#F4F4F4', 'white']),
            // opacity: interpolate(segmentAnimation.value, [0, 1], [0.9, 1]),
            // transform: [{ scale: interpolate(segmentAnimation.value, [0, 1], [0.96, 1]) }],
        };
    });

    const customDateTextAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(segmentAnimation.value, [0, 1], ['#3B3A3C', '#3B3A3C']);
        return {
            color,
        };
    });

    const todayDateTextAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(segmentAnimation.value, [0, 1], ['#3B3A3C', '#3B3A3C']);
        return {
            color,
        };
    });

    const renderPassTypesContent = useCallback(() => {
        return (
            <>
                <Animated.Image
                    accessible={false}
                    source={mtIcMtcMockTicket}
                    style={tailwind.style('w-full h-[75px]')}
                />
                <Animated.View style={tailwind.style('mb-5')}>
                    <Animated.Text
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-center text-[#969696]')}>
                        {userLanguageStrings.AvailablePassTypes}
                    </Animated.Text>
                </Animated.View>
                <Animated.View style={tailwind.style('gap-2')}>
                    {passes?.map(pass => {
                        const isSelected = selectedPassId === pass.id;
                        // ! TODO: Get discounted amount from backend
                        const originalAmount = pass.originalAmount ?? pass.amount;
                        const discountedAmount = pass.amount;
                        const hasDiscount = discountedAmount < originalAmount;
                        return (
                            <Pressable
                                key={pass.id}
                                testID={`pass-select-${pass.name?.replace(' ', '_')}`}
                                accessibilityRole="button"
                                accessibilityLabel={`Select ${pass.name} Pass button`}
                                onPress={() => handleSelectPass(pass.id)}>
                                <Animated.View
                                    style={[
                                        tailwind.style('flex-row p-[17px] mx-5 rounded-[20px] bg-white'),
                                        {
                                            borderColor: isSelected ? '#047AEA' : '#F1F2F2',
                                            borderWidth: isSelected ? 3 : 1,
                                        },
                                    ]}>
                                    <Animated.Image
                                        style={tailwind.style('w-[49px] h-[74px] mr-3 rounded-[8px]')}
                                        source={pass.code === 'DIAMOND2000' ? mtIcSilverTicket : mtIcGoldenTicket}
                                        accessibilityLabel={
                                            pass.code === 'DIAMOND2000' ? 'Diamond Ticket Image' : 'Golden Ticket Image'
                                        }
                                    />

                                    <Animated.View style={tailwind.style('flex-1')}>
                                        <Animated.View
                                            style={tailwind.style(
                                                'flex-row justify-between items-center border-b-[1px] border-[#ECEDEF] pb-3',
                                            )}>
                                            <Animated.View style={tailwind.style('flex-1 pr-2')}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[14px] font-areaNormal-extrabold text-[#3A3B3C] tracking-[0.16px] leading-[21px]',
                                                    )}
                                                    numberOfLines={2}>
                                                    {pass.name}
                                                </Animated.Text>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[13px] font-areaNormal-extrabold text-[#7E7E7E] tracking-[0.16px] leading-[18px]',
                                                    )}
                                                    numberOfLines={2}>
                                                    {pass.description ||
                                                        userLanguageStrings.DaysValidity(pass.maxDays || '')}
                                                </Animated.Text>
                                            </Animated.View>

                                            <Animated.View
                                                style={[tailwind.style('flex-col items-end'), { flexShrink: 0 }]}>
                                                <Animated.View
                                                    style={[
                                                        tailwind.style('flex-row relative items-center'),
                                                        { flexShrink: 0 },
                                                    ]}>
                                                    <Animated.Text
                                                        style={tailwind.style(
                                                            'text-[14px] font-inter-regular text-[#313131] tracking-[0.16px] leading-[20px] pt-1.5',
                                                            `${hasDiscount ? 'text-[11px] text-gray-400 pt-0.5' : ''}`,
                                                        )}>
                                                        ₹
                                                    </Animated.Text>
                                                    <Animated.Text
                                                        style={tailwind.style(
                                                            'text-[24px] font-areaNormal-extrabold text-[#313131] leading-[28px]',
                                                            `${hasDiscount ? 'text-[14px] text-gray-400 leading-[18px]' : ''}`,
                                                        )}>
                                                        {originalAmount}
                                                    </Animated.Text>
                                                    {hasDiscount && (
                                                        <Animated.View
                                                            style={[
                                                                tailwind.style('absolute bg-gray-400 left-0 right-0'),
                                                                {
                                                                    height: 1,
                                                                    top: '50%',
                                                                },
                                                            ]}
                                                        />
                                                    )}
                                                </Animated.View>
                                                {hasDiscount ? (
                                                    <Animated.View
                                                        style={[
                                                            tailwind.style('flex-row items-center'),
                                                            { flexShrink: 0 },
                                                        ]}>
                                                        <Animated.Text
                                                            style={tailwind.style(
                                                                'text-[14px] font-inter-regular text-[#313131] tracking-[0.16px] leading-[20px] pt-1.5',
                                                            )}>
                                                            ₹
                                                        </Animated.Text>
                                                        <Animated.Text
                                                            style={tailwind.style(
                                                                'text-[24px] font-areaNormal-extrabold text-[#313131] leading-[28px]',
                                                            )}>
                                                            {discountedAmount}
                                                        </Animated.Text>
                                                    </Animated.View>
                                                ) : null}
                                            </Animated.View>
                                        </Animated.View>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[13px] font-areaNormal-extrabold text-[#7E7E7E] tracking-[0.16px] leading-[18px] pt-2',
                                            )}>
                                            {pass.benefitDescription}
                                        </Animated.Text>
                                    </Animated.View>
                                </Animated.View>
                            </Pressable>
                        );
                    })}
                </Animated.View>
                <Animated.View>
                    <Pressable
                        testID="confirm-pass"
                        accessibilityLabel="Confirm Pass Button"
                        style={tailwind.style(
                            'mx-5 min-h-[58px] items-center justify-center rounded-[36px] bg-[#3B3A3C] rounded-[18px] mt-6',
                        )}
                        onPress={handleConfirmPass}
                        accessibilityRole="button">
                        <Animated.Text
                            style={tailwind.style('text-[14px] font-areaNormal-extrabold text-center text-white')}>
                            {userLanguageStrings.Confirm}
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            </>
        );
    }, [passes, selectedPassId, handleSelectPass, handleConfirmPass]);

    const renderValidityContent = useCallback(() => {
        return (
            <>
                <Animated.Image
                    source={selectedPass?.code === 'DIAMOND2000' ? mtIcSilverTicket : mtIcGoldenTicket}
                    style={tailwind.style(`w-[80px] absolute top-[0px] left-[17px] h-[130px] z-10 shadow-sm`)}
                />
                <Animated.View style={tailwind.style('bg-white mt-12 pt-[110px] rounded-t-[24px] pb-6')}>
                    <Animated.View style={tailwind.style('px-[19px] flex-row items-end justify-between')}>
                        <Animated.View>
                            <Animated.Text
                                style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#7E7E7E]')}>
                                {selectedPass?.description ||
                                    userLanguageStrings.DaysValidity(selectedPass?.maxDays || '')}
                            </Animated.Text>
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style('text-[16px] font-areaNormal-extrabold text-[#3B3A3C] pt-[4px]')}>
                                {selectedPass?.name || userLanguageStrings.Pass}
                            </Animated.Text>
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#09941E] pt-[4px]')}>
                                {selectedPass?.benefitDescription || userLanguageStrings.ValidInAllNonACBuses}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View style={tailwind.style('flex-col items-end')}>
                            {(() => {
                                const originalAmount = selectedPass?.originalAmount ?? selectedPass?.amount ?? 1000;
                                const discountedAmount = selectedPass?.amount;
                                const hasDiscount = discountedAmount && discountedAmount < originalAmount;
                                return (
                                    <>
                                        <Animated.View
                                            style={[
                                                tailwind.style('flex-row relative items-center'),
                                                { flexShrink: 0 },
                                            ]}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[18px] font-inter-regular text-[#313131] pt-1',
                                                    `${hasDiscount ? 'text-[11px] text-gray-400' : ''}`,
                                                )}>
                                                ₹
                                            </Animated.Text>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[32px] font-areaNormal-extrabold text-[#313131]',
                                                    `${hasDiscount ? 'text-[14px] text-gray-400 leading-[18px]' : ''}`,
                                                )}>
                                                {originalAmount}
                                            </Animated.Text>
                                            {hasDiscount && (
                                                <Animated.View
                                                    style={[
                                                        tailwind.style('absolute bg-gray-400 left-0 right-0'),
                                                        {
                                                            height: 1,
                                                            top: '50%',
                                                        },
                                                    ]}
                                                />
                                            )}
                                        </Animated.View>
                                        {hasDiscount ? (
                                            <Animated.View
                                                style={[tailwind.style('flex-row items-center'), { flexShrink: 0 }]}>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[18px] font-inter-regular text-[#313131] pt-2.5',
                                                    )}>
                                                    ₹
                                                </Animated.Text>
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[32px] font-areaNormal-extrabold text-[#313131]',
                                                    )}>
                                                    {discountedAmount}
                                                </Animated.Text>
                                            </Animated.View>
                                        ) : null}
                                    </>
                                );
                            })()}
                        </Animated.View>
                    </Animated.View>
                    <Animated.View style={tailwind.style('px-[19px] pt-[28px] flex-col gap-4')}>
                        {/* Today Option */}
                        <Pressable
                            onPress={handleTodayButtonPress}
                            accessibilityRole="button"
                            accessibilityLabel="Select Today"
                            testID="today-option-button"
                            style={[
                                tailwind.style(
                                    'flex-row items-center justify-between px-4 py-3 rounded-[20px] border-2',
                                ),
                                {
                                    borderColor: isStartDateNextValidFromToday ? '#047AEA' : '#E5E5E5',
                                    backgroundColor: isStartDateNextValidFromToday ? '#F2F8FF' : '#FFFFFF',
                                },
                            ]}>
                            <Animated.View style={tailwind.style('flex-row items-center gap-3')}>
                                <PassCalendarIcon
                                    fill={isStartDateNextValidFromToday ? '#09941E' : '#7E7E7E'}
                                    width={30}
                                    height={31}
                                    isToday={true}
                                />

                                <Animated.View>
                                    <Animated.Text
                                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                                        {userLanguageStrings.Today || 'Today'}{' '}
                                        {' (' + formatDate(nextValidFromToday, false) + ')'}
                                    </Animated.Text>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[10px] font-areaNormal-extrabold text-[#7E7E7E] mt-0.5',
                                        )}>
                                        {userLanguageStrings.ValidTill
                                            ? `${userLanguageStrings.ValidTill} ${formatDate(candidateEndDate(nextValidFromToday), false)}`
                                            : `Valid till ${formatDate(endDate, false)}`}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                        </Pressable>

                        {/* Custom Date Selection Component */}
                        <Pressable
                            onPress={handleCustomButtonPress}
                            accessibilityRole="button"
                            accessibilityLabel="Select Custom Date"
                            testID="custom-date-option-button"
                            style={[
                                tailwind.style(
                                    'flex-row items-center justify-between px-4 py-3 rounded-[20px] border-2',
                                ),
                                {
                                    borderColor: !isStartDateNextValidFromToday ? '#047AEA' : '#E5E5E5',
                                    backgroundColor: !isStartDateNextValidFromToday ? '#F2F8FF' : '#FFFFFF',
                                },
                            ]}>
                            <Animated.View style={tailwind.style('flex-row items-center gap-3')}>
                                {/* Placeholder SVG Icon */}
                                <PassCalendarIcon
                                    fill={!isStartDateNextValidFromToday ? '#E97F06' : '#7E7E7E'}
                                    width={30}
                                    height={31}
                                    isToday={false}
                                />

                                <Animated.View>
                                    <Animated.Text
                                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                                        {formatDate(isStartDateToday(startDate) ? nextValid16th : startDate, false)}
                                    </Animated.Text>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[10px] font-areaNormal-extrabold  text-[#7E7E7E] mt-0.5',
                                        )}>
                                        {userLanguageStrings.ValidTill
                                            ? `${userLanguageStrings.ValidTill} ${formatDate(candidateEndDate(isStartDateToday(startDate) ? nextValid16th : startDate), false)}`
                                            : `Valid till ${formatDate(endDate, false)}`}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                            <TouchableHighlight
                                onPress={() => {
                                    hapticFeedback();
                                    setIsStartDatePickerOpen(true);
                                }}
                                hitSlop={10}
                                style={tailwind.style('ml-2 p-4 rounded-full')}
                                testID="edit-date-button"
                                accessibilityRole="button"
                                accessibilityLabel="Edit Date"
                                underlayColor={'#E0E0E0'}>
                                <EditIcon fill="#969696" />
                            </TouchableHighlight>
                        </Pressable>
                    </Animated.View>
                    <Animated.View style={tailwind.style('px-[19px] mt-2')}>
                        {/* Confirm Button */}
                        <Pressable
                            {...handlers}
                            testID="confirm-validity-button"
                            accessibilityLabel="Confirm Validity Button"
                            onPress={handleConfirmValidityWithCheck}
                            accessibilityRole="button">
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'min-h-[58px] items-center justify-center rounded-[36px] bg-[#047AEA] rounded-[18px] mt-[17px]',
                                    ),
                                    animatedStyle,
                                ]}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-areaNormal-extrabold text-center text-white',
                                    )}>
                                    {userLanguageStrings.Confirm}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                </Animated.View>
                <DatePicker
                    modal
                    mode="date"
                    open={isStartDatePickerOpen}
                    date={new Date()}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    onConfirm={handleStartDateConfirm}
                    onCancel={handleDatePickerCancel}
                />
            </>
        );
    }, [
        startDate,
        endDate,
        formatDate,
        getStartDateLabel,
        isStartDateTodayMemo,
        calculatedEndDate,
        isStartDatePickerOpen,
        handleConfirmValidityWithCheck,
        handleStartDateConfirm,
        handleDatePickerCancel,
        minimumDate,
        maximumDate,
        handlers,
        animatedStyle,
        selectedPass,
        upcoming16thFormatted,
        handleCustomButtonPress,
        handleTodayButtonPress,
        customDateAnimatedStyle,
        todayDateAnimatedStyle,
        customDateTextAnimatedStyle,
        todayDateTextAnimatedStyle,
    ]);

    const { bottom } = useSafeAreaInsets();

    return (
        <>
            {/* {!isValidity && isSheetOpen && (
                <Animated.Image
                    source={mtIcGoldenTicket}
                    style={tailwind.style('w-[100px] h-[149px] absolute top-[-100px] left-0 z-10')}
                />
            )} */}
            <BottomSheetModal
                onChange={index => {
                    setIsSheetOpen(index === 0);
                }}
                backdropComponent={renderBackdrop}
                style={tailwind.style('  overflow-hidden', isValidity ? 'bg-transparent' : 'bg-white rounded-t-[36px]')}
                handleComponent={null}
                enableDynamicSizing
                ref={buyBussPassOptionsSheetRef}
                onDismiss={onDismiss}>
                <BottomSheetView style={tailwind.style(isValidity ? `pb-[${bottom - 30}px]` : `pb-[${bottom}px]`)}>
                    {isValidity ? renderValidityContent() : renderPassTypesContent()}
                </BottomSheetView>
            </BottomSheetModal>
        </>
    );
};

export const BuyBussPassOptionsSheet = React.memo(BuyBussPassOptionsSheetComponent);
