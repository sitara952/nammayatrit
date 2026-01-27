import generalDisability from '@/typescript/assets/general_disability.webp';
import driverAndPhysicallyAbled from '@/typescript/assets/driver_and_physically_abled.webp';
import driverAndDeaf from '@/typescript/assets/driver_and_deaf.webp';
import driverAndBlind from '@/typescript/assets/driver_and_blind.webp';
import React from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useAppSelector } from '@/typescript/state/hooks';

import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { Icon } from '@/typescript/components/Icon';
import CloseCross from '@/typescript/components/svg/CloseCross';
import DotIcon from '@/typescript/components/svg/DotIcon';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { selectUserProfile } from '@/typescript/state/client/user.ts';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectAppReadableName } from '@/typescript/state/client/session';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';

interface DisabilityPopUpProps {
    onClick: () => Promise<void>;
}

const BlindLowVision = driverAndBlind;
const HearImpairment = driverAndDeaf;
const LocomotorDisability = driverAndPhysicallyAbled;
const Other = generalDisability;

const DisabilityPopUp: React.FC<DisabilityPopUpProps> = ({ onClick }) => {
    const { bottom } = useSafeAreaInsets();
    const userProfile = useAppSelector(selectUserProfile);
    const { disabilityPopUp } = useRefsContext();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appName = useAppSelector(selectAppReadableName);
    const getDisabilityImage = () => {
        switch (userProfile?.disability) {
            case 'BLIND_LOW_VISION':
                return BlindLowVision;
            case 'HEAR_IMPAIRMENT':
                return HearImpairment;
            case 'LOCOMOTOR_DISABILITY':
                return LocomotorDisability;
            case 'OTHER':
                return Other;
            default:
                return Other;
        }
    };

    const ListItem = ({ text }: { text: string }) => (
        <View style={tailwind.style('pl-1 flex flex-row pt-2 items-start justify-start')}>
            <Icon icon={<DotIcon />} size={14} />
            <Typography
                type="subhead-700"
                style={tailwind.style('text-xs text-[#5B6777] text-wrap font-semibold pl-0.5')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {text}
            </Typography>
        </View>
    );

    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.Fill_neutralUltraLow}] pt-[29px] pb-[${bottom}px] px-[16px] rounded-[15px]`,
            )}>
            <View style={tailwind.style('flex flex-row pb-[20px]')}>
                <View style={tailwind.style('flex-1 pr-4')}>
                    <Typography
                        type="subhead-1"
                        style={tailwind.style('text-lg font-extrabold leading-6')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.NammaYatriNowCustomisedForYou(appName)}
                    </Typography>
                    <View style={tailwind.style('flex flex-row mt-4 items-center')}>
                        <Image
                            accessible={false}
                            source={getDisabilityImage()}
                            style={tailwind.style('h-[186px] w-[343px]')}
                        />
                    </View>
                </View>
                <Pressable
                    accessibilityRole="button"
                    testID="profile_disability_popup_close"
                    accessibilityLabel="Close disability pop up button"
                    style={tailwind.style('justify-start pl-4 mr-2')}
                    onPress={() => disabilityPopUp?.current?.close()}>
                    <Icon
                        icon={<CloseCross />}
                        size={34}
                        accessibilityLabel="Close disability pop up"
                        accessibilityRole="button"
                    />
                </Pressable>
            </View>

            <View style={tailwind.style('px-3')}>
                <Typography
                    type="subhead-700"
                    style={tailwind.style('text-xs font-extralight text-[#5B6777] font-semibold mb-4')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.ToCaterToYourSpecificNeedsWeHaveCustomisedCertainFeaturesOfNammaYatri(appName)}
                </Typography>
                <View style={tailwind.style('pr-4')}>
                    {[
                        userLanguageStrings.DriversWillBePromptedToCallInsteadOfTexting,
                        userLanguageStrings.DriversWillBePromptedToSoundHornOnceAtThePickup,
                        userLanguageStrings.DriversWillBeSensitisedToHelpYouWithYourNeedsAndRequests,
                    ].map((text, index) => (
                        <ListItem key={index} text={text} />
                    ))}
                </View>
            </View>

            <View style={tailwind.style('mt-4')}>
                <Button
                    testID="profile_disability_got_it"
                    type="primary"
                    text={userLanguageStrings.GotIt}
                    disabled={false}
                    onPress={async () => {
                        await onClick();
                    }}
                />
            </View>
        </Animated.View>
    );
};

export default DisabilityPopUp;
