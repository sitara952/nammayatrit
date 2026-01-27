import React from 'react';
import Animated from 'react-native-reanimated';
import { Icon } from '@/typescript/components/Icon';
import TipCharge from '@/typescript/components/svg/TipCharge';
import colors from '@/typescript/designSystem/colorPalette';
import { CurrencyText } from '@/typescript/components/CurrencyText';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

type RideDetailRowType = {
    name: string;
    cost: number;
};

const RideDetailRow = ({ name, cost }: RideDetailRowType) => {
    const currencySymbol = CURRENCY_SYMBOL.value;

    return (
        <Animated.View
            style={tailwind.style(
                `py-[${token?.spacing?.[12]}] border-t border-t-[${colors?.primitive?.black?.[1]}] flex-row justify-between`,
            )}>
            <Animated.View style={tailwind.style(`flex-row gap-[${token?.spacing?.[8]}]`)}>
                <Icon size={20} icon={<TipCharge />} />
                <Typography
                    type="body-2"
                    style={tailwind.style(`text-[${token?.text?.['text-inverse-bold']}] leading-[21px]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {`${name}`}
                </Typography>
            </Animated.View>
            <CurrencyText
                textType="subhead-1"
                currencyStyle={[tailwind.style('font-inter-extrabold')]}
                textStyle={tailwind.style(`text-[${token?.text?.['text-inverse-highContrast']}]`)}
                text={`${currencySymbol}${cost}`}
            />
        </Animated.View>
    );
};

export default RideDetailRow;
