import { Action, Resolver } from '@/typescript/utils/common';
import { IssueScreenProps } from '../ActiveTickets/Types';

export type KaptureRecentChatsAction =
    | Action<'HANDLE_BACKPRESS'>
    | Action<'CHAT_CLICKED', { rideId: string | undefined; ticketId: string | undefined }>
    | Action<
          'NORMAL_CHAT_CLICKED',
          { rideId: string | undefined; issueReportId: string; categoryId: string | undefined }
      >;

export type KaptureRecentChatsUIProps = {
    kaptureRecentChats: IssueScreenProps[] | undefined;
    kaptureRecentChatsDispatch: Resolver<KaptureRecentChatsAction>;
};
