import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import shieldImage from '@/typescript/assets/ny_ic_white_shield.webp';
import nyIcInfoWhite from '@/typescript/assets/ny_ic_white_info.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useLazyInsuranceReferenceIdGetQuery } from '@/api/integrations/rtk/InsuranceReferenceIdGet';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setInsuranceData } from '@/typescript/state/client/ride';
import { createRideId } from '@/typescript/state/client/booking';

type InsuranceBannerProps = { rideId: string; callApi: boolean };

const InsuranceBanner = ({ rideId, callApi }: InsuranceBannerProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { rideInsuranceBottomSheetModalRef } = useRefsContext();
    const [getInsuranceApiTrigger] = useLazyInsuranceReferenceIdGetQuery();
    const dispatch = useAppDispatch();
    const callInsuranceApi = async () => {
        if (!callApi) {
            return;
        }
        await getInsuranceApiTrigger({ referenceId: rideId })
            .unwrap()
            .then(insuranceRes => {
                dispatch(
                    setInsuranceData({
                        id: createRideId(rideId),
                        payload: insuranceRes,
                    }),
                );
            });
    };
    return (
        <Animated.View style={styles.container}>
            <Animated.Image source={shieldImage} style={styles.iconContainer} resizeMode="contain" />
            <Text style={styles.text}>{userLanguageStrings.YourRideInsuredForFree}</Text>
            <TouchableOpacity
                testID="ride_insurance_click"
                accessibilityRole="button"
                accessibilityLabel={userLanguageStrings.StayInsuredAndRideWithConfidence}
                onPress={() => {
                    rideInsuranceBottomSheetModalRef.current?.present();
                    callInsuranceApi();
                }}>
                <Animated.Image source={nyIcInfoWhite} style={styles.infoCircle} resizeMode="contain" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1976F7',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        margin: 8,
    },
    iconContainer: {
        width: 25,
        height: 25,
    },
    text: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
        marginLeft: 10,
    },
    infoCircle: {
        width: 28,
        height: 28,
    },
});

export default React.memo(InsuranceBanner);
