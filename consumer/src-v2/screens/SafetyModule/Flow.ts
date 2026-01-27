import { strings, ThemeTokens } from 'config-types';
import { personDefaultEmergencyNumberAPIEntity } from '../../../src/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { SOSTool } from '../../../src/typescript/state/client/sos';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { sosReq } from '@/readOnly/api/types/SosReq.gen';
import { RideId } from '@/typescript/state/client/booking';
import { getCurrentLocation } from '@/typescript/utils/location';
import { sosType } from '@/readOnly/api/types/SosType.gen';

export const transformEmergencyContacts = (contacts: Array<personDefaultEmergencyNumberAPIEntity>) => {
    return (
        contacts?.map((contact: personDefaultEmergencyNumberAPIEntity) => {
            const [firstName, lastName] = contact.name.split(' ');

            return {
                name: contact.name,
                profile: `${firstName?.[0] || 'A'}${lastName?.[0] || ''}`,
                status: 'unknown',
                id: contact.contactPersonId || '',
                mobileNumber: contact.mobileNumber,
                priority: contact.priority,
            };
        }) || []
    );
};

export const getSafetyCreatePostBody = async (rideId: RideId | null | string, flow: sosType) => {
    const location = await getCurrentLocation();
    const sosRequestBody: sosReq = {
        customerLocation: {
            lat: location.coords.latitude,
            lon: location.coords.longitude,
        },
        flow: flow,
        isRideEnded: false,
        notifyAllContacts: false,
        rideId: rideId ?? '',
        sendPNOnPostRideSOS: undefined,
    };
    return sosRequestBody;
};

export function getRandomColor(themeColors: ThemeTokens) {
    const colorList = [themeColors.Text_info, colors.recovered.warning, themeColors.Fill_orange];

    const randomIndex = Math.floor(Math.random() * 3);
    return colorList[randomIndex];
}

export const safetyToolsList = (
    userLanguageStrings: strings,
    themeColors: ThemeTokens,
    enableSafetyCall: boolean,
): Array<{
    label: string;
    imgFill: string;
    id: SOSTool;
}> => {
    const baseTools: Array<{ label: string; imgFill: string; id: SOSTool }> = [
        {
            label: userLanguageStrings.RecordAudio,
            imgFill: themeColors.Text_info,
            id: 'RecordAudio',
        },
        {
            label: userLanguageStrings.CallPolice,
            imgFill: themeColors.Fill_negativeHigh,
            id: 'CallPolice',
        },
    ];
    const safetyCallTool: { label: string; imgFill: string; id: SOSTool } = {
        label: userLanguageStrings.CallSafetyTeam,
        imgFill: colors.recovered.warning,
        id: 'CallSafetyTeam',
    };

    return enableSafetyCall ? [...baseTools, safetyCallTool] : baseTools;
};

export const safetyToolsListActive = (
    userLanguageStrings: strings,
    themeColors: ThemeTokens,
    enableSafetyCall: boolean,
): Array<{
    label: string;
    imgFill: string;
    id: SOSTool;
}> => {
    const safetyListActiveData: Array<{ label: string; imgFill: string; id: SOSTool }> = [
        {
            label: userLanguageStrings.RecordAudio,
            imgFill: themeColors.Fill_neutralMax,
            id: 'RecordAudio',
        },
        {
            label: userLanguageStrings.CallPolice,
            imgFill: themeColors.Fill_neutralMax,
            id: 'CallPolice',
        },
        {
            label: userLanguageStrings.Siren,
            imgFill: themeColors.Fill_neutralMax,
            id: 'PlaySiren',
        },
    ];
    const safetyCallTool: { label: string; imgFill: string; id: SOSTool } = {
        label: userLanguageStrings.CallSafetyTeam,
        imgFill: themeColors.Fill_neutralMax,
        id: 'CallSafetyTeam',
    };

    return enableSafetyCall ? [...safetyListActiveData, safetyCallTool] : safetyListActiveData;
};
