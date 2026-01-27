import Animated, { FadeIn } from 'react-native-reanimated';
import React from 'react';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';
import Typography from './primitives/Typography';
import Divider from './primitives/Divider';
import PassengerIcon from '../../assets/svg/symbols/PassengerIcon';
import { getVehicleImage } from '../../utils/bookingUtils';

import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';

import { useConfigContext } from '@/typescript/context/ConfigContext';

type CardRideOTPTypes = {
    serviceTierType: ServiceTierType_serviceTierType | undefined;
    serviceTierName: string | undefined;
    otpCode: string;
    capacity: number;
};

const CardRideOTP = ({
    serviceTierType = 'AUTO_RICKSHAW',
    serviceTierName = 'Auto',
    otpCode,
    capacity,
}: CardRideOTPTypes) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View
            entering={FadeIn.delay(100)}
            style={tailwind.style(
                `p-[${token?.spacing?.[16]}] rounded-[${token?.corner?.md}] bg-[${themeColors.Fill_neutralMin}] border border-[${themeColors.Fill_neutralLow}]`,
            )}>
            <Animated.View>
                <Typography
                    type="body-1"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Boardthefirstridefrompickupzone}
                </Typography>
                <Typography
                    style={tailwind.style(`mt-[4px] text-[${token?.text?.['text-weak']}]`)}
                    type="body-subtext"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.ShareOTPtostartyourride(otpCode)}
                </Typography>
            </Animated.View>
            <Divider
                style={tailwind.style(`py-[${token?.spacing?.[16]}]`)}
                type="dashed"
                direction={undefined}
                labelPosition={undefined}
                offset={undefined}
                offsetBackground={undefined}
                dividerColor={undefined}
                strokeDashArray={undefined}
            />
            <Animated.View style={tailwind.style(`flex-row justify-between items-center`)}>
                <Animated.View style={tailwind.style(`flex-col justify-between`)}>
                    <Typography
                        type="body-1"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.RideType(serviceTierName)}
                    </Typography>
                    <Animated.View
                        style={tailwind.style(`flex-row items-center gap-[${token?.gap?.spacing?.[6]}] pt-1`)}>
                        <PassengerIcon />
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {`${capacity}`}
                        </Typography>
                    </Animated.View>
                </Animated.View>
                {serviceTierType && (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="vehicle image"
                        source={getVehicleImage(serviceTierType, undefined)} // Use the utility function to get the image
                        style={tailwind.style(`w-[55px] h-[45px]`)}
                        resizeMode="contain"
                    />
                )}
            </Animated.View>
        </Animated.View>
    );
};

export default CardRideOTP;
