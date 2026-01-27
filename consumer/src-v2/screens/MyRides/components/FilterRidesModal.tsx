import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { Pressable } from '@/src-v2/primitives/Pressable';
import DatePicker from 'react-native-date-picker';
import InfoFilled from '@/typescript/assets/svg/symbols/InfoFilled';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import {
    BillingCategory_billingCategory as Enums_BillingCategory_billingCategory,
    RideBookingListV2BillingCategory_rideBookingListV2BillingCategory,
    RideBookingListV2RideType_rideBookingListV2RideType,
} from '@/readOnly/api/types/Enums.gen';
import { RideType_rideType as Enums_RideType_rideType } from '@/readOnly/api/types/Enums.gen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setToastProps } from '@/typescript/state/client/session';

export type DateFilterOption = 'last7days' | 'currentMonth' | 'lastMonth' | 'custom' | 'default';

export interface FilterState {
    dateFilter: DateFilterOption;
    customStartDate: Date | undefined;
    customEndDate: Date | undefined;
    category?: RideBookingListV2BillingCategory_rideBookingListV2BillingCategory;
    rideType?: RideBookingListV2RideType_rideBookingListV2RideType;
}

interface FilterRidesModalProps {
    initialFilters: FilterState;
    onApply: () => void;
    setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterRidesModal: React.FC<FilterRidesModalProps> = ({ initialFilters, onApply, setFilterState }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const [dateFilter, setDateFilter] = useState<DateFilterOption>(initialFilters.dateFilter);
    const [customStartDate, setCustomStartDate] = useState<Date | undefined>(initialFilters.customStartDate);
    const [customEndDate, setCustomEndDate] = useState<Date | undefined>(initialFilters.customEndDate);
    const [category, setCategory] = useState<
        RideBookingListV2BillingCategory_rideBookingListV2BillingCategory | undefined
    >(initialFilters.category ?? undefined);
    const [rideType, setRideType] = useState<RideBookingListV2RideType_rideBookingListV2RideType | undefined>(
        initialFilters.rideType ?? undefined,
    );

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showDateError, setShowDateError] = useState(false);

    const isDateRangeExceeds30Days = (): boolean => {
        if (!customStartDate || !customEndDate) return false;
        const diffTime = Math.abs(customEndDate.getTime() - customStartDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    };

    const validateCustomDate = (): { isValid: boolean; errorMessage: string | undefined } => {
        if (dateFilter !== 'custom') {
            return { isValid: true, errorMessage: undefined };
        }

        if (!customStartDate && !customEndDate) {
            return { isValid: false, errorMessage: 'Start/End date is missing' };
        }

        if (!customStartDate) {
            return { isValid: false, errorMessage: 'Start date is missing' };
        }

        if (!customEndDate) {
            return { isValid: false, errorMessage: 'End date is missing' };
        }

        if (isDateRangeExceeds30Days()) {
            return { isValid: false, errorMessage: userLanguageStrings.DurationCanBeMaxUpto30days };
        }

        return { isValid: true, errorMessage: undefined };
    };

    const handleApply = () => {
        const validation = validateCustomDate();

        if (!validation.isValid) {
            setShowDateError(true);
            dispatch(
                setToastProps({
                    visible: true,
                    message: validation.errorMessage || 'Invalid date selection',
                    backgroundColor: '#EA4848',
                    autoDismissAfter: 3000,
                    buttons: [],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    logo: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
            return;
        }

        setShowDateError(false);
        onApply();
    };

    const handleStartDateConfirm = (date: Date) => {
        setCustomStartDate(date);
        setFilterState(prev => ({
            ...prev,
            customStartDate: date,
        }));
        setShowStartDatePicker(false);
        setShowDateError(false);
    };

    const handleEndDateConfirm = (date: Date) => {
        setCustomEndDate(date);
        setFilterState(prev => ({
            ...prev,
            customEndDate: date,
        }));
        setShowEndDatePicker(false);
        setShowDateError(false);
    };

    const renderRadio = (isSelected: boolean) => (
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            {isSelected ? <View style={styles.radioInner} /> : null}
        </View>
    );

    const renderDateOption = (option: DateFilterOption, label: string) => {
        const isSelected = dateFilter === option;
        return (
            <TouchableOpacity
                testID={`date-filter-${option}`}
                onPress={() => {
                    setDateFilter(option);
                    setFilterState(prev => ({
                        ...prev,
                        dateFilter: option,
                    }));
                    setShowDateError(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={styles.dateOptionRow}>
                <Typography
                    type="sub-body-700"
                    style={styles.dateOptionLabel}
                    accessibilityLabel={label}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityRole="text">
                    {label}
                </Typography>
                {renderRadio(isSelected)}
            </TouchableOpacity>
        );
    };

    const renderCategoryChip = (
        value: Enums_BillingCategory_billingCategory | undefined,
        label: string,
        currentValue: Enums_BillingCategory_billingCategory | undefined,
        onSelect: (value: Enums_BillingCategory_billingCategory | undefined) => void,
        testID: string,
    ) => {
        const isSelected = currentValue === value;
        return (
            <Pressable
                testID={testID}
                onPress={() => {
                    onSelect(value);
                    setFilterState(prev => ({
                        ...prev,
                        category: value,
                    }));
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={[styles.chip, isSelected && styles.chipSelected]}>
                <Typography
                    type="subhead"
                    style={[styles.chipText, isSelected && styles.chipTextSelected]}
                    accessibilityLabel={label}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityRole="text">
                    {label}
                </Typography>
            </Pressable>
        );
    };

    const renderRideTypeChip = (
        value: Enums_RideType_rideType | undefined,
        label: string,
        currentValue: Enums_RideType_rideType | undefined,
        onSelect: (value: Enums_RideType_rideType | undefined) => void,
        testID: string,
    ) => {
        const isSelected = currentValue === value;
        return (
            <Pressable
                testID={testID}
                onPress={() => {
                    onSelect(value);
                    setFilterState(prev => ({
                        ...prev,
                        rideType: value,
                    }));
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={[styles.chip, isSelected && styles.chipSelected]}>
                <Typography
                    type="subhead"
                    style={[styles.chipText, isSelected && styles.chipTextSelected]}
                    accessibilityLabel={label}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityRole="text">
                    {label}
                </Typography>
            </Pressable>
        );
    };

    const formatDate = (date: Date | undefined): string => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <View style={[styles.container, { paddingBottom: bottom }]}>
            <Typography
                type="subhead-800"
                style={styles.title}
                accessibilityLabel="Filters"
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityRole="header">
                {userLanguageStrings.Filters}
            </Typography>

            <View style={styles.divider} />

            {/* Date Section */}
            <Typography
                type="subhead-700"
                style={styles.sectionTitle}
                accessibilityLabel={userLanguageStrings.Date}
                numberOfLines={1}
                isAnimate={false}
                accessible={true}
                accessibilityRole="text">
                {userLanguageStrings.Date}
            </Typography>

            {renderDateOption('last7days', userLanguageStrings.Last7days)}
            {renderDateOption('currentMonth', userLanguageStrings.Currentmonth)}
            {renderDateOption('lastMonth', userLanguageStrings.Lastmonth)}
            {renderDateOption('custom', userLanguageStrings.Custom)}

            {/* Custom Date Pickers */}
            <View style={styles.customDateContainer}>
                <Pressable
                    testID="start-date-picker-button"
                    style={[
                        styles.datePickerButton,
                        dateFilter !== 'custom' && styles.datePickerButtonDisabled,
                        showDateError && dateFilter === 'custom' && styles.datePickerButtonError,
                    ]}
                    onPress={() => {
                        if (dateFilter === 'custom') {
                            setShowStartDatePicker(true);
                            setShowDateError(false);
                        }
                    }}
                    disabled={dateFilter !== 'custom'}
                    accessibilityLabel="Select start date"
                    accessibilityRole="button">
                    <Typography
                        type="subhead"
                        style={[styles.datePickerText, dateFilter !== 'custom' && styles.datePickerTextDisabled]}
                        accessibilityLabel="Start date"
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityRole="text">
                        {customStartDate ? formatDate(customStartDate) : userLanguageStrings.Start}
                    </Typography>
                </Pressable>
                <Typography
                    type="subhead"
                    style={styles.dateSeparator}
                    accessibilityLabel="-"
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={false}
                    accessibilityRole="text">
                    -
                </Typography>
                <Pressable
                    testID="end-date-picker-button"
                    style={[
                        styles.datePickerButton,
                        dateFilter !== 'custom' && styles.datePickerButtonDisabled,
                        showDateError && dateFilter === 'custom' && styles.datePickerButtonError,
                    ]}
                    onPress={() => {
                        if (dateFilter === 'custom') {
                            setShowEndDatePicker(true);
                            setShowDateError(false);
                        }
                    }}
                    disabled={dateFilter !== 'custom'}
                    accessibilityLabel="Select end date"
                    accessibilityRole="button">
                    <Typography
                        type="subhead"
                        style={[styles.datePickerText, dateFilter !== 'custom' && styles.datePickerTextDisabled]}
                        accessibilityLabel="End date"
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityRole="text">
                        {customEndDate ? formatDate(customEndDate) : userLanguageStrings.End}
                    </Typography>
                </Pressable>
            </View>

            <DatePicker
                modal
                open={showStartDatePicker}
                date={customStartDate || new Date()}
                mode="date"
                maximumDate={customEndDate || new Date()}
                onConfirm={handleStartDateConfirm}
                onCancel={() => setShowStartDatePicker(false)}
            />

            <DatePicker
                modal
                open={showEndDatePicker}
                date={customEndDate || new Date()}
                mode="date"
                minimumDate={customStartDate}
                maximumDate={new Date()}
                onConfirm={handleEndDateConfirm}
                onCancel={() => setShowEndDatePicker(false)}
            />

            <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                    <InfoFilled size={18} />
                </View>
                <Typography
                    type="sub-body-800"
                    style={styles.infoText}
                    accessibilityLabel="Duration can be max upto 30 days"
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityRole="text">
                    {userLanguageStrings.DurationCanBeMaxUpto30days}
                </Typography>
            </View>

            <View style={styles.divider} />

            {/* Category Section */}
            <Typography
                type="subhead-800"
                style={styles.sectionTitle}
                accessibilityLabel="Category"
                numberOfLines={1}
                isAnimate={false}
                accessible={true}
                accessibilityRole="text">
                {userLanguageStrings.Category}
            </Typography>
            <View style={styles.chipsRow}>
                {renderCategoryChip(undefined, userLanguageStrings.All, category, setCategory, 'category-all')}
                {renderCategoryChip(
                    'BUSINESS',
                    userLanguageStrings.Business,
                    category,
                    setCategory,
                    'category-business',
                )}
                {renderCategoryChip(
                    'PERSONAL',
                    userLanguageStrings.Personal,
                    category,
                    setCategory,
                    'category-personal',
                )}
            </View>

            <View style={styles.divider} />

            {/* Ride Type Section */}
            <Typography
                type="subhead-800"
                style={styles.sectionTitle}
                accessibilityLabel={userLanguageStrings.RideTypeLabel}
                numberOfLines={1}
                isAnimate={false}
                accessible={true}
                accessibilityRole="text">
                {userLanguageStrings.RideTypeLabel}
            </Typography>
            <View style={styles.chipsRow}>
                {renderRideTypeChip(undefined, userLanguageStrings.All, rideType, setRideType, 'ridetype-all')}
                {renderRideTypeChip('NORMAL', userLanguageStrings.Regular, rideType, setRideType, 'ridetype-regular')}
                {renderRideTypeChip('RENTAL', userLanguageStrings.Rentals, rideType, setRideType, 'ridetype-rental')}
                {renderRideTypeChip(
                    'INTERCITY',
                    userLanguageStrings.Intercity,
                    rideType,
                    setRideType,
                    'ridetype-intercity',
                )}
            </View>

            <Button
                onPress={handleApply}
                text={userLanguageStrings.Apply}
                testID="apply-filter-button"
                type="primary"
                size="lg"
                style={styles.applyButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 32,
        backgroundColor: '#F8F8F8',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    title: {
        textAlign: 'center',
        color: '#14171F',
        fontSize: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E2E2',
        marginVertical: 16,
    },
    sectionTitle: {
        color: '#14171F',
        fontSize: 16,
        marginBottom: 8,
    },
    dateOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    dateOptionLabel: {
        color: '#14171F',
        fontSize: 13,
        lineHeight: 18,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#C5CAD3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#14171F',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 6,
        backgroundColor: '#14171F',
    },
    customDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 8,
    },
    datePickerButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    datePickerButtonDisabled: {
        backgroundColor: '#F5F5F5',
    },
    datePickerButtonError: {
        borderColor: '#F06767',
    },
    datePickerText: {
        color: '#14171F',
        fontSize: 14,
    },
    datePickerTextDisabled: {
        color: '#999999',
    },
    dateSeparator: {
        color: '#666666',
        fontSize: 14,
        marginHorizontal: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
    },
    infoIcon: {
        marginRight: 6,
    },
    infoIconText: {
        color: '#2196F3',
        fontSize: 14,
    },
    infoText: {
        color: '#5B6777',
        fontSize: 11,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        backgroundColor: '#FFFFFF',
    },
    chipSelected: {
        borderColor: '#14171F',
        backgroundColor: '#14171F',
    },
    chipText: {
        color: '#14171F',
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    applyButton: {
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
});

export default FilterRidesModal;
