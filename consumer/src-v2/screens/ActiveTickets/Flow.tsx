import { useHelpAndSupportHandler } from '@/typescript/hooks/kaptureLoginHandler';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ActiveTicketsUI } from './UI';
import { HelpAndSupportParamList, MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { ActiveTicketsAction } from './Types';

export const ActiveTicketsFlow = () => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const route = useRoute<RouteProp<HelpAndSupportParamList, 'activeTicketsScreen'>>();
    const { activeTickets } = route.params;
    const [isEndChatConfirmationModalOpen, setIsEndChatConfirmationModalOpen] = useState(false);

    const onHelpAndSupportPress = useHelpAndSupportHandler();

    const onActiveTicketsClicked = useCallback(
        (rideId: string | undefined, ticketId: string | undefined) => {
            onHelpAndSupportPress(rideId, ticketId);
        },
        [onHelpAndSupportPress],
    );

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    const handleBackPress = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.popTo('ProfileTab', {
                screen: 'helpAndSupportNavigator',
                params: { screen: 'helpAndSupportScreen' },
            });
        }
    }, [navigation]);

    const onContinueChat = useCallback(
        (rideId: string | undefined, ticketId: string | undefined) => {
            onHelpAndSupportPress(rideId, ticketId);
        },
        [onHelpAndSupportPress],
    );

    const resolver: Resolver<ActiveTicketsAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HANDLE_BACKPRESS':
                    handleBackPress();
                    break;
                case 'ACTIVE_TICKETS_CLICKED':
                    onActiveTicketsClicked(action?.payload?.rideId, action?.payload?.ticketId);
                    break;
                case 'CONTINUE_CHAT':
                    onContinueChat(action?.payload?.rideId, action?.payload?.ticketId);
                    break;
                case 'NORMAL_CHAT_CLICKED':
                    if (action.payload) {
                        navigation.navigate('ProfileTab', {
                            screen: 'helpAndSupportNavigator',
                            params: {
                                screen: 'reportIssueChatScreen',
                                params: {
                                    category: undefined,
                                    rideId: action.payload.rideId,
                                    issueReportId: action.payload.issueReportId,
                                    ticketId: undefined,
                                    driverNumber: undefined,
                                },
                            },
                        });
                    }
                    break;
                default:
                    break;
            }
        },
        [handleBackPress, onActiveTicketsClicked, onContinueChat],
    );

    const activeTicketsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);
    return (
        <ActiveTicketsUI
            activeTickets={activeTickets}
            activeTicketsDispatch={activeTicketsDispatch}
            isEndChatConfirmationModalOpen={isEndChatConfirmationModalOpen}
            setIsEndChatConfirmationModalOpen={setIsEndChatConfirmationModalOpen}
        />
    );
};
