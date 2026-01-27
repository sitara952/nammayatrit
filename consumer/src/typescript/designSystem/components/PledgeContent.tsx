import mtIcCeoSignature from '../../assets/ny-service/mt_ic_ceo_signature.webp';
import driverPledge from '@/typescript/assets/ic_driver_pledge.webp';
import driverPledgeCab from '@/typescript/assets/ic_driver_pledge_cab.webp';

import React from 'react';
import { tailwind } from '../../tailwindTheme/tailwind';
import Animated from 'react-native-reanimated';
import Typography from './primitives/Typography';
import { View } from 'react-native';

import { colors } from 'config-types/src/domain/default/themes/colors';
import { selectAppConfig, selectAppReadableName } from '../../state/client/session';
import { useAppSelector } from '../../state/hooks';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Image } from 'react-native';

export type PledgeContentProps = {
    driverAnimation: boolean | undefined;
    pledgeText: string;
    isCab: boolean;
    isDriverProfile: boolean;
    driverName: string | undefined;
};

const PledgeContent = ({
    driverAnimation = true,
    pledgeText,
    isCab = false,
    isDriverProfile = false,
    driverName = '',
}: PledgeContentProps) => {
    const appNameString = useAppSelector(selectAppReadableName);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);
    return (
        <View style={tailwind.style(driverAnimation && isDriverProfile ? 'pb-[400px]' : '')}>
            <Typography
                style={tailwind.style(
                    `text-[17px] mx-auto max-w-[170px] leading-[23px] text-center ${driverAnimation ? 'pt-[60px]' : 'pt-[40px]'}`,
                )}
                type={'subhead-1'}
                numberOfLines={2}
                isAnimate={undefined}
                accessible={false}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {isDriverProfile
                    ? userLanguageStrings.PromiseFromNammaYatri(driverName)
                    : userLanguageStrings.PromiseFromNammaYatri(
                          appConfig.appType === 'multimodal' ? 'Namma Yatri' : appNameString,
                      )}
            </Typography>
            <Typography
                type="callout"
                style={tailwind.style(
                    `text-center pt-6 text-[${colors.gray300}] max-w-[267px] mx-auto text-[14px] leading-[26px]`,
                )}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={false}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {pledgeText}
            </Typography>
            {!isDriverProfile && (
                <>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="ceo signature image"
                        source={mtIcCeoSignature}
                        style={tailwind.style('max-w-[120px] h-[71px] mx-auto mt-[30px]')}
                    />
                    <Typography
                        type="body-1"
                        style={tailwind.style(`text-[${colors.gray200}] mx-auto pt-[4px]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={false}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        Magizhan Selvan
                    </Typography>
                    <Typography
                        type="body-1"
                        style={tailwind.style(
                            `text-[${colors.gray300}] mx-auto ${!driverAnimation ? '' : 'pb-[400px]'}`,
                        )}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={false}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        CEO
                    </Typography>
                </>
            )}
            {driverAnimation && (
                <Image
                    accessible={true}
                    accessibilityLabel="pledge image"
                    source={isCab ? driverPledgeCab : driverPledge}
                    style={tailwind.style('w-[400px] h-[400px] absolute bottom-0 self-center')}
                />
            )}
        </View>
    );
};

export default PledgeContent;
