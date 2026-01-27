import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mapPng from '@/typescript/assets/ny-service/mt_ic_map_dummy.webp';
import { View, StyleSheet, Platform, Image, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { ScrollView } from 'react-native-gesture-handler';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Header } from '@/src-v2/primitives/Header';
import { BookingDetailLocationCard } from '@/src-v2/screens/MyBookingDetails/components/BookingDetailsLocationCard';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import ChevronRight from '@/typescript/assets/svg/symbols/ChevronRight';
import { HelpAndSupportTopicItem, HelpAndSupportUIProps } from './Types';
import { Icon } from '@/typescript/components/Icon';
import { SupportIcon } from '@/typescript/components/svg/SupportIcon';
import { CabAutoIcon } from '@/typescript/components/svg/CabAutoIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { createAction, loggingOutUser } from '@/typescript/utils/common';
import { FilledInfoIcon } from '@/typescript/assets/svg/symbols/FilledInfoIcon';
import { HistoryIcon } from '@/typescript/assets/svg/symbols/HistoryIcon';
import { DeleteIcon } from '@/typescript/assets/svg/symbols/DeleteIcon';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import DeleteAccountReason from '@/src-v2/components/DeleteAccountReason';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useDeletedPersonPostMutation } from '@/api/integrations/rtk/DeletedPersonPost';
import { useAppDispatch } from '@/typescript/state/hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootNavigationParamList } from '@/typescript/navigation/globalParamList';
import { setToastProps } from '@/typescript/state/client/session';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { MetroIcon } from '@/src-v2/multimodal/components/svg/transport';
import AboutIcon from '@/typescript/assets/svg/symbols/AboutIcon';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import WorkBagIcon from '@/typescript/assets/svg/symbols/WorkBag';
import { helpAndSupportTopic } from '@/src-v2/systems/configs/types';
import { isUndefined } from 'lodash';
import { renderPublicTransportCard } from '../MyBookingDetails/UI';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen';

export const HelpAndSupportUI: React.FC<HelpAndSupportUIProps> = ({
    recentBooking,
    helpAndSupportDispatch,
    activeTickets,
    closedTicketIds,
    ...props
}) => {
    const [showDeleteAccountReasonModal, setShowDeleteAccountReasonModal] = useState(false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<RootNavigationParamList>>();
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [deleteAccount] = useDeletedPersonPostMutation();

    const getTopicItem = (type: helpAndSupportTopic): HelpAndSupportTopicItem | undefined => {
        switch (type) {
            case 'appRelated':
                return {
                    testID: 'd9e7843a-0045-4ad8-8eab-92b84a01b16e',
                    icon: <SupportIcon fill={undefined} />,
                    iconSize: 20,
                    accessibilityLabel: 'App Related Issues',
                    text: userLanguageStrings.AppRelatedIssues,
                    onPress: () => helpAndSupportDispatch(createAction('APP_RELATED_ISSUES', undefined)),
                };
            case 'rideRelated':
                return {
                    testID: '364f9928-3488-4fd1-8f75-16ce3bf9db35',
                    icon: <CabAutoIcon fill={undefined} />,
                    iconSize: 28,
                    accessibilityLabel: 'Ride Related Issues',
                    text: userLanguageStrings.RideRelatedIssues,
                    onPress: () => helpAndSupportDispatch(createAction('RIDE_RELATED_ISSUES', undefined)),
                };
            case 'metroRelated':
                return {
                    testID: 'metro-related-issues',
                    icon: <MetroIcon fill={undefined} />,
                    iconSize: 20,
                    accessibilityLabel: 'Metro Related Issues',
                    text: userLanguageStrings.MetroRelatedIssues,
                    onPress: () => helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'METRO_ISSUE_FAQ')),
                };
            case 'businessProfileRelated':
                return {
                    testID: 'business-profile-issues',
                    icon: <WorkBagIcon color={'black'} />,
                    iconSize: 18,
                    accessibilityLabel: 'Business Profile Issues',
                    text: userLanguageStrings.BusinessAccountIssues,
                    onPress: () => helpAndSupportDispatch(createAction('BUSINESS_PROFILE_ISSUES', undefined)),
                };
            case 'aboutApp':
                return {
                    testID: 'about-app',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'About App',
                    text: userLanguageStrings.AboutApp,
                    onPress: () => helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'ABOUT_APP')),
                };
            case 'appRegistration':
                return {
                    testID: 'about-registration',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'App Registration',
                    text: userLanguageStrings.AppRegistration,
                    onPress: () => helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'APP_REGISTRATION')),
                };
            case 'appFeature':
                return {
                    testID: 'about-features',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'App Features',
                    text: userLanguageStrings.AppFeatures,
                    onPress: () => helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'APP_FEATURES')),
                };
            case 'ticketBooking':
                return {
                    testID: 'about-ticket-booking',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'Ticket Booking',
                    text: userLanguageStrings.TicketBooking,
                    onPress: () => helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'TICKET_BOOKING')),
                };
            case 'busPass':
                return {
                    testID: 'about-bus-pass',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'Bus Pass',
                    text: userLanguageStrings.BusPass,
                    onPress: () => helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'BUS_PASS')),
                };
            case 'journeyRelated':
                return {
                    testID: 'about-journey-related-issues',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'Journey Related Issues',
                    text: userLanguageStrings.JourneyRelatedIssues,
                    onPress: () =>
                        helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'JOURNEY_RELATED_ISSUES')),
                };
            case 'paymentRelated':
                return {
                    testID: 'about-payment-related-issues',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'Payment Related Issues',
                    text: userLanguageStrings.PaymentRelatedIssues,
                    onPress: () =>
                        helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'PAYMENT_RELATED_ISSUES')),
                };
            case 'qrCodeValidation':
                return {
                    testID: 'about-qr-code-and-validation',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'QR Code and Validation',
                    text: userLanguageStrings.QRCodeAndValidation,
                    onPress: () =>
                        helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'QR_CODE_AND_VALIDATION')),
                };
            case 'security':
                return {
                    testID: 'about-security-safety-and-support',
                    icon: <AboutIcon color={'black'} />,
                    iconSize: 20,
                    accessibilityLabel: 'Security, Safety and Support',
                    text: userLanguageStrings.SecuritySafetyAndSupport,
                    onPress: () =>
                        helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', 'SECURITY_SAFETY_AND_SUPPORT')),
                };
            case 'deleteAccount':
                return {
                    testID: 'delete-account',
                    icon: <DeleteIcon fill={undefined} />,
                    iconSize: 20,
                    accessibilityLabel: 'Delete Account',
                    text: userLanguageStrings.DeleteAccount,
                    onPress: () => setShowDeleteAccountReasonModal(true),
                };
            default:
                return undefined;
        }
    };

    const { topicsList, faqList } = useMemo(() => {
        if (props.issueCategories?.categories) {
            const categories = props.issueCategories.categories;
            const backendCategories = categories
                .filter(category => category.categoryType === 'Category')
                .map((category): HelpAndSupportTopicItem => {
                    const imgUrl = category.logoUrl.split(',')[1];
                    return {
                        testID: `issue-category-${category.issueCategoryId}`,
                        icon: imgUrl ? (
                            <Image style={{ height: '100%' }} source={{ uri: imgUrl }} />
                        ) : (
                            <SupportIcon fill={undefined} />
                        ),
                        iconSize: 20,
                        accessibilityLabel: category.label,
                        text: category.category,
                        onPress: () => {
                            if (category.isTicketRequired) {
                                helpAndSupportDispatch(createAction('SELECT_CATEGORY_WITH_TICKET', category));
                            } else if (category.isRideRequired) {
                                helpAndSupportDispatch(createAction('SELECT_CATEGORY_WITH_RIDE', category));
                            } else {
                                helpAndSupportDispatch(createAction('SELECT_CATEGORY', category));
                            }
                        },
                    };
                });

            const faqCategories = categories
                .filter(category => category.categoryType === 'FAQ')
                .map((category): HelpAndSupportTopicItem => {
                    const imgUrl = category.logoUrl.split(',')[1];
                    return {
                        testID: `faq-category-${category.issueCategoryId}`,
                        icon: imgUrl ? (
                            <Image style={{ height: '100%' }} source={{ uri: imgUrl }} />
                        ) : (
                            <SupportIcon fill={undefined} />
                        ), // You might want a different icon for FAQs
                        iconSize: 20,
                        accessibilityLabel: category.label,
                        text: category.category,
                        onPress: () => {
                            helpAndSupportDispatch(createAction('METRO_ISSUE_FAQ_CLICKED', category.issueCategoryId));
                        },
                    };
                });

            return {
                topicsList: backendCategories,
                faqList: [...faqCategories, getTopicItem('deleteAccount')],
            };
        }

        return { topicsList: [], faqList: [] };
    }, [props.issueCategories, helpAndSupportDispatch]);

    const onDeleteSuccess = useCallback(
        (data: aPISuccess) => {
            if (data.result === 'Success') {
                setShowDeleteAccountReasonModal(false);
                focusTimeoutRef.current = setTimeout(() => {
                    dispatch(
                        setToastProps({
                            backgroundColor: `${colors.green700}`,
                            autoDismissAfter: 2000,
                            visible: true,
                            buttons: [],
                            spannerType: 'bottom',
                            message: 'Account Deleted Successfully!',
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            logo: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                    loggingOutUser(dispatch, undefined);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'onboardingNavigation' }],
                    });
                }, 5);
            }
        },
        [dispatch, navigation],
    );

    const onDeleteAccount = useCallback(
        (reason: string) => {
            deleteAccount({
                body: {
                    reasonToDelete: reason,
                },
            })
                .unwrap()
                .then(onDeleteSuccess);
        },
        [onDeleteSuccess],
    );

    useEffect(() => {
        return () => {
            if (focusTimeoutRef.current) {
                focusTimeoutRef.current = null;
            }
        };
    }, []);

    const handleCategoryClick = useCallback(
        (category: issueCategoryRes) => helpAndSupportDispatch(createAction('SELECT_CATEGORY', category)),

        [helpAndSupportDispatch],
    );

    const { bottom } = useSafeAreaInsets();

    return (
        <HardwareBackpressHandler>
            <Animated.View style={styles.container}>
                <Header
                    title={userLanguageStrings.HelpandSupport}
                    onBackPress={() => {
                        helpAndSupportDispatch(createAction('HANDLE_BACKPRESS', undefined));
                    }}
                />
                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}>
                    {/* Recent Ride Card */}
                    {!recentBooking && props.isLoadingRecent && <ActivityIndicator style={{ marginBottom: 20 }} />}
                    {recentBooking && (
                        <View style={{ marginBottom: 20 }}>
                            <View style={styles.rideCardHeader}>
                                <Typography
                                    type="title"
                                    style={styles.rideCardTitle}
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={
                                        recentBooking.tag === 'Ride' ? 'Your Recent Ride' : 'Your Recent Ticket'
                                    }
                                    accessibilityRole={undefined}>
                                    {recentBooking.tag === 'Ride'
                                        ? userLanguageStrings.YourRecentRide
                                        : userLanguageStrings.YourRecentTicket}
                                </Typography>
                                <TouchableOpacity
                                    testID="help-support-view-all-rides"
                                    accessibilityRole="button"
                                    onPress={() =>
                                        helpAndSupportDispatch({ type: 'VIEW_ALL_RIDES', payload: undefined })
                                    }>
                                    <Typography
                                        type="body-subtext"
                                        style={styles.viewAllRides}
                                        numberOfLines={1}
                                        isAnimate={false}
                                        accessible={true}
                                        accessibilityLabel="View All Bookings"
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.ViewAllBookings}
                                    </Typography>
                                </TouchableOpacity>
                            </View>
                            {recentBooking.tag === 'Ride' ? (
                                <View style={styles.rideCardContent}>
                                    <View style={styles.mapImageContainer}>
                                        <Animated.Image
                                            accessibilityLabel="Route map of your recent ride image"
                                            source={mapPng}
                                            style={styles.mapImage}
                                            resizeMode="cover"
                                        />
                                    </View>

                                    <View style={styles.bookingDetails}>
                                        <BookingDetailLocationCard
                                            source={recentBooking.source}
                                            stops={recentBooking.stops}
                                            rideStartTime={recentBooking.rideStartTime}
                                            rideEndTime={recentBooking.rideEndTime}
                                            showTitle={false}
                                            stopsInfo={undefined}
                                        />
                                    </View>

                                    <Divider
                                        type="dashed"
                                        dividerColor={undefined}
                                        strokeDashArray={'6 5'}
                                        direction={undefined}
                                        style={styles.divider}
                                        labelPosition={undefined}
                                        offset={undefined}
                                        offsetBackground={undefined}
                                    />
                                    <TouchableOpacity
                                        testID="help-support-report-issue-this-ride"
                                        accessibilityRole="button"
                                        onPress={() => helpAndSupportDispatch(createAction('REPORT_ISSUE', undefined))}>
                                        <View style={styles.reportIssueContainer}>
                                            <Typography
                                                type="body"
                                                style={styles.reportIssueText}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={'Report an issue with this ride'}
                                                accessibilityRole={undefined}>
                                                {userLanguageStrings.ReportAnIssueWithThisRide}
                                            </Typography>
                                            <ChevronRight color={colors.gray275} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                renderPublicTransportCard(
                                    recentBooking.leg,
                                    0,
                                    props.issueCategories,
                                    handleCategoryClick,
                                )
                            )}
                        </View>
                    )}
                    {activeTickets && activeTickets.length > 0 && (
                        <View>
                            <Typography
                                type="title"
                                style={styles.allTopicsTitle}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Active Tickets"
                                accessibilityRole={undefined}>
                                {userLanguageStrings.ActiveTickets}
                            </Typography>
                            <View style={styles.allTopicsContent}>
                                <View style={styles.topicsContainer}>
                                    {activeTickets && activeTickets.length > 0 && (
                                        <TouchableOpacity
                                            accessibilityRole="button"
                                            testID="active-tickets"
                                            onPress={() =>
                                                helpAndSupportDispatch(
                                                    createAction('ACTIVE_TICKETS_CLICKED', undefined),
                                                )
                                            }>
                                            <View style={[styles.topicItem, { justifyContent: 'flex-start' }]}>
                                                <Icon
                                                    icon={<FilledInfoIcon fill={undefined} />}
                                                    size={activeTickets.length === 1 ? 20 : 30}
                                                    color={themeColors.Text_neutralMax}
                                                />
                                                {activeTickets.length === 1 ? (
                                                    <>
                                                        <Typography
                                                            type="body"
                                                            style={styles.topicText}
                                                            numberOfLines={undefined}
                                                            isAnimate={undefined}
                                                            accessible={undefined}
                                                            accessibilityLabel={
                                                                'You have ' +
                                                                activeTickets.length +
                                                                ' active tickets open'
                                                            }
                                                            accessibilityRole={undefined}>
                                                            {userLanguageStrings.YouhaveXactiveticketsopen(
                                                                activeTickets.length,
                                                            )}
                                                        </Typography>
                                                        <ChevronRight color={colors.gray275} />
                                                    </>
                                                ) : (
                                                    <View>
                                                        <Typography
                                                            type="body"
                                                            style={styles.topicText}
                                                            numberOfLines={undefined}
                                                            isAnimate={undefined}
                                                            accessible={undefined}
                                                            accessibilityLabel={
                                                                'You have ' +
                                                                activeTickets.length +
                                                                ' active tickets open'
                                                            }
                                                            accessibilityRole={undefined}>
                                                            {userLanguageStrings.YouhaveXactiveticketsopen(
                                                                activeTickets.length,
                                                            )}
                                                        </Typography>
                                                        <View
                                                            style={{
                                                                paddingTop: 5,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'flex-start',
                                                            }}>
                                                            <Typography
                                                                type="body"
                                                                style={{
                                                                    marginHorizontal: 12,
                                                                    color: colors.black600,
                                                                    fontWeight: '700',
                                                                }}
                                                                numberOfLines={undefined}
                                                                isAnimate={undefined}
                                                                accessible={undefined}
                                                                accessibilityLabel={'See all tickets'}
                                                                accessibilityRole={undefined}>
                                                                {userLanguageStrings.SeeAllTickets}
                                                            </Typography>
                                                            <View style={{ marginLeft: -10, paddingTop: 3 }}>
                                                                <ChevronRight
                                                                    color={colors.black600}
                                                                    height={20}
                                                                    width={20}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* FAQ Section */}
                    {faqList.length > 0 && (
                        <>
                            <Typography
                                type="title"
                                style={styles.allTopicsTitle}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Frequently Asked Questions"
                                accessibilityRole={undefined}>
                                {userLanguageStrings.FrequentlyAskedQuestions}
                            </Typography>
                            <View style={styles.allTopicsContent}>
                                <View style={styles.topicsContainer}>
                                    {faqList
                                        .filter(v => !isUndefined(v))
                                        .map((topic, index) => (
                                            <React.Fragment key={topic.testID}>
                                                <TouchableOpacity
                                                    testID={topic.testID}
                                                    onPress={topic.onPress}
                                                    accessibilityRole="button">
                                                    <View style={styles.topicItem}>
                                                        <Icon
                                                            icon={topic.icon}
                                                            size={topic.iconSize}
                                                            color={themeColors.Text_neutralMax}
                                                        />
                                                        <Typography
                                                            type="body"
                                                            style={styles.topicText}
                                                            numberOfLines={undefined}
                                                            isAnimate={undefined}
                                                            accessible={undefined}
                                                            accessibilityLabel={topic.accessibilityLabel}
                                                            accessibilityRole={undefined}>
                                                            {topic.text}
                                                        </Typography>
                                                        <ChevronRight color={colors.gray275} />
                                                    </View>
                                                </TouchableOpacity>
                                                {index !== faqList.length - 1 && (
                                                    <Animated.View style={styles.dividerContainer}>
                                                        <Divider
                                                            dividerColor={`${themeColors.Fill_neutralLow}`}
                                                            type={undefined}
                                                            direction={undefined}
                                                            style={undefined}
                                                            labelPosition={undefined}
                                                            offset={undefined}
                                                            offsetBackground={undefined}
                                                            strokeDashArray={undefined}
                                                        />
                                                    </Animated.View>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </View>
                            </View>
                            <View style={{ marginBottom: 20 }} />
                        </>
                    )}

                    {/* All Topics Section */}
                    <Typography
                        type="title"
                        style={styles.allTopicsTitle}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel="All Topics"
                        accessibilityRole={undefined}>
                        {'Report an Issue'}
                    </Typography>
                    <View style={styles.allTopicsContent}>
                        <View style={styles.topicsContainer}>
                            {topicsList
                                .filter(v => !isUndefined(v))
                                .map((topic, index) => (
                                    <React.Fragment key={topic.testID}>
                                        <TouchableOpacity
                                            testID={topic.testID}
                                            onPress={topic.onPress}
                                            accessibilityRole="button">
                                            <View style={styles.topicItem}>
                                                <Icon
                                                    icon={topic.icon}
                                                    size={topic.iconSize}
                                                    color={themeColors.Text_neutralMax}
                                                />
                                                <Typography
                                                    type="body"
                                                    style={styles.topicText}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={topic.accessibilityLabel}
                                                    accessibilityRole={undefined}>
                                                    {topic.text}
                                                </Typography>
                                                <ChevronRight color={colors.gray275} />
                                            </View>
                                        </TouchableOpacity>
                                        {index !== topicsList.length - 1 && (
                                            <Animated.View style={styles.dividerContainer}>
                                                <Divider
                                                    dividerColor={`${themeColors.Fill_neutralLow}`}
                                                    type={undefined}
                                                    direction={undefined}
                                                    style={undefined}
                                                    labelPosition={undefined}
                                                    offset={undefined}
                                                    offsetBackground={undefined}
                                                    strokeDashArray={undefined}
                                                />
                                            </Animated.View>
                                        )}
                                    </React.Fragment>
                                ))}
                        </View>
                    </View>

                    {closedTicketIds && closedTicketIds.length > 0 ? (
                        <View>
                            <Typography
                                type="title"
                                style={styles.allTopicsTitle}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Past Tickets"
                                accessibilityRole={undefined}>
                                {userLanguageStrings.PastTickets}
                            </Typography>
                            <View style={styles.allTopicsContent}>
                                <View style={styles.topicsContainer}>
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        testID="closed-tickets"
                                        onPress={() =>
                                            helpAndSupportDispatch(createAction('HISTORY_CLICKED', undefined))
                                        }>
                                        <View style={styles.topicItem}>
                                            <Icon
                                                icon={<HistoryIcon fill={undefined} />}
                                                size={20}
                                                color={themeColors.Text_neutralMax}
                                            />
                                            <Typography
                                                type="body"
                                                style={styles.topicText}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={`History: ${closedTicketIds.length}`}
                                                accessibilityRole={undefined}>
                                                {userLanguageStrings.History + ': ' + closedTicketIds.length}
                                            </Typography>
                                            <ChevronRight color={colors.gray275} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) : null}
                </ScrollView>
                <AnimatedModal
                    visible={showDeleteAccountReasonModal}
                    setVisible={setShowDeleteAccountReasonModal}
                    contentStyle={{ backgroundColor: colors.white100 }}>
                    <KeyboardAwareScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="always">
                        <DeleteAccountReason
                            onSubmit={onDeleteAccount}
                            onGoBack={() => {
                                setShowDeleteAccountReasonModal(false);
                            }}
                        />
                    </KeyboardAwareScrollView>
                </AnimatedModal>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral200,
    },
    scrollContent: {
        paddingHorizontal: 16,
        marginTop: 12,
    },
    rideCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rideCardTitle: {
        fontWeight: '500',
        fontSize: 14,
    },
    viewAllRides: {
        color: '#004FB6',
    },
    rideCardContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 1,
        padding: 16,
    },
    mapImageContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    mapImage: {
        flex: 1,
        height: 170,
        width: '100%',
        resizeMode: 'cover',
        borderRadius: 12,
        maxWidth: '100%',
    },
    bookingDetails: {
        flex: 1,
    },
    divider: {
        paddingTop: 16,
        paddingBottom: 10,
    },
    reportIssueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reportIssueText: {
        color: '#004FB6',
    },
    allTopicsTitle: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    allTopicsContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        zIndex: 1,
    },
    topicsContainer: {
        flexDirection: 'column',
    },
    topicItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    topicText: {
        flex: 1,
        marginHorizontal: 12,
    },
    dividerContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
