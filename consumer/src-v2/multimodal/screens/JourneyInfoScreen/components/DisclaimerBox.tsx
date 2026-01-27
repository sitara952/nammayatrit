import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import React from 'react';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { FRFSServiceTierType_fRFSServiceTierType } from '@/readOnly/api/types/Enums.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface BulletPointProps {
    text: string;
}

const BulletPoint: React.FC<BulletPointProps> = ({ text }) => {
    return (
        <Animated.View style={tailwind.style('flex-row items-start mb-2')}>
            <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#7E7E7E] mr-2')}>
                •
            </Animated.Text>
            <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#7E7E7E] flex-1')}>
                {text}
            </Animated.Text>
        </Animated.View>
    );
};

interface DisclaimerBoxProps {
    legmode: MultimodalTravelMode_multimodalTravelMode;
    serviceTiers: FRFSServiceTierType_fRFSServiceTierType[] | undefined;
}

export const DisclaimerBox: React.FC<DisclaimerBoxProps> = ({ legmode, serviceTiers }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const suburbanDisclaimerTexts = [
        userLanguageStrings.suburbanDisclaimerCheckNextTrains,
        userLanguageStrings.suburbanDisclaimerNoCancellations,
        userLanguageStrings.suburbanDisclaimerFirstClassNotAvailable,
        userLanguageStrings.suburbanDisclaimerNoBookingFromStation,
    ];

    const getBusDisclaimerTexts = (
        serviceTiers: (FRFSServiceTierType_fRFSServiceTierType | null | undefined)[],
    ): string[] => {
        if (serviceTiers.length === 0 || serviceTiers.every(tier => tier === null || tier === undefined)) {
            return [];
        }

        const tierDisclaimers = serviceTiers
            .map(tier => {
                switch (tier) {
                    case 'AC':
                        return userLanguageStrings.busacticketdisclaimer;
                    case 'EXECUTIVE':
                        return userLanguageStrings.busDisclaimerDeluxeValidIn;
                    case 'ORDINARY':
                        return userLanguageStrings.busDisclaimerOrdinaryValidOnly;
                    case 'EXPRESS':
                        return userLanguageStrings.busDisclaimerExpressValidIn;
                    default:
                        return null;
                }
            })
            .filter(t => t != null);

        return tierDisclaimers;
    };

    const disclaimerContent = (() => {
        switch (legmode) {
            case 'Subway':
                return { content: suburbanDisclaimerTexts, title: userLanguageStrings.suburbanDisclaimerTitle };
            case 'Bus':
                return {
                    content: getBusDisclaimerTexts(serviceTiers || []),
                    title: userLanguageStrings.busDisclaimerTitle,
                };
            default:
                return null;
        }
    })();

    if (!disclaimerContent || disclaimerContent.content.length === 0) {
        return null;
    }

    return (
        <Animated.View style={tailwind.style('p-4 rounded-[20px] bg-white border border-[#F1F2F2] mt-4')}>
            <Animated.Text
                style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C] text-center mb-3')}>
                {disclaimerContent.title}
            </Animated.Text>
            <Animated.View style={tailwind.style('px-2')}>
                {disclaimerContent.content.map((text, index) => (
                    <BulletPoint key={index} text={text} />
                ))}
            </Animated.View>
        </Animated.View>
    );
};
