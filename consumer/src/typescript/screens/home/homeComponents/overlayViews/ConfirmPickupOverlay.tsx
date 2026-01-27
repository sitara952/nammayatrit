import { DEFAULT_CAMERA_ZOOM_CONFIRM_PICKUP } from '@/typescript/constants/common';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import RecenterButton from '@/typescript/designSystem/components/RecenterButton';
import { setOnRecenter } from '@/typescript/state/client/session';
import { useAppDispatch } from '@/typescript/state/hooks';
import { GeolocationResponse } from '@/typescript/utils/location';
import { FC } from 'react';
import { SharedValue } from 'react-native-reanimated';

interface ConfirmPickupOverlayProps {
    onRecenterPress: (zoomLevel?: number, position?: GeolocationResponse) => void;
    buttonPositionUpwardsBy: SharedValue<number>;
}

const ConfirmPickupOverlay: FC<ConfirmPickupOverlayProps> = ({ onRecenterPress, buttonPositionUpwardsBy }) => {
    const dispatch = useAppDispatch();
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues(undefined);

    return (
        <RecenterButton
            onPress={() => {
                onRecenterPress(DEFAULT_CAMERA_ZOOM_CONFIRM_PICKUP);
                dispatch(setOnRecenter(true));
            }}
            sheetAnimatedIndex={sheetAnimatedIndex}
            sheetAnimatedPosition={sheetAnimatedPosition}
            buttonPositionUpwardsBy={buttonPositionUpwardsBy}
            additionalOffset={0}
        />
    );
};

export default ConfirmPickupOverlay;
