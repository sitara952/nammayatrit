import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useRef } from 'react';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import mtIcFullStation from '../../../../assets/3D-assets/mt_ic_full_station.png';
import mtIcMetroSideView from '../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type InStationToastProps = {
    stationName: string;
};

export const InStationToast = ({ stationName }: InStationToastProps) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    useEffect(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            handleComponent={null}
            detached
            bottomInset={bottom ? bottom : 16}
            style={tailwind.style('bg-[#FFE590] mx-6 rounded-[28px] overflow-hidden')}
            enableDynamicSizing={true}>
            <BottomSheetView style={tailwind.style('bg-[#FFE590] rounded-[32px] px-6 pt-6 overflow-hidden')}>
                <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#313131]')}>
                    {userLanguageStrings.YouAreEntering}
                </Animated.Text>
                <Animated.Text style={tailwind.style('text-[22px] font-areaNormal-extrabold text-[#313131] pt-0.5')}>
                    {stationName} {userLanguageStrings.MetroStationZone}
                </Animated.Text>
                <Animated.View style={tailwind.style('mt-2 justify-center items-center top-3.5')}>
                    <Animated.Image
                        accessible={false}
                        entering={FadeIn.springify().damping(20).mass(1).stiffness(340)}
                        resizeMode="cover"
                        source={mtIcFullStation}
                        style={tailwind.style('w-[241px] h-[104px]')}
                    />
                </Animated.View>
                <Animated.Image
                    accessible={false}
                    resizeMode="cover"
                    entering={SlideInLeft.delay(150).springify().damping(20).mass(1).stiffness(340)}
                    source={mtIcMetroSideView}
                    style={tailwind.style('absolute -bottom-[20px] w-full h-[104px] -left-5.5/7')}
                />
            </BottomSheetView>
        </BottomSheetModal>
    );
};
