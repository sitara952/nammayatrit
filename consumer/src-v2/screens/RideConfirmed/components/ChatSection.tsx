import React from 'react';
import { View } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import token from '@/typescript/designSystem/tokens/index';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { personDefaultEmergencyNumberAPIEntity as emergencyContactNumber } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen.tsx';
import { FeatureFlags } from '@/src-v2/systems/configs/types';

interface ChatSectionProps {
    currentChatSessionId: string | null;
    rideDetails: rideAPIEntity | null;
    rideId: string | null;
    emergencyContacts: Array<emergencyContactNumber>;
    featureFlags: FeatureFlags;
    hideAccessibility: boolean;
}

const ChatSection: React.FC<ChatSectionProps> = ({
    currentChatSessionId,
    rideDetails,
    rideId,
    emergencyContacts,
    featureFlags,
    hideAccessibility,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <View
            accessibilityElementsHidden={hideAccessibility}
            importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}
            style={[tailwind.style(`px-[${token?.spacing[16]}]`)]}>
            <View>
                {(currentChatSessionId && rideDetails && rideId && rideDetails?.status !== 'INPROGRESS') ||
                (featureFlags.rideStartContactTrustedContacts &&
                    rideId &&
                    rideDetails &&
                    emergencyContacts.filter(v => v.contactPersonId && v.contactPersonId !== '').length > 0) ? (
                    // Chat card would go here
                    <></>
                ) : rideDetails && !featureFlags.rideStartContactTrustedContacts ? (
                    <Typography
                        type="subhead-800"
                        style={tailwind.style('font-areaNormal-extrabold')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.BookingDetailsforthisjourney}
                    </Typography>
                ) : null}
            </View>
        </View>
    );
};

export default ChatSection;
