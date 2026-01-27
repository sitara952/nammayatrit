import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { ImageSourcePropType } from 'react-native';
import { emergencySettingsRes } from '../../../readOnly/api/types/EmergencySettingsRes.gen';
import { updateEmergencySettingsReq } from '../../../readOnly/api/types/UpdateEmergencySettingsReq.gen';
import { updateProfileDefaultEmergencyNumbersReq } from '../../../readOnly/api/types/UpdateProfileDefaultEmergencyNumbersReq.gen';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { strings } from 'config-types';

// Safety Stage Types
export type SafetyStageId =
    | 'trustedContacts'
    | 'safetyCheckIns'
    | 'emergencyActions'
    // | 'emergencyDrill'
    | 'safetyTips'
    | 'emergencyContacts';

// More Safety Measures Types
export type MoreSafetyMeasureId = 'safetyTips' | 'emergencyContacts';

export interface SafetyStageStatus {
    trustedContacts: { name: string; isCompleted: boolean };
    safetyCheckIns: { name: string; isCompleted: boolean };
    emergencyActions: { name: string; isCompleted: boolean };
    // emergencyDrill: { name: string; isCompleted: boolean };
}

export interface SafetyStage {
    id: SafetyStageId;
    title: string;
    icon:
        | ImageSourcePropType
        | React.ComponentType<{
              width: number | undefined;
              height: number | undefined;
              fill: string | undefined;
              stroke: string | undefined;
          }>;
    isCompleted: boolean;
    showSubtitle: boolean;
    subtitleText: string;
}

export interface MoreSafetyMeasure {
    id: MoreSafetyMeasureId;
    title: string;
    icon:
        | ImageSourcePropType
        | React.ComponentType<{
              width: number | undefined;
              height: number | undefined;
              fill: string | undefined;
              stroke: string | undefined;
          }>;
    onPress: () => void;
}

export interface CarouselItem {
    id: number;
    image: ImageSourcePropType;
    title: string;
    subtitle: string;
}

// Safety Hook Types
export interface SafetyHookReturn {
    emergencySettings: emergencySettingsRes | undefined;
    isLoading: boolean;
    error: FetchBaseQueryError | SerializedError | undefined;
    updateEmergencySettings: (data: updateEmergencySettingsReq) => Promise<aPISuccess>;
    updateEmergencyContacts: (
        contacts: updateProfileDefaultEmergencyNumbersReq['defaultEmergencyNumbers'],
    ) => Promise<aPISuccess>;
    refetch: () => Promise<unknown> | unknown;
    isUpdating: boolean;
    updateError: FetchBaseQueryError | SerializedError | undefined;
    stageStatus: SafetyStageStatus;
    safetyStages: SafetyStage[];
    carouselData: CarouselItem[];
    moreSafetyMeasures: MoreSafetyMeasure[];
    userLanguageStrings: strings;
}

// Safety Flow Types
export interface SafetyFlowProps {
    onBack: () => void;
}

// Safety UI Types
export interface SafetyStageItemProps {
    title: string;
    icon:
        | ImageSourcePropType
        | React.ComponentType<{
              width: number | undefined;
              height: number | undefined;
              fill: string | undefined;
              stroke: string | undefined;
          }>;
    isCompleted: boolean;
    onPress: () => void;
    showSubtitle: boolean;
    subtitleText: string;
}

export interface SafetyUIProps {
    onNavigateToStage: (stage: SafetyStageId) => void;
    onBack: () => void;
    stageStatus: {
        trustedContacts: boolean;
        safetyCheckIns: boolean;
        emergencyActions: boolean;
        // emergencyDrill: boolean;
    };
    stageNames: {
        trustedContacts: string;
        safetyCheckIns: string;
        emergencyActions: string;
        // emergencyDrill: string;
    };
    safetyStages: SafetyStage[];
    completedStagesCount: number;
    totalStages: number;
    isLoading: boolean;
    error: FetchBaseQueryError | SerializedError | undefined;
    carouselData: CarouselItem[];
    moreSafetyMeasures: MoreSafetyMeasure[];
    userLanguageStrings: strings;
}
