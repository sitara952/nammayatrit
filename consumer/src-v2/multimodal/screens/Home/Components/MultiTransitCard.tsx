import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import {
    getIconBGFromType,
    getIconFromType,
    getIconSecondaryBGFromType,
} from '../../JourneyInfoScreen/components/TransitIconWrapper';
import { HomeScreenServices } from '../../SingleModeSearch/Types';

const TRANSIT_MODES: HomeScreenServices[] = ['Bus', 'Train', 'Metro', 'Passes'];

const PassesIcon = ({ color = '#7C7C7C' }: { color: string }) => {
    return (
        <Svg width={27} height={20} viewBox="0 0 27 20" fill="none">
            <Path d="M22 0H5a5 5 0 00-5 5v10a5 5 0 005 5h17a5 5 0 005-5V5a5 5 0 00-5-5z" fill={'#fff'} />
            <Path
                d="M27 9.37c-2.91-3.7-7.38-6.03-12.6-6.33-.44-.03-.9-.04-1.37-.04C7.01 3 2.79 5.17 0 8.16V15c0 .17.03.32.05.49.09-.26.16-.53.27-.78 1.24-2.77 3.69-5.04 6.9-6.41 1.77-.75 3.78-1.15 5.81-1.15 4.69 0 8.95 2.03 11.39 5.42.95 1.33 1.64 2.91 1.99 4.56 0 .05.01.1.02.15.35-.69.57-1.45.57-2.28V9.37z"
                fill={color}
            />
            <Path d="M12.67 11.32s-3.61 2.88-6.21 4.12l1.1 2.71 3.5-1.53V20h4.05v-8.68h-2.44z" fill={color} />
        </Svg>
    );
};
interface MultiTransitCardProps {
    onPressMore: () => void;
    onPressModes: (mode: HomeScreenServices) => void;
}

export const MultiTransitCard = ({ onPressModes }: MultiTransitCardProps) => {
    return (
        <Animated.View
            accessibilityLabel="Transit mode options"
            style={tailwind.style(
                ' bg-white border border-[#F1F2F2] rounded-[20px] w-full justify-between items-center',
            )}>
            <Animated.View
                style={tailwind.style('flex-row gap-[14px] pt-4 pb-[13px] justify-between items-center w-full px-5')}>
                {TRANSIT_MODES.map(mode => (
                    <TransitMode key={mode} mode={mode} isCompact={false} onPressModes={() => onPressModes(mode)} />
                ))}
                {/* <Pressable style={tailwind.style('items-center')} onPress={onPressMore}>
                    <Animated.View
                        style={tailwind.style(
                            'w-[50px] h-[48px] justify-center items-center rounded-full bg-[#ECEDEF]',
                        )}>
                        <Icon icon={<ThreeDot />} style={{ transform: [{ rotate: '90deg' }], width: 25, height: 25 }} />
                    </Animated.View>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] capitalize font-areaNormal-extrabold text-[#656565] pt-[7px]',
                        )}>
                        more
                    </Animated.Text>
                </Pressable> */}
            </Animated.View>
        </Animated.View>
    );
};

export const TransitMode = ({
    mode,
    isCompact = false,
    onPressModes,
}: {
    mode: HomeScreenServices;
    isCompact: boolean;
    onPressModes: (homeScreenService: HomeScreenServices) => void;
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const haptic = useHaptic(undefined, undefined);
    const handleOnPress = () => {
        haptic?.();
        onPressModes(mode);
    };

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                testID={`6bed28c5-83bc-4870-96da-43333696b5d0`}
                key={mode}
                style={tailwind.style('items-center')}
                {...handlers}
                onPress={handleOnPress}
                accessibilityRole="button"
                accessible={true}
                accessibilityLabel={mode !== 'Passes' ? `Select ${mode} button` : 'Passes button'}
                accessibilityHint={mode !== 'Passes' ? `Tap to view ${mode} transit options` : ''}>
                <Animated.View
                    style={tailwind.style(
                        ' justify-center items-center rounded-full',
                        `${isCompact ? 'w-[37px] h-[36px] ' : 'w-[50px] h-[48px]'}`,
                        `bg-[${mode === 'Passes' ? '#8E65FF' : getIconBGFromType(mode === 'Train' ? 'Subway' : mode)}]`,
                    )}>
                    {mode === 'Passes' ? (
                        <PassesIcon color="#8E65FF" />
                    ) : (
                        getIconFromType(
                            mode === 'Train' ? 'Subway' : mode,
                            20,
                            getIconSecondaryBGFromType(mode === 'Train' ? 'Subway' : mode),
                        )
                    )}
                </Animated.View>
                <Animated.Text
                    style={tailwind.style(
                        `${
                            isCompact ? 'text-[9px] uppercase ' : ' text-[14px] capitalize'
                        }  font-areaNormal-extrabold text-[#656565] pt-[7px]`,
                    )}>
                    {mode === 'Train'
                        ? userLanguageStrings.Train
                        : mode === 'Bus'
                          ? userLanguageStrings.Bus
                          : mode === 'Metro'
                            ? userLanguageStrings.Metro
                            : mode === 'Passes'
                              ? userLanguageStrings.Passes
                              : mode}
                </Animated.Text>
            </Pressable>
        </Animated.View>
    );
};
