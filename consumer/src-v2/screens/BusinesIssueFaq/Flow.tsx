import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BusinessIssueFaqAction, BusinessIssueFaqItem, BusinessIssueFaqUIProps } from './types';
import { BusinessIssueFaqUI } from './UI';
import { useHelpAndSupportHandler } from '@/typescript/hooks/kaptureLoginHandler';

export const BusinessIssueFaqFlow = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const onHelpAndSupportPress = useHelpAndSupportHandler();

    const onAppRelatedIssues = useCallback(() => onHelpAndSupportPress(undefined, undefined), [onHelpAndSupportPress]);

    const businessIssuesFaqItems = useMemo<BusinessIssueFaqItem[]>(
        () => [
            {
                id: '1',
                title: userLanguageStrings.UnableToSelectBusinessProfile,
                description: userLanguageStrings.UnableToSelectBusinessProfileDescription,
                nextDescription: undefined,
                bulletPoints: userLanguageStrings.UnableToSelectBusinessProfileBulletPoints,
                buttonText: userLanguageStrings.RaiseATicket,
                buttonOnPress: onAppRelatedIssues,
            },
            {
                id: '2',
                title: userLanguageStrings.NotAbleToReceiveEmail,
                description: userLanguageStrings.NotAbleToReceiveEmailDescription,
                nextDescription: undefined,
                bulletPoints: userLanguageStrings.NotAbleToReceiveEmailBulletPoints,
                buttonText: undefined,
                buttonOnPress: undefined,
            },
            {
                id: '3',
                title: userLanguageStrings.OTPReceivedIsShowingInvalid,
                description: userLanguageStrings.OTPReceivedIsShowingInvalidDescription,
                nextDescription: undefined,
                bulletPoints: userLanguageStrings.OTPReceivedIsShowingInvalidBulletPoints,
                buttonText: undefined,
                buttonOnPress: undefined,
            },
            {
                id: '4',
                title: userLanguageStrings.MagicLinkIsNotWorking,
                description: userLanguageStrings.MagicLinkIsNotWorkingDescription,
                nextDescription: undefined,
                bulletPoints: userLanguageStrings.MagicLinkIsNotWorkingBulletPoints,
                buttonText: undefined,
                buttonOnPress: undefined,
            },
            {
                id: '5',
                title: userLanguageStrings.VerificationTimedOut,
                description: userLanguageStrings.VerificationTimedOutDescription,
                nextDescription: undefined,
                bulletPoints: userLanguageStrings.VerificationTimedOutBulletPoints,
                buttonText: undefined,
                buttonOnPress: undefined,
            },
            {
                id: '6',
                title: userLanguageStrings.NotAbleToSwitchToBusinessProfile,
                description: userLanguageStrings.NotAbleToSwitchToBusinessProfileDescription,
                nextDescription: undefined,
                bulletPoints: userLanguageStrings.NotAbleToSwitchToBusinessProfileBulletPoints,
                buttonText: userLanguageStrings.RaiseATicket,
                buttonOnPress: onAppRelatedIssues,
            },
        ],
        [userLanguageStrings, onAppRelatedIssues],
    );

    const resolver: Resolver<BusinessIssueFaqAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HANDLE_BACKPRESS':
                    navigation.goBack();
                    break;

                default:
                    throw new Error(`Unhandled action type: ${action.type}`);
            }
        },
        [navigation],
    );

    const businessIssueFaqDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const viewProps: BusinessIssueFaqUIProps = {
        faqItems: businessIssuesFaqItems,
        businessIssueFaqDispatch,
        heading: userLanguageStrings.BusinessAccountIssues,
    };

    return <BusinessIssueFaqUI {...viewProps} />;
};
