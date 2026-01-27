import { Linking, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Typography from '../../../designSystem/components/primitives/Typography';
import colors from '../../../designSystem/colorPalette';
import { useAppSelector } from '../../../state/hooks';
import { LinearGradient } from 'react-native-linear-gradient';
import Stat from '../../../components/svg/Stat';
import Button from '@/src-v2/primitives/Button';
import { Icon } from '../../../components/Icon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectAppConfig, selectAppReadableName } from '../../../state/client/session';
import { EventName, logEvent } from '@/typescript/utils/logger';

const checkoutLiveStatsButton = (url: string, text: string) => {
    return (
        <Button
            testID="home_footer_live_stats"
            size="md"
            type="secondary"
            style={styles.buttonContainer}
            textStyle={styles.buttonText}
            text={text}
            prefix={<Icon icon={<Stat fill={undefined} />} size={20} />}
            onPress={() => {
                logEvent(EventName.LIVE_DASHBOARD_SELECTED);
                Linking.openURL(url);
            }}
        />
    );
};

const FooterView = () => {
    const appReadableName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const openDataDashboardUrl = appConfig.constants.openDataDashboardLink;

    return (
        <Animated.View
            style={{
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
                padding: 30,
            }}>
            <Typography
                type="title-800"
                style={{
                    color: colors.primitive.gray[13],
                    paddingHorizontal: 40,
                    textAlign: 'center',
                }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.Bookandmoveanywhereinthecity}
            </Typography>
            <LinearGradient
                colors={['#9A9CA10F', '#9A9CA1BD', '#9A9CA10F']}
                style={{ height: 1, width: '100%' }}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                locations={[0.2, 0.5, 0.8]}
            />

            {openDataDashboardUrl &&
                checkoutLiveStatsButton(openDataDashboardUrl, userLanguageStrings.CheckoutourLiveStats)}
            <Animated.View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Typography
                    type="body-1"
                    style={{ color: colors.primitive.gray[13], paddingHorizontal: 40 }}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.HomescreenFooter(appReadableName)}
                </Typography>
                <Typography
                    type="body-subtext"
                    style={{ color: colors.primitive.gray[13], paddingHorizontal: 40 }}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.beOpenchooseOpen(appReadableName)}
                </Typography>
            </Animated.View>
        </Animated.View>
    );
};

export default FooterView;

const styles = StyleSheet.create({
    buttonContainer: {
        borderColor: '#E5E7EB',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderRadius: 12,
    },
    buttonText: {
        color: '#1D74F6',
    },
});
