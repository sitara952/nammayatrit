import { Icon } from '@/typescript/components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { getIconFromType } from '../PublicTransportCard/PublicTransportCardUtils';
import { TransitType } from '../PublicTransportCard/types';
import { useTransportAnimation } from './hooks/useTransportAnimation';

const RightArrow = () => {
    return (
        <Svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <Path
                d="M2.25014 11.3939L1 10.129L5.06885 6.01212L5.06885 5.97138L1 1.86645L2.25014 0.601562L6.83792 5.23154L6.83792 6.7639L2.25014 11.3939Z"
                fill="#C6C5C8"
            />
        </Svg>
    );
};

export interface Transit {
    mode: 'metro' | 'bus' | 'walk' | 'taxi' | 'auto';
}

/**
 * LiveJourneyProgress Component
 *
 * A component that displays an animated progress bar showing the user's journey through different modes of transport.
 *
 * @example
 * ```tsx
 * <LiveJourneyProgress
 *   progress={75} // Current progress percentage (0-100)
 *   activeLiveTransit={1} // Index of the currently active transit mode
 *   transits={[
 *     { mode: 'walk' },
 *     { mode: 'bus' },
 *     { mode: 'metro' }
 *   ]}
 * />
 * ```
 *
 * @param props
 * @param props.progress - Number between 0-100 representing the progress through the current transit mode
 * @param props.transits - Array of transit objects, each with a mode property
 * @param props.activeLiveTransit - Index of the currently active transit in the transits array
 *
 * Supported transit modes:
 * - walk: Walking segment
 * - bus: Bus transit
 * - metro: Metro/subway transit
 * - auto: Auto/car transit
 * - taxi: Taxi transit
 *
 * The component will animate between transit modes and show progress through the current mode.
 * Each mode is represented by an icon with connecting arrows between them.
 *
 * ! Dont bring backend data to this component, do calculations in the parent component and just pass the activeLiveTransit and progress to this component
 */

interface LiveJourneyProgressProps {
    progress: number;
    transits: Transit[];
    activeLiveTransit: number;
}

export const LiveJourneyProgress = ({ progress, transits, activeLiveTransit }: LiveJourneyProgressProps) => {
    return (
        <Animated.View style={tailwind.style(`w-[${SCREEN_WIDTH}px] px-4`)}>
            <Animated.View style={tailwind.style('flex flex-row items-center py-5')}>
                {transits.map((item, index) => (
                    <Animated.View style={tailwind.style(`flex-row`)} key={index}>
                        {item.mode === 'walk' ? (
                            <Transport
                                index={index}
                                totalTransits={transits.length}
                                activeLiveTransit={activeLiveTransit}
                                activeLiveTransitProgress={progress}
                                mode="walk"
                            />
                        ) : null}
                        {item.mode === 'metro' ? (
                            <Transport
                                index={index}
                                totalTransits={transits.length}
                                activeLiveTransit={activeLiveTransit}
                                activeLiveTransitProgress={progress}
                                mode="metro"
                            />
                        ) : null}
                        {item.mode === 'bus' ? (
                            <Transport
                                index={index}
                                totalTransits={transits.length}
                                activeLiveTransit={activeLiveTransit}
                                activeLiveTransitProgress={progress}
                                mode="bus"
                            />
                        ) : null}
                        {item.mode === 'auto' ? (
                            <Transport
                                index={index}
                                totalTransits={transits.length}
                                activeLiveTransit={activeLiveTransit}
                                activeLiveTransitProgress={progress}
                                mode="auto"
                            />
                        ) : null}
                    </Animated.View>
                ))}
            </Animated.View>
        </Animated.View>
    );
};

interface TransportProps {
    index: number;
    totalTransits: number;
    activeLiveTransit: number;
    activeLiveTransitProgress: number;
}

const Transport = ({
    index,
    totalTransits,
    activeLiveTransit,
    activeLiveTransitProgress,
    mode,
}: TransportProps & { mode: Transit['mode'] }) => {
    const { containerWidth, iconTranslate, viewTranslate } = useTransportAnimation({
        index,
        totalTransits,
        activeLiveTransit,
        activeLiveTransitProgress,
    });

    return (
        <Animated.View key={index} style={tailwind.style('flex flex-row items-center overflow-hidden')}>
            <Animated.View style={[tailwind.style('bg-[#E7E6E9] rounded-[16px] overflow-hidden'), containerWidth]}>
                <Animated.View
                    style={[
                        tailwind.style(
                            'absolute h-full w-full bg-white rounded-full',
                            activeLiveTransit === index ? `bg-white` : 'bg-transparent',
                        ),
                        viewTranslate,
                    ]}
                />
                <Animated.View
                    style={[tailwind.style('w-9 h-8 justify-center items-center rounded-[16px]'), iconTranslate]}>
                    {getIconFromType(mode as TransitType, 16)}
                </Animated.View>
            </Animated.View>
            {index !== totalTransits - 1 ? (
                <Animated.View style={tailwind.style('px-1.5')}>
                    <Icon icon={<RightArrow />} size={8} />
                </Animated.View>
            ) : null}
        </Animated.View>
    );
};
