import { activeTicketsRes } from '@/readOnly/api/types/ActiveTicketsRes.gen';
import { issueReportListItem } from '@/readOnly/api/types/IssueReportListItem.gen';
import { Action, Resolver } from '@/typescript/utils/common';

export type ActiveTicketsAction =
    | Action<'HANDLE_BACKPRESS'>
    | Action<'CONTINUE_CHAT', { rideId: string | undefined; ticketId: string | undefined }>
    | Action<'ACTIVE_TICKETS_CLICKED', { rideId: string | undefined; ticketId: string | undefined }>
    | Action<
          'NORMAL_CHAT_CLICKED',
          { rideId: string | undefined; issueReportId: string; categoryId: string | undefined }
      >;

export type ActiveTicketsUIProps = {
    activeTickets: IssueScreenProps[] | undefined;
    activeTicketsDispatch: Resolver<ActiveTicketsAction>;
    isEndChatConfirmationModalOpen: boolean;
    setIsEndChatConfirmationModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type IssueScreenProps =
    | {
          issueType: 'kapture';
          data: activeTicketsRes;
      }
    | {
          issueType: 'normal';
          data: issueReportListItem;
      };
