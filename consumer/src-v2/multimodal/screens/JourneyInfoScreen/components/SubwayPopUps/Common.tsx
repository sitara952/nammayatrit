import { View } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Button from '@/src-v2/primitives/Button';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';

export const BodyView: React.FC<{ title: string; body: string }> = ({ title, body }) => {
    return (
        <View>
            <Typography
                type="callout-1"
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                style={tailwind.style(`text-[#3B3A3C] self-center pt-[16px]`)}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {title}
            </Typography>
            <Typography
                type="body-1"
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                style={tailwind.style(`text-[#656565] self-center pt-[16px] text-center`)}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {body}
            </Typography>
        </View>
    );
};

export const PrimaryButton: React.FC<{
    title: string;
    onPress: (() => void) | undefined;
    testId: string;
    isLoading: boolean;
    disabled: boolean;
}> = ({ title, onPress, testId, isLoading, disabled }) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    return (
        <Button
            testID={testId}
            onPress={onPress}
            disabled={disabled}
            style={tailwind.style(`mt-[24px] h-[56px] bg-[${colors.Confirm_button_bg}] justify-center`)}
            type="primary">
            {isLoading ? (
                <LottieWithFallback
                    fallback={undefined}
                    style={tailwind.style('w-[40px] h-[50px] m-auto')}
                    source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                    autoPlay
                    loop
                />
            ) : (
                <Typography
                    type="subhead-800"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    style={tailwind.style(`text-[${colors.Confirm_button_text}]`)}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title}
                </Typography>
            )}
        </Button>
    );
};
