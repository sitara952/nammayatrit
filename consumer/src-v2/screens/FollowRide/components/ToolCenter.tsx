import { Icon } from '@/typescript/components/Icon';
import { AlertIcon } from '@/typescript/components/svg/AlertIcon';
import { CallIcon } from '@/typescript/components/svg/CallIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import colors from '@/typescript/designSystem/colorPalette';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { selectAppReadableName, selectSafetyHelplineNo } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { Linking, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

export const ToolCenter = () => {
    const appName = useAppSelector(selectAppReadableName);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { safetyNumber, enableSafetyCall } = useAppSelector(selectSafetyHelplineNo);
    return (
        <Animated.View style={styles.toolCenterContainer}>
            {enableSafetyCall && (
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="follow_ride_call_helpline"
                    onPress={() => Linking.openURL(`tel:${safetyNumber}`)}
                    style={tailwind?.style(
                        `flex-row px-[${token?.spacing?.[24]}] py-[${token?.spacing?.[12]}] ] bg-[${colors.primitive.white[10]}] flex-1 justify-center items-center rounded-xl`,
                    )}>
                    <CallIcon />
                    <Typography
                        type="body-3"
                        numberOfLines={2}
                        style={tailwind?.style('ml-10px')}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Call_App_Helpline(appName)}
                    </Typography>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                accessibilityRole="button"
                testID="follow_ride_call_police"
                onPress={() => Linking.openURL(`tel:112`)}
                style={tailwind?.style(
                    `flex-row px-[${token?.spacing?.[24]}] py-[${token?.spacing?.[12]}] bg-[${colors.primitive.red[1]}] flex-1 justify-center items-center rounded-xl`,
                )}>
                <Icon icon={<AlertIcon fill={undefined} />} size={20} />
                <Typography
                    type="body"
                    numberOfLines={2}
                    style={tailwind?.style(`ml-10px text-[${colors.primitive.red[10]}]`)}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.CallPoliceHelpline_One_One_Two}
                </Typography>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toolCenterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        gap: 12,
        marginVertical: 12,
    },
});
