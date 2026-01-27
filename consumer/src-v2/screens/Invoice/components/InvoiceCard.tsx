import React from 'react';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';

import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { CostDataType, InvoiceScreenAction, pdfProps } from '../Types';

import { Resolver } from '@/typescript/utils/common';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { fareDetail } from '@/typescript/utils/fareEntityHelper';

const CostData = ({ cost, name }: CostDataType) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <Animated.View style={tailwind.style('flex-row justify-between items-center')}>
            <Typography
                type="body"
                style={tailwind.style(`text-[${themeColors.Text_neutralHigh}]`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {name}
            </Typography>
            <Animated.View style={tailwind.style('flex-row gap-1 items-center justify-center')}>
                <Typography
                    type="subhead-1"
                    style={tailwind.style(`text-[${themeColors.Text_neutralHigh}]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {`${cost}`}
                </Typography>
            </Animated.View>
        </Animated.View>
    );
};

type InvoiceCardProps = {
    data: fareDetail[];
    rideDetail: rideAPIEntity;
    sourceAddress: string;
    destinationAddress: string;
    endDate: string | undefined;
    endTime: string | undefined;
    pdfProps: pdfProps;
    invDispatch: Resolver<InvoiceScreenAction>;
};
const InvoiceCard = ({ data, endDate, endTime, pdfProps }: InvoiceCardProps) => {
    const total = pdfProps.finalAmount;

    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style(`flex-col items-center justify-center`)}>
            <Animated.View
                style={tailwind.style(
                    'px-5 pt-5 pb-2 flex-col justify-center items-center mb-3 bg-white mt-5 gap-1 rounded-lg w-full',
                )}>
                <Typography
                    type="subhead-700"
                    style={tailwind.style(`mb-6px text-[${themeColors.Text_neutralMax}]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.TotalPaid}
                </Typography>
                <Typography
                    type="title-800"
                    style={{ fontSize: 26, paddingTop: 2, lineHeight: 27 }}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>{`${total.toString()}`}</Typography>
                <Typography
                    type="subhead-700"
                    style={tailwind.style(`text-[${themeColors.Text_neutralHigh}]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>{`${endDate} • ${endTime}`}</Typography>
                <Animated.View style={tailwind.style('w-11/12 justify-center py-3 mx-auto flex-row')}>
                    <Divider
                        type="dashed"
                        dividerColor={`${themeColors.Fill_neutralMid}`}
                        direction={undefined}
                        style={undefined}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        strokeDashArray={undefined}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style(`flex-col gap-5 justify-center mb-5 items-between w-full`)}>
                    {data.map((item, _) => (
                        <CostData key={item.title} cost={item.amountText} name={item.key} />
                    ))}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default InvoiceCard;
