import { useCallback, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HelpAndSupportParamList, MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { createDispatcher, Resolver, transformLanguage } from '@/typescript/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MetroIssueFaqAction } from './Types';
import { MetroIssueFaqUI } from './UI';
import { useIssueOptionGetQuery } from '@/api/integrations/rtk/IssueOptionGet';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserLanguage } from '@/typescript/state/client/session';

export const MetroIssueFaqFlow = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<HelpAndSupportParamList, 'metroIssueFaqScreen'>>();
    const { SelectedOption } = route.params;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const language = useAppSelector(selectUserLanguage);
    const languageStr = language ? transformLanguage(language) : undefined;

    // Fetch FAQs based on SelectedOption (categoryId)
    const { data: faqData, isLoading } = useIssueOptionGetQuery({
        categoryId: SelectedOption,
        optionId: undefined,
        issueReportId: undefined,
        rideId: undefined,
        language: languageStr,
    });

    const faqMessages = useMemo(() => {
        return faqData?.messages || [];
    }, [faqData]);

    const title = useMemo(() => {
        return userLanguageStrings.FrequentlyAskedQuestions;
    }, [userLanguageStrings]);

    const resolver: Resolver<MetroIssueFaqAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HANDLE_BACKPRESS':
                    navigation.goBack();
                    break;

                default:
                    console.error('unhandled action called');
            }
        },
        [navigation],
    );

    const metroIssueFaqDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    return (
        <>
            <MetroIssueFaqUI
                faqMessages={faqMessages}
                metroIssueFaqDispatch={metroIssueFaqDispatch}
                heading={title}
                isLoading={isLoading}
            />
        </>
    );
};
