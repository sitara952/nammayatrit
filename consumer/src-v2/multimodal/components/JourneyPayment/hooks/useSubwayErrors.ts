import { useCallback } from 'react';
import { useAppDispatch } from '@/typescript/state/hooks';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { setSubwayPopUpState } from '@/typescript/state/client/session';
import { createSubwayPopUpState } from '@/src-v2/multimodal/utils/SubwayUtils';

export enum SubwayErrorPopUpType {
    DeviceChange = 'deviceChange',
    UnknownError = 'unknownError',
    DeveloperSettingsError = 'developerSettingsError',
}

interface UseSubwayErrorsProps {
    onMoreOptions: (() => void) | undefined;
}

export const useSubwayErrors = ({ onMoreOptions }: UseSubwayErrorsProps) => {
    const dispatch = useAppDispatch();
    const { deviceChangeModalRef, subwayPopUpModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const showSubwayError = useCallback(
        (errorType: SubwayErrorPopUpType, errorMessage: string | undefined) => {
            deviceChangeModalRef.current?.dismiss();
            subwayPopUpModalRef.current?.dismiss();

            const subwayPopUpState = createSubwayPopUpState(
                errorType,
                userLanguageStrings,
                onMoreOptions,
                errorMessage,
            );

            switch (errorType) {
                case SubwayErrorPopUpType.DeviceChange:
                    deviceChangeModalRef.current?.present();
                    break;
                default:
                    dispatch(setSubwayPopUpState(subwayPopUpState));
                    break;
            }
        },
        [deviceChangeModalRef, subwayPopUpModalRef, userLanguageStrings, onMoreOptions, dispatch],
    );

    const dismissAllSubwayErrors = useCallback(() => {
        deviceChangeModalRef.current?.dismiss();
        subwayPopUpModalRef.current?.dismiss();
        dispatch(setSubwayPopUpState(undefined));
    }, [deviceChangeModalRef, subwayPopUpModalRef, dispatch]);

    return {
        showSubwayError,
        dismissAllSubwayErrors,
    };
};
