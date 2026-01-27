import { APIEndpoint, ButtonConfig } from './types';
import { useIssuePostMutation } from '@/api/integrations/rtk/IssuePost';
import { Language_language } from '@/readOnly/api/types/Enums.gen';
import { issueReportRes } from '@/readOnly/api/types/IssueReportRes.gen';

type Context = {
    rideId: string | undefined;
    language: Language_language | undefined;
    issuePostMutation: ReturnType<typeof useIssuePostMutation>[0];
};

// Currently hardcoded issue chat, because we dont want to go to help and support and create a issue like normal flow.
// This is being moved to remote config in purescript side which will be used here also. @prithivi @aman
// prod config
const ISSUE_CONFIGS = {
    [APIEndpoint.ReportAcIssue]: {
        CATEGORY_ID: '227b8d4c-16af-4b62-b52c-cae0e6eb5123',
        OPTION_ID: '45cd11ea-a151-4928-816c-6bcf03065123',
        ISSUE_DESCRIPTION: 'I have an AC related Issue in my ride',
        CHAT_ID_1: '45cd11ea-a151-4928-816c-6bcf03065123',
        CHAT_ID_2: '99512bc1-f42d-43df-91ab-627c9dc1c123',
    },
    [APIEndpoint.ReportExtraFare]: {
        CATEGORY_ID: '96d764e5-af9a-8b9e-cbe9-e09e4dd048db',
        OPTION_ID: '4bd378ff-f1c6-6567-abec-684017eaa247',
        ISSUE_DESCRIPTION: 'Did your driver\ndemand extra fare?',
        CHAT_ID_1: '51e9c818-8d94-4a9b-899e-a7aad125c5aa',
        CHAT_ID_2: 'b0107b30-455d-4218-a38b-b81f35776274',
    },
};

export const executeBannerApi = async (
    config: ButtonConfig & { createTicket: boolean | undefined },
    context: Context,
): Promise<void> => {
    const { apiEndpoint } = config;

    if (apiEndpoint === APIEndpoint.None) {
        console.error('[Banner] No API configured for this button.');
        return;
    }

    if (!context.rideId) {
        console.error('[Banner] rideId missing. Cannot report issue.');
        return;
    }

    const issue = ISSUE_CONFIGS[apiEndpoint];
    if (!issue) {
        console.error('[Banner] Unknown APIEndpoint:', apiEndpoint);
        return;
    }

    reportIssue(
        issue,
        {
            rideId: context.rideId,
            language: context.language,
            issuePostMutation: context.issuePostMutation,
        },
        config.createTicket,
    );
};

const mapToIssueLanguage = (lang: Language_language | undefined): string => {
    switch (lang) {
        case 'ENGLISH':
            return 'en';
        case 'HINDI':
            return 'hi';
        case 'KANNADA':
            return 'kn';
        case 'TAMIL':
            return 'ta';
        case 'MALAYALAM':
            return 'ml';
        case 'BENGALI':
            return 'bn';
        case 'FRENCH':
            return 'fr';
        case 'TELUGU':
            return 'te';
        case 'ODIA':
            return 'or';
        default:
            return 'en';
    }
};

const reportIssue = (
    config: (typeof ISSUE_CONFIGS)[keyof typeof ISSUE_CONFIGS],
    {
        rideId,
        language,
        issuePostMutation,
    }: {
        rideId: string;
        language: Language_language | undefined;
        issuePostMutation: ReturnType<typeof useIssuePostMutation>[0];
    },
    createTicket: boolean | undefined,
): void => {
    const timestamp = new Date().toISOString();
    const issueLang = mapToIssueLanguage(language);

    const payload = {
        mediaFiles: [],
        categoryId: config.CATEGORY_ID,
        optionId: config.OPTION_ID,
        rideId,
        description: config.ISSUE_DESCRIPTION,
        createTicket: createTicket,
        ticketBookingId: undefined,
        chats: [
            {
                chatType: 'IssueOption' as const,
                chatId: config.CHAT_ID_1,
                timestamp,
            },
            {
                chatType: 'IssueMessage' as const,
                chatId: config.CHAT_ID_2,
                timestamp,
            },
        ],
    };

    issuePostMutation({ language: issueLang, body: payload })
        .unwrap()
        .then((res: issueReportRes) => {
            console.info('[Banner] Issue reported successfully:', res);
        })
        .catch(err => {
            console.error('[Banner] Issue report failed:', err);
        });
};
