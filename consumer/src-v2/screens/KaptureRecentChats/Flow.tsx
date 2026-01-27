import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { KaptureRecentChatsUI } from './UI';
import { HelpAndSupportParamList, MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useCallback, useMemo } from 'react';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { KaptureRecentChatsAction } from './Types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const KaptureRecentChatsFlow = () => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const route = useRoute<RouteProp<HelpAndSupportParamList, 'recentChatsScreen'>>();
    const { closedTicketIds } = route.params;

    const onChatClicked = useCallback(
        (rideId: string | undefined, ticketId: string | undefined) => {
            navigation.navigate('ProfileTab', {
                screen: 'helpAndSupportNavigator',
                params: {
                    screen: 'recentChatDetailScreen',
                    params: { rideId, ticketId },
                },
            });
        },
        [navigation],
    );

    const handleBackPress = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.popTo('ProfileTab', {
                screen: 'helpAndSupportNavigator',
                params: {
                    screen: 'helpAndSupportScreen',
                },
            });
        }
    }, [navigation]);

    const resolver: Resolver<KaptureRecentChatsAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HANDLE_BACKPRESS':
                    handleBackPress();
                    break;
                case 'CHAT_CLICKED':
                    onChatClicked(action?.payload?.rideId, action?.payload?.ticketId);
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
        [handleBackPress, onChatClicked],
    );

    const kaptureRecentChatsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);
    return (
        <KaptureRecentChatsUI
            kaptureRecentChats={closedTicketIds ?? []}
            kaptureRecentChatsDispatch={kaptureRecentChatsDispatch}
        />
    );
};
