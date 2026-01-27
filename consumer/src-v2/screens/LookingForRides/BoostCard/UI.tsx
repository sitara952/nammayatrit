import Divider from '@/typescript/designSystem/components/primitives/Divider';
import BoostSearchChangeVehicleModal from '@/typescript/screens/lookingForRides/BoostSearchChangeVehicleModal';
import BoostSearchTipsModal from '@/typescript/screens/lookingForRides/BoostSearchTipsModal';
import Animated from 'react-native-reanimated';
import { BoostCardProps } from './types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { selectUserProfileLanguage } from '@/typescript/state/client/user';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { getRemoteConfig, getString } from '@react-native-firebase/remote-config';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';

export const BoostCardUI: React.FC<BoostCardProps> = ({
    containerStyle,
    additionalFare,
    setAdditionalFare,
    selectedExpandedData,
    setSelectedExpandedData,
    setHeight,
    updateInitialSelectedVehicles,
    tipOptions,
    currentlySelectedIds,
}: BoostCardProps) => {
    const lookingForRidesTipEnabled = useAppSelector(selectNewFeatureFlags).lookingForRidesTipEnabled;
    const currentLanguage = useAppSelector(selectUserProfileLanguage);

    const remoteConfigInstance = getRemoteConfig();
    const boostCardSelectionText = (() => {
        const configString = getString(remoteConfigInstance, 'boost_card_selection_text');

        if (!configString) {
            return null;
        }

        try {
            const translations = safeJsonParse<Record<string, string>>(configString, {}, 'boost_card_selection_text');

            return translations[currentLanguage || 'en'] || translations['en'] || null;
        } catch (error) {
            console.error('Error parsing boost card selection text:', error);
            return null;
        }
    })();

    return (
        <Animated.View style={containerStyle}>
            <Animated.View style={[{ backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 16, flex: 1 }]}>
                <Animated.View style={{ flex: 1 }}>
                    {/* Tips Modal contains the slider for additional fare */}
                    {lookingForRidesTipEnabled && tipOptions.length > 0 ? (
                        <Animated.View>
                            <BoostSearchTipsModal
                                selectTip={additionalFare}
                                setSelectedTip={setAdditionalFare}
                                isEstimatesScreen={false}
                                currentlySelectedIds={currentlySelectedIds}
                            />
                            <Divider
                                type={'dashed'}
                                direction={undefined}
                                style={{ marginVertical: 20, paddingHorizontal: 16 }}
                                labelPosition={undefined}
                                offset={undefined}
                                offsetBackground={undefined}
                                dividerColor={undefined}
                                strokeDashArray={undefined}
                            />
                        </Animated.View>
                    ) : null}

                    {/* Vehicle selection */}
                    <BoostSearchChangeVehicleModal
                        selectedExpandedData={selectedExpandedData}
                        setSelectedExpandedData={setSelectedExpandedData}
                        setHeight={setHeight}
                        updateInitialSelectedVehicles={updateInitialSelectedVehicles}
                    />
                </Animated.View>
            </Animated.View>

            {boostCardSelectionText && (
                <View style={styles.infoContainer}>
                    <View style={styles.infoIcon}>
                        <Typography
                            type={undefined}
                            style={styles.iconText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            i
                        </Typography>
                    </View>
                    <Typography
                        type={undefined}
                        style={styles.infoText}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={boostCardSelectionText}
                        accessibilityRole={undefined}>
                        {boostCardSelectionText}
                    </Typography>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    infoContainer: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 20,
        marginTop: 6,
        borderRadius: 8,
        minHeight: 40,
    },
    infoIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#434144',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    iconText: {
        color: '#434144',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    infoText: {
        fontFamily: 'Area Normal',
        fontWeight: '800',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        letterSpacing: 0.35,
        color: '#434144',
    },
});
