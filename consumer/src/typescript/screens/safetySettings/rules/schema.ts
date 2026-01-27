import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { emergencySettingsRes } from '../../../../readOnly/api/types/EmergencySettingsRes.gen';
import { updateEmergencySettingsReq } from '../../../../readOnly/api/types/UpdateEmergencySettingsReq.gen';
import { updateProfileDefaultEmergencyNumbersReq } from '../../../../readOnly/api/types/UpdateProfileDefaultEmergencyNumbersReq.gen';
import { aPISuccess } from '../../../../readOnly/api/types/APISuccess.gen';
import { SafetyStageId } from '../../safety/Types';
import { RideShareOptions_rideShareOptions } from '../../../../readOnly/api/types/Enums.gen';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ContactColor } from '@/src-v2/utils/common';
import { strings } from 'config-types';

export interface SafetyContext {
    emergencySettings: emergencySettingsRes | undefined;
    isLoading: boolean;
    updateEmergencySettings: (
        data: Partial<updateEmergencySettingsReq> | updateEmergencySettingsReq,
    ) => Promise<aPISuccess>;
    updateEmergencyContacts: (
        contacts: updateProfileDefaultEmergencyNumbersReq['defaultEmergencyNumbers'],
    ) => Promise<aPISuccess>;
    refetch: () => Promise<unknown> | unknown;
    draft: (Partial<updateEmergencySettingsReq> | updateEmergencySettingsReq) & {
        selectedDefaultContactId: string | undefined;
        updatedEmergencyContacts: updateProfileDefaultEmergencyNumbersReq['defaultEmergencyNumbers'] | undefined;
        contactPreferences: Record<string, 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE'> | undefined;
    };
    setDraft: (
        updater: (
            prev: (Partial<updateEmergencySettingsReq> | updateEmergencySettingsReq) & {
                selectedDefaultContactId: string | undefined;
                updatedEmergencyContacts:
                    | updateProfileDefaultEmergencyNumbersReq['defaultEmergencyNumbers']
                    | undefined;
                contactPreferences:
                    | Record<string, 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE'>
                    | undefined;
            },
        ) => (Partial<updateEmergencySettingsReq> | updateEmergencySettingsReq) & {
            selectedDefaultContactId: string | undefined;
            updatedEmergencyContacts: updateProfileDefaultEmergencyNumbersReq['defaultEmergencyNumbers'] | undefined;
            contactPreferences:
                | Record<string, 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE'>
                | undefined;
        },
    ) => void;
    manageContactsRef: React.RefObject<BottomSheetModal | null>;
    isInEditMode: boolean;
    userLanguageStrings: strings;
    appName: string;
}

// Individual component types
export interface InfoCardProps {
    title: string;
    subtitle: string | undefined;
    icon: ImageSourcePropType | undefined;
}

export interface ToggleSettingProps {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void | Promise<void>;
}

export interface TrustedContactsListProps {
    contacts: {
        id: string;
        name: string;
        phone: string;
        initials: string;
        color: ContactColor;
        selectedOption: 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE' | undefined;
    }[];
    options: { label: string; value: 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE' }[];
    onDelete: (id: string) => Promise<void>;
    onOptionSelect: (contactId: string, option: 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE') => void;
}

export interface ShareOptionSelectorProps {
    contactId: string;
    value: RideShareOptions_rideShareOptions | 'NEVER_SHARE';
    onChange: (v: RideShareOptions_rideShareOptions | 'NEVER_SHARE') => void;
}

export interface DefaultContactCardProps {
    name: string;
    description: string;
}

export interface ActionItem {
    id: string;
    label: string;
    icon: React.ComponentType | undefined;
}

export interface ActionGridProps {
    title: string | undefined;
    items: ActionItem[];
}

export interface HeroImageProps {
    image: ImageSourcePropType | undefined;
}

export interface HeroTitleProps {
    title: string;
}

export interface HeroSubtitleProps {
    subtitle: string;
}

export type ToggleCardProps = {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    description: string;
    marginVertical: number;
    showNotificationBox: boolean;
    icon: React.ComponentType | undefined;
    notificationText: string | undefined;
};

export interface InfoActionCardProps {
    title: string;
    description: string;
    icon: React.ComponentType | undefined;
}

export interface AddContactButtonProps {
    onPress: () => void;
    visibility?: boolean;
    isEditMode?: boolean;
}

export interface DropdownCardProps {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (selectedValue: string) => void;
    marginVertical: number;
    visibility: boolean | undefined;
}

export interface DefaultContactSelectorProps {
    contacts: Array<{
        id: string;
        name: string;
        phone: string;
        initials: string;
        color: ContactColor;
    }>;
    selectedContactId?: string;
    onContactSelect: (contactId: string) => void;
    title?: string;
}

export interface LoadingOverlayProps {
    visible: boolean;
    message: string;
    backgroundColor?: string;
    spinnerColor?: string;
}

export type Renderable =
    | { type: 'InfoCard'; props: InfoCardProps }
    | { type: 'ToggleSetting'; props: ToggleSettingProps }
    | { type: 'TrustedContactsList'; props: TrustedContactsListProps }
    | { type: 'ShareOptionSelector'; props: ShareOptionSelectorProps }
    | { type: 'DefaultContactCard'; props: DefaultContactCardProps }
    | { type: 'ActionGrid'; props: ActionGridProps }
    | { type: 'HeroImage'; props: HeroImageProps }
    | { type: 'HeroTitle'; props: HeroTitleProps }
    | { type: 'HeroSubtitle'; props: HeroSubtitleProps }
    | { type: 'ToggleCard'; props: ToggleCardProps }
    | { type: 'InfoActionCard'; props: InfoActionCardProps }
    | { type: 'DropdownCard'; props: DropdownCardProps }
    | { type: 'AddContactButton'; props: AddContactButtonProps }
    | { type: 'DefaultContactSelector'; props: DefaultContactSelectorProps }
    | { type: 'LoadingOverlay'; props: LoadingOverlayProps };

export interface StepRule {
    id: string;
    components: (safetyContext: SafetyContext) => Renderable[];
    onNext: ((safetyContext: SafetyContext) => Promise<void> | void) | undefined;
}

export interface StageRule {
    id: SafetyStageId;
    title: string;
    steps: StepRule[];
}

export type SafetyRules = StageRule[];
