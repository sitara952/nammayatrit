import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';
import { Icon } from '../../components/Icon';
import Typography from './primitives/Typography';
import Divider from './primitives/Divider';
import Tag from './primitives/Tag';
import { ScrollView } from 'react-native-gesture-handler';
import { CurrencyText } from '@/typescript/components/CurrencyText';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type CardBoostSearchSelectionTypes = {
    header: string;
    headerDescription: string;
    headerIcon: React.ReactElement;
    optionHeader: { text: string; minAmount: number; maxAmount: number } | undefined;
    options: { name: string; value: number | string }[];
    onOptionSelect: ((value: string[]) => void) | undefined;
    allowMultipleSelect: boolean | undefined;
    defaultSelectedOptions: string[] | undefined;
    dividerType: 'default' | 'dashed' | undefined;
};

const CardBoostSearchSelection: React.FC<CardBoostSearchSelectionTypes> = ({
    header,
    headerDescription,
    headerIcon,
    optionHeader = undefined,
    options,
    onOptionSelect = () => {},
    allowMultipleSelect,
    defaultSelectedOptions,
    dividerType = 'default',
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [selectedOption, setSelectedOption] = useState<string[]>([]);
    const currencySymbol = CURRENCY_SYMBOL.value;

    useEffect(() => {
        if (defaultSelectedOptions) {
            setSelectedOption(defaultSelectedOptions);
        }
    }, [defaultSelectedOptions]);
    return (
        <Animated.View
            style={tailwind.style(
                `py-[${token?.spacing?.[8]}]  flex-col justify-between gap-[${token?.gap.spacing[10]}] rounded-[${token?.corner?.md}] bg-[${themeColors.Fill_neutralMin}]`,
            )}>
            <Animated.View exiting={FadeOutUp.duration(150)} entering={FadeInUp.springify().damping(28).stiffness(200)}>
                <Animated.View
                    style={tailwind.style(
                        `flex-row py-[${token?.spacing?.[8]}] justify-between items-center px-[${token?.spacing?.[16]}]`,
                    )}>
                    <Animated.View style={tailwind.style(`flex-col `)}>
                        <Typography
                            type="body-1"
                            style={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {header}
                        </Typography>
                        <Typography
                            style={tailwind.style(`mt-[4px] text-[${token?.text?.['text-weak']}]`)}
                            type="body-subtext"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {headerDescription}
                        </Typography>
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style(
                            `w-[40px] h-[40px] rounded-full justify-center items-center bg-[#F1F2F7]`,
                        )}>
                        <Icon
                            icon={headerIcon}
                            size={header === userLanguageStrings.Requestformultiplevehicles ? 24 : 16}
                        />
                    </Animated.View>
                </Animated.View>
                <Animated.View style={tailwind.style(`py-[${token?.spacing?.[8]}] px-[${token?.spacing?.[16]}]`)}>
                    <Divider
                        type={dividerType}
                        direction={undefined}
                        style={undefined}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        dividerColor={undefined}
                        strokeDashArray={undefined}
                    />
                </Animated.View>

                {optionHeader ? (
                    <Animated.View
                        style={tailwind.style(
                            `flex-row py-[${token?.spacing?.[8]}] justify-between items-center px-[${token?.spacing?.[16]}]`,
                        )}>
                        <Typography
                            type="body"
                            style={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {optionHeader.text}
                        </Typography>
                        {optionHeader.minAmount !== optionHeader.maxAmount ? (
                            <Animated.View
                                accessible={false}
                                style={tailwind.style(`flex-row justify-between items-center`)}>
                                <AmountBlock currency={currencySymbol} amount={optionHeader.minAmount} />
                                <Typography
                                    type="body-1"
                                    accessible={false}
                                    style={undefined}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {' '}
                                    -{' '}
                                </Typography>
                                <AmountBlock currency={currencySymbol} amount={optionHeader.maxAmount} />
                            </Animated.View>
                        ) : (
                            <AmountBlock currency={currencySymbol} amount={optionHeader.minAmount} />
                        )}
                    </Animated.View>
                ) : null}

                <Animated.View style={tailwind.style(`py-[${token?.spacing?.[8]}]`)}>
                    <AnimatedScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={tailwind.style(`flex-row gap-[8px] px-[${token?.spacing?.[16]}]`)}>
                        {options?.map((item, index) => (
                            <Tag
                                testID={`ff116e1c-d949-46a5-b922-32977d9d0be9-${index}`}
                                size="md"
                                key={item?.value}
                                type="secondary"
                                text={item?.name}
                                accessibilityLabel={item?.name}
                                accessibilityHint={
                                    `Selected items price range ${currencySymbol}` +
                                    optionHeader?.minAmount +
                                    ` to ${currencySymbol}` +
                                    optionHeader?.maxAmount
                                }
                                accessibilityRole="combobox"
                                accessibilityState={{
                                    /* eslint-disable-next-line myCustomPlugin/no-as-in-modified-files */
                                    selected: selectedOption?.includes(item?.value as string) ?? false,
                                }}
                                onPress={() => {
                                    const currentSelected = selectedOption ?? [];
                                    const itemValue = item.value?.toString();

                                    if (currentSelected.includes(itemValue)) {
                                        if (currentSelected.length === 1 && allowMultipleSelect) return;

                                        const updatedData = currentSelected.filter(v => v !== itemValue);
                                        setSelectedOption(updatedData);
                                        onOptionSelect(
                                            updatedData.map(
                                                dataItem =>
                                                    options
                                                        .find(opt => opt.value?.toString() === dataItem)
                                                        ?.value?.toString() || '',
                                            ),
                                        );
                                    } else {
                                        const updatedData = allowMultipleSelect
                                            ? [...currentSelected, itemValue]
                                            : [itemValue];

                                        setSelectedOption(updatedData);
                                        onOptionSelect(
                                            updatedData.map(
                                                dataItem =>
                                                    options
                                                        .find(opt => opt.value?.toString() === dataItem)
                                                        ?.value?.toString() || '',
                                            ),
                                        );
                                    }
                                }}
                                /* eslint-disable-next-line myCustomPlugin/no-as-in-modified-files */
                                selected={selectedOption?.includes(item?.value as string)}
                            />
                        ))}
                    </AnimatedScrollView>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default CardBoostSearchSelection;

type AmountBlockProps = {
    currency: string;
    amount: number;
};

const AmountBlock: React.FC<AmountBlockProps> = ({ currency, amount }) => {
    const currencySymbol = CURRENCY_SYMBOL.value;

    return (
        <CurrencyText
            textType="body-1"
            text={`${currency === '₹' ? currencySymbol : currency}${amount}`}
            currencyStyle={tailwind.style('font-inter-bold')}
            accessible={false}
        />
    );
};
