import React from 'react';
import { View } from 'react-native';
import { tailwind } from '../../tailwindTheme/tailwind';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import dayjs from 'dayjs';
import { useRefsContext } from '../../context/RefsContext';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import Animated from 'react-native-reanimated';
import { Icon } from '@/typescript/components/Icon.tsx';
import CloseCross from '../../components/svg/CloseCross';
import OverlapIcon from '../../assets/svg/symbols/OverlapIcon.tsx';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';

type OverLapBannerProps = {
    overLapBookingTime: string | undefined;
};

export const OverLapBanner: React.FC<OverLapBannerProps> = ({ overLapBookingTime }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { overlappingRideExistModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    return (
        <PopUpModal
            sheetRef={overlappingRideExistModalRef}
            enableDynamicSizing={true}
            onHardwareBackPress={undefined}
            showBackdrop={undefined}
            isScrollable={false}>
            <Animated.View style={tailwind.style(`rounded-2xl p-4 mb-${bottom}px`)}>
                <View style={tailwind.style(`pr-6px`)}>
                    <View style={tailwind.style(`flex-row justify-between items-center`)}>
                        <View style={tailwind.style(`flex-row items-center py-16px`)}>
                            <Typography
                                type="subhead-700"
                                style={tailwind.style(`pl-12px`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.ARideAlreadyExists}
                            </Typography>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Close button"
                            testID="overlap_modal_close"
                            onPress={() => {
                                overlappingRideExistModalRef.current?.close();
                            }}>
                            <Icon icon={<CloseCross />} size={34} />
                        </Pressable>
                    </View>
                    <View style={tailwind.style('px-2 items-center')}>
                        <OverlapIcon height={200} width={200} />
                        <Typography
                            type="body-7"
                            style={tailwind.style('py-3')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.YouAlreadyHaveActiveRideOn}
                            {dayjs(overLapBookingTime).format('DD MMM, hh:mm A')}
                        </Typography>
                        <Typography
                            type="body-7"
                            style={tailwind.style('items-center py-4')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.ToCreateNewBookingCancelExisting}
                        </Typography>
                    </View>
                </View>
                <Button
                    testID="overlap_modal_got_it"
                    type="primary"
                    text={userLanguageStrings.Gotit}
                    onPress={() => {
                        overlappingRideExistModalRef.current?.close();
                    }}
                />
            </Animated.View>
        </PopUpModal>
    );
};
