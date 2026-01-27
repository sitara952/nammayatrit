import React, { useEffect, useCallback } from 'react';
import { PopupRuleOutput } from '../../rules/JourneyRulesTypes';
import StartJourneyStatusModal, {
    StartJourneyStatusModalProps,
} from '../NewLiveJourney/components/StatusPopUpModal/StartJourneyStatusModal';
import BusStatusModal, { BusStatusModalProps } from '../NewLiveJourney/components/StatusPopUpModal/Bus/BusStatusModal';
import MetroStatusModal, {
    MetroStatusModalProps,
} from '../NewLiveJourney/components/StatusPopUpModal/MetroStatusModal';
import SuburbanStatusModal, {
    SuburbanStatusModalProps,
} from '../NewLiveJourney/components/StatusPopUpModal/SuburbanStatusModal';
import UserWillMissBusStatusModal, {
    UserWillMissBusStatusModalProps,
} from '../NewLiveJourney/components/StatusPopUpModal/UserWIllMissRideModals/UserWillMissBusStatusModal';
import UserWillMissBusStatusModalWithNoOptions, {
    UserWillMissBusStatusModalWithNoOptionsProps,
} from '../NewLiveJourney/components/StatusPopUpModal/UserWIllMissRideModals/UserWillMissBusStatusModalWithNoOptions';
import UserWillMissMetro, {
    UserWillMissMetroProps,
} from '../NewLiveJourney/components/StatusPopUpModal/UserWIllMissRideModals/UserWillMissMetro';
import UserWillMissSuburban, {
    UserWillMissSuburbanProps,
} from '../NewLiveJourney/components/StatusPopUpModal/UserWIllMissRideModals/UserWillMissSuburban';
import OptionsModal, { OptionsModalProps } from '../NewLiveJourney/components/StatusPopUpModal/OptionsModal';
import AutoAndCabStatusModal, {
    AutoAndCabStatusModalProps,
} from '../NewLiveJourney/components/StatusPopUpModal/AutoAndCabStatusModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { MMKVKey } from '@/typescript/utils/MMKV';
import { createMMKV } from '@/utils/mmkvUtils';

export type LiveJourneyPopupModalProps =
    | StartJourneyStatusModalProps
    | BusStatusModalProps
    | MetroStatusModalProps
    | SuburbanStatusModalProps
    | UserWillMissBusStatusModalProps
    | UserWillMissBusStatusModalWithNoOptionsProps
    | UserWillMissMetroProps
    | UserWillMissSuburbanProps
    | OptionsModalProps
    | AutoAndCabStatusModalProps;

export const LiveJourneyPopupManager: React.FC<{ popupInfo: PopupRuleOutput | undefined }> = ({ popupInfo }) => {
    const popupManager = useLiveJourneyPopupModalManager();

    useEffect(() => {
        if (popupInfo) {
            popupManager.present(popupInfo.type);
        }
    }, [popupInfo]);

    if (!popupInfo) return null;
    switch (popupInfo.type) {
        case 'StartJourney':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <StartJourneyStatusModal {...(popupInfo.props as StartJourneyStatusModalProps)} />;
        case 'BusStatus':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <BusStatusModal {...(popupInfo.props as BusStatusModalProps)} />;
        case 'MetroStatus':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <MetroStatusModal {...(popupInfo.props as MetroStatusModalProps)} />;
        case 'SuburbanStatus':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <SuburbanStatusModal {...(popupInfo.props as SuburbanStatusModalProps)} />;
        case 'UserWillMissBus':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <UserWillMissBusStatusModal {...(popupInfo.props as UserWillMissBusStatusModalProps)} />;
        case 'UserWillMissBusWithNoOptions':
            return (
                <UserWillMissBusStatusModalWithNoOptions
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    {...(popupInfo.props as UserWillMissBusStatusModalWithNoOptionsProps)}
                />
            );
        case 'UserWillMissMetro':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <UserWillMissMetro {...(popupInfo.props as UserWillMissMetroProps)} />;
        case 'UserWillMissSuburban':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <UserWillMissSuburban {...(popupInfo.props as UserWillMissSuburbanProps)} />;
        case 'Options':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <OptionsModal {...(popupInfo.props as OptionsModalProps)} />;
        case 'AutoAndCabStatus':
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return <AutoAndCabStatusModal {...(popupInfo.props as AutoAndCabStatusModalProps)} />;
        default:
            return null;
    }
};

const dismissedPopupStorage = createMMKV();

const getDismissedPopupIds = (): Set<string> => {
    try {
        const data = dismissedPopupStorage.getString(MMKVKey.DISMISSED_LIVE_JOURNEY_POPUP_IDS);
        const parsed = data ? safeJsonParse<string[]>(data, [], 'dismissedPopupStorage') : [];
        return new Set(parsed || []);
    } catch (error) {
        console.error('[PopupDismissalTracker] Failed to parse dismissed popup IDs:', error);
        return new Set();
    }
};

const setDismissedPopupIds = (dismissedIds: Set<string>): void => {
    try {
        const idsArray = Array.from(dismissedIds);
        dismissedPopupStorage.set(MMKVKey.DISMISSED_LIVE_JOURNEY_POPUP_IDS, JSON.stringify(idsArray));
    } catch (error) {
        console.error('[PopupDismissalTracker] Failed to write dismissed popup IDs:', error);
    }
};

export const PopupDismissalTracker = {
    dismiss(id: string | undefined): void {
        if (!id) return;
        const dismissedIds = getDismissedPopupIds();
        const updatedIds = new Set(Array.from(dismissedIds).concat([id]));
        setDismissedPopupIds(updatedIds);
    },

    isDismissed(id: string | undefined): boolean {
        if (!id) return false;
        const dismissedIds = getDismissedPopupIds();
        return dismissedIds.has(id);
    },
};

export type LiveJourneyPopupType =
    | 'StartJourney'
    | 'BusStatus'
    | 'MetroStatus'
    | 'SuburbanStatus'
    | 'UserWillMissBus'
    | 'UserWillMissBusWithNoOptions'
    | 'UserWillMissMetro'
    | 'UserWillMissSuburban'
    | 'Options'
    | 'AutoAndCabStatus';

export interface LiveJourneyPopupModalRefs {
    liveJourneyStartJourneyStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyBusStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyMetroStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneySuburbanStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyUserWillMissBusStatusModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyUserWillMissMetroModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyUserWillMissSuburbanModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyOptionsModalRef: React.RefObject<BottomSheetModal | null>;
    liveJourneyBookAutoOrCabStatusModalRef: React.RefObject<BottomSheetModal | null>;
}

const getModalRefKey = (popupType: LiveJourneyPopupType): keyof LiveJourneyPopupModalRefs => {
    switch (popupType) {
        case 'StartJourney':
            return 'liveJourneyStartJourneyStatusModalRef';
        case 'BusStatus':
            return 'liveJourneyBusStatusModalRef';
        case 'MetroStatus':
            return 'liveJourneyMetroStatusModalRef';
        case 'SuburbanStatus':
            return 'liveJourneySuburbanStatusModalRef';
        case 'UserWillMissBus':
            return 'liveJourneyUserWillMissBusStatusModalRef';
        case 'UserWillMissBusWithNoOptions':
            return 'liveJourneyUserWillMissBusStatusModalRef';
        case 'UserWillMissMetro':
            return 'liveJourneyUserWillMissMetroModalRef';
        case 'UserWillMissSuburban':
            return 'liveJourneyUserWillMissSuburbanModalRef';
        case 'Options':
            return 'liveJourneyOptionsModalRef';
        case 'AutoAndCabStatus':
            return 'liveJourneyBookAutoOrCabStatusModalRef';
        default:
            return 'liveJourneyStartJourneyStatusModalRef';
    }
};

export const useLiveJourneyPopupModalManager = () => {
    const refs = useRefsContext();

    const getRef = useCallback(
        (popupType: LiveJourneyPopupType): React.RefObject<BottomSheetModal | null> | undefined => {
            const refKey = getModalRefKey(popupType);
            return refs[refKey];
        },
        [refs],
    );

    const present = useCallback(
        (popupType: LiveJourneyPopupType): void => {
            getRef(popupType)?.current?.present?.();
        },
        [getRef],
    );

    const dismiss = useCallback(
        (popupType: LiveJourneyPopupType): void => {
            getRef(popupType)?.current?.close?.();
        },
        [getRef],
    );

    return {
        present,
        dismiss,
        getRef,
    };
};
