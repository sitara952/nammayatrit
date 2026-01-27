import { View, Text } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { WalkIcon } from '@/src-v2/multimodal/components/svg/transport/WalkIcon';
import Button from '@/src-v2/primitives/Button';
import { AutoHomeIcon } from '@/src-v2/multimodal/components/svg/transport/AutoHomeIcon';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type NextWalkLegInfoProps = {
    distance: string;
    destination: string;
    isLoading: boolean;
    onPressUseAuto: () => void;
    onNextWalkLegCTAPress: () => void;
};

export const NextWalkLegInfo = ({
    distance,
    destination,
    onPressUseAuto,
    onNextWalkLegCTAPress,
    isLoading,
}: NextWalkLegInfoProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <View style={tailwind.style('mt-4 mb-2 items-center')}>
                <Text style={tailwind.style('text-[14px] text-[#7E7E7E] font-areaNormal-extrabold')}>
                    {userLanguageStrings.UpnextInJourney}
                </Text>
            </View>
            <Button
                testID="next-walk-leg-info-card"
                type="clear"
                onPress={onNextWalkLegCTAPress}
                style={tailwind.style('bg-[#F7F7F7] p-4 rounded-[22px] mt-1 mb-4 mx-7')}>
                <View style={tailwind.style('flex-row items-center')}>
                    <Animated.View
                        style={tailwind.style(
                            'h-[40px] w-[40px] items-center justify-center rounded-[14px] bg-[#656565]',
                        )}>
                        <Icon color="#FFF" icon={<WalkIcon fill={undefined} />} size={22} />
                    </Animated.View>
                    <View style={tailwind.style('mx-1 flex-1')}>
                        <Typography
                            style={tailwind.style('text-[14px] text-[#3B3A3C] mx-1')}
                            type="body-1"
                            numberOfLines={2}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.WalkDistanceToDestination(distance, destination)}
                        </Typography>
                    </View>
                    <Button
                        testID="use-button"
                        text={userLanguageStrings.Use}
                        onPress={onPressUseAuto}
                        isLoading={isLoading}
                        showLoader={true}
                        type="primary"
                        size="md"
                        suffix={<AutoHomeIcon fill={'#fff'} />}
                        style={tailwind.style('bg-[#3B3A3C]')}
                        textStyle={tailwind.style('text-white font-areaNormal-extrabold text-[13px] z-10')}
                    />
                </View>
            </Button>
        </>
    );
};
