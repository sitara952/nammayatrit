import { ChatType_chatType } from '@/readOnly/api/types/Enums.gen';
import { issueOptionRes } from '@/readOnly/api/types/IssueOptionRes.gen';
import { mandatoryUploads } from '@/readOnly/api/types/MandatoryUploads.gen';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// API TYPES
export interface MediaFile {
    _type: 'Audio' | 'Image' | 'Video';
    id: string; // Internal ID for UI
    fileId: string; // Server ID returned after upload
    url: string;
}

export interface Translation {
    language: string;
    translation: string;
}

export interface Translations {
    actionTranslation?: Translation[];
    contentTranslation?: Translation[];
    titleTranslation?: Translation[];
}

export interface ChildMessage {
    childOptions: string[];
    isActive: boolean;
    label: string;
    mediaFiles?: MediaFile[];
    message: string;
    messageAction?: string;
    messageId: string;
    messageTitle?: string;
    messageType: string;
    priority: number;
    translations?: Translations;
}

export interface IssueOption {
    childMessages?: ChildMessage[];
    isActive: boolean;
    label: string;
    option: string;
    optionId: string;
    priority: number;
    translations?: Translation[];
}

export interface MandatoryUpload {
    fileType: 'Audio' | 'Image' | 'Video';
    limit: number;
}

export interface IssueOptionsResponse {
    options: IssueOption[];
    mandatoryUploads?: MandatoryUpload[];
}

// UI State Types

export interface MessageItem {
    id: string;
    type: ChatType_chatType; // Distinguish between system messages and user selections
    text: string;
    mediaFiles?: MediaFile[];
    timestamp: string;
}

export type ReportIssueChatAction =
    | { type: 'HANDLE_BACKPRESS'; payload: undefined }
    | { type: 'OPTION_SELECTED'; payload: issueOptionRes }
    | { type: 'INPUT_CHANGE'; payload: string }
    | { type: 'ATTACHMENT_PRESS'; payload: undefined }
    | { type: 'PHOTO_PRESS'; payload: undefined }
    | { type: 'PHOTO_OPTIONS_PRESS'; payload: undefined }
    | { type: 'TAKE_PHOTO_PRESS'; payload: undefined }
    | { type: 'VOICE_PRESS'; payload: undefined }
    | { type: 'SUBMIT_ISSUE'; payload: undefined }
    | { type: 'CLOSE_INPUT'; payload: undefined }
    | { type: 'RECORDING_COMPLETE'; payload: string }
    | { type: 'CLOSE_RECORDER'; payload: undefined }
    | { type: 'CLOSE_ATTACHMENT_PICKER'; payload: undefined }
    | { type: 'OPEN_ATTACHMENT_PICKER'; payload: undefined }
    | { type: 'REMOVE_ATTACHMENT'; payload: string }
    | { type: 'STILL_HAVE_ISSUE_CLICKED'; payload: undefined };

export interface ReportIssueChatUIProps {
    messages: MessageItem[];
    options: issueOptionRes[];
    showInput: boolean;
    inputText: string;
    dispatch: (action: ReportIssueChatAction) => void;
    attachments: MediaFile[];
    loading: boolean;
    isSubmitted: boolean;
    mandatoryUploads: mandatoryUploads[];
    attachmentPickerRef: React.RefObject<BottomSheetModal | null>;
    audioRecorderRef: React.RefObject<BottomSheetModal | null>;
    showStillHaveIssue: boolean;
    status?: string;
}
