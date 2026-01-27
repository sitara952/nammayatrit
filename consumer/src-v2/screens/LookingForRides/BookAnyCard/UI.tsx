import Tag from '@/typescript/designSystem/components/primitives/Tag';
import token from '@/typescript/designSystem/tokens';
import { getVehicleFromVehicleType } from '@/typescript/utils/bookingUtils';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

import { Image, View } from 'react-native';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BookAnyUiProps } from './types';
import { createAction } from '@/typescript/utils/common';

export const BookAnyCardUI: React.FC<BookAnyUiProps> = ({
    options,
    selectedOption,
    autoSelectedOptions,
    userInteractedVariants,
    rcsDispatch,
    setHeight,
}: BookAnyUiProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const shouldShowAutoSelectedPill = (itemValue: string): boolean => {
        const isAutoSelected = autoSelectedOptions?.includes(itemValue) ?? false;
        const hasUserInteracted = userInteractedVariants?.has(itemValue) ?? false;
        return isAutoSelected && !hasUserInteracted;
    };

    return (
        <Animated.View
            onLayout={e => setHeight(e.nativeEvent.layout.height)}
            style={tailwind.style(` flex-col rounded-[${token?.corner?.md}] bg-[${themeColors.Fill_neutralMin}]`)}>
            <Animated.View exiting={FadeOutUp.duration(150)} entering={FadeInUp.springify().damping(28).stiffness(200)}>
                <Animated.View style={tailwind.style(``)}>
                    <Animated.View style={tailwind.style(`pt-[16px] flex-row flex-wrap px-2px gap-12px`)}>
                        {options?.map(item => {
                            const itemValue = String(item?.value ?? '');
                            const isSelected = selectedOption?.includes(itemValue) ?? false;

                            return (
                                item && (
                                    <View key={item?.value} style={{ position: 'relative' }}>
                                        <Tag
                                            testID={`looking_for_rides_vehicle_variant_${item?.name?.toLowerCase().replace(/\s+/g, '_')}`}
                                            // subText={item.name === 'Sedan' ? 'a' : ''}   #till a new config is made
                                            size="md"
                                            type="primary"
                                            text={item?.name}
                                            accessibilityLabel={item?.name}
                                            accessibilityHint={`Selected items ${item.name}`}
                                            accessibilityRole="combobox"
                                            accessibilityState={{
                                                selected: isSelected,
                                            }}
                                            style={{ paddingTop: 8, paddingBottom: 8, minHeight: 42 }}
                                            onPress={() => rcsDispatch(createAction('TAG_SELECTED', item))}
                                            selected={isSelected}
                                            icon={
                                                <Image
                                                    accessible={false}
                                                    source={getVehicleFromVehicleType(item.service, item.isAc)}
                                                    style={{ width: 42, height: 32 }}
                                                    resizeMode="contain"
                                                />
                                            }
                                        />
                                        {shouldShowAutoSelectedPill(itemValue) && (
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    top: -9,
                                                    alignSelf: 'center',
                                                    backgroundColor: themeColors.Icon_positive,
                                                    borderRadius: 12,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 1,
                                                    zIndex: 1,
                                                }}>
                                                <Typography
                                                    type={undefined}
                                                    style={{
                                                        color: '#FFFFFF',
                                                        fontSize: 10,
                                                        fontWeight: '600',
                                                        textAlign: 'center',
                                                    }}
                                                    numberOfLines={1}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    Auto-Selected
                                                </Typography>
                                            </View>
                                        )}
                                    </View>
                                )
                            );
                        })}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
