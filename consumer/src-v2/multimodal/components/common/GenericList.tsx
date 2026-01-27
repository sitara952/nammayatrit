import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../tailwind-theme/tailwind';

import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import { Icon } from '../common/Icon';
import { CaretRight } from '../svg/Caret';

export interface GenericListType {
    key?: string;
    title?: string;
    icon?: React.JSX.Element;
    subtitle?: string;
    subtitleType?: 'dark' | 'light';
    hasChevron?: boolean;
    onPressListItem?: (key?: string) => void;
    isDestructive?: boolean;
    isDisabled?: boolean;
    hidden?: boolean;
}

type GenericListProps = {
    sectionTitle: string | undefined;
    list: GenericListType[];
};

type ListItemProps = {
    listItem: GenericListType;
    index: number;
    isLastItem: boolean;
    itemKey: string | undefined;
};

const ListItem = (props: ListItemProps) => {
    const { listItem, index, isLastItem, itemKey } = props;
    const hapticSelection = useHaptic(undefined, undefined);
    const pressableRef = useRef(null);

    const accessibilityFocusConfig = useMemo(
        () => ({
            mainContentRef: pressableRef,
            focusDelay: 100,
            accessibilityDelay: 50,
            maxStackSize: 10,
        }),
        [],
    );

    useAccessibilityFocus(accessibilityFocusConfig);

    const handleListItemPress = useCallback(() => {
        hapticSelection?.();
        // Announce the action for accessibility
        if (listItem.title) {
            AccessibilityInfo.announceForAccessibilityWithOptions(
                `${listItem.title}${listItem.isDisabled ? ' is disabled' : ' selected'}`,
                { queue: true },
            );
        }
        listItem?.onPressListItem?.(itemKey);
    }, [hapticSelection, listItem, itemKey]);

    // Build accessibility label
    const accessibilityLabel = useMemo(() => {
        const label = listItem.title || '';
        const subtitle = listItem.subtitle ? `, ${listItem.subtitle}` : '';
        const warning = listItem.isDestructive ? ', Warning' : '';
        return label + subtitle + warning;
    }, [listItem.title, listItem.subtitle, listItem.isDestructive]);

    // Build accessibility hint
    const accessibilityHint = useMemo(() => {
        if (listItem.isDisabled) {
            return 'This option is currently disabled';
        }
        return listItem.hasChevron ? 'Double tap to navigate' : 'Double tap to select';
    }, [listItem.isDisabled, listItem.hasChevron]);

    return (
        <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityHint={accessibilityHint}
            accessibilityState={{
                disabled: listItem.isDisabled,
            }}
            disabled={listItem.isDisabled}
            accessibilityLabel={accessibilityLabel + ' button'}
            onPress={handleListItemPress}
            key={index}
            testID="a628f94c-8087-46ac-a882-6cad5350e16c"
            style={({ pressed }) => [
                tailwind.style(
                    pressed ? 'bg-gray-100' : '',
                    index === 0 ? 'rounded-t-[13px]' : '',
                    isLastItem ? 'rounded-b-[13px]' : '',
                ),
            ]}>
            <Animated.View ref={pressableRef} style={tailwind.style('flex flex-row items-center pl-3')}>
                {listItem.icon ? (
                    <Animated.View accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
                        <Icon color={listItem.isDestructive ? '#EB544A' : '#171717'} icon={listItem.icon} size={16} />
                    </Animated.View>
                ) : null}
                <Animated.View
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no-hide-descendants"
                    style={tailwind.style(
                        'flex-1 flex-row items-center justify-between py-[16px]',
                        listItem.icon ? 'ml-3' : '',
                        !isLastItem ? 'border-b-[1px] border-b-[#F3F3F3]' : '',
                    )}>
                    <Animated.View>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-base font-areaNormal-bold leading-[22px] tracking-[0.16px] text-[#171717]',
                                listItem.isDestructive ? 'text-[#EB544A]' : '',
                            )}>
                            {listItem.title}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={tailwind.style('flex flex-row items-center pr-3')}>
                        {listItem.subtitle ? (
                            <Animated.Text
                                style={tailwind.style(
                                    'text-base font-areaNormal-semibold leading-[22px] tracking-[0.16px]',
                                    listItem.subtitleType === 'light' ? 'text-[#6F6F6F]' : 'text-[#171717]',
                                )}>
                                {listItem.subtitle}
                            </Animated.Text>
                        ) : null}
                        {listItem.hasChevron ? <Icon icon={<CaretRight stroke={undefined} />} size={20} /> : null}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

export const GenericList = (props: GenericListProps) => {
    const { list, sectionTitle } = props;
    const mainContentRef = useRef<View>(null);
    const listContainerRef = useRef<View>(null);

    // Initialize accessibility focus management
    const accessibilityFocusConfig = useMemo(
        () => ({
            mainContentRef,
            focusDelay: 100,
            accessibilityDelay: 50,
            maxStackSize: 10,
        }),
        [],
    );

    const accessibilityFocus = useAccessibilityFocus(accessibilityFocusConfig);

    // Announce list when it mounts
    useEffect(() => {
        if (sectionTitle) {
            AccessibilityInfo.announceForAccessibilityWithOptions(`${sectionTitle} list`, {
                queue: true,
            });
        }
        // Push list to focus stack
        accessibilityFocus.pushToFocusStack(listContainerRef, 'generic-list');

        return () => {
            // Clean up focus stack when list unmounts
            accessibilityFocus.popFromFocusStack();
        };
    }, [sectionTitle, accessibilityFocus.pushToFocusStack, accessibilityFocus.popFromFocusStack]);

    return (
        <Animated.View ref={mainContentRef} style={tailwind.style('')}>
            {sectionTitle ? (
                <Animated.View style={tailwind.style('pl-4 pb-3')}>
                    <Animated.Text
                        accessible={true}
                        accessibilityRole="header"
                        style={tailwind.style('text-[17px] font-areaNormal-extrabold text-[#2F2D32]')}>
                        {sectionTitle}
                    </Animated.Text>
                </Animated.View>
            ) : null}
            <Animated.View
                ref={listContainerRef}
                style={[tailwind.style('rounded-[13px] mx-4 bg-white', sectionTitle ? 'mt-2' : ''), styles.listShadow]}>
                {list.map((listItem, index) => (
                    <ListItem
                        key={index}
                        {...{ listItem, index, itemKey: undefined }}
                        isLastItem={index === list.length - 1}
                        itemKey={listItem.key}
                    />
                ))}
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    listShadow: {
        // box-shadow: 0px 0.15000000596046448px 2px 0px #00000040;
        // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 0.15 },
        shadowRadius: 2,
        shadowOpacity: 0.35,
        elevation: 2,
    },
});
