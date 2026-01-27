import React from 'react';
import Animated from 'react-native-reanimated';
import Typography from '../../designSystem/components/primitives/Typography';
import { tailwind } from '../../tailwindTheme/tailwind';
import { Rect } from 'react-native-svg';
import ContentLoader from './ContentLoader';
import Button from '@/src-v2/primitives/Button';
import Divider from './primitives/Divider';
import { CurrencyText } from '../../components/CurrencyText';
import token from '../tokens';
import colors from '../colorPalette';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

interface RevisedFareCardProps {
    headerString?: string;
    newFare?: string;
    prevFare: string | null;
    newDist?: string;
    previousDist?: string;
    footerString?: string;
    isLoading?: boolean;
    buttonClick?: () => void;
}

const RevisedFareCard = (props: RevisedFareCardProps) => {
    const { headerString, newFare, prevFare, newDist, previousDist, footerString, isLoading } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const currencySymbol = CURRENCY_SYMBOL.value;
    const { bottom } = useSafeAreaInsets();
    return (
        <Animated.View
            style={[
                tailwind.style(`bg-[${colors.primitive.gray[11]}]`),
                {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    paddingTop: 24,
                    paddingBottom: bottom,
                    paddingHorizontal: 20,
                },
            ]}>
            {isLoading ? (
                <ContentLoader height={24} width={'50%'}>
                    <Rect x="0" y="0" rx="6" ry="6" width="50%" height="18" />
                </ContentLoader>
            ) : (
                <Typography
                    type="subhead-800"
                    style={tailwind.style('text-[#14171F]')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {headerString ?? ''}
                </Typography>
            )}
            <Animated.View
                style={tailwind.style(
                    `bg-[${colors.primitive.white[10]}] rounded-lg border-[1px] border-[${colors?.primitive.gray[14]}]  my-5 p-4`,
                )}>
                {isLoading ? (
                    <ContentLoader height={24} width={'50%'}>
                        <Rect x="0" y="0" rx="6" ry="6" width="50%" height="18" />
                    </ContentLoader>
                ) : (
                    <CurrencyText
                        text={`${currencySymbol}${newFare ?? '--'}`}
                        textType="title-800"
                        currencyStyle={tailwind.style('font-inter-bold')}
                        textStyle={{
                            textAlign: 'center',
                            fontSize: 32,
                            lineHeight: 35,
                            paddingBottom: 9,
                            color: '#2F2935',
                        }}
                    />
                )}
                <Divider
                    type="dashed"
                    dividerColor="#B2B9C7"
                    strokeDashArray="7 6"
                    direction={undefined}
                    style={undefined}
                    labelPosition={undefined}
                    offset={undefined}
                    offsetBackground={undefined}
                />
                <Animated.View style={tailwind.style(`my-3`)}>
                    {isLoading ? (
                        <ContentLoader height={24} width={'50%'}>
                            <Rect x="0" y="0" rx="6" ry="6" width="50%" height="18" />
                        </ContentLoader>
                    ) : (
                        <>
                            {prevFare !== null && Number(prevFare) > 0 && (
                                <Animated.View style={tailwind.style(' flex-row justify-between')}>
                                    <Typography
                                        type="body-7"
                                        style={tailwind.style('text-[14px]')}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.PreviousFare + ':'}
                                    </Typography>
                                    <CurrencyText
                                        text={`${currencySymbol}${prevFare ?? ''}`}
                                        textType="body-7"
                                        currencyStyle={tailwind.style('font-inter-bold')}
                                        textStyle={tailwind.style('text-[14px]')}
                                    />
                                </Animated.View>
                            )}
                            <Typography
                                type="body-7"
                                style={tailwind.style(`text-[12px] text-[#5B6777] pt-[${token?.spacing?.[8]}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {'' +
                                    ((newDist ? newDist : '') +
                                        ` (${userLanguageStrings.Previously} ` +
                                        (previousDist ?? '') +
                                        ')')}
                            </Typography>
                        </>
                    )}
                </Animated.View>
                {isLoading ? (
                    <ContentLoader height={24} width={'100%'}>
                        <Rect x="0" y="0" rx="6" ry="6" width="100%" height="18" />
                    </ContentLoader>
                ) : footerString ? (
                    <Animated.View style={tailwind.style(`bg-[#FFECC6] py-3 px-2 rounded-[${token?.corner?.md}] `)}>
                        <Typography
                            type="body-subtext"
                            style={tailwind.style('text-center')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {footerString ?? ''}
                        </Typography>
                    </Animated.View>
                ) : null}
            </Animated.View>
            <Button
                testID="49b5aeae-1536-44f9-b0c3-4117908ddbc4"
                text={userLanguageStrings.RequestRide}
                onPress={props.buttonClick}
                type="primary"
                disabled={isLoading}
            />
        </Animated.View>
    );
};

export default RevisedFareCard;
