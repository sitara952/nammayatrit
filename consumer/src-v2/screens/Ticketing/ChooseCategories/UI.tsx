import React, { useState, useCallback, memo, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import ChevronUp from '@/typescript/assets/svg/symbols/ChevronUp';
import {
    CategoryAction,
    CategoryScreenProps,
    PassengerCategoryQuantities,
    PeopleCategoriesData,
    SelectedBusinessHours,
    SelectedCategories,
    ServiceCategory,
    SlotInterval,
    TicketServiceData,
} from './Types';
import { createAction, Resolver } from '@/typescript/utils/common';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import calendarImage from '@/typescript/assets/ticketing/ys_black_calendar.webp';
import personIcon from '@/typescript/assets/ticketing/ys_person_icon.webp';
import bottomChevron from '@/typescript/assets/ticketing/ys_blue_chevron_bottom.webp';
import topChevron from '@/typescript/assets/ticketing/ys_blue_chevron_top.webp';
import { Calendar, DateData } from 'react-native-calendars';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import Button from '@/src-v2/primitives/Button';
import {
    convertUTCToISTAnd12HourFormat,
    findMinPriceCategory,
    getFilteredSlots,
    shouldDisplayIncDscView,
} from '../utils/ticketingHelper';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setToastProps, setToastVisible } from '@/typescript/state/client/session';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import colors from '@/typescript/designSystem/colorPalette';
import plusIcon from '@/typescript/assets/ny_ic_plus.webp';
import minusIcon from '@/typescript/assets/ny_ic_minus.webp';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const DashedLine: React.FC = memo(() => {
    return (
        <View style={styles.dashedLineContainer}>
            {Array.from({ length: 20 }).map((_, index) => (
                <View key={index} style={[styles.dashDot, { backgroundColor: '#F5F5F5' }]} />
            ))}
        </View>
    );
});

const TopBar: React.FC<{ mpDispatch: Resolver<CategoryAction>; placeName: string | undefined }> = memo(
    ({ mpDispatch, placeName }) => {
        return (
            <Animated.View style={styles.topBar}>
                <TouchableOpacity
                    testID="901ead7d-af8c-4a17-8e6a-0b0d2c328317"
                    accessible={true}
                    accessibilityHint="Go Back"
                    accessibilityRole="button"
                    onPress={() => mpDispatch(createAction('PRESSED_BACK', undefined))}
                    style={{ marginRight: 16 }}>
                    <ChevronLeftIcon />
                </TouchableOpacity>
                <Animated.View style={styles.eventInfo}>
                    <Typography
                        type="subhead-600"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}
                        style={styles.eventTitle}>
                        {placeName}
                    </Typography>
                </Animated.View>
            </Animated.View>
        );
    },
);

const BottomView: React.FC<{ mpDispatch: Resolver<CategoryAction>; numberOfTickets: number; totalPrice: number }> =
    memo(({ mpDispatch, numberOfTickets, totalPrice }) => {
        const configManager = useConfigContext();
        const themeColors = configManager.get('themeColors');
        const userLanguageStrings = configManager.get('userLanguageStrings');
        return (
            <Animated.View style={[styles.footer]}>
                <Animated.View>
                    <Typography
                        type="body-1"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}
                        style={styles.ticketCount}>
                        {numberOfTickets + ' ' + userLanguageStrings.Tickets}
                    </Typography>
                    <Typography
                        type="title-800"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}
                        style={styles.totalPrice}>
                        ₹{totalPrice}
                    </Typography>
                </Animated.View>
                <TouchableOpacity
                    testID="901ead7d-af8c-4a17-8e6a-0b0d2c328387"
                    style={[styles.payNowButton, { backgroundColor: themeColors.choose_category_button_bg }]}
                    onPress={() => mpDispatch(createAction('PAY_NOW', undefined))}
                    accessibilityRole="button"
                    accessibilityLabel="Pay Now">
                    <Typography
                        type="title-800"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}
                        style={[styles.payNowText, { color: themeColors.choose_category_button_text }]}>
                        {userLanguageStrings.PayNow}
                    </Typography>
                </TouchableOpacity>
            </Animated.View>
        );
    });

const DatePicker: React.FC<{
    mpDispatch: Resolver<CategoryAction>;
    selectedDate: string | undefined;
}> = memo(({ mpDispatch, selectedDate }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={{ marginBottom: 20 }}>
            <Typography
                type="subhead-600"
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}
                style={styles.sectionLabel}>
                {userLanguageStrings.DateofVisit}
            </Typography>
            <TouchableOpacity
                testID="date-picker-button"
                style={styles.datePickerRow}
                onPress={() => mpDispatch(createAction('SHOW_DATE_PICKER', undefined))}
                accessibilityRole="button"
                accessibilityLabel="Select date of visit">
                <Text
                    style={
                        selectedDate
                            ? styles.dateText
                            : { fontSize: 16, color: themeColors.Fill_neutralMid, fontWeight: '500' }
                    }>
                    {selectedDate ? selectedDate : 'MM/DD/YYYY'}
                </Text>
                <Image accessible={false} source={calendarImage} style={{ width: 20, height: 22 }} />
            </TouchableOpacity>
        </Animated.View>
    );
});

const ExpandableDescription: React.FC<{ description: string[] }> = memo(({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const firstPoint = description[0] || '';
    const truncatedText = firstPoint.length > 50 ? firstPoint.substring(0, 50) + '...' : firstPoint;

    return (
        <Animated.View style={styles.featuresList}>
            {!isExpanded ? (
                <Animated.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Animated.View style={{ flexDirection: 'row', flex: 1 }}>
                        <Typography
                            type="title-800"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityRole={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            style={{ fontSize: 15, color: '#5B6777' }}>
                            •
                        </Typography>
                        <Typography
                            type="body"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityRole={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            style={styles.bullet}>
                            {truncatedText}
                        </Typography>
                    </Animated.View>
                    <TouchableOpacity
                        testID="expand_description"
                        onPress={() => setIsExpanded(true)}
                        style={{ marginLeft: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel="Show more description">
                        <ChevronDown height={19} width={19} />
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <>
                    {description.map((points, index) => (
                        <Animated.View
                            key={index}
                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Animated.View style={{ flexDirection: 'row', flex: 1 }}>
                                <Typography
                                    type="title-800"
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}
                                    style={{ fontSize: 15, color: '#5B6777' }}>
                                    •
                                </Typography>
                                <Typography
                                    type="body"
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}
                                    style={styles.bullet}>
                                    {points}
                                </Typography>
                            </Animated.View>
                            {index === 0 && (
                                <TouchableOpacity
                                    testID={`collapse_description_${index}`}
                                    onPress={() => setIsExpanded(false)}
                                    style={{ marginLeft: 8 }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Show less description">
                                    <ChevronUp height={19} width={19} />
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    ))}
                </>
            )}
        </Animated.View>
    );
});

const ServiceSlot: React.FC<{
    mpDispatch: Resolver<CategoryAction>;
    services: TicketServiceData[];
    selectedDate: string | undefined;
    selectedBusinessHours: SelectedBusinessHours;
    passengerCategoryQuantities: PassengerCategoryQuantities;
    selectedCategories: SelectedCategories;
}> = memo(
    ({
        mpDispatch,
        services,
        selectedDate,
        selectedBusinessHours,
        passengerCategoryQuantities,
        selectedCategories,
    }) => {
        const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({});
        const configManager = useConfigContext();
        const themeColors = configManager.get('themeColors');
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const dispatch = useAppDispatch();

        const calculateMaxSlotsPerRow = useCallback(() => {
            const screenWidth = Dimensions.get('window').width;
            const containerPadding = 32;
            const cardPadding = 36;
            const availableWidth = screenWidth - containerPadding - cardPadding;
            const slotWidth = 97;
            const slotGap = 12;
            const maxSlots = Math.floor((availableWidth + slotGap) / (slotWidth + slotGap));
            return Math.max(2, Math.min(maxSlots, 6));
        }, []);

        const getSelectedBusinessHour = useCallback(
            (serviceId: string) => {
                return selectedBusinessHours[`${serviceId}`];
            },
            [selectedBusinessHours],
        );

        const getPassengerQuantity = useCallback(
            (serviceId: string, peopleCategoryId: string) => {
                return passengerCategoryQuantities[`${serviceId}__${peopleCategoryId}`]?.quantity || 0;
            },
            [passengerCategoryQuantities],
        );

        const isBusinessHourSelected = useCallback(
            (serviceId: string, businessHourId: string) => {
                return getSelectedBusinessHour(serviceId) === businessHourId;
            },
            [getSelectedBusinessHour],
        );

        const serviceCategorySlot = useCallback(
            (service: TicketServiceData, selectedCategoryId: string | undefined) => {
                return (
                    <Animated.View style={{ marginTop: 20 }}>
                        <Animated.View style={styles.slotGrid}>
                            {service.serviceCategories.map(category => (
                                <TouchableOpacity
                                    key={category.categoryId}
                                    testID={`category-${category.categoryId}`}
                                    style={[
                                        styles.slotButton,
                                        category.categoryId === selectedCategoryId
                                            ? {
                                                  backgroundColor: themeColors.Fill_neutralLow,
                                                  borderColor: themeColors.Icon_neutralHigh,
                                              }
                                            : {
                                                  backgroundColor: themeColors.Icon_neutralMin,
                                                  borderColor: themeColors.PickupInstructions_pill_border_color,
                                              },
                                    ]}
                                    onPress={() => {
                                        mpDispatch(
                                            createAction('SELECTED_CATEGORY', {
                                                serviceId: service.id,
                                                categoryId: category.categoryId,
                                            }),
                                        );
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Select category ${category.categoryName}`}>
                                    <Typography
                                        type="body"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityRole={undefined}
                                        accessibilityLabel={undefined}
                                        style={[
                                            styles.slotButtonText,
                                            category.categoryId === selectedCategoryId
                                                ? styles.slotButtonTextSelected
                                                : styles.slotButtonTextUnselected,
                                        ]}>
                                        {category.categoryName}
                                    </Typography>
                                </TouchableOpacity>
                            ))}
                        </Animated.View>
                    </Animated.View>
                );
            },
            [mpDispatch],
        );

        const peopleCategorySlot = useCallback(
            (
                peopleCategory: PeopleCategoriesData,
                quantity: number,
                serviceId: string,
                maxTicketSelection: number | undefined,
            ) => {
                return (
                    <Animated.View key={peopleCategory.peopleCategoryId} style={styles.passengerCategoryRow}>
                        <Image
                            accessible={false}
                            source={peopleCategory.iconUrl ? { uri: peopleCategory.iconUrl } : personIcon}
                            style={{
                                width: 14,
                                height: 16,
                                marginRight: 10,
                                marginTop: 1,
                            }}
                        />

                        <View
                            style={{
                                flexDirection: 'row',
                                width: '55%',
                                flexWrap: 'wrap',
                                flex: 1,
                            }}>
                            <Typography
                                type="body"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessibilityRole={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                style={styles.passengerCategoryName}>
                                {peopleCategory.peopleCategoryName}
                                {' / '}
                            </Typography>
                            <Typography
                                type="body"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityRole={undefined}
                                accessibilityLabel={undefined}
                                style={styles.passengerCategoryPrice}>
                                {'₹'}
                                {peopleCategory.pricePerUnit}
                            </Typography>
                        </View>
                        <Animated.View style={styles.passengerCategoryControl}>
                            {quantity > 0 ? (
                                <Animated.View style={styles.passengerStepper}>
                                    <TouchableOpacity
                                        testID={`decrement-${peopleCategory.peopleCategoryId}-${serviceId}`}
                                        style={styles.stepperButton}
                                        onPress={() => {
                                            mpDispatch(
                                                createAction('DECREMENT_PASSENGER_CATEGORY', {
                                                    serviceId: serviceId,
                                                    peopleCategoryId: peopleCategory.peopleCategoryId,
                                                    price: peopleCategory.pricePerUnit || 0,
                                                }),
                                            );
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Decrease quantity for ${peopleCategory.peopleCategoryName}`}>
                                        <Image
                                            accessible={false}
                                            source={minusIcon}
                                            style={{
                                                width: 22,
                                                height: 24,
                                            }}
                                        />
                                    </TouchableOpacity>
                                    <Typography
                                        type="title-800"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessibilityRole={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        style={styles.stepperCount}>
                                        {quantity.toString().padStart(2, '0')}
                                    </Typography>
                                    <TouchableOpacity
                                        testID={`increment-${peopleCategory.peopleCategoryId}-${serviceId}`}
                                        style={styles.stepperButton}
                                        onPress={() => {
                                            if (maxTicketSelection && quantity > maxTicketSelection - 1) {
                                                dispatch(
                                                    setToastProps({
                                                        visible: true,
                                                        message:
                                                            userLanguageStrings.HoldOnMaxTicketsPerBooking(
                                                                maxTicketSelection,
                                                            ),
                                                        backgroundColor: `${colors?.primitive.black[2]}`,
                                                        autoDismissAfter: 3000,
                                                        logo: undefined,
                                                        buttons: [],
                                                        useSpannedToast: undefined,
                                                        bottomSpanDescription: undefined,
                                                        spannerType: undefined,
                                                        dismissButton: () => {
                                                            dispatch(setToastVisible(false));
                                                        },
                                                        onSpannedToastLoad: undefined,
                                                        margin: undefined,
                                                        customToast: undefined,
                                                    }),
                                                );
                                            } else {
                                                mpDispatch(
                                                    createAction('INCREMENT_PASSENGER_CATEGORY', {
                                                        serviceId: serviceId,
                                                        peopleCategoryId: peopleCategory.peopleCategoryId,
                                                        price: peopleCategory.pricePerUnit || 0,
                                                    }),
                                                );
                                            }
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Increase quantity for ${peopleCategory.peopleCategoryName}`}>
                                        <Image
                                            accessible={false}
                                            source={plusIcon}
                                            style={{
                                                width: 24,
                                                height: 24,
                                            }}
                                        />
                                    </TouchableOpacity>
                                </Animated.View>
                            ) : (
                                <TouchableOpacity
                                    testID={`add-${peopleCategory.peopleCategoryId}-${serviceId}`}
                                    style={styles.addCategoryButton}
                                    onPress={() => {
                                        mpDispatch(
                                            createAction('INCREMENT_PASSENGER_CATEGORY', {
                                                serviceId: serviceId,
                                                peopleCategoryId: peopleCategory.peopleCategoryId,
                                                price: peopleCategory.pricePerUnit || 0,
                                            }),
                                        );
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Add ${peopleCategory.peopleCategoryName}`}>
                                    <Typography
                                        type="body"
                                        numberOfLines={undefined}
                                        accessibilityRole={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        style={styles.addCategoryButtonText}>
                                        {userLanguageStrings.Add}
                                    </Typography>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    </Animated.View>
                );
            },
            [mpDispatch],
        );

        const BusinessHourSlot = useCallback(
            (serviceId: string, filteredSlots: SlotInterval[], selectedCategory: ServiceCategory | undefined) => {
                return (
                    <Animated.View style={styles.timeSlotSection}>
                        <Animated.View style={styles.slotGrid}>
                            {(() => {
                                const isExpanded = expandedSlots[serviceId] || false;
                                const maxSlotsToShow = calculateMaxSlotsPerRow();
                                const slotsToDisplay =
                                    isExpanded || filteredSlots.length <= maxSlotsToShow
                                        ? filteredSlots
                                        : filteredSlots.slice(0, maxSlotsToShow);

                                return slotsToDisplay.map(slots => (
                                    <TouchableOpacity
                                        key={slots.bhourId}
                                        testID={`time-slot-${slots.bhourId}`}
                                        style={[
                                            styles.slotButton,
                                            isBusinessHourSelected(serviceId, slots.bhourId)
                                                ? {
                                                      backgroundColor: themeColors.Fill_neutralLow,
                                                      borderColor: themeColors.Icon_neutralHigh,
                                                  }
                                                : {
                                                      backgroundColor: themeColors.Icon_neutralMin,
                                                      borderColor: themeColors.PickupInstructions_pill_border_color,
                                                  },
                                        ]}
                                        onPress={() => {
                                            mpDispatch(
                                                createAction('SELECTED_TIME_SLOT', {
                                                    serviceId: serviceId,
                                                    categoryId: selectedCategory?.categoryId,
                                                    businessHourId: slots.bhourId,
                                                }),
                                            );
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Select time slot ${convertUTCToISTAnd12HourFormat(slots.slot)}`}>
                                        <Typography
                                            type="body"
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityRole={undefined}
                                            accessibilityLabel={undefined}
                                            style={[
                                                styles.slotButtonText,
                                                isBusinessHourSelected(serviceId, slots.bhourId)
                                                    ? styles.slotButtonTextSelected
                                                    : styles.slotButtonTextUnselected,
                                            ]}>
                                            {convertUTCToISTAnd12HourFormat(slots.slot)}
                                        </Typography>
                                    </TouchableOpacity>
                                ));
                            })()}
                        </Animated.View>

                        {filteredSlots.length > calculateMaxSlotsPerRow() && (
                            <TouchableOpacity
                                testID={`toggle-slots-${serviceId}`}
                                style={styles.viewSlotsButton}
                                onPress={() => {
                                    setExpandedSlots(prev => ({
                                        ...prev,
                                        [serviceId]: !prev[serviceId],
                                    }));
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    expandedSlots[serviceId] ? 'Close time slots' : 'View more time slots'
                                }>
                                <Typography
                                    type="title-800"
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    style={styles.viewSlotsText}>
                                    {expandedSlots[serviceId]
                                        ? userLanguageStrings.CloseSlots
                                        : userLanguageStrings.ViewSlots}
                                </Typography>
                                <Text style={styles.viewSlotsArrow}>
                                    {expandedSlots[serviceId] ? (
                                        <Image
                                            accessible={false}
                                            source={topChevron}
                                            style={{ width: 15, height: 8 }}
                                        />
                                    ) : (
                                        <Image
                                            accessible={false}
                                            source={bottomChevron}
                                            style={{ width: 15, height: 8 }}
                                        />
                                    )}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                );
            },
            [mpDispatch, expandedSlots, isBusinessHourSelected, calculateMaxSlotsPerRow],
        );

        const filterServices = useMemo(() => {
            return [...services].sort((a, b) => {
                const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
                const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                const minPriceA = findMinPriceCategory(a.serviceCategories);
                const minPriceB = findMinPriceCategory(b.serviceCategories);
                return minPriceA - minPriceB;
            });
        }, [services]);

        return (
            <Animated.View style={{ marginTop: 15 }}>
                {filterServices.map(service => {
                    const selectedCategoryId = selectedCategories[service.id];
                    const selectedCategory = service.serviceCategories.find(
                        category => category.categoryId === selectedCategoryId,
                    );
                    const filteredSlots = getFilteredSlots(
                        selectedCategory?.validOpDay?.slot || [],
                        selectedDate || '',
                    );
                    const displayPeopleCategory = selectedCategory
                        ? shouldDisplayIncDscView(selectedCategory.validOpDay, getSelectedBusinessHour(service.id))
                        : false;
                    const maxTicketSelection =
                        selectedCategory && selectedCategory.maxSelection ? selectedCategory.maxSelection : undefined;
                    const minPrice = findMinPriceCategory(service.serviceCategories);
                    const description =
                        selectedCategory && selectedCategory.categoryDetails.length > 0
                            ? selectedCategory.categoryDetails
                            : service.serviceDetails;
                    return (
                        <Animated.View key={service.id} style={styles.ticketCard}>
                            <Animated.View style={styles.ticketHeader}>
                                <Animated.View style={{ width: '75%' }}>
                                    <Typography
                                        type="subhead-600"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessibilityRole={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        style={styles.ticketTitle}>
                                        {service.serviceName}
                                    </Typography>
                                </Animated.View>
                                <Animated.View
                                    style={{
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}>
                                    <Typography
                                        type="title-800"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessibilityRole={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        style={styles.ticketTitlePrice}>
                                        {'₹' + minPrice}
                                    </Typography>
                                    <Typography
                                        type="body"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessibilityRole={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        style={{
                                            fontSize: 12,
                                            color: '#7B8997',
                                            marginTop: -3,
                                        }}>
                                        {userLanguageStrings.Onwards}
                                    </Typography>
                                </Animated.View>
                            </Animated.View>
                            {description.length > 0 && <ExpandableDescription description={description} />}

                            {(service.serviceCategories?.length || 0) > 1 &&
                                serviceCategorySlot(service, selectedCategoryId)}

                            {filteredSlots.length > 0 &&
                                selectedCategory &&
                                BusinessHourSlot(service.id, filteredSlots, selectedCategory)}

                            {displayPeopleCategory && (
                                <>
                                    <DashedLine />
                                    <Animated.View style={styles.passengerCategorySection}>
                                        {selectedCategory?.peopleCategories.map(peopleCategory => {
                                            const quantity = getPassengerQuantity(
                                                service.id,
                                                peopleCategory.peopleCategoryId,
                                            );
                                            return peopleCategorySlot(
                                                peopleCategory,
                                                quantity,
                                                service.id,
                                                maxTicketSelection,
                                            );
                                        })}
                                    </Animated.View>
                                </>
                            )}
                        </Animated.View>
                    );
                })}
            </Animated.View>
        );
    },
);

const ChooseCategoriesUI: React.FC<CategoryScreenProps> = props => {
    const { top, bottom } = useSafeAreaInsets();
    const { datePickerRef } = useRefsContext();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [selectedDate, setSelectedDate] = useState<string>(props.selectedDate);

    return (
        <HardwareBackpressHandler
            onHardwareBackPress={() => {
                props.mpDispatch(createAction('PRESSED_BACK', undefined));
            }}>
            <Animated.View style={[styles.container, { paddingTop: top, marginBottom: bottom }]}>
                <TopBar mpDispatch={props.mpDispatch} placeName={props.placeName} />
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <DatePicker mpDispatch={props.mpDispatch} selectedDate={props.selectedDate} />
                    {props.services ? (
                        <ServiceSlot
                            mpDispatch={props.mpDispatch}
                            services={props.services}
                            selectedDate={props.selectedDate}
                            selectedBusinessHours={props.selectedBusinessHours}
                            passengerCategoryQuantities={props.passengerCategoryQuantities}
                            selectedCategories={props.selectedCategories}
                        />
                    ) : null}
                    {props.numberOfTickets > 0 ? <Animated.View style={{ height: 70 }} /> : null}
                </ScrollView>
                {props.numberOfTickets > 0 ? (
                    <BottomView
                        mpDispatch={props.mpDispatch}
                        numberOfTickets={props.numberOfTickets}
                        totalPrice={props.totalPrice}
                    />
                ) : null}
                <PopUpModal
                    sheetRef={datePickerRef}
                    enableDynamicSizing={true}
                    onHardwareBackPress={undefined}
                    showBackdrop={undefined}
                    onDismiss={() => setSelectedDate(props.selectedDate)}
                    isScrollable={false}>
                    <Animated.View style={{ paddingHorizontal: 16, paddingBottom: bottom, paddingTop: 8 }}>
                        <Animated.View style={[styles.topBar, { marginBottom: 16 }]}>
                            <TouchableOpacity
                                testID="901ead7d-af8c-4a17-8e6a-0b0d2c328318"
                                accessible={true}
                                accessibilityHint="Go Back"
                                accessibilityRole="button"
                                onPress={() => {
                                    datePickerRef.current?.dismiss();
                                }}>
                                <ChevronLeftIcon />
                            </TouchableOpacity>
                            <Animated.View style={[styles.eventInfo, { alignItems: 'center' }]}>
                                <Typography
                                    type="title-800"
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    style={[styles.eventTitle, { fontSize: 17, marginRight: 25 }]}>
                                    {userLanguageStrings.SelectDate}
                                </Typography>
                            </Animated.View>
                        </Animated.View>
                        <Calendar
                            initialDate={selectedDate}
                            maxDate={props.endDate}
                            minDate={props.operationalDate}
                            style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, marginBottom: 25 }}
                            onDayPress={(day: DateData) => {
                                setSelectedDate(day.dateString);
                            }}
                            markingType="custom"
                            markedDates={{
                                ...props.markedDates,
                                [selectedDate]: {
                                    customStyles: {
                                        container: {
                                            backgroundColor: themeColors.marked_date_selected_bg,
                                            borderRadius: 20,
                                            width: 33,
                                            height: 33,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        },
                                        text: {
                                            color: 'white',
                                            fontWeight: 'bold',
                                        },
                                    },
                                },
                            }}
                        />
                        <Button
                            testID="apply_selected_dates"
                            type="primary"
                            text={'Apply'}
                            accessibilityLabel="Select Date of Visit"
                            onPress={() => {
                                props.mpDispatch(createAction('SELECTED_DATE', { date: selectedDate }));
                                datePickerRef.current?.dismiss();
                            }}
                        />
                    </Animated.View>
                </PopUpModal>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

export default React.memo(ChooseCategoriesUI);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
        paddingHorizontal: 16,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FB',
        marginTop: 10,
    },

    eventInfo: {
        flex: 1,
        alignItems: 'center',
        marginRight: 38,
    },
    eventTitle: {
        color: '#14171F',
    },
    eventDetails: {
        fontSize: 12,
        color: '#78747C',
        marginTop: 2,
    },
    scrollContent: {
        paddingTop: 16,
    },
    sectionLabel: {
        fontSize: 15,
        color: '#78747C',
        marginBottom: 8,
    },
    datePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 18,
        justifyContent: 'space-between',
    },
    dateText: {
        fontSize: 16,
        color: '#14171F',
        fontWeight: '500',
    },
    calendarIcon: {
        fontSize: 20,
    },
    ticketCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderColor: '#F5F5F5',
        padding: 18,
        marginBottom: 16,
        paddingBottom: 20,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketTitle: {
        fontSize: 16,
        color: '#14171F',
    },
    ticketTitlePrice: {
        fontSize: 22,
        color: '#14171F',
    },
    featuresList: {
        marginTop: 15,
        marginBottom: 4,
    },
    bullet: {
        fontSize: 13,
        color: '#5B6777',
        marginLeft: 8,
        lineHeight: 20,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    ticketCount: {
        color: '#7B8997',
        fontSize: 13,
    },
    totalPrice: {
        color: '#14171F',
        fontSize: 19,
        fontWeight: '700',
    },
    payNowButton: {
        backgroundColor: '#252525',
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payNowText: {
        color: '#FDCB6B',
        fontSize: 15,
    },
    dashedLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
    },
    dashDot: {
        width: 12,
        height: 1,
        backgroundColor: '#F5F5F5',
    },
    timeSlotSection: {
        marginTop: 20,
        marginBottom: 10,
    },
    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        rowGap: 20,
    },
    slotButton: {
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 10,
        width: 97,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotButtonText: {
        fontSize: 14,
    },
    slotButtonTextSelected: {
        color: '#14171F',
    },
    slotButtonTextUnselected: {
        color: '#5B6777',
    },
    passengerCategorySection: { rowGap: 25 },
    passengerCategoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    passengerCategoryInfo: {
        flexDirection: 'row',
        width: '60%',
        flexWrap: 'wrap',
    },
    passengerCategoryName: {
        fontSize: 16,
        color: '#5B6777',
    },
    passengerCategoryPrice: {
        fontSize: 16,
        color: '#14171F',
    },
    passengerCategoryControl: {},
    passengerStepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#F1F2F7',
        borderRadius: 10,
        padding: 6,
        height: 43,
    },
    stepperButton: {
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F2F7',
    },
    stepperCount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#14171F',
        minWidth: 24,
        textAlign: 'center',
    },
    addCategoryButton: {
        backgroundColor: '#F1F2F7',
        borderRadius: 10,
        paddingHorizontal: 40,
        height: 43,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCategoryButtonText: {
        fontSize: 17,
        color: '#14171F',
    },
    viewSlotsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    viewSlotsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#016ACD',
        marginRight: 4,
    },
    viewSlotsArrow: { marginTop: 6, marginLeft: 5 },
});
