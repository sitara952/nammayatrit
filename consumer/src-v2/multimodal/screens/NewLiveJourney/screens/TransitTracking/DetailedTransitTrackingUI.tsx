import mtIcBusSideView from '../../../../../assets/3D-assets/mt_ic_bus_side_view.webp';
import mtIcTrainSideView from '../../../../../assets/3D-assets/mt_ic_train_side_view.webp';
import mtIcMetroSideView from '../../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import { DetailedLiveHeader, DetailedLiveHeaderProps } from '../../components/DetailedLiveJourney/DetailedLiveHeader';
import { ExpandCollapseTrackingButton } from './components/ExpandCollapseTrackingButton';
import { MiniTransitInfo, MiniTransitInfoProps } from './components/MiniTransitInfo';
import { TransitTracking, TransitTrackingProps } from './TransitTracking';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

export interface DetailedTransitTrackingUIProps {
    mode: 'Train' | 'Metro' | 'Bus' | null;
    detailedLiveHeaderProps: DetailedLiveHeaderProps;
    transitTrackingProps: TransitTrackingProps;
    miniTransitInfoProps: MiniTransitInfoProps;
    hasLiveTracking: boolean;
    customTopPadding: number | undefined;
    onHideDetails: () => void;
}

export const DetailedTransitTrackingUI = ({
    mode,
    detailedLiveHeaderProps,
    transitTrackingProps,
    miniTransitInfoProps,
    onHideDetails,
    customTopPadding = 24,
}: DetailedTransitTrackingUIProps) => {
    const { bottom, top } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    useDebounceBackPress(() => {
        onHideDetails();
        return true;
    });

    return (
        <Animated.View
            style={tailwind.style(
                'flex-1 bg-white',
                `pt-[${typeof customTopPadding === 'number' ? customTopPadding : top ? top : 16}px] pb-[${bottom}px]`,
            )}>
            <Animated.View style={tailwind.style(mode ? 'border-b-[2px] border-[#7E7E7E] mb-6' : 'mb-6')}>
                {mode === 'Metro' ? (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="metro transit tracking image"
                        entering={SlideInLeft.springify().damping(25).stiffness(300)}
                        source={mtIcMetroSideView}
                        resizeMode={'contain'}
                        style={tailwind.style('h-[100px] w-full -left-1/2 top-0.5')}
                    />
                ) : null}
                {mode === 'Train' ? (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="train transit tracking image"
                        entering={SlideInLeft.springify().damping(25).stiffness(300)}
                        source={mtIcTrainSideView}
                        resizeMode={'contain'}
                        style={tailwind.style('h-[100px] w-full -left-1/2 top-0.5')}
                    />
                ) : null}
                {mode === 'Bus' ? (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="bus transit tracking image"
                        entering={SlideInLeft.springify().damping(25).stiffness(300)}
                        source={mtIcBusSideView}
                        resizeMode={'contain'}
                        style={tailwind.style('h-[100px] w-full -left-1/2 top-0.5')}
                    />
                ) : null}
            </Animated.View>
            <DetailedLiveHeader {...detailedLiveHeaderProps} />
            <TransitTracking {...transitTrackingProps} mode={mode ? mode : 'Bus'} scrollViewOffset={138 + bottom} />
            {miniTransitInfoProps?.info && (
                <Animated.View style={tailwind.style('mx-6 pt-5')}>
                    <MiniTransitInfo {...miniTransitInfoProps} />
                </Animated.View>
            )}
            <ExpandCollapseTrackingButton
                buttonText={userLanguageStrings.HideDetails}
                onPress={onHideDetails}
                isExpanded={false}
            />
        </Animated.View>
    );
};
