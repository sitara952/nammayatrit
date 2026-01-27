import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeOut,
    interpolateColor,
    LinearTransition,
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { NarrowArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import { Icon } from '../../../components/common/Icon';
import { ToggleBusRoute } from '../../SingleModeTicketBooking/UI';
import { EventPrefix, logPrefixEvent } from '@/typescript/utils/logger';

/**
 * Represents an item that can be selected in the GenericStopsPicker
 */
export type GenericStopsPickerItem = {
    id: number;
    name: string;
    code: string | undefined;
};

/**
 * Props for route toggle functionality
 */
export interface RouteToggleProps {
    /** Whether to show the route toggle UI */
    show: boolean;
    /** Whether the route toggle is enabled/interactive */
    isEnabled: boolean;
    /** Start station for route toggle display */
    startStation: { name: string | undefined } | undefined;
    /** End station for route toggle display */
    endStation: { name: string | undefined } | undefined;
    /** Callback when route toggle is pressed */
    onToggle: () => void;
    /** Whether to show the switch stop style (with labels) or regular style. Defaults to false */
    isSwitchStop: boolean;
    /** Callback when switch or select route is pressed */
    onSwitchOrSelectRoute?: () => void;
}

/**
 * SVG icon component for edit functionality
 */
const EditIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.47645 12.2343C2.28855 12.2343 2.10065 12.1621 1.96334 12.0248C1.80435 11.8658 1.73208 11.6562 1.75376 11.4321L2.06452 8.59923C2.0862 8.43301 2.15847 8.28125 2.2741 8.16562L8.25069 2.18903C8.83606 1.60366 9.79 1.60366 10.3754 2.18903L11.7991 3.61272C12.0809 3.89456 12.2399 4.27036 12.2399 4.67506C12.2399 5.07976 12.0809 5.45556 11.7991 5.73741L5.82247 11.7068C5.69961 11.8224 5.54785 11.9019 5.38886 11.9163L2.55594 12.2271H2.47645V12.2343ZM3.13409 8.83772L2.88838 11.0997L5.15037 10.854L9.17647 6.82296L7.16019 4.80667L3.13409 8.83772ZM11.033 4.96413L9.94252 6.05597L7.92624 4.03968L9.01673 2.94785C9.18295 2.78163 9.45034 2.78163 9.60933 2.94785L11.033 4.37153C11.1125 4.45103 11.1559 4.5522 11.1559 4.66783C11.1559 4.78346 11.1125 4.88464 11.033 4.96413ZM8.59766 12.2417V11.1576L12.2491 11.1582V12.2422L8.59766 12.2417Z"
            fill="#656565"
        />
    </Svg>
);

/**
 * SVG icon component for route toggle (enabled state)
 */
const ToggleBusRouteLocal = () => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.216 6.9866L14.2118 2.98242L13.1512 4.04308L16.114 7.00589H5.10571V8.50589H16.1105L13.1512 11.4653L14.2118 12.5259L18.216 8.52174C18.642 8.09576 18.642 7.41258 18.216 6.9866ZM7.88856 15.495H18.8945V16.995H7.88822L10.8495 19.9562L9.78881 21.0169L5.78464 17.0127C5.35866 16.5868 5.35866 15.9036 5.78464 15.4776L9.78881 11.4734L10.8495 12.5341L7.88856 15.495Z"
                fill="#0356CA"
            />
        </Svg>
    );
};

/**
 * SVG icon component for route toggle (disabled state)
 */
const NoToggleBusRoute = () => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.7064 11.152L15.3395 5.78516L14.2789 6.84582L18.6857 11.2526H3.31519V12.7526H18.681L14.2789 17.1547L15.3395 18.2154L20.7064 12.8486C21.1776 12.3773 21.1776 11.6232 20.7064 11.152ZM19.4001 12.0335L19.4333 12.0003L19.4001 11.9671V12.0335Z"
                fill="#0356CA"
            />
        </Svg>
    );
};

interface GenericStopsPickerProps {
    /** Initially selected item in the picker */
    initialSelectedItem: GenericStopsPickerItem | null;
    /** List of all selectable items */
    list: GenericStopsPickerItem[];
    /** Callback for when an item is selected */
    onSelect: (item: GenericStopsPickerItem, isExpanded: boolean) => void;
    /** Whether the picker should start in expanded or collapsed state */
    initialExpanded: boolean;
    /** Whether the picker should collapse after selection */
    shouldCollapseAfterSelect: boolean;
    /** Title text for the picker (used when collapsed, or as fallback for expanded title) */
    title: string;
    /** Optional title text specifically for when the picker is expanded (list view) */
    expandedTitle?: string;
    /** Whether the picker is stand alone or part of a larger component */
    isStandAlone: boolean;
    /** Route toggle configuration - pass this object to enable route toggle functionality */
    routeToggle: RouteToggleProps | undefined;
    expanded?: boolean;

    pickerType?: 'SOURCE' | 'DESTINATION';
}

/**
 * GenericStopsPicker component that provides an animated dropdown selection UI
 *
 * The component has two states:
 * - Collapsed: Shows only the selected item with an edit icon
 * - Expanded: Shows the full list of selectable items
 */
export const GenericStopsPicker = React.memo((props: GenericStopsPickerProps) => {
    const {
        list,
        initialSelectedItem,
        onSelect,
        initialExpanded = false,
        shouldCollapseAfterSelect = false,
        title,
        expandedTitle, // Destructure here
        isStandAlone = true,
        routeToggle,
        expanded = initialExpanded,
        pickerType,
    } = props;
    // True when the picker is showing the list of options
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const [shouldScroll, setShouldScroll] = useState(true);
    // Reference to the ScrollView to enable programmatic scrolling
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        setIsExpanded(expanded);
    }, [expanded]);

    // Animation values for smooth transitions
    const expandedValueForAnimation = useDerivedValue(() => {
        return isExpanded ? withSpring(1) : withSpring(0);
    }, [isExpanded]);

    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    // Background color animation based on expanded state
    const animatedBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(expandedValueForAnimation.value, [0, 1], ['#FFFFFF', '#E6E6E6']),
    }));
    const handleOptionSelect = useCallback(
        (item: GenericStopsPickerItem) => {
            onSelect(item, false);
            if (pickerType === 'SOURCE') {
                logPrefixEvent(EventPrefix.NY_BUS_CONFIRM_SOURCE_STOP, item.name);
            } else if (pickerType === 'DESTINATION') {
                logPrefixEvent(EventPrefix.NY_BUS_CONFIRM_DESTINATION_STOP, item.name);
            } else {
                logPrefixEvent(EventPrefix.NY_BUS_STOP_SELECTED, item.name);
            }
            if (shouldCollapseAfterSelect) {
                setIsExpanded(false);
                setShouldScroll(true);
            }
        },
        [onSelect, shouldCollapseAfterSelect],
    );

    // Toggle expanded/collapsed state
    const toggleExpanded = () => {
        if (initialSelectedItem) {
            onSelect(initialSelectedItem, !isExpanded);
        }
        setIsExpanded(!isExpanded);
    };

    // Scroll to the selected item when the picker is expanded to show options
    useEffect(() => {
        if (isExpanded && scrollViewRef.current && list.length > 0) {
            // Find the index of the selected item
            const selectedIndex = list.findIndex(item => item.code === initialSelectedItem?.code);

            if (selectedIndex !== -1) {
                // Calculate the approximate position to scroll to
                // The 58 value comes from the item height (55px) plus gap (3px)
                const yOffset = selectedIndex * 67;
                // Add a small delay to ensure the ScrollView is properly rendered
                if (shouldCollapseAfterSelect && shouldScroll) {
                    setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
                    }, 300);
                    setShouldScroll(false);
                }
            }
        }
    }, [isExpanded, list, initialSelectedItem?.code, shouldCollapseAfterSelect]);

    // Renders the selected item view when collapsed (not expanded)
    const renderSelectedItemView = useCallback(
        () => (
            <Animated.View
                entering={FadeInDown}
                exiting={FadeOut.duration(200)}
                style={tailwind.style('items-center pt-[14px] pb-[18px] overflow-hidden')}>
                <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style(
                        'text-[15px] leading-[20px] font-areaNormal-extrabold text-[#3B3A3C] w-3/4 capitalize text-center',
                        initialSelectedItem?.name ? '' : 'text-[#C9C9C9]',
                    )}
                    accessibilityRole="text"
                    accessibilityLabel={`Selected ${title}: ${initialSelectedItem?.name}`}>
                    {initialSelectedItem?.name.toLowerCase() || `${userLanguageStrings.Enter} ${title}`}
                </Animated.Text>
                <Animated.View style={tailwind.style('absolute right-4 top-[10px] items-end')}>
                    <Animated.View
                        style={tailwind.style(
                            `bg-[${colors.CrossButton_bg}] w-6 h-6 justify-center items-center rounded-full`,
                        )}>
                        <EditIcon />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        ),
        [initialSelectedItem?.name],
    );

    const OptionItem = useCallback(
        ({ item, index }: { item: GenericStopsPickerItem; index: number }) => {
            const isSelected = item.code === initialSelectedItem?.code;

            return (
                <Pressable
                    testID={`090e0382-87ff-4060-bdb6-f8985e772bf7-${index}`}
                    onPress={() => handleOptionSelect(item)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.name} ${isSelected ? '(currently selected)' : ''} button`}
                    style={({ pressed }: { pressed: boolean }) => [
                        tailwind.style(
                            'rounded-[16px] min-h-14 bg-white justify-center items-center px-2',
                            isSelected ? 'bg-[#3A3B3C]' : '',
                            pressed ? 'bg-[#D6D6D6]' : '',
                        ),
                    ]}>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'text-[15px] leading-[20px] font-areaNormal-extrabold capitalize',
                            isSelected ? 'text-[#FFFFFF]' : 'text-[#3B3A3C]',
                        )}>
                        {item.name.toLowerCase()}
                    </Animated.Text>
                </Pressable>
            );
        },
        [initialSelectedItem?.code, onSelect, shouldCollapseAfterSelect],
    );

    // Renders the route toggle UI when routeToggle is provided
    const renderRouteToggle = useCallback(() => {
        if (!routeToggle?.show || !routeToggle.startStation || !routeToggle.endStation) return null;

        const isSwitchStop = routeToggle.isSwitchStop;
        const startStationName = routeToggle.startStation.name;
        const endStationName = routeToggle.endStation.name;

        // Render station content (used in both styles)
        const renderStationText = (stationName: string | undefined, label: string | undefined, isStart: boolean) => (
            <Animated.View
                style={tailwind.style('flex-1', isSwitchStop ? 'pt-3' : 'justify-center items-center overflow-hidden')}>
                {isSwitchStop && label && (
                    <Animated.Text
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#7E7E7E] text-center')}>
                        {label}
                    </Animated.Text>
                )}
                <Animated.Text
                    entering={!isSwitchStop ? (isStart ? SlideInRight : SlideInLeft) : undefined}
                    exiting={!isSwitchStop ? (isStart ? SlideOutRight : SlideOutLeft) : undefined}
                    numberOfLines={1}
                    style={tailwind.style(
                        isSwitchStop
                            ? 'text-[15px] font-areaNormal-extrabold text-[#3B3A3C] capitalize mt-1 text-center'
                            : 'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] text-center capitalize',
                    )}>
                    {stationName}
                </Animated.Text>
            </Animated.View>
        );

        // Render center icon
        const renderCenterIcon = () => (
            <Animated.View
                style={tailwind.style(
                    isSwitchStop
                        ? 'mx-3 mt-5 p-1 rounded-[10px] bg-[#F7F7F7]'
                        : 'bg-[#F4F4F4] rounded-[12px] justify-center items-center w-[38px] h-9 mx-3',
                )}>
                <Icon
                    icon={
                        isSwitchStop ? (
                            <NarrowArrowRight />
                        ) : routeToggle.isEnabled ? (
                            <ToggleBusRouteLocal />
                        ) : (
                            <NoToggleBusRoute />
                        )
                    }
                    size={24}
                />
            </Animated.View>
        );

        return (
            <Animated.View style={tailwind.style('pb-4')}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${
                        routeToggle.isEnabled
                            ? 'Switch source and destination'
                            : `Route from ${routeToggle.startStation?.name} to ${routeToggle.endStation?.name}`
                    } button`}
                    onPress={() => (routeToggle.isEnabled ? routeToggle.onToggle() : null)}
                    testID={isSwitchStop ? 'route-toggle-switch-stop-picker' : 'route-toggle-generic-picker'}>
                    <Animated.View
                        style={tailwind.style(
                            'flex-row justify-between items-center',
                            isSwitchStop ? 'px-2' : 'bg-[#FFFFFF] rounded-[12px] min-h-[38px] px-3',
                        )}>
                        {renderStationText(startStationName, isSwitchStop ? 'Start Terminus' : undefined, true)}
                        {renderCenterIcon()}
                        {renderStationText(endStationName, isSwitchStop ? 'End Terminus' : undefined, false)}
                    </Animated.View>
                </Pressable>
            </Animated.View>
        );
    }, [routeToggle]);

    // Renders the list of selectable items when expanded
    const renderOptionsList = useCallback(
        () => (
            <Animated.View
                entering={FadeInUp}
                exiting={FadeOut.duration(200)}
                layout={LinearTransition.springify().damping(34).stiffness(240)}
                style={tailwind.style('relative mx-4 mt-4 mb-4 max-h-[320px]')}>
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    accessible={true}
                    accessibilityLabel={`List of ${title} options`}
                    contentContainerStyle={tailwind.style('gap-y-3')}>
                    {renderRouteToggle()}
                    {list?.map((item, index) => <OptionItem key={`${item.id}-${index}`} item={item} index={index} />)}
                    {routeToggle?.isEnabled && (
                        <Animated.View style={tailwind.style('pt-2 pb-6 px-4 bg-[#E6E6E6]')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-center text-[14px] font-areaNormal-extrabold text-[#7E7E7E] mb-4',
                                )}>
                                {userLanguageStrings.CouldntFindDestinationOrStops}
                            </Animated.Text>
                            <Pressable
                                onPress={routeToggle?.onSwitchOrSelectRoute}
                                testID="switch-and-book-button"
                                accessibilityRole="button"
                                accessibilityLabel="Switch source and destination and book"
                                style={({ pressed }) => [
                                    tailwind.style(
                                        'bg-white rounded-[16px] min-h-14 flex-row items-center justify-center gap-2 mx-4',
                                        pressed ? 'opacity-80' : '',
                                    ),
                                ]}>
                                <ToggleBusRoute fill="#016ACD" />
                                <Animated.Text
                                    style={tailwind.style('text-[#016ACD] text-[15px] font-areaNormal-extrabold')}>
                                    {userLanguageStrings.SwitchFindStop}
                                </Animated.Text>
                            </Pressable>
                        </Animated.View>
                    )}
                </ScrollView>
            </Animated.View>
        ),
        [list, OptionItem, renderRouteToggle],
    );

    const titleView = useMemo(() => {
        if (!title) return null;
        return (
            <Animated.View style={tailwind.style('pt-[14px] items-center')}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[12px] leading-[13px] font-areaNormal-extrabold text-[#969696] translate-[0.2px]',
                    )}>
                    {isExpanded ? `${userLanguageStrings.Select} ${expandedTitle || title}` : title}
                </Animated.Text>
            </Animated.View>
        );
    }, [title, expandedTitle, isExpanded]); // Add expandedTitle to dependency array

    return (
        <Animated.View layout={LinearTransition.springify().damping(34).stiffness(240)}>
            <Animated.View
                style={[
                    tailwind.style(
                        !isStandAlone ? (isExpanded ? '-mt-1' : '') : '',
                        !isStandAlone ? 'rounded-[24px]' : '',
                    ),
                    animatedBackgroundStyle,
                ]}>
                <Pressable
                    testID={`7e969413-67b7-4786-86a6-35c84cc7bceb`}
                    onPress={toggleExpanded}
                    accessibilityRole="button"
                    accessibilityLabel={
                        isExpanded
                            ? `${userLanguageStrings.ExpandedListToSelect} ${title}`
                            : `${userLanguageStrings.CurrentlySelected} ${title} ${userLanguageStrings.Is} ${initialSelectedItem?.name}. ${userLanguageStrings.DoubleTapToChange}`
                    }>
                    {titleView}
                    {!isExpanded && renderSelectedItemView()}
                </Pressable>
                {isExpanded && renderOptionsList()}
            </Animated.View>
        </Animated.View>
    );
});
