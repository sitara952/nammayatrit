import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';

import Typography from '../designSystem/components/primitives/Typography';

import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import token from '../designSystem/tokens';
import { Icon } from './Icon';
import { useRefsContext } from '../context/RefsContext';
import CloseCross from './svg/CloseCross';
import Button from '@/src-v2/primitives/Button';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

const SpecialPickUpZoneInfo: React.FC = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { bottom } = useSafeAreaInsets();
    const { specialPickUpInfoBottomSheetModalRef } = useRefsContext();
    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.Fill_neutralUltraLow}] pt-[29px] pb-[${bottom}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
            )}>
            <View style={tailwind.style(`flex flex-row pb-[10px]`)}>
                <View style={{ flexDirection: 'column', width: '100%' }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }}>
                        <Typography
                            style={tailwind.style('text-lg font-extrabold leading-6 text-[18rpx]')}
                            type="subhead-1"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.SpecialPickupZone}
                        </Typography>

                        <Animated.View style={tailwind.style('px-4')}>
                            <Pressable
                                accessibilityRole="button"
                                testID="special_pickup_zone_close"
                                accessibilityLabel={'Close button'}
                                onPress={() => specialPickUpInfoBottomSheetModalRef?.current?.close()}>
                                <Icon icon={<CloseCross />} size={34} />
                            </Pressable>
                        </Animated.View>
                    </View>

                    <View
                        style={{
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            width: '100%',
                            paddingVertical: 16,
                            gap: 16,
                        }}>
                        <View style={tailwind.style('items-center w-full my-[20px]')}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="unserviceable location image"
                                source={{ uri: 'mt_ic_loc_unserviceable' }}
                                height={172}
                                width={184}
                            />
                        </View>
                        <Typography
                            type="body"
                            style={{ color: '#14171F' }}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.SpecialZoneDesc1}
                        </Typography>
                        <Typography
                            type="body"
                            style={{ color: '#14171F' }}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.SpecialZoneDesc2}
                        </Typography>
                    </View>
                </View>
            </View>

            <Animated.View style={tailwind.style(``)}>
                <Button
                    testID="special_pickup_zone_got_it"
                    type="primary"
                    text={userLanguageStrings.GotIt}
                    onPress={() => specialPickUpInfoBottomSheetModalRef?.current?.close()}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default SpecialPickUpZoneInfo;
