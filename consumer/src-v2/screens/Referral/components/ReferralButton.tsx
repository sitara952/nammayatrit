import nyIcReferralProfileIcon from '@/resources/assets/png/referral/ny_ic_referral_profile_icon.webp';
import colors from '@/typescript/designSystem/colorPalette';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleType } from '@/typescript/types/CommonTypes';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type ReferralButtonProps = {
    style: StyleType;
    onPress: () => void;
};

export const ReferralButton: React.FC<ReferralButtonProps> = props => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View style={[props.style]}>
            <Button
                testID="referral_got_referral_code"
                size="md"
                type="secondary"
                onPress={props.onPress}
                style={[
                    tailwind.style(
                        `bg-[${themeColors.Fill_neutralMin}] h-40px py-2 px-3 rounded-[${token?.corner?.lg}]`,
                    ),
                    { elevation: 5 },
                ]}>
                <Image
                    accessible={true}
                    accessibilityLabel="referral profile icon"
                    source={nyIcReferralProfileIcon}
                    style={[styles.referralProfileIconStyles]}
                />
                <Typography
                    type="body-1"
                    style={[styles.textStyle]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.GotAReferralCode}
                </Typography>
            </Button>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    referralButtonShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
        backgroundColor: 'white',
        zIndex: 1,
    },
    textStyle: tailwind.style('text-center text-[' + `${colors?.recovered?.neutralUltraHigh}` + ']'),
    referralProfileIconStyles: tailwind.style('w-5 h-5 m-auto mr-2.0'),
});
