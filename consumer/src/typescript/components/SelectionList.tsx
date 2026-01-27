import React from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ListItem } from './ListItem';
import { Dot } from './svg/Dot';
import { UnFilled } from './svg/UnfilledDot';
import { tailwind } from '../tailwindTheme/tailwind';
import Typography from '../designSystem/components/primitives/Typography';
import { Pressable } from '@/src-v2/primitives/Pressable';

export interface SelectionListProps {
    label: string | undefined;
    optionArray: string[];
    onSelect: (index: number) => void;
    style: ViewStyle | undefined;
    selectedIndex: number | undefined;
    isSelected: boolean | undefined;
    labelStyle: TextStyle | undefined;
    disabled: boolean | undefined;
}

export function SelectionList({
    label,
    optionArray,
    onSelect,
    style,
    selectedIndex,
    isSelected,
    labelStyle,
    disabled = false,
}: SelectionListProps) {
    const [currIndex, setCurrIndex] = React.useState(isSelected ? selectedIndex : -1);

    const data = optionArray.map((title, index) => ({
        title,
        state: index === currIndex ? ('Active' as const) : ('Default' as const),
        activeIcon: index === currIndex ? <Dot color={undefined} /> : <UnFilled color={undefined} />,
        index,
    }));

    const handleSelect = (index: number) => {
        setCurrIndex(index);
        onSelect(index);
    };

    return (
        <View
            style={[
                tailwind.style(disabled ? ` opacity-50 pb-3 ` : 'pb-3'),
                // styles.container,
                style,
            ]}>
            {label && (
                <Typography
                    type="body-7"
                    style={[tailwind.style('mb-2 pt-1 leading-[18px]'), labelStyle ? labelStyle : '']}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {label}
                </Typography>
            )}
            <View style={{ flexWrap: 'wrap' }} accessibilityRole="radiogroup">
                {data.map((item, index) => (
                    <View key={item.index.toString()}>
                        <Pressable
                            testID={`784c77b0-edd1-4e96-8f12-3b0eab863358-${index}`}
                            onPress={() => handleSelect(item.index)}
                            accessible
                            disabled={disabled}
                            accessibilityLabel={item.title}
                            accessibilityRole="radio"
                            // style={tailwind.style(disabled ? ` opacity-50` : '')}
                            accessibilityState={{ selected: item.index === currIndex }}>
                            <View style={[styles.listItemContainer]}>
                                <ListItem
                                    state={item.state}
                                    style="Boxed"
                                    title={item.title}
                                    showLeadingIcon
                                    leadingIcon={item.activeIcon}
                                />
                            </View>
                        </Pressable>
                        {index < data.length - 1 && <View style={styles.separator} />}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    separator: {
        height: 8,
    },
});
