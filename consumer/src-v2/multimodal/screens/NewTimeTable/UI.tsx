import CrossIcon from '@/src-v2/assets/svg/CrossIcon';
import { Pressable, RNPressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { BottomSheetModal, BottomSheetScrollView, SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { memo, useMemo, useState, useRef, useCallback, type ElementRef } from 'react';
import Animated from 'react-native-reanimated';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { DetailedTimeTable } from './components/DetailedTimeTable';
import { MiniTimeTableSchedule } from './components/MiniTimeTableSchedule';
import { StackedTimeCards } from './components/StackedTimeCards';
import { getNext3TimesFromNow } from './timeUtils';
import { NewTimeTableUIProps, TimeTableInfo } from './types.tsx';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler.tsx';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const RefreshIcon = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
            <Path
                d="M9.98535 2.46582C12.2317 2.46591 14.2865 3.45226 15.7012 5.09863L15.9766 3.48047L15.9844 3.43066L16.0342 3.43945L17.5078 3.68652L17.5576 3.69434L17.5488 3.74414L16.8232 8.04004L16.8145 8.08984L16.7656 8.08105L12.5068 7.36328L12.457 7.35449L12.4658 7.30566L12.7129 5.83105L12.7207 5.78125L12.7705 5.79004L14.4268 6.07227C13.3164 4.81514 11.7252 4.06259 9.98535 4.0625C6.71207 4.0625 4.04688 6.72769 4.04688 10.001C4.04705 13.2741 6.71218 15.9385 9.98535 15.9385C13.2584 15.9383 15.9227 13.274 15.9229 10.001V9.9502H17.5205V10.001C17.5203 14.1526 14.137 17.536 9.98535 17.5361C5.83359 17.5361 2.45037 14.1527 2.4502 10.001C2.4502 5.84911 5.83349 2.46582 9.98535 2.46582Z"
                fill="#313131"
                stroke="black"
                strokeWidth="0.1"
            />
        </Svg>
    );
};

const NewTimeTableUI = (props: NewTimeTableUIProps) => {
    const { times, source, sheetRef, onDismiss } = props;
    const { top, bottom } = useSafeAreaInsets();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { timeTableBottomSheetModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const next3Times: TimeTableInfo[] = useMemo(() => {
        return getNext3TimesFromNow(times, props.mode, userLanguageStrings);
    }, [times, refreshTrigger, props.mode, userLanguageStrings]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleOnClose = () => {
        if (sheetRef?.current) {
            sheetRef.current.dismiss();
        } else {
            timeTableBottomSheetModalRef.current?.dismiss();
        }
        onDismiss?.();
    };

    const { handlers: closeHandlers, animatedStyle: closeAnimatedStyle } = useScaleAnimation();
    const { handlers: refreshHandlers, animatedStyle: refreshAnimatedStyle } = useScaleAnimation();

    const closeBtnRef = useRef<ElementRef<typeof RNPressable>>(null);

    const handleSheetChange = useCallback((index: number) => {
        if (index >= 0) {
            setTimeout(() => {
                const node = closeBtnRef.current ? findNodeHandle(closeBtnRef.current) : null;
                if (node) {
                    AccessibilityInfo.setAccessibilityFocus(node);
                }
            }, 120);
        }
    }, []);

    return (
        <BottomSheetModal
            backgroundStyle={tailwind.style('rounded-t-[36px] overflow-hidden')}
            snapPoints={[SCREEN_HEIGHT - (top ? top : 12)]}
            topInset={top ? top : 24}
            handleComponent={null}
            ref={sheetRef ? sheetRef : timeTableBottomSheetModalRef}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            enableContentPanningGesture={true}
            enableHandlePanningGesture={false}
            onChange={handleSheetChange}
            onDismiss={onDismiss}>
            <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                style={tailwind.style('bg-white rounded-t-[36px]')}
                contentContainerStyle={tailwind.style(`pt-[30px] pb-[${bottom + 16}px]`)}>
                <HardwareBackpressHandler onHardwareBackPress={handleOnClose}>
                    <>
                        <RNPressable
                            ref={closeBtnRef}
                            onPress={handleOnClose}
                            testID="close-button"
                            accessibilityRole="button"
                            accessibilityLabel="Close timetable button"
                            accessibilityHint="Closes timetable"
                            accessible={true}
                            focusable={true}
                            importantForAccessibility={Platform.OS === 'android' ? 'yes' : undefined}
                            {...closeHandlers}
                            style={[
                                tailwind.style(
                                    'h-9 w-9 absolute top-5 left-5 bg-[#E5E5E5] justify-center items-center rounded-full z-10',
                                ),
                            ]}>
                            <Animated.View style={closeAnimatedStyle}>
                                <Icon icon={<CrossIcon />} size={16} color="#313131" />
                            </Animated.View>
                        </RNPressable>
                        <Animated.Text
                            accessibilityLabel="Timetable title"
                            accessibilityHint="Shows timetable"
                            style={tailwind.style(
                                'text-[15px] font-areaNormal-extrabold tracking-[0.2px] leading-[18px] text-center text-[#969696]',
                            )}>
                            {userLanguageStrings.Timetable}
                        </Animated.Text>
                        <Pressable
                            onPress={handleRefresh}
                            testID="refresh-button"
                            accessibilityRole="button"
                            accessibilityLabel="Refresh timetable button"
                            {...refreshHandlers}
                            style={[
                                tailwind.style(
                                    'h-9 w-9 absolute top-5 right-5 bg-[#E5E5E5] justify-center items-center rounded-full z-10',
                                ),
                            ]}>
                            <Animated.View style={refreshAnimatedStyle}>
                                <Icon icon={<RefreshIcon />} size={20} color="#313131" />
                            </Animated.View>
                        </Pressable>
                        <StackedTimeCards
                            variant="timetable"
                            refreshStack={handleRefresh}
                            timeTableInfoList={next3Times}
                            source={source}
                            towardsJunction={props.towardsStation}
                            displayTimeType={props.mode === 'Subway' ? 'timerWithJustMins' : 'timer'}
                            swipeDisabled={false}
                            isNightMode={false}
                        />
                        <MiniTimeTableSchedule times={times} interval={15} mode={props.mode} />
                        {props.mode !== 'Subway' && <DetailedTimeTable times={times} mode={props.mode} />}
                    </>
                </HardwareBackpressHandler>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
};

export const MemoizedNewTimeTableUI = memo(NewTimeTableUI, (prev, next) => {
    return (
        prev.times.length === next.times.length &&
        prev.source === next.source &&
        prev.towardsStation === next.towardsStation
    );
});
