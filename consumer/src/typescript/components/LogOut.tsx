import React, { useEffect, useContext } from 'react';
// Adjust the path as necessary
import { useAppDispatch } from '../state/hooks';
import { useLogOutMutation } from '../state/server/authApi';
import '../utils/MMKV';
import { AccessibilityInfo, NativeModules, View } from 'react-native';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { useRefsContext } from '../context/RefsContext';
import Typography from '../designSystem/components/primitives/Typography';
import Button from '../../../src-v2/primitives/Button';
import { useConfigContext } from '../context/ConfigContext';
import { FlowStatusContext } from '../context/FlowStatusContext';
import { loggingOutUser } from '../utils/common';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';

type Props = {
    buttonColor: string | undefined;
    navigateBack: (() => void) | undefined;
    closeModal: (() => void) | undefined;
};

const LogoutModal: React.FC<Props> = ({ closeModal = () => {}, navigateBack = () => {} }) => {
    const { MainAppUtils } = NativeModules;
    const dispatch = useAppDispatch();
    const [logOutCall] = useLogOutMutation();
    const { logoutModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const flowStatusContext = useContext(FlowStatusContext);
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleLogout = async () => {
        logOutCall({ skip: false })
            .unwrap()
            .then(() => {
                logEvent(EventName.NY_USER_LOGOUT);
                loggingOutUser(dispatch, flowStatusContext);
                MainAppUtils.updateSharedPreferences({
                    REGISTERATION_TOKEN: '__failed',
                    CUSTOMER_ID: 'NO_CUSTOMER_ID',
                    SUGGESTIONS_MAP: '__failed',
                    RECENT_SEARCHES: '__failed',
                });
                closeModal();
                navigateBack();
            })
            .catch(error => console.error('Logout error:', error));
    };

    const onCancelPress = () => {
        logoutModalRef.current?.close();
        closeModal();
    };
    const { bottom } = useSafeAreaInsets();
    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('Logout popup', {
            queue: true,
        });
    }, []);

    return (
        <View
            style={{
                backgroundColor: 'white',
                paddingHorizontal: 16,
                paddingVertical: 24,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: bottom,
            }}>
            <Typography
                type="subhead-800"
                style={{ textAlign: 'center' }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.Logout}
            </Typography>
            <Typography
                type="subhead-600"
                style={{ textAlign: 'center', marginTop: 20 }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.AreYouSureLogOut + '?'}
            </Typography>
            <Button
                testID="logout_confirm_button"
                type="primary"
                text={userLanguageStrings.Logout}
                style={{ marginTop: 20, justifyContent: 'center' }}
                onPress={handleLogout}
                accessibilityLabel="Confirm logout"
            />

            <Button
                testID="logout_cancel_button"
                type="secondary"
                text={userLanguageStrings.Cancel}
                style={{ marginTop: 20, justifyContent: 'center' }}
                onPress={onCancelPress}
                accessibilityLabel="Cancel logout"
            />
        </View>
    );
};

export default LogoutModal;
