import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { MultimodalWarning_multimodalWarning } from '@/readOnly/api/types/Enums.gen';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';

interface MultimodalWarningPopupProps {
    multimodalWarning: MultimodalWarning_multimodalWarning | undefined;
    actualVehicleType: string | undefined;
    onPress: () => void;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MultimodalWarningPopup: React.FC<MultimodalWarningPopupProps> = ({
    multimodalWarning,
    actualVehicleType,
    onPress,
    setVisible,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const displayVehicleType = actualVehicleType === 'SUBWAY' ? 'Train' : actualVehicleType || '';

    const handleOnPress = () => {
        setVisible(false);
        onPress();
    };

    return (
        <Animated.View style={tailwind.style(`p-4 pb-[${bottom + 16}px]`)}>
            <Typography
                type="body-2"
                style={tailwind.style('text-lg font-bold mb-2 capitalize text-gray-500')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.Noroutefound(displayVehicleType)}{' '}
            </Typography>
            <Animated.Text style={tailwind.style('text-base mb-4')}>
                <Typography
                    type="body-2"
                    style={tailwind.style('text-gray-600')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {multimodalWarning === 'NoSingleModeRoutes'
                        ? userLanguageStrings.WeCouldntFindRouteForSelection(displayVehicleType.toLowerCase())
                        : multimodalWarning === 'NoPublicTransportRoutes'
                          ? userLanguageStrings.WeCouldntFindPublicTransportRoute
                          : userLanguageStrings.WeCouldntFindJourneyForTransitPreferences}
                </Typography>
            </Animated.Text>
            <Button
                type="primary"
                text={userLanguageStrings.GotIt}
                onPress={handleOnPress}
                testID="multimodal-warning-popup-confirm"
            />
        </Animated.View>
    );
};
