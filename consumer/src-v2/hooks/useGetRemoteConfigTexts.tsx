import { useMemo } from 'react';
import { getRemoteConfig, getString } from '@react-native-firebase/remote-config';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfileLanguage } from '@/typescript/state/client/user';

interface CancellationTextsConfig {
    cancel_trip_with_charges_find_another_driver_text: string;
    choose_ride_cancellation_fee_info_modal_text: string;
    my_rides_driver_cancellation_text: string;
    my_rides_user_cancellation_text: string;
}

const defaultCancellationTexts: CancellationTextsConfig = {
    cancel_trip_with_charges_find_another_driver_text: 'Find another driver',
    choose_ride_cancellation_fee_info_modal_text:
        "Includes charges from your past cancellations and rides where the driver cancelled because you didn't show up.",
    my_rides_driver_cancellation_text: 'Cancelled due to no show',
    my_rides_user_cancellation_text: 'You cancelled the ride',
};

export const useGetRemoteConfigTexts = () => {
    const currentLanguage = useAppSelector(selectUserProfileLanguage);
    const lang = currentLanguage || 'en';

    const getCancellationTexts = useMemo(() => {
        try {
            const remoteConfigInstance = getRemoteConfig();
            const configString = getString(remoteConfigInstance, 'customer_cancellation_texts');

            if (!configString) {
                return {
                    findAnotherDriverText: defaultCancellationTexts.cancel_trip_with_charges_find_another_driver_text,
                    chooseRideCancellationFeeInfoText:
                        defaultCancellationTexts.choose_ride_cancellation_fee_info_modal_text,
                    cancellationStatusTexts: {
                        myRidesDriverCancellationText: defaultCancellationTexts.my_rides_driver_cancellation_text,
                        myRidesUserCancellationText: defaultCancellationTexts.my_rides_user_cancellation_text,
                    },
                };
            }

            const allTranslations = safeJsonParse<Record<string, CancellationTextsConfig>>(
                configString,
                {},
                'customer_cancellation_texts',
            );

            const texts = allTranslations[lang] || allTranslations['en'];

            return {
                findAnotherDriverText:
                    texts?.cancel_trip_with_charges_find_another_driver_text ||
                    defaultCancellationTexts.cancel_trip_with_charges_find_another_driver_text,
                chooseRideCancellationFeeInfoText:
                    texts?.choose_ride_cancellation_fee_info_modal_text ||
                    defaultCancellationTexts.choose_ride_cancellation_fee_info_modal_text,
                cancellationStatusTexts: {
                    myRidesDriverCancellationText:
                        texts?.my_rides_driver_cancellation_text ||
                        defaultCancellationTexts.my_rides_driver_cancellation_text,
                    myRidesUserCancellationText:
                        texts?.my_rides_user_cancellation_text ||
                        defaultCancellationTexts.my_rides_user_cancellation_text,
                },
            };
        } catch (error) {
            console.error(
                'Error parsing customer cancellation texts from remote config (returning default texts):',
                error,
            );
            return {
                findAnotherDriverText: defaultCancellationTexts.cancel_trip_with_charges_find_another_driver_text,
                chooseRideCancellationFeeInfoText:
                    defaultCancellationTexts.choose_ride_cancellation_fee_info_modal_text,
                cancellationStatusTexts: {
                    myRidesDriverCancellationText: defaultCancellationTexts.my_rides_driver_cancellation_text,
                    myRidesUserCancellationText: defaultCancellationTexts.my_rides_user_cancellation_text,
                },
            };
        }
    }, [lang]);

    return {
        getCancellationTexts,
    };
};
