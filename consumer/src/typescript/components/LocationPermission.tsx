import { Platform, View } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import Button from '@/src-v2/primitives/Button';
import Typography from '../designSystem/components/primitives/Typography';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import PinPointIcon from '../assets/svg/symbols/PinPointIcon';
import { requestToEnableGps, requestLocationPermission } from '@/typescript/utils/location';
import { selectUserName } from '../state/client/user';
import { useAppDispatch, useAppSelector } from '../state/hooks';

import colors from '../designSystem/colorPalette';
import Danger from '@/typescript/components/svg/Danger';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import {
    BottomSheetStage,
    SearchInput,
    selectAppReadableName,
    selectCurrentLocationCoords,
    setActiveInput,
    setBottomSheetStage,
} from '../state/client/session';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { setToastProps } from '../state/client/session';
import { useLocationPermissionModal } from '@/src-v2/utils/common';

interface LocationPermissionProps {
    locationGranted: boolean;
    setLocationGranted: React.Dispatch<React.SetStateAction<boolean>>;
    checkingForGps: boolean;
}

function LocationPermission(props: LocationPermissionProps): React.JSX.Element {
    const userName = useAppSelector(selectUserName);
    const dispatch = useAppDispatch();
    const { dismissLocationPermissionModal } = useLocationPermissionModal();
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const { bottom } = useSafeAreaInsets();
    const appName = useAppSelector(selectAppReadableName);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleRequestPermission = async () => {
        const granted = props.checkingForGps
            ? await requestToEnableGps()
            : await requestLocationPermission(userLanguageStrings);
        if (granted) {
            dismissLocationPermissionModal();
            props.setLocationGranted(x => !x);
        } else {
            setToastProps({
                visible: true,
                message: userLanguageStrings.Youneedtograntlocationpermissiontousetheapp,
                backgroundColor: `${colors?.primitive?.red?.danger}`,
                autoDismissAfter: 1000,
                logo: <Danger />,
                buttons: [],
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                margin: undefined,
                customToast: undefined,
            });
        }
    };

    const searchLocationManually = useCallback(() => {
        dismissLocationPermissionModal();
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'add_location_manually' }));
        dispatch(
            setActiveInput(
                currentLocationCoords?.coords.latitude && currentLocationCoords?.coords.longitude
                    ? SearchInput.Destination
                    : SearchInput.Source,
            ),
        );
    }, [dispatch, dismissLocationPermissionModal, currentLocationCoords]);

    useEffect(() => {
        if (Platform.OS === 'ios' && !props.checkingForGps) {
            const timer = setTimeout(() => {
                handleRequestPermission();
            }, 100);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [props.checkingForGps]);
    return (
        <View style={tailwind.style(`mt-[24px] mb-[${bottom}px] mx-[16px]`)}>
            <Typography
                type="title-800"
                style={undefined}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {props.checkingForGps
                    ? userLanguageStrings.GpsIsTurnedOff
                    : userLanguageStrings.welcomeToApp(appName, userName)}
            </Typography>

            <Typography
                type="subhead-800"
                style={tailwind.style('text-[#5B6777] mt-[24px] text-base')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {props.checkingForGps
                    ? userLanguageStrings.AllowGps
                    : userLanguageStrings.Tostartbookingridespleaseallowustofindyou}
            </Typography>

            <Button
                testID="location_permission_button"
                type="primary"
                text={
                    props.checkingForGps
                        ? userLanguageStrings.TurnOnGps
                        : Platform.OS == 'android'
                          ? userLanguageStrings.GrantLocationAccess
                          : userLanguageStrings.Continue
                }
                textColor={themeColors.Button_Primary_Default_Text_Base}
                style={tailwind.style('text-[#5B6777] mt-[24px] justify-center')}
                prefix={
                    Platform.OS == 'android' ? (
                        <PinPointIcon color={themeColors.Button_Primary_Default_Text_Base} height={20} width={20} />
                    ) : null
                }
                onPress={() => {
                    logEvent(EventName.NY_USER_GRANT_LOCATION_PERMISSION);
                    handleRequestPermission();
                }}
            />
            {Platform.OS === 'ios' && (
                <Button
                    testID="addLocation_manually"
                    type="primary"
                    text={userLanguageStrings.Searchalocationmanually}
                    textColor={themeColors.Button_Primary_Default_Text_Base}
                    style={tailwind.style('text-[#5B6777] mt-[24px] justify-center')}
                    onPress={searchLocationManually}
                />
            )}
        </View>
    );
}

export default LocationPermission;
