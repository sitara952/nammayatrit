import Animated from 'react-native-reanimated';
import React from 'react';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import { TransitSummary, TransitSummaryType } from '../../JourneyInfoScreen/components/TransitSummary';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Path } from 'react-native-svg';
import Svg from 'react-native-svg';
import { Icon } from '../../../../../src/typescript/components/Icon';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { strings } from 'config-types';
import { isNull } from 'lodash';

const Plus = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
            <Path
                d="M6.70078 1.5V1.25H6.45078H5.55078H5.30078V1.5V10.5V10.75H5.55078H6.45078H6.70078V10.5V1.5Z"
                fill="#1655DC"
                stroke="#1655DC"
                strokeWidth="0.5"
            />
            <Path
                d="M10.75 5.55005V5.30005H10.5H1.5H1.25V5.55005V6.45005V6.70005H1.5H10.5H10.75V6.45005V5.55005Z"
                fill="#1655DC"
                stroke="#1655DC"
                strokeWidth="0.5"
            />
        </Svg>
    );
};

const Rupee = () => {
    return (
        <Svg width="5" height="8" viewBox="0 0 5 8" fill="none">
            <Path
                d="M1.60235 8L0 5.86183V5.28863H0.286599C0.746895 5.28863 1.13337 5.24521 1.44602 5.15836C1.76736 5.07151 2.01922 4.92821 2.2016 4.72846C2.38398 4.52871 2.49254 4.25514 2.52728 3.90775H0V3.074H2.51426C2.45346 2.75267 2.33187 2.49212 2.14949 2.29237C1.96711 2.08393 1.71959 1.93195 1.40694 1.83642C1.10297 1.74088 0.729525 1.69312 0.286599 1.69312H0V0.859375H5V1.69312H2.93113C3.13088 1.85813 3.29589 2.05354 3.42616 2.27934C3.55643 2.50515 3.63894 2.77003 3.67368 3.074H5V3.90775H3.69973C3.63894 4.54174 3.39576 5.03677 2.97021 5.39285C2.55334 5.74024 2.14081 5.96171 1.44602 6.05724L2.93113 8H1.60235Z"
                fill="#23653B"
            />
        </Svg>
    );
};

const Earliest = () => {
    return (
        <Svg width="9" height="10" viewBox="0 0 9 10" fill="none">
            <Path
                d="M4.71624 0L0.262967 5.34393C0.0885632 5.55321 0.00136111 5.65785 2.8483e-05 5.74623C-0.00113001 5.82306 0.0331051 5.89615 0.0928678 5.94445C0.161614 6 0.297828 6 0.570256 6H4.21624L3.71624 10L8.16951 4.65607C8.34391 4.44679 8.43112 4.34215 8.43245 4.25377C8.43361 4.17694 8.39937 4.10385 8.33961 4.05555C8.27086 4 8.13465 4 7.86222 4H4.21624L4.71624 0Z"
                fill="#5F37F2"
            />
        </Svg>
    );
};

type PublicTransportTag = 'EARLIEST' | 'AFFORDABLE' | 'HYBRID';

interface PublicTransitItemProps {
    distance: string;
    cost: string;
    tag: PublicTransportTag | null;
    journey: TransitSummaryType[];
    onPress: () => void;
    startTime: number | null;
    endTime: string | null;
    wrapperStyle?: string;
    index: number;
}

const EARLIEST_TAG = ({ userLanguageStrings }: { userLanguageStrings: strings }) => {
    return (
        <Animated.View
            style={tailwind.style(
                'bg-[#F1EEFF] border border-[#EAE5FF] rounded-[6px] px-[5px] min-h-5 flex-row justify-center items-center',
            )}>
            <Earliest />
            <Animated.Text style={tailwind.style('text-[10px] font-areaNormal-extrabold text-[#5F37F2] pl-1')}>
                {userLanguageStrings.Earliest}
            </Animated.Text>
        </Animated.View>
    );
};

const AFFORDABLE_TAG = ({ userLanguageStrings }: { userLanguageStrings: strings }) => {
    return (
        <Animated.View
            style={tailwind.style(
                'bg-[#E9F4EC] border border-[#DEF0E3] rounded-[6px] px-[5px] min-h-5 flex-row justify-center items-center',
            )}>
            <Rupee />
            <Animated.Text style={tailwind.style('text-[10px] font-areaNormal-extrabold text-[#23653B] pl-1')}>
                {userLanguageStrings.Affordable}
            </Animated.Text>
        </Animated.View>
    );
};

const HYBRID_TAG = ({ userLanguageStrings }: { userLanguageStrings: strings }) => {
    return (
        <Animated.View
            style={tailwind.style(
                'bg-[#E9EFF5] border border-[#DAE2EE] rounded-[6px] px-[5px] min-h-5 flex-row justify-center items-center',
            )}>
            <Icon icon={<Plus />} size={8} color="#1655DC" />
            <Animated.Text style={tailwind.style('text-[10px] font-areaNormal-extrabold text-[#1655DC] pl-1')}>
                {userLanguageStrings.Hybrid}
            </Animated.Text>
        </Animated.View>
    );
};

const buildAccessibilityLabel = (
    index: number,
    distance: string,
    cost: string,
    endTime: string | null,
    tag: PublicTransportTag | null,
    journey: TransitSummaryType[],
): string => {
    const baseParts = [`Leg ${index + 1}`, `distance ${distance} `, `cost ₹${cost}`];

    const optionalParts = [endTime ? `ETA ${endTime}` : null, tag ? `Tag: ${tag}` : null].filter(
        (part): part is string => part !== null,
    );

    const journeyParts = journey.map(item => {
        // Add distance if available and transit type is walk
        const distanceStr = item.type === 'walk' && !isNull(item.distance) ? `${item.distance}m distance` : null;

        // Add cost if available and valid
        const costStr = item.cost !== null && item.cost !== undefined && item.cost !== 0 ? `₹${item.cost}` : null;

        // Add time if available
        const timeStr = item.time ? `${item.time}` : null;

        return [item.type, distanceStr, costStr, timeStr].filter((part): part is string => part !== null).join(' ');
    });

    const journeyDescription = journeyParts.length > 0 ? journeyParts.join(', ') : '';

    const allParts = [...baseParts, ...optionalParts, journeyDescription].filter(part => part !== '');

    return allParts.join(', ');
};

export const PublicTransitItem = (props: PublicTransitItemProps) => {
    const { distance, cost, tag, journey = [], onPress, wrapperStyle = '', endTime, index } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const accessibilityLabel = buildAccessibilityLabel(index, distance, cost, endTime, tag, journey);

    return (
        <TouchableOpacity
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            onPress={onPress}
            testID="PUBLIC_TRANSIT_ITEM_ON_PRESS">
            <Animated.View style={tailwind.style('bg-[#F8F9FB] pt-4', wrapperStyle)}>
                <Animated.View style={tailwind.style('flex-row justify-between items-center px-6')}>
                    <Animated.View style={tailwind.style('flex-row items-center gap-x-1')}>
                        <Animated.Text
                            accessibilityRole="text"
                            accessibilityLabel={`${distance} Trip`}
                            style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C] pr-2.5')}>
                            {distance} {userLanguageStrings.Trip}
                        </Animated.Text>
                        {tag === 'EARLIEST' ? <EARLIEST_TAG userLanguageStrings={userLanguageStrings} /> : null}
                        {tag === 'AFFORDABLE' ? <AFFORDABLE_TAG userLanguageStrings={userLanguageStrings} /> : null}
                        {tag === 'HYBRID' ? <HYBRID_TAG userLanguageStrings={userLanguageStrings} /> : null}
                    </Animated.View>
                    <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                        ₹{cost}
                    </Animated.Text>
                </Animated.View>
                <Animated.View style={tailwind.style('flex-row justify-between items-center px-6 mt-2')}>
                    <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#7E7E7E]')}>
                        {/* {startTime === 0 ? userLanguageStrings.Startnow : userLanguageStrings.StartinMin(startTime)} */}
                        {endTime ? `ETA ${endTime}` : ''}
                    </Animated.Text>
                </Animated.View>
                <Animated.View style={tailwind.style('py-5 pt-2')}>
                    <TransitSummary journey={journey} type="alternate" switchToAuto={() => {}} />
                </Animated.View>
                <Animated.View
                    style={tailwind.style('h-[1px] ml-5 bg-[#E6E6E6]', `w-[${SCREEN_WIDTH - 40}px]`)}></Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
};
