import { createAction, Resolver } from '@/typescript/utils/common';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import frfs_unservicreable from '@/src-v2/assets/frfs_unserviceable.webp';
import subway_unserviceable from '@/src-v2/assets/ny_ic_subway_unserviceability.webp';
import { Image } from 'react-native';
import Button from '@/src-v2/primitives/Button';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { RefObject } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { strings } from 'config-types';
import { JourneyDetailScreenAction } from '../../JourneyInfoScreen/Types';
import { MetroSubwayBookingAction } from '../Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';

export const ExploreOtherServicesPopUp = ({
    vehicleType,
    userLanguageStrings,
    serviceableStartTime,
    serviceUnavailableModalRef,
    mpDispatch,
    withExploreRouteButton,
    onExploreOtherService,
    styles,
}: {
    vehicleType: VehicleCategory_vehicleCategory;
    userLanguageStrings: strings;
    serviceableStartTime: string | undefined;
    serviceUnavailableModalRef: RefObject<BottomSheetModal | null> | undefined;
    mpDispatch: Resolver<JourneyDetailScreenAction> | Resolver<MetroSubwayBookingAction>;
    withExploreRouteButton: boolean;
    onExploreOtherService: () => void;
    styles: StyleProp<ViewStyle> | undefined;
}) => {
    const { bottom } = useSafeAreaInsets();
    const themeColors = useConfigContext().get('themeColors');
    return (
        <View
            style={[
                {
                    paddingBottom: bottom,
                    backgroundColor: '#F7F7F7',
                    padding: 20,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                },
                styles,
            ]}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#454C55' }}>
                {`${vehicleType === 'SUBWAY' ? userLanguageStrings.Train : userLanguageStrings.Metro} services are currently unavailable. ` +
                    (serviceableStartTime ? `Service resumes at ${serviceableStartTime}. ` : '') +
                    `Until then you can explore other modes of transport.`}
            </Text>
            <View style={{ alignItems: 'center' }}>
                <Image
                    accessible={true}
                    accessibilityLabel="frfs unserviceable image"
                    source={vehicleType === 'SUBWAY' ? subway_unserviceable : frfs_unservicreable}
                    style={{ width: '100%', height: 100, margin: 16 }}
                />
            </View>
            <Button
                testID="explore-other-services-button"
                type={'primary'}
                style={() => [
                    tailwind.style(' min-h-14 justify-center items-center rounded-[16px]'),
                    { backgroundColor: themeColors.Button_primary_default_fill_base },
                ]}
                onPress={() => {
                    serviceUnavailableModalRef?.current && serviceUnavailableModalRef?.current?.dismiss();
                    mpDispatch(createAction('GO_BACK_TO_SEARCH', undefined));
                }}>
                <Animated.Text
                    style={tailwind.style('text-[16px] leading-[22px] font-areaNormal-bold text-center capitalize', {
                        color: themeColors.Button_Primary_Default_Text_Base,
                    })}>
                    {userLanguageStrings.ExploreOtherServices}
                </Animated.Text>
            </Button>
            {withExploreRouteButton && (
                <Pressable
                    accessibilityLabel="Explore the route button"
                    accessibilityRole="button"
                    testID="explore-metro-route-button"
                    onPress={() => {
                        serviceUnavailableModalRef?.current && serviceUnavailableModalRef?.current?.dismiss();
                        onExploreOtherService();
                    }}
                    style={({ pressed }) => [tailwind.style('mt-2 py-2'), pressed && { opacity: 0.7 }]}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#016ACD',
                            textAlign: 'center',
                            textDecorationLine: 'underline',
                        }}>
                        {userLanguageStrings.ExploreTheRoute(
                            vehicleType === 'SUBWAY' ? userLanguageStrings.Train : userLanguageStrings.Metro,
                        )}
                    </Text>
                </Pressable>
            )}
        </View>
    );
};
