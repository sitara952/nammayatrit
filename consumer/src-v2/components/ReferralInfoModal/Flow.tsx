import { useNavigation } from '@react-navigation/native';
import { ReferralInfoModal } from './UI';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { ReferralInfoModalFlowProps } from './Types';
import { useCallback } from 'react';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectReferralPayoutConfigV2 } from '@/typescript/state/client/session';

export { ReferralInfoModal } from './UI';
export type { ReferralInfoModalUIProps } from './Types';

export const ReferralInfoModalFlow: React.FC<ReferralInfoModalFlowProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { referralInfoModalRef, referralModalRef } = useRefsContext();
    const referralPayoutConfigV2 = useAppSelector(selectReferralPayoutConfigV2);

    const handleTermsPress = useCallback(() => {
        referralModalRef.current?.dismiss();
        referralInfoModalRef.current?.close();
        navigation.navigate('webView', {
            url: referralPayoutConfigV2.termsLink,
            goBack: () => {
                referralInfoModalRef.current?.present();
            },
        });
    }, [navigation, referralInfoModalRef, referralModalRef]);
    return (
        <ReferralInfoModal
            handleTermsPress={handleTermsPress}
            referralInfoModalRef={referralInfoModalRef}
            referralModalRef={referralModalRef}
        />
    );
};
