import { useMemo } from 'react';
import { useProfileGetEmergencySettingsGetQuery } from '../../../api/integrations/rtk/ProfileGetEmergencySettingsGet';
import { useProfileUpdateEmergencySettingsPutMutation } from '../../../api/integrations/rtk/ProfileUpdateEmergencySettingsPut';
import { useProfileDefaultEmergencyNumbersPostMutation } from '../../../api/integrations/rtk/ProfileDefaultEmergencyNumbersPost';
import { emergencySettingsRes } from '../../../readOnly/api/types/EmergencySettingsRes.gen';
import { updateEmergencySettingsReq } from '../../../readOnly/api/types/UpdateEmergencySettingsReq.gen';
import { updateProfileDefaultEmergencyNumbersReq } from '../../../readOnly/api/types/UpdateProfileDefaultEmergencyNumbersReq.gen';
import { RideShareOptions_rideShareOptions } from '@/readOnly/api/types/Enums.gen';
import { SafetyStageStatus, SafetyStage, SafetyHookReturn, MoreSafetyMeasure } from './Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';

// Import safety stage icons
import { Contact } from '@/typescript/components/svg/Contact';
import { SafetyCar } from '@/typescript/components/svg/SafetyCar';
import { EmergencyActions } from '@/typescript/components/svg/EmergencyActions';
import { DriverSafety } from '@/typescript/components/svg/DriverSafety';

// Import carousel images
import sosTestImage from '@/typescript/assets/mt_ic_sos_test.png';
import safetyCheckImage from '@/typescript/assets/mt_ic_safety_check.png';
import trustedContactImage from '@/typescript/assets/mt_ic_trusted_contact_carousel.png';
import emergencyActionsImage from '@/typescript/assets/ny_ic_emergency_actions_complete.png';
import { strings } from 'config-types';

const isValidRideShareOption = (value: RideShareOptions_rideShareOptions): boolean => {
    return value === 'ALWAYS_SHARE' || value === 'SHARE_WITH_TIME_CONSTRAINTS';
};

const transformStageStatus = (
    settings: emergencySettingsRes | undefined,
    userLanguageStrings: strings,
): SafetyStageStatus => {
    if (!settings) {
        return {
            trustedContacts: { name: userLanguageStrings.TrustedContacts, isCompleted: false },
            safetyCheckIns: { name: userLanguageStrings.SafetyCheckIns, isCompleted: false },
            emergencyActions: { name: userLanguageStrings.EmergencyActions, isCompleted: false },
            // emergencyDrill: { name: userLanguageStrings.EmergencyDrill, isCompleted: false },
        };
    }

    return {
        // TrustedContacts: defaultEmergencyNumbers shouldn't be empty
        trustedContacts: {
            name: userLanguageStrings.TrustedContacts,
            isCompleted: settings.defaultEmergencyNumbers && settings.defaultEmergencyNumbers.length > 0,
        },

        // SafetyCheckIns: enablePostRideSafetyCheck OR enableUnexpectedEventsCheck should be valid ride share option
        safetyCheckIns: {
            name: userLanguageStrings.SafetyCheckIns,
            isCompleted:
                isValidRideShareOption(settings.enablePostRideSafetyCheck) ||
                isValidRideShareOption(settings.enableUnexpectedEventsCheck) ||
                settings.notifySafetyTeamForSafetyCheckFailure,
        },

        // EmergencyActions: shakeToActivate should be true OR autoCallDefaultContact should be true
        emergencyActions: {
            name: userLanguageStrings.EmergencyActions,
            isCompleted: settings.shakeToActivate || settings.autoCallDefaultContact,
        },

        // emergencyDrill: {
        //     name: userLanguageStrings.EmergencyDrill,
        //     isCompleted: settings.hasCompletedMockSafetyDrill,
        // },
    };
};

export const useSafetyHook = (): SafetyHookReturn => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { data: emergencySettings, isLoading, error, refetch } = useProfileGetEmergencySettingsGetQuery({});

    const [updateEmergencySettingsMutation, { isLoading: isUpdating, error: updateError }] =
        useProfileUpdateEmergencySettingsPutMutation();

    const [updateEmergencyContactsMutation, { isLoading: _isUpdatingContacts }] =
        useProfileDefaultEmergencyNumbersPostMutation();

    const stageStatus = useMemo(() => {
        return transformStageStatus(emergencySettings, userLanguageStrings);
    }, [emergencySettings, userLanguageStrings]);

    const safetyStages = useMemo((): SafetyStage[] => {
        return [
            {
                id: 'trustedContacts',
                title: stageStatus.trustedContacts.name,
                icon: Contact,
                isCompleted: stageStatus.trustedContacts.isCompleted,
                showSubtitle: true,
                subtitleText: 'Enables Live Tracking and In App Chat',
            },
            {
                id: 'safetyCheckIns',
                title: stageStatus.safetyCheckIns.name,
                icon: SafetyCar,
                isCompleted: stageStatus.safetyCheckIns.isCompleted,
                showSubtitle: false,
                subtitleText: '',
            },
            {
                id: 'emergencyActions',
                title: stageStatus.emergencyActions.name,
                icon: EmergencyActions,
                isCompleted: stageStatus.emergencyActions.isCompleted,
                showSubtitle: false,
                subtitleText: '',
            },
            // {
            //     id: 'emergencyDrill',
            //     title: stageStatus.emergencyDrill.name,
            //     icon: ShieldPlus,
            //     isCompleted: stageStatus.emergencyDrill.isCompleted,
            //     showSubtitle: false,
            //     subtitleText: '',
            // },
        ] satisfies SafetyStage[];
    }, [stageStatus]);

    const carouselData = useMemo(() => {
        return [
            {
                id: 1,
                image: trustedContactImage,
                title: userLanguageStrings.TrustedContacts,
                subtitle: userLanguageStrings.ShareRideDetailsWithTrustedContacts,
            },
            {
                id: 2,
                image: emergencyActionsImage,
                title: userLanguageStrings.EmergencyActions,
                subtitle: userLanguageStrings.QuickAccessToEmergencyContactsAndSafetyFeatures,
            },
            {
                id: 3,
                image: safetyCheckImage,
                title: userLanguageStrings.SafetyCheckIns,
                subtitle: userLanguageStrings.GetSafetyCheckInsInCaseOfAnyRouteDeviationOrUnusualStoppages,
            },
            {
                id: 4,
                image: sosTestImage,
                title: userLanguageStrings.SOSTest,
                subtitle: userLanguageStrings.TestYourEmergencyAlertSystemToEnsureItWorksWhenNeeded,
            },
        ];
    }, [userLanguageStrings]);

    const moreSafetyMeasures = useMemo((): MoreSafetyMeasure[] => {
        return [
            {
                id: 'safetyTips',
                title: userLanguageStrings.HowCanTrustedContactsHelp,
                icon: Contact,
                onPress: () => {
                    // Navigation will be handled by Flow component
                },
            },
            {
                id: 'emergencyContacts',
                title: userLanguageStrings.DriverSafetyStandards,
                icon: DriverSafety,
                onPress: () => {
                    // Navigation will be handled by Flow component
                },
            },
        ];
    }, [userLanguageStrings]);

    const updateEmergencySettings = async (data: Partial<updateEmergencySettingsReq>) => {
        // Merge with current settings to ensure all required fields are present
        const fullData: updateEmergencySettingsReq = Object.assign({}, emergencySettings, data);
        const result = await updateEmergencySettingsMutation({ body: fullData }).unwrap();
        // Refetch to get the latest data from the server
        await refetch();
        return result;
    };

    const updateEmergencyContacts = async (
        contacts: updateProfileDefaultEmergencyNumbersReq['defaultEmergencyNumbers'],
    ) => {
        try {
            const requestPayload: updateProfileDefaultEmergencyNumbersReq = {
                defaultEmergencyNumbers: contacts,
            };

            const result = await updateEmergencyContactsMutation({ body: requestPayload }).unwrap();
            await refetch();
            return result;
        } catch (error) {
            console.error('Failed to update emergency contacts:', error);
            throw error;
        }
    };

    return {
        emergencySettings,
        isLoading,
        error,
        updateEmergencySettings,
        updateEmergencyContacts,
        refetch,
        isUpdating,
        updateError,
        stageStatus,
        safetyStages,
        carouselData,
        moreSafetyMeasures,
        userLanguageStrings,
    };
};
