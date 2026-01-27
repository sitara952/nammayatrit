import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useHelpAndSupportHandler } from '@/typescript/hooks/kaptureLoginHandler';
import { HelpAndSupportUI } from './UI';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getStopsWithDestination } from '../MyBookingDetails/utils';
import { createDispatcher, Resolver, transformLanguage } from '@/typescript/utils/common';
import { HelpAndSupportAction, recentBooking } from './Types';
import { useLazyGetAllActiveTicketsGetQuery } from '@/api/integrations/rtk/GetAllActiveTicketsGet';
import { useGetClosedTicketIdsGetQuery } from '@/api/integrations/rtk/GetClosedTicketIdsGet';
import { useRideBookingListV2GetQuery } from '@/api/integrations/rtk/RideBookingListV2Get';
import { getPropsFromBookingDetails, meetsAgeAndStatusCriteria } from '../MyRides/UI';
import { convertMultimodalLocationToAPIEntity } from '@/typescript/utils/placeUtils';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { runOnJS } from 'react-native-reanimated';
import { useIssueCategoryGetQuery } from '@/api/integrations/rtk/IssueCategoryGet';
import { useLazyIssueListGetQuery } from '@/api/integrations/rtk/IssueListGet';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectFeatureFlags, selectNewFeatureFlags, selectUserLanguage } from '@/typescript/state/client/session';
import { IssueScreenProps } from '../ActiveTickets/Types';
import { isTicketOlderThanXSeconds } from '@/src-v2/utils/common';

export const HelpAndSupportFlow = () => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const onHelpAndSupportPress = useHelpAndSupportHandler();
    const [retryCount, setRetryCount] = useState(0);
    const [hasValidRide, setHasValidRide] = useState<boolean>(false);
    const enableKaptureHelpSupport = useAppSelector(selectNewFeatureFlags).enableKaptureHelpSupport;
    const language = useAppSelector(selectUserLanguage);
    const languageStr = language ? transformLanguage(language) : undefined;
    const featureFlags = useAppSelector(selectFeatureFlags);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const {
        data: rawBookingList,
        refetch,
        isLoading: recentRideLoading,
    } = useRideBookingListV2GetQuery({
        limit: 5,
        offset: undefined,
        bookingOffset: 0,
        journeyOffset: 0,
        fromDate: undefined,
        toDate: undefined,
        rideStatus: undefined,
        journeyStatus: undefined,
        isPaymentSuccess: true,
        bookingRequestType: undefined,
        billingCategory: undefined,
        rideType: undefined,
    });

    // Filter rides from current time up to 72 hours ago for help and support
    const data = useMemo(() => {
        if (!rawBookingList) return rawBookingList;

        const filteredList = rawBookingList.list.filter(bookingDetail =>
            meetsAgeAndStatusCriteria(bookingDetail, undefined, ['COMPLETED'], true),
        );

        return {
            list: filteredList,
        };
    }, [rawBookingList]);

    const { data: closedTicketIds } = useGetClosedTicketIdsGetQuery({});

    const [getAllActiveTickets, { data: activeTickets }] = useLazyGetAllActiveTicketsGetQuery();

    const { data: issueCategories } = useIssueCategoryGetQuery({
        language: languageStr,
    });

    const [getAllIssues, { data: issueList }] = useLazyIssueListGetQuery();

    useFocusEffect(
        useCallback(() => {
            getAllActiveTickets({});
            getAllIssues({ language: languageStr });
        }, [languageStr]),
    );

    useEffect(() => {
        const hasData = (data?.list?.length ?? 0) > 0;

        setHasValidRide(hasData);

        if (!hasData && retryCount < 3) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            timerRef.current = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                refetch();
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [retryCount, data]);

    const recentBooking = hasValidRide ? data?.list?.[0] : undefined;

    const { ongoingIssues, resolvedIssues } = useMemo(() => {
        if (!issueList?.issues) {
            return { ongoingIssues: [], resolvedIssues: [] };
        }

        const ongoing = issueList.issues.filter(issue =>
            ['OPEN', 'PENDING_INTERNAL', 'PENDING_EXTERNAL', 'RESOLVED', 'REOPENED'].includes(issue.status),
        );
        const resolved = issueList.issues.filter(issue => ['CLOSED', 'NOT_APPLICABLE'].includes(issue.status));

        return { ongoingIssues: ongoing, resolvedIssues: resolved };
    }, [issueList]);

    const onReportIssue = useCallback(() => {
        if (recentBooking?.TAG === 'Ride') {
            if (enableKaptureHelpSupport) {
                const currentActiveTicket = activeTickets?.activeTickets.find(
                    ticket => ticket.rideId === recentBooking?._0.rideList.at(0)?.shortRideId,
                )?.ticketId;
                onHelpAndSupportPress(recentBooking._0.rideList.at(0)?.id, currentActiveTicket);
            } else {
                const mappedData = getPropsFromBookingDetails(recentBooking?._0, featureFlags);
                navigation.navigate('ProfileTab', {
                    screen: 'myRidesNavigator',
                    params: {
                        screen: 'myRideDetails',
                        params: {
                            bookingDetailCard: {
                                ...mappedData,
                                journeyId: null,
                                isExpired: false,
                            },
                            journeyDetailCard: null,
                            showEstimate: mappedData.showEstimate,
                            isCancelled: false,
                            showHelpAndSupport: true,
                            subAutoDetails: { legOrder: 0 },
                            issueCategory: issueCategories,
                        },
                    },
                });
            }
        } else if (recentBooking?.TAG === 'MultiModalRide') {
            if (enableKaptureHelpSupport && recentBooking._0.legs[0]?.legExtraInfo.TAG === 'Taxi') {
                onHelpAndSupportPress(recentBooking._0.legs[0]?.legExtraInfo._0.rideId, undefined);
            }
        }
    }, [onHelpAndSupportPress, recentBooking]);

    const onViewAllRides = useCallback(
        () =>
            navigation.navigate('ProfileTab', {
                screen: 'myRidesNavigator',
                params: {
                    screen: 'myRidesScreen',
                    params: { isHelpAndSupportScreen: false, issueCategory: undefined },
                },
            }),
        [navigation],
    );

    const { activeIssues, closedIssues } = useMemo(() => {
        const kaptureActiveIssues: IssueScreenProps[] =
            activeTickets?.activeTickets.map(ticket => ({
                issueType: 'kapture',
                data: ticket,
            })) || [];

        const normalActiveIssues: IssueScreenProps[] = ongoingIssues.map(issue => ({
            issueType: 'normal',
            data: issue,
        }));
        const kaptureResolvedIssues: IssueScreenProps[] =
            closedTicketIds?.closedTicketIds.map(ticket => ({
                issueType: 'kapture',
                data: ticket,
            })) || [];

        const normalResolvedIssues: IssueScreenProps[] = resolvedIssues.map(issue => ({
            issueType: 'normal',
            data: issue,
        }));

        return {
            activeIssues: [...kaptureActiveIssues, ...normalActiveIssues],
            closedIssues: [...kaptureResolvedIssues, ...normalResolvedIssues],
        };
    }, [activeTickets, closedTicketIds, ongoingIssues, resolvedIssues]);

    const onAppRelatedIssues = useCallback(() => onHelpAndSupportPress(undefined, undefined), [onHelpAndSupportPress]);

    const onRideRelatedIssues = useCallback(
        () =>
            navigation.navigate('ProfileTab', {
                screen: 'myRidesNavigator',
                params: {
                    screen: 'myRidesScreen',
                    params: { isHelpAndSupportScreen: true, issueCategory: undefined },
                },
            }),
        [navigation],
    );

    const onActiveTicketsClicked = useCallback(() => {
        navigation.navigate('ProfileTab', {
            screen: 'helpAndSupportNavigator',
            params: {
                screen: 'activeTicketsScreen',
                params: { activeTickets: activeIssues },
            },
        });
    }, [navigation, activeIssues]);

    const onHistoryClicked = useCallback(() => {
        navigation.navigate('ProfileTab', {
            screen: 'helpAndSupportNavigator',
            params: {
                screen: 'recentChatsScreen',
                params: { closedTicketIds: closedIssues },
            },
        });
    }, [navigation, closedIssues]);

    const handleBackPress = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.popTo('mainTabNavigation', {
                screen: 'profileTab_homeScreen',
            });
        }
    }, [navigation]);

    const resolver: Resolver<HelpAndSupportAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HANDLE_BACKPRESS':
                    handleBackPress();
                    break;
                case 'REPORT_ISSUE':
                    onReportIssue();
                    break;
                case 'VIEW_ALL_RIDES':
                    onViewAllRides();
                    break;
                case 'APP_RELATED_ISSUES':
                    onAppRelatedIssues();
                    break;
                case 'RIDE_RELATED_ISSUES':
                    onRideRelatedIssues();
                    break;
                case 'BUSINESS_PROFILE_ISSUES':
                    runOnJS(hapticEffect)(HapticFeedbackTypes.selection, undefined);
                    navigation.navigate('ProfileTab', {
                        screen: 'helpAndSupportNavigator',
                        params: {
                            screen: 'businessIssueFaqScreen',
                            params: { SelectedOption: action.payload ?? 'BUSINESS_PROFILE_ISSUES' },
                        },
                    });
                    break;
                case 'ACTIVE_TICKETS_CLICKED':
                    onActiveTicketsClicked();
                    break;
                case 'HISTORY_CLICKED':
                    onHistoryClicked();
                    break;
                case 'METRO_ISSUE_FAQ_CLICKED':
                    runOnJS(hapticEffect)(HapticFeedbackTypes.selection, undefined);
                    navigation.navigate('ProfileTab', {
                        screen: 'helpAndSupportNavigator',
                        params: {
                            screen: 'metroIssueFaqScreen',
                            params: { SelectedOption: action.payload ?? 'METRO_ISSUE_FAQ' },
                        },
                    });
                    break;
                case 'SELECT_CATEGORY':
                    if (action.payload && !action.payload.isRideRequired) {
                        if (enableKaptureHelpSupport) {
                            onAppRelatedIssues();
                        } else {
                            navigation.navigate('ProfileTab', {
                                screen: 'helpAndSupportNavigator',
                                params: {
                                    screen: 'reportIssueChatScreen',
                                    params: {
                                        category: {
                                            issueCategoryId: action.payload.issueCategoryId,
                                            label: action.payload.label,
                                            category: action.payload.category,
                                        },
                                        rideId: undefined,
                                        issueReportId: undefined,
                                        ticketId: undefined,
                                        driverNumber: undefined,
                                    },
                                },
                            });
                        }
                    }
                    break;
                case 'SELECT_CATEGORY_WITH_RIDE':
                    if (action.payload && action.payload.isRideRequired) {
                        navigation.navigate('ProfileTab', {
                            screen: 'myRidesNavigator',
                            params: {
                                screen: 'myRidesScreen',
                                params: {
                                    isHelpAndSupportScreen: true,
                                    issueCategory: action.payload,
                                },
                            },
                        });
                    }
                    break;
                case 'SELECT_CATEGORY_WITH_TICKET':
                    if (action.payload && action.payload.isTicketRequired) {
                        navigation.navigate('TicketsTab', {
                            screen: 'ticketHistory',
                            params: {
                                isHelpAndSupportScreen: true,
                                issueCategory: action.payload,
                            },
                        });
                    }
                    break;
                default:
                    break;
            }
        },
        [
            onReportIssue,
            onViewAllRides,
            onAppRelatedIssues,
            onRideRelatedIssues,
            handleBackPress,
            onActiveTicketsClicked,
            onHistoryClicked,
            navigation,
        ],
    );

    const helpAndSupportDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const recentBookingProp: recentBooking = useMemo(() => {
        if (recentBooking?.TAG === 'Ride') {
            return {
                tag: 'Ride',
                source: recentBooking._0.fromLocation,
                stops: getStopsWithDestination(recentBooking._0.bookingDetails),
                rideStartTime: recentBooking._0.rideList.at(0)?.rideStartTime,
                rideEndTime: recentBooking._0.rideList.at(0)?.rideEndTime,
            };
        } else if (recentBooking?.TAG === 'MultiModalRide') {
            if (enableKaptureHelpSupport) {
                return {
                    tag: 'Ride',
                    source:
                        recentBooking?._0.legs[0]?.legExtraInfo.TAG === 'Taxi'
                            ? convertMultimodalLocationToAPIEntity(recentBooking?._0.legs[0]?.legExtraInfo._0.origin)
                            : undefined,
                    stops:
                        recentBooking?._0.legs[0]?.legExtraInfo.TAG === 'Taxi'
                            ? [
                                  convertMultimodalLocationToAPIEntity(
                                      recentBooking?._0.legs[0]?.legExtraInfo._0.destination,
                                  ),
                              ]
                            : [],
                    rideStartTime: recentBooking._0.legs[0]?.startTime,
                    rideEndTime: recentBooking._0.endTime,
                };
            } else {
                const leg = recentBooking?._0.legs.find(v => ['Metro', 'Bus', 'Subway'].includes(v.legExtraInfo.TAG));
                const shouldShow = issueCategories?.categories.filter(
                    v =>
                        v.isTicketRequired &&
                        !isTicketOlderThanXSeconds(recentBooking._0.createdAt, v.maxAllowedRideAge ?? 24 * 60 * 60),
                );
                if (leg && shouldShow && shouldShow?.length > 0)
                    return {
                        tag: 'Ticket',
                        leg: leg,
                    };
            }
        }
        return undefined;
    }, [recentBooking]);

    return (
        <HelpAndSupportUI
            recentBooking={recentBookingProp}
            activeTickets={activeIssues}
            closedTicketIds={closedIssues}
            issueCategories={issueCategories}
            isLoadingRecent={recentRideLoading}
            helpAndSupportDispatch={helpAndSupportDispatch}
        />
    );
};
