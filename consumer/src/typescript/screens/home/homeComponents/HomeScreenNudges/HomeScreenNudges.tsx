import icSafetyNudgeHomescreen from '@/typescript/assets/ny-service/ic_safety_nudge_homescreen_max.webp';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { hybridActions, selectWentToHybridSection, setWentToHybridSection } from '@/typescript/state/client/appinfo';
import { selectEmergencyContacts } from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useProfileDefaultEmergencyNumbersGetQuery } from '@/api/integrations/rtk/ProfileDefaultEmergencyNumbersGet';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { UtilityBanner } from '@/typescript/designSystem/components/UtilityBanner';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors } from 'config-types/src/domain/default/themes/colors';
import ArrowRight from '@/typescript/assets/svg/symbols/ArrowRight';
import { Icon } from '@/typescript/components/Icon';

const updateActions: hybridActions[] = ['safety', 'emergencyContactScreen'];
const HomeScreenNudges: React.FC = () => {
    const navigation: DrawerNavigationProp<MainNavigationParamList> = useNavigation();
    const wentToHybridSection = useAppSelector(selectWentToHybridSection);
    const { refetch } = useProfileDefaultEmergencyNumbersGetQuery({ refetchOnMountOrArgChange: true });
    const dispatch = useAppDispatch();
    const emergencyContacts = useSelector(selectEmergencyContacts);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    useFocusEffect(
        React.useCallback(() => {
            const shouldTrigger = updateActions.some(action => wentToHybridSection[action]);
            if (shouldTrigger) {
                refetch();
                updateActions.forEach(action => {
                    if (wentToHybridSection[action]) {
                        dispatch(setWentToHybridSection(action));
                    }
                });
            }
        }, [wentToHybridSection, refetch, dispatch]),
    );
    const SafetyBannerImage = useCallback(
        () => (
            <Animated.Image
                accessible={true}
                accessibilityLabel="safety nudge homescreen image"
                source={icSafetyNudgeHomescreen}
                resizeMode={'contain'}
                style={{ width: 50, height: 50 }}
            />
        ),
        [],
    );
    return !emergencyContacts || emergencyContacts.length == 0 ? (
        <View style={styles.container}>
            <UtilityBanner
                onPress={() =>
                    navigation.navigate('ProfileTab', {
                        screen: 'safetyScreen',
                    })
                }
                titleText={userLanguageStrings.SetupSafety}
                LeftIcon={<SafetyBannerImage />}
                containerBackground="#EFFFD2"
                subTitleStyles={styles.subTitleStyles}
                titleTextStyleFontSize={16}
                subtitleText={userLanguageStrings.SecureYourRideWithOurSafetyTools}
                RightIcon={<Icon icon={<ArrowRight fill={undefined} bold={true} />} size={12} color={'white'} />}
                rightIconStyles={styles.rightIconStyles}
                titleTextFontWeight={800}
                iconFillColor="#FFF"
                marginBottom={undefined}
                titleTextStyles={styles.titleTextStyles}
            />
        </View>
    ) : null;
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 21,
    },
    rightIconStyles: {
        marginLeft: 8,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.green600,
    },
    subTitleStyles: {
        color: colors.green600,
        fontSize: 14,
        fontWeight: Platform.OS === 'ios' ? 700 : 500,
    },
    titleTextStyles: {
        color: colors.green600,
        fontSize: 15,
        fontWeight: Platform.OS === 'ios' ? 800 : 600,
    },
});

export default HomeScreenNudges;
