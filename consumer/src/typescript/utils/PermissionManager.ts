import { Linking, Platform } from 'react-native';
import { setToastProps } from '../state/client/session';
import { store } from '../state/store';
import { strings } from 'config-types';

// eslint-disable-next-line functional/no-let
let dispatch: typeof store.dispatch;

const permissionManager = {
    initialize: (d: typeof store.dispatch) => {
        dispatch = d;
    },
    showPermissionBlockedToast: (userLanguageStrings: strings) => {
        if (dispatch) {
            dispatch(
                setToastProps({
                    visible: true,
                    message:
                        Platform.OS === 'ios'
                            ? userLanguageStrings.Somefeaturesmaybelimitedwithoutlocationpermission
                            : userLanguageStrings.Pleasegrantaccessfromtheappsettings,
                    backgroundColor: '#374151',
                    autoDismissAfter: undefined,
                    logo: undefined,
                    buttons: [
                        {
                            title: 'Settings',
                            onPress: () => Linking.openSettings(),
                            color: '#111827',
                            logo: undefined,
                        },
                    ],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    customToast: undefined,
                    margin: undefined,
                }),
            );
        }
    },
};

export { permissionManager };
