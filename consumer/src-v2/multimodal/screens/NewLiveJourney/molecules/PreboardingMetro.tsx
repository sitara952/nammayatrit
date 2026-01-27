import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { isEqual } from 'lodash';
import { memo, useMemo, useState } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackedTimeCards } from '../../NewTimeTable/components/StackedTimeCards';
import { getNext3TimesFromNow } from '../../NewTimeTable/timeUtils';
import { PlatformInfo, SuburbanPlatformInfo } from '../components/GateInfo/PlatformInfo';
import { SmartTicketButton } from '../../../components/SmartTicketButton';
import { SecondaryExpandCollapseTrackingButton } from '../screens/TransitTracking/components/ExpandCollapseTrackingButton';
import { TimeEntry } from '../screens/TransitTracking/TransitTimetable';
import { JourneyId } from '@/typescript/state/client/user';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getUserLanguageStringsForMetroLine } from '@/src-v2/multimodal/utils/journeyTrackingUtils';

export interface PreboardingMetroProps {
    // Callback to open the ticket modal
    onPressShowTicket: () => void;
    // Callback to open the timetable modal
    onPressShowTimetable: () => void;
    // Callback to manually check in
    onPressCheckIn: () => void;
    // Platform number
    platformNo: string;
    // Destination station name
    towards: string;
    // List of times for the timetable
    times: TimeEntry[];
    // Source station name
    sourceStationName: string;
    fromTime: number;
    isTransitLeg: boolean;

    currentLegMetroLineColor: string | undefined;
    mode: MultimodalTravelMode_multimodalTravelMode | undefined;
}

const UnMemoizedPreboardingMetro = (props: PreboardingMetroProps & { journeyId: JourneyId }) => {
    const bottom = useSafeAreaInsets().bottom;
    const {
        times,
        platformNo,
        towards,
        onPressShowTicket,
        onPressShowTimetable,
        onPressCheckIn,
        sourceStationName,
        isTransitLeg,
        currentLegMetroLineColor,
        mode,
        journeyId,
    } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const next3Times = useMemo(() => {
        return getNext3TimesFromNow(times, mode, userLanguageStrings);
    }, [times, refreshTrigger, mode, userLanguageStrings]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tailwind.style(`pt-[${60}px] pb-[${bottom + 12}px]`)}>
            {mode === 'Subway' ? (
                <SuburbanPlatformInfo platformNo={platformNo} towards={towards} />
            ) : (
                <PlatformInfo platformNo={platformNo} towards={towards} />
            )}
            <Animated.View style={tailwind.style(mode === 'Subway' ? 'h-[480px]' : 'h-[440px]')}>
                <StackedTimeCards
                    timeTableInfoList={next3Times}
                    source={sourceStationName}
                    refreshStack={handleRefresh}
                    variant="preboarding"
                    towardsJunction={towards}
                    displayTimeType={mode === 'Subway' ? 'timerWithJustMins' : 'timer'}
                    swipeDisabled={false}
                    isNightMode={false}
                    checkIn={onPressCheckIn}
                />
            </Animated.View>
            <Animated.View style={tailwind.style('pt-4 mt-5')}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[14px] font-areaNormal-extrabold leading-[25px] text-center text-[#969696] px-20',
                    )}>
                    {userLanguageStrings.ScanQRTicketAtTheEntranceGateOfTheStation}
                </Animated.Text>
            </Animated.View>
            <SmartTicketButton
                journeyId={journeyId}
                wrapperStyle="mx-6 px-0 mt-[13px]"
                onPressViewTicket={onPressShowTicket}
            />
            {isTransitLeg && currentLegMetroLineColor ? (
                <Animated.View style={tailwind.style('pt-4')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] font-areaNormal-extrabold leading-[25px] text-center text-[#969696] px-15',
                        )}>
                        {userLanguageStrings.SwitchToTheLineHereToContinueTowardsYourDestination(
                            getUserLanguageStringsForMetroLine(currentLegMetroLineColor, userLanguageStrings),
                        )}
                    </Animated.Text>
                </Animated.View>
            ) : null}
            <Animated.View style={tailwind.style(`pt-1`)}>
                <SecondaryExpandCollapseTrackingButton
                    isExpanded={true}
                    buttonText={userLanguageStrings.Timetable}
                    onPress={onPressShowTimetable}
                />
            </Animated.View>
        </Animated.ScrollView>
    );
};

export const PreboardingMetro = memo(UnMemoizedPreboardingMetro, (prev, next) => {
    return isEqual(prev.times, next.times);
});
