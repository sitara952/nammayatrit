import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useCheckForInterCity } from '@/typescript/hooks/checkForIntercity';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import {
    setIsPickup,
    setBottomSheetStage,
    BottomSheetStage,
    selectSearchedSource,
    selectSearchedStops,
    setToastProps,
} from '@/typescript/state/client/session';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { View } from 'react-native';
import { useMemo } from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

export const SearchContinueButton = () => {
    const source = useAppSelector(selectSearchedSource);
    const stops = useAppSelector(selectSearchedStops);
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();

    // Check intercity between all consecutive stops
    const { isInterCity } = useCheckForInterCity(source, stops);

    // Check if route is serviceable
    const isServiceable = useMemo(() => {
        return (
            source?.serviceable &&
            stops.some(stop => stop !== null) &&
            !stops.some(stop => stop !== null && !stop.serviceable)
        );
    }, [source, stops]);

    const showIntercityToast = () => {
        dispatch(
            setToastProps({
                message: 'Intercity ride detected between stops',
                visible: true,
                useSpannedToast: false,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                backgroundColor: `${themeColors.Fill_negativeHigh}`,
                logo: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                buttons: [],
                autoDismissAfter: 3000,
                margin: undefined,
                customToast: undefined,
            }),
        );
    };

    const onContinue = () => {
        if (isInterCity) {
            showIntercityToast();
        } else {
            if (isServiceable) {
                dispatch(setIsPickup(true));
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'continueSearch' }));
            }
        }
    };

    return (
        <View style={tailwind.style(`absolute w-full justify-end  bottom-[${bottom}px] px-5`)}>
            <Button
                type="primary"
                text={userLanguageStrings.Continue}
                onPress={onContinue}
                textType="subhead-800"
                disabled={!isServiceable}
                testID={'searchContinueButton'}
            />
        </View>
    );
};
