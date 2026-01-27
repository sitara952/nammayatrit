import { SafetyRules } from './schema';
import sosImage from '@/typescript/assets/ny_ic_emergency_sos_banner.png';
import defaultContactImage from '@/typescript/assets/ny_ic_default_contact.png';
import everythingOkayImage from '@/typescript/assets/ny_ic_everything_okay.png';
import safeJourneyImage from '@/typescript/assets/ny_ic_safe_journey_post_ride.png';
import { VolumeOn } from '../../../components/svg/VolumeOn';
import { Headphone } from '../../../components/svg/HeadPhone';
import { AlertIcon } from '../../../components/svg/AlertIcon';
import { AudioIcon } from '../../../components/svg/AudioIcon';
import trustedContactActionsImage from '@/typescript/assets/mt_ic_trusted_contact_action.webp';
import { LiveTracking } from '../../../components/svg/LiveTracking';
import { Chat } from '../../../components/svg/Chat';
import driverSafetyStandardsImage from '@/typescript/assets/mt_ic_driver_safety_standard.webp';
import { VerifiedProfile } from '../../../components/svg/VerifiedProfile';
import { Training } from '../../../components/svg/Traning';
import { IdCheck } from '../../../components/svg/IdCheck';
import { Lock } from '../../../components/svg/Lock';
import { FavoriteHeart } from '../../../components/svg/FavoriteHeart';
import { DashCam } from '../../../components/svg/DashCam';
import { WomanIcon } from './../../../components/svg/WomanIcon';
import {
    handleAutoCallToggle,
    generateDefaultContactCard,
    isSharingRide,
    getEmergencySettingValue,
    handleContactSelection,
} from '../HelperFunctions';
import { ContactColor } from '@/src-v2/utils/common';
import notifySafetyTeamImage from '@/typescript/assets/mt_ic_notify_safety_team.webp';

export const safetyRules: SafetyRules = [
    {
        id: 'trustedContacts',
        title: 'TrustedContacts', // Translation key
        steps: [
            {
                id: 'manageContacts',
                components: safetyContext => [
                    {
                        type: 'HeroImage',
                        props: {
                            image: everythingOkayImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.LiveRideTracking,
                        },
                    },
                    {
                        type: 'HeroSubtitle',
                        props: {
                            subtitle: safetyContext.userLanguageStrings.LiveRideTrackingDescription,
                        },
                    },
                    {
                        type: 'TrustedContactsList',
                        props: {
                            contacts: (safetyContext.emergencySettings?.defaultEmergencyNumbers ?? []).map(
                                (contact, index) => {
                                    const colors: readonly ContactColor[] = [
                                        ContactColor.Blue,
                                        ContactColor.Orange,
                                        ContactColor.Green,
                                    ];

                                    return {
                                        id: contact.mobileNumber, // Use mobile number as unique ID
                                        name: contact.name,
                                        phone: contact.mobileNumber,
                                        initials: contact.name.charAt(0).toUpperCase(),
                                        color: colors[index % colors.length] || ContactColor.Blue, // Fallback to blue
                                        selectedOption:
                                            safetyContext.draft.contactPreferences?.[contact.mobileNumber] ||
                                            contact.shareTripWithEmergencyContactOption ||
                                            'ALWAYS_SHARE',
                                    };
                                },
                            ),
                            options: [
                                {
                                    label: safetyContext.userLanguageStrings.AllRidesSharedAutomatically,
                                    value: 'ALWAYS_SHARE',
                                },
                                {
                                    label: safetyContext.userLanguageStrings.NightRidesSharedAutomatically,
                                    value: 'SHARE_WITH_TIME_CONSTRAINTS',
                                },
                                {
                                    label: safetyContext.userLanguageStrings.IWillShareRidesManually,
                                    value: 'NEVER_SHARE',
                                },
                            ],
                            onOptionSelect: (
                                contactId: string,
                                option: 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE',
                            ) => {
                                // Store individual contact preferences
                                safetyContext.setDraft(prev => ({
                                    ...prev,
                                    contactPreferences: {
                                        ...prev.contactPreferences,
                                        [contactId]: option,
                                    },
                                }));
                                console.info('Contact option stored in draft:', contactId, option);
                            },
                            onDelete: async (contactId: string) => {
                                try {
                                    // Find the contact by ID and remove it
                                    const currentContacts =
                                        safetyContext.emergencySettings?.defaultEmergencyNumbers ?? [];
                                    const deletedContact = currentContacts.find(
                                        contact => contact.mobileNumber === contactId,
                                    );
                                    const isDefault = deletedContact && deletedContact.priority === 0;
                                    const updatedContacts = currentContacts
                                        .filter(contact => contact.mobileNumber !== contactId)
                                        .map((contact, index) => {
                                            if (contact.mobileNumber !== contactId) {
                                                if (index === 0 && isDefault)
                                                    return {
                                                        ...contact,
                                                        priority: 0,
                                                    };
                                                else return contact;
                                            }
                                            return undefined;
                                        })
                                        .filter(v => v !== undefined);

                                    // Call the API to update emergency contacts
                                    await safetyContext.updateEmergencyContacts(updatedContacts);

                                    console.info('Contact deleted successfully:', contactId);
                                } catch (error) {
                                    console.error('Failed to delete contact:', error);
                                    // TODO: Show error message to user
                                }
                            },
                        },
                    },
                    // Add Contact Button - always include but control visibility with prop
                    {
                        type: 'AddContactButton',
                        props: {
                            onPress: () => {
                                // Open the ContactModal directly using the ref from safety context
                                if (safetyContext.manageContactsRef?.current) {
                                    safetyContext.manageContactsRef.current.present();
                                }
                            },
                            visibility: (() => {
                                const contactCount =
                                    safetyContext.emergencySettings?.defaultEmergencyNumbers?.length ?? 0;
                                const isVisible =
                                    !safetyContext.isLoading &&
                                    safetyContext.emergencySettings?.defaultEmergencyNumbers &&
                                    contactCount > 0 &&
                                    contactCount < 3;
                                return isVisible;
                            })(),
                            isEditMode: safetyContext.isInEditMode,
                        },
                    },
                ],
                onNext: async safetyContext => {
                    // Update individual contact preferences when user clicks Done
                    try {
                        if (safetyContext.draft.contactPreferences) {
                            const currentContacts = safetyContext.emergencySettings?.defaultEmergencyNumbers ?? [];
                            const updatedContacts = currentContacts.map(contact => ({
                                ...contact,
                                shareTripWithEmergencyContactOption:
                                    safetyContext.draft.contactPreferences?.[contact.mobileNumber] ||
                                    contact.shareTripWithEmergencyContactOption,
                            }));

                            await safetyContext.updateEmergencyContacts(updatedContacts);
                            console.info('Contact preferences updated successfully');
                        }
                    } catch (error) {
                        console.error('Failed to update contact preferences:', error);
                    }
                },
            },
            {
                id: 'inAppChatAndCall',
                components: safetyContext => [
                    {
                        type: 'HeroImage',
                        props: {
                            image: everythingOkayImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.InAppChatAndCall,
                        },
                    },
                    {
                        type: 'HeroSubtitle',
                        props: {
                            subtitle: safetyContext.userLanguageStrings.InAppChatAndCallDescription,
                        },
                    },
                    {
                        type: 'DefaultContactSelector',
                        props: {
                            title: 'Default Contact',
                            contacts: (safetyContext.emergencySettings?.defaultEmergencyNumbers ?? []).map(
                                (contact, index) => {
                                    const colors: readonly ContactColor[] = [
                                        ContactColor.Blue,
                                        ContactColor.Orange,
                                        ContactColor.Green,
                                    ];

                                    return {
                                        id: contact.mobileNumber,
                                        name: contact.name,
                                        phone: contact.mobileNumber,
                                        initials: contact.name.charAt(0).toUpperCase(),
                                        color: colors[index % colors.length] || ContactColor.Blue,
                                    };
                                },
                            ),
                            selectedContactId:
                                safetyContext.draft.selectedDefaultContactId ||
                                safetyContext.emergencySettings?.defaultEmergencyNumbers?.find(
                                    contact => contact.priority === 0,
                                )?.mobileNumber,
                            onContactSelect: (contactId: string) => {
                                const currentContacts = safetyContext.emergencySettings?.defaultEmergencyNumbers || [];
                                handleContactSelection(contactId, currentContacts, safetyContext.setDraft);
                            },
                        },
                    },
                ],
                onNext: async safetyContext => {
                    // Update the emergency contacts with new priorities when user clicks Done
                    try {
                        if (safetyContext.draft.updatedEmergencyContacts) {
                            await safetyContext.updateEmergencyContacts(safetyContext.draft.updatedEmergencyContacts);
                            console.info('Contact priorities updated successfully on next');
                        }
                    } catch (error) {
                        console.error('Failed to update contact priorities on next:', error);
                    }
                },
            },
        ],
    },

    {
        id: 'safetyCheckIns',
        title: 'SafetyCheckIns',
        steps: [
            {
                id: 'routeDeviation',
                components: safetyContext => [
                    {
                        type: 'HeroImage',
                        props: {
                            image: everythingOkayImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.UnexpectedEventsCheck,
                        },
                    },
                    {
                        type: 'ToggleCard',
                        props: {
                            label: safetyContext.userLanguageStrings.EnableUnexpectedEventsCheck,
                            value: safetyContext.draft.enableUnexpectedEventsCheck
                                ? ['ALWAYS_SHARE', 'SHARE_WITH_TIME_CONSTRAINTS'].includes(
                                      safetyContext.draft.enableUnexpectedEventsCheck,
                                  )
                                : isSharingRide(safetyContext.emergencySettings?.enableUnexpectedEventsCheck),
                            onChange: v => {
                                safetyContext.setDraft(prev => ({
                                    ...prev,
                                    enableUnexpectedEventsCheck: v ? 'ALWAYS_SHARE' : 'NEVER_SHARE',
                                }));
                            },
                            description: safetyContext.userLanguageStrings.EnableUnexpectedEventsCheckDescription,
                            marginVertical: 15,
                            showNotificationBox: false,
                            notificationText: undefined,
                            icon: undefined,
                        },
                    },
                    {
                        type: 'DropdownCard',
                        props: {
                            label: safetyContext.userLanguageStrings.RideCoverage,
                            value:
                                (safetyContext.draft.enableUnexpectedEventsCheck ||
                                    getEmergencySettingValue(
                                        safetyContext.emergencySettings?.enableUnexpectedEventsCheck,
                                    )) === 'SHARE_WITH_TIME_CONSTRAINTS'
                                    ? 'night'
                                    : 'all',
                            options: [
                                { label: safetyContext.userLanguageStrings.OnAllRides, value: 'all' },
                                { label: safetyContext.userLanguageStrings.OnlyNightRides, value: 'night' },
                            ],
                            onChange: (selectedValue: string) => {
                                safetyContext.setDraft(prev => ({
                                    ...prev,
                                    enableUnexpectedEventsCheck:
                                        selectedValue === 'night' ? 'SHARE_WITH_TIME_CONSTRAINTS' : 'ALWAYS_SHARE',
                                }));
                            },
                            marginVertical: 10,
                            visibility: safetyContext.draft.enableUnexpectedEventsCheck
                                ? safetyContext.draft.enableUnexpectedEventsCheck === 'ALWAYS_SHARE' ||
                                  safetyContext.draft.enableUnexpectedEventsCheck === 'SHARE_WITH_TIME_CONSTRAINTS'
                                : isSharingRide(safetyContext.emergencySettings?.enableUnexpectedEventsCheck),
                        },
                    },
                ],
                onNext: async safetyContext => {
                    if (safetyContext.draft.enableUnexpectedEventsCheck !== undefined) {
                        await safetyContext.updateEmergencySettings({
                            enableUnexpectedEventsCheck: safetyContext.draft.enableUnexpectedEventsCheck,
                        });
                    }
                },
            },
            {
                id: 'postRide',
                components: safetyContext => [
                    {
                        type: 'HeroImage',
                        props: {
                            image: safeJourneyImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: 'Post Ride Check',
                        },
                    },
                    {
                        type: 'ToggleCard',
                        props: {
                            label: 'Post Ride Notifications',
                            value: safetyContext.draft.enablePostRideSafetyCheck
                                ? ['ALWAYS_SHARE', 'SHARE_WITH_TIME_CONSTRAINTS'].includes(
                                      safetyContext.draft.enablePostRideSafetyCheck,
                                  )
                                : isSharingRide(safetyContext.emergencySettings?.enablePostRideSafetyCheck),
                            onChange: v => {
                                safetyContext.setDraft(prev => ({
                                    ...prev,
                                    enablePostRideSafetyCheck: v ? 'ALWAYS_SHARE' : 'NEVER_SHARE',
                                }));
                            },
                            description:
                                'Get check in notifications once your ride is complete. Get automated calls in case of no-response',
                            marginVertical: 15,
                            showNotificationBox: false,
                            notificationText: undefined,
                            icon: undefined,
                        },
                    },
                    {
                        type: 'DropdownCard',
                        props: {
                            label: 'Ride Coverage',
                            value:
                                (safetyContext.draft.enablePostRideSafetyCheck ||
                                    getEmergencySettingValue(
                                        safetyContext.emergencySettings?.enablePostRideSafetyCheck,
                                    )) === 'SHARE_WITH_TIME_CONSTRAINTS'
                                    ? 'night'
                                    : 'all',
                            options: [
                                { label: safetyContext.userLanguageStrings.OnAllRides, value: 'all' },
                                { label: safetyContext.userLanguageStrings.OnlyNightRides, value: 'night' },
                            ],
                            onChange: (selectedValue: string) => {
                                safetyContext.setDraft(prev => ({
                                    ...prev,
                                    enablePostRideSafetyCheck:
                                        selectedValue === 'night' ? 'SHARE_WITH_TIME_CONSTRAINTS' : 'ALWAYS_SHARE',
                                }));
                            },
                            marginVertical: 10,
                            visibility: safetyContext.draft.enablePostRideSafetyCheck
                                ? safetyContext.draft.enablePostRideSafetyCheck === 'ALWAYS_SHARE' ||
                                  safetyContext.draft.enablePostRideSafetyCheck === 'SHARE_WITH_TIME_CONSTRAINTS'
                                : isSharingRide(safetyContext.emergencySettings?.enablePostRideSafetyCheck),
                        },
                    },
                ],
                onNext: async safetyContext => {
                    if (safetyContext.draft.enablePostRideSafetyCheck !== undefined) {
                        await safetyContext.updateEmergencySettings({
                            enablePostRideSafetyCheck: safetyContext.draft.enablePostRideSafetyCheck,
                        });
                    }
                },
            },
            {
                id: 'notifySafetyTeam',
                components: safetyContext => [
                    {
                        type: 'HeroImage',
                        props: {
                            image: notifySafetyTeamImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.SafetyTeamNotification,
                        },
                    },
                    {
                        type: 'ToggleCard',
                        props: {
                            label: safetyContext.userLanguageStrings.NotifySafetyTeam,
                            value:
                                safetyContext.draft.notifySafetyTeamForSafetyCheckFailure ??
                                Boolean(safetyContext.emergencySettings?.notifySafetyTeamForSafetyCheckFailure),
                            onChange: v => {
                                safetyContext.setDraft(prev => ({ ...prev, notifySafetyTeamForSafetyCheckFailure: v }));
                            },
                            description: safetyContext.userLanguageStrings.NotifySafetyTeamDescription,
                            marginVertical: 15,
                            showNotificationBox: true,
                            notificationText: safetyContext.userLanguageStrings.NotifySafetyTeamDescription,
                            icon: AlertIcon,
                        },
                    },
                ],
                onNext: async safetyContext => {
                    if (safetyContext.draft.notifySafetyTeamForSafetyCheckFailure !== undefined) {
                        await safetyContext.updateEmergencySettings({
                            notifySafetyTeamForSafetyCheckFailure:
                                safetyContext.draft.notifySafetyTeamForSafetyCheckFailure,
                        });
                    }
                },
            },
        ],
    },
    {
        id: 'emergencyActions',
        title: 'EmergencyActions',
        steps: [
            {
                id: 'sosAndShake',
                components: safetyContext => [
                    {
                        type: 'HeroImage',
                        props: {
                            image: sosImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.EmergencySOS,
                        },
                    },
                    {
                        type: 'HeroSubtitle',
                        props: {
                            subtitle: safetyContext.userLanguageStrings.EmergencySOSDescription,
                        },
                    },
                    {
                        type: 'ToggleCard',
                        props: {
                            label: safetyContext.userLanguageStrings.ShakeToActivate,
                            value:
                                safetyContext.draft.shakeToActivate ??
                                Boolean(safetyContext.emergencySettings?.shakeToActivate),
                            onChange: v => {
                                safetyContext.setDraft(prev => ({ ...prev, shakeToActivate: v }));
                            },
                            description: safetyContext.userLanguageStrings.ShakeToActivateDescription(
                                safetyContext.appName,
                            ),
                            marginVertical: 0,
                            showNotificationBox: false,
                            notificationText: undefined,
                            icon: undefined,
                        },
                    },
                ],
                onNext: async safetyContext => {
                    if (safetyContext.draft.shakeToActivate !== undefined) {
                        await safetyContext.updateEmergencySettings({
                            shakeToActivate: safetyContext.draft.shakeToActivate,
                        });
                    }
                },
            },
            {
                id: 'autoCallToggle',
                components: safetyContext => [
                    //   { type: 'InfoCard', props: { title: 'Automatic call on emergency', subtitle: undefined, icon: undefined } },
                    {
                        type: 'HeroImage',
                        props: {
                            image: defaultContactImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.EmergencyCallTitle,
                        },
                    },
                    {
                        type: 'HeroSubtitle',
                        props: {
                            subtitle: safetyContext.userLanguageStrings.EmergencyCallSubtitle,
                        },
                    },
                    {
                        type: 'ToggleSetting',
                        props: {
                            label: 'Place call to default contact',
                            value:
                                safetyContext.draft.autoCallDefaultContact ??
                                Boolean(safetyContext.emergencySettings?.autoCallDefaultContact),
                            onChange: async v => {
                                await handleAutoCallToggle(v, safetyContext.setDraft);
                            },
                        },
                    },
                    // Show default contact card when auto call is enabled
                    ...generateDefaultContactCard(
                        safetyContext.draft.autoCallDefaultContact ??
                            Boolean(safetyContext.emergencySettings?.autoCallDefaultContact),
                        safetyContext.emergencySettings?.defaultEmergencyNumbers ?? [],
                    ),
                ],
                onNext: async safetyContext => {
                    if (safetyContext.draft.autoCallDefaultContact !== undefined) {
                        await safetyContext.updateEmergencySettings({
                            autoCallDefaultContact: safetyContext.draft.autoCallDefaultContact,
                        });
                    }
                },
            },
            {
                id: 'moreActions',
                components: safetyContext => [
                    {
                        type: 'ActionGrid',
                        props: {
                            title: undefined,
                            items: [
                                {
                                    id: 'callPolice',
                                    label: safetyContext.userLanguageStrings.CallPolice,
                                    icon: AlertIcon,
                                },
                                {
                                    id: 'recordAudio',
                                    label: safetyContext.userLanguageStrings.RecordAudio,
                                    icon: AudioIcon,
                                },
                                { id: 'siren', label: safetyContext.userLanguageStrings.Siren, icon: VolumeOn },
                                {
                                    id: 'callSafety',
                                    label: safetyContext.userLanguageStrings.CallSafetyTeam,
                                    icon: Headphone,
                                },
                            ],
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.MoreEmergencyActions,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.CallPolice,
                            description: safetyContext.userLanguageStrings.CallPoliceDescription,
                            icon: AlertIcon,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.RecordAudio,
                            description: safetyContext.userLanguageStrings.CallPoliceDescription,
                            icon: AudioIcon,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.Siren,
                            description: safetyContext.userLanguageStrings.CallPoliceDescription,
                            icon: VolumeOn,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.CallSafetyTeam,
                            description: safetyContext.userLanguageStrings.CallPoliceDescription,
                            icon: Headphone,
                        },
                    },
                ],
                onNext: undefined,
            },
        ],
    },
    {
        id: 'safetyTips',
        title: 'Trusted Contact Actions',
        steps: [
            {
                id: 'tips',
                components: safetyContext => [
                    {
                        type: 'HeroImage',
                        props: {
                            image: trustedContactActionsImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.RideActions,
                        },
                    },
                    {
                        type: 'HeroSubtitle',
                        props: {
                            subtitle: safetyContext.userLanguageStrings.RideActionsDescription,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.LiveRideTracking,
                            description: safetyContext.userLanguageStrings.LiveRideTrackingDescription,
                            icon: LiveTracking,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.ChatWithRider,
                            description: safetyContext.userLanguageStrings.ChatWithRiderDescription,
                            icon: Chat,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.EmergencyActions,
                        },
                    },
                    {
                        type: 'HeroSubtitle',
                        props: {
                            subtitle: safetyContext.userLanguageStrings.EmergencyActionsDescription,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.CallPolice,
                            description: safetyContext.userLanguageStrings.CallPoliceDescription,
                            icon: AlertIcon,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.CallSafetyTeam,
                            description: safetyContext.userLanguageStrings.CallSafetyTeamDescription(
                                safetyContext.appName,
                            ),
                            icon: Headphone,
                        },
                    },
                ],
                onNext: undefined,
            },
        ],
    },
    {
        id: 'emergencyContacts',
        title: 'TrustedContactActions',
        steps: [
            {
                id: 'actions',
                components: safetyContext => [
                    {
                        type: 'HeroImage',
                        props: {
                            image: driverSafetyStandardsImage,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.CurrentInitiatives,
                        },
                    },
                    {
                        type: 'HeroSubtitle',
                        props: {
                            subtitle: safetyContext.userLanguageStrings.CurrentInitiativesDescription,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.DriverVerification,
                            description: safetyContext.userLanguageStrings.DriverVerificationDescription,
                            icon: VerifiedProfile,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.SafetyFeedback,
                            description: safetyContext.userLanguageStrings.SafetyFeedbackDescription,
                            icon: Chat,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.SafetyTraining,
                            description: safetyContext.userLanguageStrings.SafetyTrainingDescription,
                            icon: Training,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.DriverIDCheck,
                            description: safetyContext.userLanguageStrings.DriverIDCheckDescription,
                            icon: IdCheck,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.DataPrivacy,
                            description: safetyContext.userLanguageStrings.DataPrivacyDescription,
                            icon: Lock,
                        },
                    },
                    {
                        type: 'HeroTitle',
                        props: {
                            title: safetyContext.userLanguageStrings.UpcomingInitiatives,
                        },
                    },
                    {
                        type: 'HeroSubtitle',
                        props: {
                            subtitle: safetyContext.userLanguageStrings.UpcomingInitiativesDescription,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.FavouriteDrivers,
                            description: safetyContext.userLanguageStrings.FavouriteDriversDescription,
                            icon: FavoriteHeart,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.Dashcam,
                            description: safetyContext.userLanguageStrings.DashcamDescription,
                            icon: DashCam,
                        },
                    },
                    {
                        type: 'InfoActionCard',
                        props: {
                            title: safetyContext.userLanguageStrings.WomenDrivers,
                            description: safetyContext.userLanguageStrings.WomenDriversDescription,
                            icon: WomanIcon,
                        },
                    },
                ],
                onNext: undefined,
            },
        ],
    },
];
